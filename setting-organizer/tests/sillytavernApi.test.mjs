import assert from 'node:assert/strict';
import { ERROR_CODES, SettingOrganizerError } from '../src/core/errors.js';
import { callCurrentModel, getCompatibilitySnapshot } from '../src/adapters/sillytavernApi.js';

globalThis.window = {};

const snapshot = getCompatibilitySnapshot();
assert.equal(snapshot.hasContext, false);

await assert.rejects(
    () => callCurrentModel('测试文本', {}),
    (error) => error instanceof SettingOrganizerError && error.code === ERROR_CODES.INCOMPATIBLE_API,
);

globalThis.window = {
    SillyTavern: {
        getContext() {
            return {
                async generateQuietPrompt(prompt) {
                    assert.ok(prompt.includes('测试文本'));
                    return '{"characters":[{"name":"林月"}],"lorebookEntries":[]}';
                },
            };
        },
    },
};

const rawText = await callCurrentModel('测试文本', { targets: { character: true } });
assert.ok(rawText.includes('林月'));

console.log('sillytavern api tests passed');
