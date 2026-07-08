import assert from 'node:assert/strict';
import { clearLogs, buildDiagnosticSnapshot, listLogs, logError, logInfo } from '../src/core/logger.js';

globalThis.console = {
    log() {},
    info() {},
    warn() {},
    error() {},
};

function createMemoryStorage() {
    const values = new Map();

    return {
        getItem(key) {
            return values.has(key) ? values.get(key) : null;
        },
        setItem(key, value) {
            values.set(key, value);
        },
        removeItem(key) {
            values.delete(key);
        },
    };
}

const storage = createMemoryStorage();
globalThis.window = {
    localStorage: storage,
    location: {
        href: 'http://localhost/test',
    },
    SillyTavern: {
        version: 'test-version',
    },
};
Object.defineProperty(globalThis, 'navigator', {
    configurable: true,
    value: {
        userAgent: 'node-test',
    },
});

clearLogs();

logInfo('test-started', {
    sourceText: '这是一段需要截断或摘要的正文'.repeat(20),
    headers: {
        authorization: 'Bearer secret',
    },
    apiKey: 'secret',
});

let logs = listLogs();
assert.equal(logs.length, 1);
assert.equal(logs[0].event, 'test-started');
assert.equal(logs[0].details.apiKey, '<redacted>');
assert.equal(logs[0].details.headers, '<redacted>');
assert.equal(typeof logs[0].details.sourceText.length, 'number');

logError('test-failed', Object.assign(new Error('boom'), { code: 'E999', details: { token: 'secret' } }));
logs = listLogs();
assert.equal(logs[0].level, 'error');
assert.equal(logs[0].details.error.code, 'E999');
assert.equal(logs[0].details.error.message, 'boom');
assert.equal(logs[0].details.error.details.token, '<redacted>');

for (let index = 0; index < 205; index += 1) {
    logInfo('overflow-test', { index });
}

logs = listLogs();
assert.equal(logs.length, 200);
assert.equal(logs[0].details.index, 204);

const snapshot = buildDiagnosticSnapshot({ prompt: '敏感提示词'.repeat(50) });
assert.equal(snapshot.app, 'setting-organizer');
assert.equal(snapshot.sillyTavernVersion, 'test-version');
assert.equal(snapshot.extra.prompt.truncated, true);
assert.ok(Array.isArray(snapshot.logs));
assert.doesNotThrow(() => JSON.parse(JSON.stringify(snapshot)));

clearLogs();
assert.equal(listLogs().length, 0);

console.log('logger tests passed');
