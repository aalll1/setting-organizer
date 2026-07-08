import { ERROR_CODES, SettingOrganizerError } from '../core/errors.js';

const BACKUP_STORAGE_KEY = 'setting-organizer.backups.v1';
const BACKUP_VERSION = '0.1.0';

export function createBackupRecord({
    operation,
    sourceDraft,
    targetInfo = {},
    beforeState = {},
    sillyTavernVersion = '',
}) {
    const createdAt = new Date().toISOString();

    return {
        backupVersion: BACKUP_VERSION,
        id: createBackupId(createdAt),
        createdAt,
        operation: operation || 'manual-backup',
        sillyTavernVersion,
        sourceDraft: cloneJson(sourceDraft || {}),
        targetInfo: cloneJson(targetInfo),
        beforeState: cloneJson(beforeState),
        afterState: null,
    };
}

export function saveBackup(record, storage = window.localStorage) {
    try {
        const backups = listBackups(storage);
        backups.unshift(record);
        storage.setItem(BACKUP_STORAGE_KEY, JSON.stringify(backups));
        return record;
    } catch (error) {
        throw new SettingOrganizerError(ERROR_CODES.BACKUP_FAILED, '创建备份失败。', {
            cause: error.message,
        });
    }
}

export function createAndSaveBackup(input, storage = window.localStorage) {
    return saveBackup(createBackupRecord(input), storage);
}

export function listBackups(storage = window.localStorage) {
    try {
        const raw = storage.getItem(BACKUP_STORAGE_KEY);
        if (!raw) {
            return [];
        }

        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        throw new SettingOrganizerError(ERROR_CODES.BACKUP_FAILED, '读取备份失败。', {
            cause: error.message,
        });
    }
}

function createBackupId(createdAt) {
    return `backup_${createdAt.replace(/[-:.TZ]/g, '')}_${Math.random().toString(36).slice(2, 8)}`;
}

function cloneJson(value) {
    return JSON.parse(JSON.stringify(value));
}
