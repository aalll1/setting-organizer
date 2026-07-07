import assert from 'node:assert/strict';
import { ERROR_CODES, SettingOrganizerError } from '../src/core/errors.js';
import { callCurrentModel, createCharacter, getCharacterSummaries, getCompatibilitySnapshot } from '../src/adapters/sillytavernApi.js';

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

const characterContext = {
    characters: [{ name: '旧角色', avatar: 'old.png' }],
    getRequestHeaders(options) {
        assert.equal(options.omitContentType, true);
        return { 'x-csrf-token': 'test' };
    },
    async getCharacters() {
        this.characters = [
            ...this.characters,
            { name: '林月', avatar: 'lin_yue.png' },
        ];
    },
};

globalThis.window = {
    SillyTavern: {
        getContext() {
            return characterContext;
        },
    },
};

globalThis.fetch = async (url, options) => {
    assert.equal(url, '/api/characters/create');
    assert.equal(options.method, 'POST');
    assert.equal(options.body.get('ch_name'), '林月');
    return {
        ok: true,
        async text() {
            return 'lin_yue.png';
        },
    };
};

const characterSnapshot = getCompatibilitySnapshot();
assert.equal(characterSnapshot.hasCharacterCreate, true);
assert.equal(characterSnapshot.hasCharacters, true);

const created = await createCharacter({
    fields: {
        ch_name: '林月',
        description: '记录员',
    },
});
assert.equal(created.avatar, 'lin_yue.png');
assert.deepEqual(getCharacterSummaries(), [
    { name: '旧角色', avatar: 'old.png' },
    { name: '林月', avatar: 'lin_yue.png' },
]);

console.log('sillytavern api tests passed');
