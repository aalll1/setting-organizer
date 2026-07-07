import { formatError } from '../core/errors.js';
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

function readSillyTavernVersion() {
    if (typeof window === 'undefined') {
        return '';
    }

    return window?.SillyTavern?.version || window?.APP_VERSION || '';
}
