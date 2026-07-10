import assert from 'node:assert/strict';
import { ERROR_CODES, SettingOrganizerError } from '../src/core/errors.js';
import { buildCampaignStateExportJson, buildCampaignStateExportPayload, parseCampaignStateImportJson } from '../src/core/stateExporter.js';
import { CAMPAIGN_STATE_SCHEMA_VERSION, createEmptyCampaignState } from '../src/core/stateTypes.js';
import { loadRecentCampaignState, saveRecentCampaignState } from '../src/storage/stateStore.js';

function createMemoryStorage() {
    const data = new Map();
    return {
        getItem(key) {
            return data.has(key) ? data.get(key) : null;
        },
        setItem(key, value) {
            data.set(key, String(value));
        },
    };
}

const state = createEmptyCampaignState({
    campaign: {
        name: '雾城',
        summary: '调查员抵达旧城区入口。',
    },
    characters: [
        {
            id: 'c1',
            type: 'character',
            name: '林月',
            sourceMessageRange: '0-2',
            confidence: 0.8,
            warnings: [],
        },
    ],
});

const payload = buildCampaignStateExportPayload(state);
assert.equal(payload.schemaVersion, CAMPAIGN_STATE_SCHEMA_VERSION);
assert.equal(payload.campaign.name, '雾城');

const json = buildCampaignStateExportJson(state);
const imported = parseCampaignStateImportJson(json);
assert.equal(imported.campaign.summary, '调查员抵达旧城区入口。');
assert.equal(imported.characters[0].name, '林月');

assert.throws(
    () => parseCampaignStateImportJson('{"schemaVersion":"campaign-state-v9","campaign":{},"characters":[],"factions":[],"missions":[],"items":[],"warnings":[]}'),
    (error) => (
        error instanceof SettingOrganizerError
        && error.code === ERROR_CODES.SCHEMA_VALIDATION_FAILED
        && error.message.includes('schemaVersion 不兼容')
    ),
);

assert.throws(
    () => parseCampaignStateImportJson('{bad json'),
    (error) => (
        error instanceof SettingOrganizerError
        && error.code === ERROR_CODES.SCHEMA_VALIDATION_FAILED
    ),
);

const storage = createMemoryStorage();
assert.equal(loadRecentCampaignState(storage), null);
saveRecentCampaignState(state, storage);
const loaded = loadRecentCampaignState(storage);
assert.equal(loaded.campaign.name, '雾城');
assert.equal(loaded.characters.length, 1);

console.log('stateExporter tests passed');
