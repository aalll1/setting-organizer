import assert from 'node:assert/strict';
import { analyzeCampaignStateText } from '../src/core/stateAnalyzer.js';
import { ERROR_CODES, SettingOrganizerError } from '../src/core/errors.js';
import { CAMPAIGN_STATE_SCHEMA_VERSION } from '../src/core/stateTypes.js';

globalThis.window = {
    setTimeout(callback) {
        callback();
    },
};

await assert.rejects(
    () => analyzeCampaignStateText('', { analysisMode: 'mock' }),
    (error) => error instanceof SettingOrganizerError && error.code === ERROR_CODES.EMPTY_INPUT,
);

await assert.rejects(
    () => analyzeCampaignStateText(null, { analysisMode: 'mock' }),
    (error) => error instanceof SettingOrganizerError && error.code === ERROR_CODES.INVALID_INPUT,
);

const state = await analyzeCampaignStateText('林月抵达旧城区入口，准备寻找银钥匙。', {
    analysisMode: 'mock',
    sourceMessageRange: '0-2',
});

assert.equal(state.schemaVersion, CAMPAIGN_STATE_SCHEMA_VERSION);
assert.equal(state.characters.length, 1);
assert.equal(state.missions.length, 1);
assert.equal(state.characters[0].sourceMessageRange, '0-2');
assert.ok(state.warnings.some((warning) => warning.includes('未写入')));

console.log('stateAnalyzer tests passed');
