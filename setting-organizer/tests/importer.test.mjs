import assert from 'node:assert/strict';
import { ERROR_CODES } from '../src/core/errors.js';
import { getCharacterImportReadiness, getLorebookImportReadiness, importCharacterDraft, importLorebookDraft } from '../src/core/importer.js';

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

const mockContext = {
    names: ['旧世界书'],
    getWorldInfoNames() {
        return this.names;
    },
    async saveWorldInfo(name, data) {
        this.names = [...this.names, name];
        this.saved = { name, data };
    },
    async updateWorldInfoList() {
        return undefined;
    },
};

globalThis.window = {
    localStorage: createMemoryStorage(),
    SillyTavern: {
        getContext() {
            return mockContext;
        },
    },
};

const successReport = await importLorebookDraft(result, { name: '测试世界书' });
assert.equal(successReport.ok, true);
assert.equal(successReport.created.name, '测试世界书');
assert.equal(successReport.created.entryCount, 1);
assert.ok(successReport.steps.every((step) => step.status === 'completed'));

const characterResult = {
    characters: [
        {
            id: 'c1',
            name: '林月',
            description: '银月教会的记录员',
            personality: '谨慎',
            scenario: '在旧书库中整理档案',
            firstMes: '你也在找这份档案吗？',
            mesExample: '',
            creatorNotes: '',
            systemPrompt: '',
            confidence: 0.8,
        },
    ],
    lorebookEntries: [
        {
            id: 'l2',
            title: '绑定世界书',
            keys: ['绑定世界书'],
            secondaryKeys: [],
            content: '用于验证角色绑定世界书。',
            enabled: true,
            constant: false,
            priority: 100,
            confidence: 0.8,
        },
    ],
};

const characterReadinessWithoutContext = getCharacterImportReadiness(characterResult);
assert.equal(characterReadinessWithoutContext.canAttempt, true);
assert.equal(characterReadinessWithoutContext.hasCharacterCreate, false);

const characterContext = {
    characters: [{ name: '旧角色', avatar: 'old.png' }],
    names: ['旧世界书'],
    getWorldInfoNames() {
        return this.names;
    },
    async saveWorldInfo(name, data) {
        this.names = [...this.names, name];
        this.savedWorldInfo = { name, data };
    },
    async updateWorldInfoList() {
        return undefined;
    },
    getRequestHeaders(options) {
        if (options) {
            assert.equal(options.omitContentType, true);
        }
        return { 'x-csrf-token': 'test' };
    },
    async getCharacters() {
        return this.characters;
    },
    async getOneCharacter(avatar) {
        this.loadedAvatar = avatar;
    },
};

globalThis.window = {
    localStorage: createMemoryStorage(),
    SillyTavern: {
        getContext() {
            return characterContext;
        },
    },
    fetch: async (url, options) => {
        if (url === '/api/characters/create') {
            assert.equal(options.method, 'POST');
            assert.equal(options.body.get('ch_name'), '林月');
            characterContext.characters = [
                ...characterContext.characters,
                { name: '林月', avatar: 'lin_yue.png' },
            ];
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
            characterContext.boundWorld = payload.data.extensions.world;
            characterContext.characters = characterContext.characters.map((character) => (
                character.avatar === payload.avatar
                    ? { ...character, data: { extensions: { world: payload.data.extensions.world } } }
                    : character
            ));
            return {
                ok: true,
                async json() {
                    return {};
                },
            };
        }

        throw new Error(`unexpected fetch: ${url}`);
    },
};
globalThis.fetch = globalThis.window.fetch;

const characterReadiness = getCharacterImportReadiness(characterResult);
assert.equal(characterReadiness.canAttempt, true);
assert.equal(characterReadiness.characterCount, 1);
assert.equal(characterReadiness.hasCharacterCreate, true);

const characterReport = await importCharacterDraft(characterResult);
assert.equal(characterReport.ok, true);
assert.equal(characterReport.created.avatar, 'lin_yue.png');
assert.ok(characterReport.steps.every((step) => step.status === 'completed'));

const boundCharacterReport = await importCharacterDraft(characterResult, {
    bindCreatedWorldbook: true,
    worldbookName: '绑定世界书',
});
assert.equal(boundCharacterReport.ok, true);
assert.equal(boundCharacterReport.createdWorldbook.name, '绑定世界书');
assert.equal(characterContext.boundWorld, '绑定世界书');
assert.ok(boundCharacterReport.steps.some((step) => step.id === 'bind-character-worldbook' && step.status === 'completed'));

globalThis.window.fetch = async (url, options) => {
    if (url === '/api/characters/create') {
        characterContext.characters = [
            ...characterContext.characters,
            { name: '林月', avatar: 'lin_yue_bind_fail.png' },
        ];
        return {
            ok: true,
            async text() {
                return 'lin_yue_bind_fail.png';
            },
        };
    }

    if (url === '/api/characters/merge-attributes') {
        return {
            ok: false,
            async json() {
                return { message: 'bind failed' };
            },
        };
    }

    throw new Error(`unexpected fetch: ${url}`);
};
globalThis.fetch = globalThis.window.fetch;

const bindFailedReport = await importCharacterDraft(characterResult, {
    bindCreatedWorldbook: true,
    worldbookName: '绑定失败世界书',
});
assert.equal(bindFailedReport.ok, false);
assert.ok(bindFailedReport.steps.some((step) => step.id === 'create-character' && step.status === 'completed'));
assert.ok(bindFailedReport.steps.some((step) => step.id === 'bind-character-worldbook' && step.status === 'failed'));
assert.equal(bindFailedReport.error.code, ERROR_CODES.CHARACTER_WORLD_BIND_FAILED);

console.log('importer tests passed');
