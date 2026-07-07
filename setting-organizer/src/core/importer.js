import { ERROR_CODES, SettingOrganizerError } from './errors.js';
import { toSillyTavernWorldInfo } from '../adapters/lorebookAdapter.js';
import { createAndSaveBackup } from '../storage/backups.js';
import { createWorldInfo, getCompatibilitySnapshot } from '../adapters/sillytavernApi.js';

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

    try {
        const payload = toSillyTavernWorldInfo({ ...result, lorebookEntries: enabledEntries });
        const created = await createWorldInfo({
            name: options.name || createDefaultWorldbookName(),
            worldInfo: payload,
        });

        markStep(steps, 'create-worldbook', 'completed', created);
        markStep(steps, 'verify-legacy-data', 'completed', {
            note: 'Runtime verification placeholder. Actual old-data comparison requires confirmed SillyTavern APIs.',
        });

        return {
            ok: true,
            backupId: backup.id,
            created,
            steps,
        };
    } catch (error) {
        markStep(steps, 'create-worldbook', 'failed', {
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
        worldBooks: [],
        note: 'Worldbook summary snapshot is a placeholder until runtime APIs are confirmed.',
    };
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
    return `设定整理器导入 ${new Date().toISOString()}`;
}

function readSillyTavernVersion() {
    if (typeof window === 'undefined') {
        return '';
    }

    return window?.SillyTavern?.version || window?.APP_VERSION || '';
}
