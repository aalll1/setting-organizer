import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import {
    CAMPAIGN_STATE_SCHEMA_VERSION,
    MISSION_STATUSES,
    STATE_BOUNDARIES,
    STATE_ENTITY_TYPES,
    createEmptyCampaignState,
} from '../src/core/stateTypes.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const schemaPath = resolve(__dirname, '../src/schemas/campaignState.schema.json');
const schema = JSON.parse(await readFile(schemaPath, 'utf8'));

assert.equal(CAMPAIGN_STATE_SCHEMA_VERSION, 'campaign-state-v0.1');
assert.equal(schema.properties.schemaVersion.const, CAMPAIGN_STATE_SCHEMA_VERSION);

assert.deepEqual(Object.values(STATE_ENTITY_TYPES), [
    'character',
    'faction',
    'mission',
    'item',
]);

assert.deepEqual(Object.values(MISSION_STATUSES), [
    'pending',
    'active',
    'completed',
    'failed',
    'unknown',
]);

assert.deepEqual(Object.values(STATE_BOUNDARIES), [
    'current_state',
    'history_archive',
    'permanent_lore',
]);

const emptyState = createEmptyCampaignState({
    campaign: {
        id: 'campaign_1',
        name: '雾城',
    },
});

assert.equal(emptyState.schemaVersion, CAMPAIGN_STATE_SCHEMA_VERSION);
assert.equal(emptyState.campaign.id, 'campaign_1');
assert.equal(emptyState.campaign.name, '雾城');
assert.deepEqual(emptyState.characters, []);
assert.deepEqual(emptyState.factions, []);
assert.deepEqual(emptyState.missions, []);
assert.deepEqual(emptyState.items, []);
assert.deepEqual(emptyState.warnings, []);

for (const collection of ['characters', 'factions', 'missions', 'items']) {
    const itemRef = schema.properties[collection].items.$ref;
    assert.match(itemRef, /^#\/\$defs\//);
}

for (const definitionName of ['characterState', 'factionState', 'missionState', 'itemState']) {
    const definition = schema.$defs[definitionName];
    assert.ok(definition.allOf, `${definitionName} should extend stateBase`);
}

assert.deepEqual(schema.$defs.stateBase.required, ['id', 'sourceMessageRange', 'confidence', 'warnings']);

console.log('stateTypes tests passed');
