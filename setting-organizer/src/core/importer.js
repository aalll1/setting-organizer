import { ERROR_CODES, SettingOrganizerError } from './errors.js';
import { toCharacterCreateFormFields } from '../adapters/characterAdapter.js';
import { toSillyTavernWorldInfo } from '../adapters/lorebookAdapter.js';
import { createAndSaveBackup } from '../storage/backups.js';
import { bindCharacterWorld, createCharacter, createWorldInfo, getCharacterSummaries, getCompatibilitySnapshot, getFreshCharacterSummaries, getWorldInfoNames } from '../adapters/sillytavernApi.js';
import { buildWorldbookSyncDraft } from './worldbookSyncBuilder.js';

export async function importCampaignStateWorldbook(campaignState, options = {}) {
    const draft = buildWorldbookSyncDraft(campaignState, { previousEntries: options.previousEntries });
    const selectedCategories = Array.isArray(options.categories) ? new Set(options.categories) : null;
    const lorebookEntries = selectedCategories
        ? draft.lorebookEntries.filter((entry) => selectedCategories.has(entry.category))
        : draft.lorebookEntries;
    const report = await importLorebookDraft({ characters: [], lorebookEntries, warnings: [] }, {
        name: options.name,
    });

    return {
        ...report,
        syncPreview: draft.preview,
        selectedCategories: selectedCategories ? [...selectedCategories] : [],
    };
}

export async function importLorebookDraft(result, options = {}) {
    const enabledEntries = (result.lorebookEntries || []).filter((entry) => entry.enabled);
    const targetName = options.name || createDefaultWorldbookName();

    if (!enabledEntries.length) {
        throw new SettingOrganizerError(ERROR_CODES.LOREBOOK_CREATE_FAILED, '没有可导入的已启用世界书条目。');
    }

    const beforeState = createWorldbookSummarySnapshot();
    const backup = createAndSaveBackup({
        operation: 'create-worldbook',
        sourceDraft: result,
        targetInfo: {
            mode: 'create-new-worldbook',
            name: targetName,
            entryCount: enabledEntries.length,
        },
        beforeState,
        sillyTavernVersion: readSillyTavernVersion(),
    });

    const steps = [
        createStep('validate-draft', '校验世界书草稿', 'completed'),
        createStep('create-backup', '创建导入前备份', 'completed', { backupId: backup.id }),
        createStep('create-worldbook', '创建新世界书', 'pending'),
        createStep('verify-legacy-data', '验证旧世界书未变化', 'pending'),
    ];

    let created = null;

    try {
        const payload = toSillyTavernWorldInfo({ ...result, lorebookEntries: enabledEntries });
        created = await createWorldInfo({
            name: targetName,
            worldInfo: payload,
        });

        markStep(steps, 'create-worldbook', 'completed', created);
        verifyExistingWorldbooksUnchanged(beforeState.worldBooks, created.name);
        markStep(steps, 'verify-legacy-data', 'completed');

        return {
            ok: true,
            backupId: backup.id,
            created,
            steps,
        };
    } catch (error) {
        const failedStepId = created ? 'verify-legacy-data' : 'create-worldbook';
        markStep(steps, failedStepId, 'failed', {
            errorCode: error.code || ERROR_CODES.LOREBOOK_CREATE_FAILED,
            message: error.message,
        });

        return {
            ok: false,
            backupId: backup.id,
            error,
            steps,
            completedSteps: steps.filter((step) => step.status === 'completed').map((step) => step.label),
            pendingSteps: steps.filter((step) => step.status === 'pending').map((step) => step.label),
            possibleImpact: [
                '当前实现未确认真实世界书写入接口。',
                '如果 adapter 未执行写入，则 SillyTavern 数据不应发生变化。',
                '备份记录可作为后续手动恢复依据。',
            ],
        };
    }
}

