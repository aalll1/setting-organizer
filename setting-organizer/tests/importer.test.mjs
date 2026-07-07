import assert from 'node:assert/strict';
import { ERROR_CODES } from '../src/core/errors.js';
import { getLorebookImportReadiness, importLorebookDraft } from '../src/core/importer.js';

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

globalThis.window = {
    localStorage: createMemoryStorage(),
};

const result = {
    lorebookEntries: [
        {
            id: 'l1',
            title: '银月教会',
            keys: ['银月教会'],
            secondaryKeys: [],
            content: '负责治疗',
            enabled: true,
            constant: false,
            priority: 100,
            confidence: 0.9,
        },
    ],
};

const readiness = getLorebookImportReadiness(result);
assert.equal(readiness.canAttempt, true);
assert.equal(readiness.enabledEntryCount, 1);
assert.equal(readiness.hasWorldInfoCreate, false);

const report = await importLorebookDraft(result, { name: '测试世界书' });
assert.equal(report.ok, false);
assert.ok(report.backupId.startsWith('backup_'));
assert.equal(report.error.code, ERROR_CODES.INCOMPATIBLE_API);
assert.ok(report.steps.some((step) => step.id === 'create-backup' && step.status === 'completed'));
assert.ok(report.steps.some((step) => step.id === 'create-worldbook' && step.status === 'failed'));
assert.ok(report.possibleImpact.length > 0);

globalThis.window = {
    localStorage: createMemoryStorage(),
    SillyTavern: {
        getContext() {
            return {
                async createWorldInfo(payload) {
                    return { id: 'world_1', ...payload };
                },
            };
        },
    },
};

const successReport = await importLorebookDraft(result, { name: '测试世界书' });
assert.equal(successReport.ok, true);
assert.equal(successReport.created.id, 'world_1');
assert.ok(successReport.steps.every((step) => step.status === 'completed'));

console.log('importer tests passed');
