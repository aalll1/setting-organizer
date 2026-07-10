import assert from 'node:assert/strict';
import { ERROR_CODES, SettingOrganizerError } from '../src/core/errors.js';
import { bindCharacterWorld, callCurrentModel, callCurrentStateModel, createCharacter, getCharacterSummaries, getCompatibilitySnapshot, openWorldInfoEditor } from '../src/adapters/sillytavernApi.js';

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

globalThis.window = {
    SillyTavern: {
        getContext() {
            return {
                async generateQuietPrompt(prompt) {
                    assert.ok(prompt.includes('剧情状态整理模块'));
                    assert.ok(prompt.includes('campaign-state-v0.1'));
                    return '{"schemaVersion":"campaign-state-v0.1","campaign":{},"characters":[],"factions":[],"missions":[],"items":[],"warnings":[]}';
                },
            };
        },
    },
};

const rawStateText = await callCurrentStateModel('剧情测试文本', { sourceMessageRange: '0-1' });
assert.ok(rawStateText.includes('campaign-state-v0.1'));

const characterContext = {
    characters: [{ name: '旧角色', avatar: 'old.png' }],
    getRequestHeaders(options) {
        if (options) {
            assert.equal(options.omitContentType, true);
        }
        return { 'x-csrf-token': 'test' };
    },
    async getCharacters() {
        this.characters = [
            ...this.characters,
            { name: '林月', avatar: 'lin_yue.png' },
        ];
    },
    async getOneCharacter(avatar) {
        this.loadedAvatar = avatar;
    },
    reloadWorldInfoEditor(name) {
        this.openedWorldInfo = name;
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
    if (url === '/api/characters/create') {
        assert.equal(options.method, 'POST');
        assert.equal(options.body.get('ch_name'), '林月');
        return {
            ok: true,
            async text() {
                return 'lin_yue.png';
            },
        };
    }

    if (url === '/api/characters/merge-attributes') {
        assert.equal(options.method, 'POST');
        const payload = JSON.parse(options.body);
        assert.equal(payload.avatar, 'lin_yue.png');
        assert.equal(payload.data.extensions.world, '绑定世界书');
        return {
            ok: true,
            async json() {
                return {};
            },
        };
    }

    throw new Error(`unexpected fetch: ${url}`);
};

const characterSnapshot = getCompatibilitySnapshot();
assert.equal(characterSnapshot.hasCharacterCreate, true);
assert.equal(characterSnapshot.hasCharacterWorldBind, true);
assert.equal(characterSnapshot.hasWorldInfoEditorOpen, true);
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

const bindResult = await bindCharacterWorld({
    avatar: 'lin_yue.png',
    worldName: '绑定世界书',
});
assert.equal(bindResult.avatar, 'lin_yue.png');
assert.equal(bindResult.worldName, '绑定世界书');
assert.equal(characterContext.loadedAvatar, 'lin_yue.png');

assert.equal(openWorldInfoEditor('绑定世界书'), true);
assert.equal(characterContext.openedWorldInfo, '绑定世界书');

globalThis.window = {
    SillyTavern: {
        getContext() {
            return {};
        },
    },
};

assert.equal(openWorldInfoEditor('绑定世界书'), false);

console.log('sillytavern api tests passed');