export function getLorebookImportReadiness(result) {
    const snapshot = getCompatibilitySnapshot();
    const enabledEntries = (result.lorebookEntries || []).filter((entry) => entry.enabled);

    return {
        canAttempt: enabledEntries.length > 0,
        enabledEntryCount: enabledEntries.length,
        hasWorldInfoCreate: snapshot.hasWorldInfoCreate,
        compatibility: snapshot,
    };
}

export async function importCharacterDraft(result, options = {}) {
    const character = (result.characters || [])[0];
    const shouldBindCreatedWorldbook = Boolean(options.bindCreatedWorldbook);

    if (!character) {
        throw new SettingOrganizerError(ERROR_CODES.CHARACTER_CREATE_FAILED, '没有可导入的角色草稿。');
    }

    if (!character.name?.trim()) {
        throw new SettingOrganizerError(ERROR_CODES.CHARACTER_CREATE_FAILED, '角色名称为空，无法导入。');
    }

    const beforeState = await createCharacterSummarySnapshot();
    const backup = createAndSaveBackup({
        operation: 'create-character',
        sourceDraft: result,
        targetInfo: {
            mode: 'create-new-character',
            name: options.name || character.name,
            bindCreatedWorldbook: shouldBindCreatedWorldbook,
        },
        beforeState,
        sillyTavernVersion: readSillyTavernVersion(),
    });

    const steps = [
        createStep('validate-draft', '校验角色草稿', 'completed'),
        createStep('create-backup', '创建导入前备份', 'completed', { backupId: backup.id }),
        ...(shouldBindCreatedWorldbook ? [createStep('create-worldbook-for-binding', '创建待绑定世界书', 'pending')] : []),
        createStep('create-character', '创建新角色', 'pending'),
        ...(shouldBindCreatedWorldbook ? [createStep('bind-character-worldbook', '绑定角色到新世界书', 'pending')] : []),
        createStep('verify-legacy-data', '验证旧角色未变化', 'pending'),
    ];

    let created = null;
    let createdWorldbook = null;

    try {
        if (shouldBindCreatedWorldbook) {
            createdWorldbook = await createWorldbookForBinding(result, options);
            markStep(steps, 'create-worldbook-for-binding', 'completed', createdWorldbook);
        }

        created = await createCharacter({
            fields: toCharacterCreateFormFields({ ...character, name: options.name || character.name }),
        });
        markStep(steps, 'create-character', 'completed', created);

        if (shouldBindCreatedWorldbook) {
            const bindResult = await bindCharacterWorld({
                avatar: created.avatar,
                worldName: createdWorldbook.name,
            });
            markStep(steps, 'bind-character-worldbook', 'completed', bindResult);
        }

        verifyExistingCharactersUnchanged(beforeState.characters, created.avatar);
        markStep(steps, 'verify-legacy-data', 'completed');

        return {
            ok: true,
            backupId: backup.id,
            created,
            createdWorldbook,
            steps,
        };
    } catch (error) {
        const failedStepId = resolveCharacterImportFailedStep(steps, created, createdWorldbook, shouldBindCreatedWorldbook);
        markStep(steps, failedStepId, 'failed', {
            errorCode: error.code || ERROR_CODES.CHARACTER_CREATE_FAILED,
            message: error.message,
        });

        return {
            ok: false,
            backupId: backup.id,
            error,
            steps,
            completedSteps: steps.filter((step) => step.status === 'completed').map((step) => step.label),
            pendingSteps: steps.filter((step) => step.status === 'pending').map((step) => step.label),
            possibleImpact: [
                '角色创建接口调用集中在 adapter 中。',
                shouldBindCreatedWorldbook
                    ? '绑定步骤失败不代表角色或世界书创建一定失败，请根据步骤状态检查。'
                    : '如果角色创建步骤失败，SillyTavern 角色数据不应发生变化。',
                '备份记录可作为后续手动恢复依据。',
            ],
        };
    }
}

