import { formatError } from '../core/errors.js';
import { logError, logInfo } from '../core/logger.js';
import { getCharacterImportReadiness, importCharacterDraft, importLorebookDraft, getLorebookImportReadiness } from '../core/importer.js';
import { openWorldInfoEditor } from '../adapters/sillytavernApi.js';
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
        logError('backup-rendered-error', backupOrError);
        container.dataset.state = 'error';
        container.textContent = formatError(backupOrError);
        container.hidden = false;
        return;
    }

    container.dataset.state = 'success';
    container.textContent = `备份已创建：${backupOrError.id}\n创建时间：${backupOrError.createdAt}`;
    logInfo('backup-created', {
        backupId: backupOrError.id,
        operation: backupOrError.operation,
    });
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
            ? '将通过 SillyTavern 原生世界书接口创建新世界书；后续编辑请使用酒馆原生世界书管理器。'
            : '当前仅能创建备份和失败状态报告，不会执行真实写入。',
    ].join('\n');
}

export function renderCharacterImportReadiness(container, result) {
    if (!container) {
        return;
    }

    const readiness = getCharacterImportReadiness(result);
    container.hidden = false;
    container.dataset.state = readiness.hasCharacterCreate ? 'success' : 'warning';
    container.textContent = [
        `角色草稿数量：${readiness.characterCount}`,
        `已验证新建角色接口：${readiness.hasCharacterCreate ? '是' : '否'}`,
        `已验证角色世界书绑定接口：${readiness.hasCharacterWorldBind ? '是' : '否'}`,
        readiness.hasCharacterCreate
            ? '将通过 SillyTavern 原生角色创建接口创建新角色；后续管理请使用酒馆原生角色面板。'
            : '当前仅能创建备份和失败状态报告，不会执行真实写入。',
    ].join('\n');
}

export async function runLorebookImportPreview(result, statusContainer) {
    try {
        const report = await importLorebookDraft(result);
        logImportReport('worldbook', report);
        renderImportReport(statusContainer, report, 'worldbook');
    } catch (error) {
        logError('worldbook-import-unhandled-failed', error);
        renderImportReport(statusContainer, {
            ok: false,
            error,
            steps: [],
            completedSteps: [],
            pendingSteps: [],
            possibleImpact: ['导入流程在创建报告前失败。'],
        }, 'worldbook');
    }
}

export async function runCharacterImportPreview(result, statusContainer, options = {}) {
    try {
        const report = await importCharacterDraft(result, options);
        logImportReport('character', report);
        renderImportReport(statusContainer, report, 'character');
    } catch (error) {
        logError('character-import-unhandled-failed', error);
        renderImportReport(statusContainer, {
            ok: false,
            error,
            steps: [],
            completedSteps: [],
            pendingSteps: [],
            possibleImpact: ['角色导入流程在创建报告前失败。'],
        }, 'character');
    }
}

function logImportReport(type, report) {
    const event = report.ok ? `${type}-import-completed` : `${type}-import-failed`;
    const details = {
        backupId: report.backupId,
        created: report.created,
        steps: report.steps,
    };

    if (report.ok) {
        logInfo(event, details);
        return;
    }

    logError(event, report.error || new Error('import failed'), details);
}

export function renderImportReport(container, report, type = 'worldbook') {
    if (!container) {
        return;
    }

    container.hidden = false;
    container.dataset.state = report.ok ? 'success' : 'error';

    const successLabel = type === 'character' ? '角色创建到酒馆流程完成。' : '世界书创建到酒馆流程完成。';
    const failureLabel = type === 'character' ? '角色创建到酒馆流程未完成。' : '世界书创建到酒馆流程未完成。';
    const lines = [
        report.ok ? successLabel : failureLabel,
    ];

    if (report.backupId) {
        lines.push(`备份标识：${report.backupId}`);
    }

    if (report.error) {
        lines.push(`错误：${formatError(report.error)}`);
    }

    if (report.createdWorldbook?.name) {
        lines.push(`新建世界书：${report.createdWorldbook.name}`);
    }

    if (report.created?.name || report.created?.avatar) {
        lines.push(`新建角色：${report.created.name || '未命名'}${report.created.avatar ? ` (${report.created.avatar})` : ''}`);
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

    lines.push(...buildNativeHandoffLines(report, type));

    container.textContent = lines.join('\n');

    const openTargetName = resolveWorldbookOpenTarget(report, type);
    if (openTargetName) {
        const openButton = document.createElement('button');
        openButton.type = 'button';
        openButton.textContent = '打开酒馆原生世界书';
        openButton.addEventListener('click', () => {
            const opened = openWorldInfoEditor(openTargetName);
            if (!opened) {
                container.appendChild(document.createTextNode('\n原生世界书入口不可用，请在酒馆世界书管理器中手动查找。'));
            }
        });
        container.appendChild(document.createTextNode('\n'));
        container.appendChild(openButton);
    }
}

function buildNativeHandoffLines(report, type) {
    if (!report.ok) {
        return [];
    }

    if (type === 'worldbook') {
        return [
            '后续操作：可在酒馆原生世界书管理器继续编辑、移动或删除该世界书。',
        ];
    }

    const lines = [
        '后续操作：可在酒馆原生角色面板继续编辑、选择或删除该角色。',
    ];

    if (report.createdWorldbook?.name) {
        lines.push('绑定说明：角色与本次新建世界书的绑定是独立步骤，请以步骤状态为准。');
    }

    return lines;
}

function resolveWorldbookOpenTarget(report, type) {
    if (!report.ok) {
        return '';
    }

    if (type === 'worldbook') {
        return report.created?.name || '';
    }

    return report.createdWorldbook?.name || '';
}

function readSillyTavernVersion() {
    if (typeof window === 'undefined') {
        return '';
    }

    return window?.SillyTavern?.version || window?.APP_VERSION || '';
}
