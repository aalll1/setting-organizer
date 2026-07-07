import { formatError } from '../core/errors.js';
import { importLorebookDraft, getLorebookImportReadiness } from '../core/importer.js';
import { createAndSaveBackup } from '../storage/backups.js';

export function createDraftBackup(result) {
    return createAndSaveBackup({
        operation: 'draft-export-preparation',
        sourceDraft: result,
        targetInfo: {
            mode: 'local-only',
            note: 'TC-10 only creates a local backup record. It does not write to SillyTavern.',
        },
        beforeState: {
            characters: [],
            worldBooks: [],
        },
        sillyTavernVersion: readSillyTavernVersion(),
    });
}

export function renderBackupStatus(container, backupOrError) {
    if (!container) {
        return;
    }

    if (backupOrError instanceof Error) {
        container.dataset.state = 'error';
        container.textContent = formatError(backupOrError);
        container.hidden = false;
        return;
    }

    container.dataset.state = 'success';
    container.textContent = `备份已创建：${backupOrError.id}\n创建时间：${backupOrError.createdAt}`;
    container.hidden = false;
}

export function renderImportReadiness(container, result) {
    if (!container) {
        return;
    }

    const readiness = getLorebookImportReadiness(result);
    container.hidden = false;
    container.dataset.state = readiness.hasWorldInfoCreate ? 'success' : 'warning';
    container.textContent = [
        `启用世界书条目：${readiness.enabledEntryCount}`,
        `已验证新建世界书接口：${readiness.hasWorldInfoCreate ? '是' : '否'}`,
        readiness.hasWorldInfoCreate
            ? '可以尝试调用 adapter 创建新世界书。'
            : '当前仅能创建备份和失败状态报告，不会执行真实写入。',
    ].join('\n');
}

export async function runLorebookImportPreview(result, statusContainer) {
    try {
        const report = await importLorebookDraft(result);
        renderImportReport(statusContainer, report);
    } catch (error) {
        renderImportReport(statusContainer, {
            ok: false,
            error,
            steps: [],
            completedSteps: [],
            pendingSteps: [],
            possibleImpact: ['导入流程在创建报告前失败。'],
        });
    }
}

export function renderImportReport(container, report) {
    if (!container) {
        return;
    }

    container.hidden = false;
    container.dataset.state = report.ok ? 'success' : 'error';

    const lines = [
        report.ok ? '世界书导入流程完成。' : '世界书导入流程未完成。',
    ];

    if (report.backupId) {
        lines.push(`备份标识：${report.backupId}`);
    }

    if (report.error) {
        lines.push(`错误：${formatError(report.error)}`);
    }

    if (report.steps?.length) {
        lines.push('步骤状态：');
        report.steps.forEach((step) => {
            lines.push(`- ${step.label}: ${step.status}`);
        });
    }

    if (report.possibleImpact?.length) {
        lines.push('可能影响范围：');
        report.possibleImpact.forEach((item) => {
            lines.push(`- ${item}`);
        });
    }

    container.textContent = lines.join('\n');
}

function readSillyTavernVersion() {
    if (typeof window === 'undefined') {
        return '';
    }

    return window?.SillyTavern?.version || window?.APP_VERSION || '';
}
