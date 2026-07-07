import assert from 'node:assert/strict';
import { buildExportJson, buildExportPayload, EXPORT_TYPES } from '../src/core/exporter.js';

const result = {
    characters: [
        {
            id: 'c1',
            name: '林月',
            description: '见习祭司',
            personality: '温和',
            scenario: '寻找导师',
            firstMes: '你好',
            mesExample: '',
            creatorNotes: '测试',
            confidence: 0.8,
            warnings: ['内部警告'],
        },
    ],
    lorebookEntries: [
        {
            id: 'l1',
            title: '银月教会',
            category: 'organization',
            keys: ['银月教会'],
            secondaryKeys: [],
            content: '负责治疗',
            constant: false,
            enabled: true,
            priority: 100,
            stability: 'permanent',
            confidence: 0.9,
            warnings: [],
        },
    ],
};

const stCharacter = buildExportPayload(result, EXPORT_TYPES.SILLYTAVERN_CHARACTERS)[0];
assert.equal(stCharacter.name, '林月');
assert.equal(stCharacter.first_mes, '你好');
assert.equal(stCharacter.warnings, undefined);

const worldInfo = buildExportPayload(result, EXPORT_TYPES.SILLYTAVERN_WORLD_INFO);
assert.deepEqual(worldInfo.entries[0].key, ['银月教会']);
assert.equal(worldInfo.entries[0].comment, '银月教会');
assert.equal(worldInfo.entries[0].disable, false);

assert.doesNotThrow(() => JSON.parse(buildExportJson(result, EXPORT_TYPES.INTERNAL_FULL)));

console.log('exporter tests passed');