export function getCharacterImportReadiness(result) {
    const snapshot = getCompatibilitySnapshot();
    const characterCount = (result.characters || []).length;

    return {
        canAttempt: characterCount > 0,
        characterCount,
        hasCharacterCreate: snapshot.hasCharacterCreate,
        hasCharacterWorldBind: snapshot.hasCharacterWorldBind,
        compatibility: snapshot,
    };
}

async function createWorldbookForBinding(result, options = {}) {
    const enabledEntries = (result.lorebookEntries || []).filter((entry) => entry.enabled);
    if (!enabledEntries.length) {
        throw new SettingOrganizerError(ERROR_CODES.LOREBOOK_CREATE_FAILED, '没有可绑定的已启用世界书条目。');
    }

    const targetName = options.worldbookName || createDefaultWorldbookName('SO_V02_设定整理器绑定');
    const payload = toSillyTavernWorldInfo({ ...result, lorebookEntries: enabledEntries });
    return createWorldInfo({
        name: targetName,
        worldInfo: payload,
    });
}

function resolveCharacterImportFailedStep(steps, created, createdWorldbook, shouldBindCreatedWorldbook) {
    if (shouldBindCreatedWorldbook && !createdWorldbook) {
        return 'create-worldbook-for-binding';
    }

    if (!created) {
        return 'create-character';
    }

    const bindStep = steps.find((step) => step.id === 'bind-character-worldbook');
    if (bindStep && bindStep.status !== 'completed') {
        return 'bind-character-worldbook';
    }

    return 'verify-legacy-data';
}

function createWorldbookSummarySnapshot() {
    return {
        compatibility: getCompatibilitySnapshot(),
        worldBooks: getWorldInfoNames(),
    };
}

async function createCharacterSummarySnapshot() {
    return {
        compatibility: getCompatibilitySnapshot(),
        characters: await getFreshCharacterSummaries(),
    };
}

function verifyExistingWorldbooksUnchanged(beforeNames, createdName) {
    const afterNames = getWorldInfoNames();
    const missingNames = beforeNames.filter((name) => !afterNames.includes(name));
    const newNames = afterNames.filter((name) => !beforeNames.includes(name));
    const unexpectedExistingChanges = newNames.filter((name) => name !== createdName);

    if (missingNames.length || unexpectedExistingChanges.length || !afterNames.includes(createdName)) {
        throw new SettingOrganizerError(ERROR_CODES.LEGACY_DATA_CHANGED, '旧世界书摘要校验失败。', {
            missingNames,
            unexpectedExistingChanges,
            createdName,
            afterNames,
        });
    }
}

function verifyExistingCharactersUnchanged(beforeCharacters, createdAvatar) {
    const afterCharacters = getCharacterSummaries();
    const beforeAvatars = beforeCharacters.map((character) => character.avatar).filter(Boolean);
    const afterAvatars = afterCharacters.map((character) => character.avatar).filter(Boolean);
    const missingAvatars = beforeAvatars.filter((avatar) => !afterAvatars.includes(avatar));

    if (missingAvatars.length || !afterAvatars.includes(createdAvatar)) {
        throw new SettingOrganizerError(ERROR_CODES.LEGACY_DATA_CHANGED, '旧角色摘要校验失败。', {
            missingAvatars,
            createdAvatar,
            afterAvatars,
        });
    }
}

function createStep(id, label, status, details = null) {
    return { id, label, status, details };
}

function markStep(steps, id, status, details = null) {
    const step = steps.find((item) => item.id === id);
    if (step) {
        step.status = status;
        step.details = details;
    }
}

function createDefaultWorldbookName(prefix = '设定整理器导入') {
    const stamp = new Date().toISOString().replace(/[-:.TZ]/g, '');
    return `${prefix} ${stamp}`;
}

function readSillyTavernVersion() {
    if (typeof window === 'undefined') {
        return '';
    }

    return window?.SillyTavern?.version || window?.APP_VERSION || '';
}
