import { ERROR_CODES, SettingOrganizerError } from './errors.js';
import { toSillyTavernWorldInfo } from '../adapters/lorebookAdapter.js';
import { createAndSaveBackup } from '../storage/backups.js';
import { createWorldInfo, getCompatibilitySnapshot, getWorldInfoNames } from '../adapters/sillytavernApi.js';

export async function importLorebookDraft(result, options = {}) {
    const enabledEntries = (result.lorebookEntries || []).filter((entry) => entry.enabled);

    if (!enabledEntries.length) {
        throw new SettingOrganizerError(ERROR_CODES.LOREBOOK_CREATE_FAILED, '没有可导入的已启用世界书条目。');
    }

    const beforeState = createWorldbookSummarySnapshot();
    const backup = createAndSaveBackup({
        operation: 'create-worldbook',
        sourceDraft: result,
        targetInfo: {
            mode: 'create-new-worldbook',
            name: options.name || createDefaultWorldbookName(),
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
            name: options.name || createDefaultWorldbookName(),
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

function createWorldbookSummarySnapshot() {
    return {
        compatibility: getCompatibilitySnapshot(),
        worldBooks: getWorldInfoNames(),
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

function createDefaultWorldbookName() {
    const stamp = new Date().toISOString().replace(/[-:.TZ]/g, '');
    return `设定整理器导入 ${stamp}`;
}

function readSillyTavernVersion() {
    if (typeof window === 'undefined') {
        return '';
    }

    return window?.SillyTavern?.version || window?.APP_VERSION || '';
}
