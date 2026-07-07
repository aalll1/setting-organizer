import assert from 'node:assert/strict';
import { ERROR_CODES, SettingOrganizerError } from '../src/core/errors.js';
import { createAndSaveBackup, createBackupRecord, listBackups, saveBackup } from '../src/storage/backups.js';

function createMemoryStorage() {
    const values = new Map();

    return {
        getItem(key) {
            return values.has(key) ? values.get(key) : null;
        },
        setItem(key, value) {
            values.set(key, value);
        },
    };
}

const storage = createMemoryStorage();
const record = createBackupRecord({
    operation: 'test',
    sourceDraft: { characters: [{ name: '林月' }] },
    targetInfo: { mode: 'local-only' },
    beforeState: { characters: [] },
    sillyTavernVersion: 'test-version',
});

assert.equal(record.backupVersion, '0.1.0');
assert.equal(record.operation, 'test');
assert.equal(record.afterState, null);
assert.ok(record.id.startsWith('backup_'));

saveBackup(record, storage);
assert.equal(listBackups(storage).length, 1);

const second = createAndSaveBackup({ operation: 'second', sourceDraft: {} }, storage);
assert.equal(listBackups(storage)[0].id, second.id);

const failingStorage = {
    getItem() {
        return '[]';
    },
    setItem() {
        throw new Error('quota exceeded');
    },
};

assert.throws(
    () => saveBackup(record, failingStorage),
    (error) => error instanceof SettingOrganizerError && error.code === ERROR_CODES.BACKUP_FAILED,
);

console.log('backups tests passed');
