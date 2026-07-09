import assert from 'node:assert/strict';
import { analyzeSettingText } from '../src/core/analyzer.js';
import { ERROR_CODES, SettingOrganizerError } from '../src/core/errors.js';

globalThis.window = {
    setTimeout(callback) {
        callback();
    },
};

await assert.rejects(
    () => analyzeSettingText('', { analysisMode: 'mock', targets: { character: true, lorebook: true } }),
    (error) => error instanceof SettingOrganizerError && error.code === ERROR_CODES.EMPTY_INPUT,
);

await assert.rejects(
    () => analyzeSettingText(null, { analysisMode: 'mock', targets: { character: true, lorebook: true } }),
    (error) => error instanceof SettingOrganizerError && error.code === ERROR_CODES.INVALID_INPUT,
);

console.log('analyzer tests passed');
