import assert from 'node:assert/strict';
import { clearLogs, listLogs } from '../src/core/logger.js';
import { captureModelOutputDebug, getModelOutputDebugSummary, getRawModelOutputExport } from '../src/core/modelOutputDebug.js';

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

globalThis.window = {
    localStorage: createMemoryStorage(),
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

const rawOutput = '```json\n{"characters":[{"name":"林月"}],"lorebookEntries":[]}\n```';
const summary = captureModelOutputDebug({
    sourceText: '林月是一名银月教会的见习祭司。',
    options: {
        targets: { character: true, lorebook: true },
        tokenBudgetMode: 'standard',
    },
    rawOutput,
});

assert.equal(summary.rawOutputLength, rawOutput.length);
assert.ok(summary.promptLength > summary.sourceLength);
assert.equal(summary.inspection.hasFencedJson, true);
assert.equal(summary.inspection.isLikelyTruncated, false);

const currentSummary = getModelOutputDebugSummary();
assert.deepEqual(currentSummary, summary);
assert.equal('rawOutput' in currentSummary, false);

const exported = getRawModelOutputExport();
assert.equal(exported.content, rawOutput);
assert.ok(exported.filename.startsWith('setting-organizer-raw-model-output-'));

const logs = listLogs();
assert.equal(logs[0].event, 'model-output-debug-captured');
assert.equal(logs[0].details.rawOutputLength, rawOutput.length);
assert.equal(logs[0].details.rawOutput, undefined);

console.log('model output debug tests passed');
