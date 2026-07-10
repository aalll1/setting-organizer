import assert from 'node:assert/strict';
import { ERROR_CODES, SettingOrganizerError } from '../src/core/errors.js';
import { buildExtractStatePrompt, EXTRACT_STATE_PROMPT_VERSION } from '../src/prompts/extractState.js';
import { parseValidateNormalize } from '../src/core/validator.js';
import { parseValidateNormalizeCampaignState } from '../src/core/stateParser.js';
import { CAMPAIGN_STATE_SCHEMA_VERSION, MISSION_STATUSES } from '../src/core/stateTypes.js';

const stateJson = JSON.stringify({
    schemaVersion: CAMPAIGN_STATE_SCHEMA_VERSION,
    campaign: {
        name: '雾城',
        summary: '调查员抵达旧城区入口。',
        sourceMessageRange: '0-3',
        confidence: 0.9,
        warnings: [],
    },
    characters: [
        {
            type: 'character',
            name: '林月',
            location: '旧城区入口',
            sourceMessageRange: '1-2',
            confidence: 0.8,
            warnings: [],
        },
    ],
    factions: [],
    missions: [
        {
            type: 'mission',
            title: '寻找银钥匙',
            status: MISSION_STATUSES.ACTIVE,
            sourceMessageRange: '2-3',
            confidence: 0.7,
            warnings: [],
        },
    ],
    items: [],
    warnings: [],
});

const parsed = parseValidateNormalizeCampaignState(stateJson);
assert.equal(parsed.schemaVersion, CAMPAIGN_STATE_SCHEMA_VERSION);
assert.equal(parsed.campaign.name, '雾城');
assert.equal(parsed.characters[0].id, 'character_state_1');
assert.equal(parsed.characters[0].name, '林月');
assert.equal(parsed.missions[0].status, MISSION_STATUSES.ACTIVE);

const markdownParsed = parseValidateNormalizeCampaignState(`\`\`\`json\n${stateJson}\n\`\`\``);
assert.equal(markdownParsed.campaign.summary, '调查员抵达旧城区入口。');

const prefixedParsed = parseValidateNormalizeCampaignState(`整理结果如下：\n${stateJson}\n请检查。`);
assert.equal(prefixedParsed.characters.length, 1);

const normalized = parseValidateNormalizeCampaignState('{"characters":[{"name":"林月","confidence":2}]}');
assert.equal(normalized.schemaVersion, CAMPAIGN_STATE_SCHEMA_VERSION);
assert.equal(normalized.characters[0].confidence, 1);
assert.ok(normalized.warnings.some((warning) => warning.includes('confidence 超出')));

const invalidMission = parseValidateNormalizeCampaignState('{"missions":[{"title":"未知任务","status":"paused"}]}');
assert.equal(invalidMission.missions[0].status, MISSION_STATUSES.UNKNOWN);
assert.ok(invalidMission.warnings.some((warning) => warning.includes('status 无效')));

assert.throws(
    () => parseValidateNormalizeCampaignState('{"campaign":{"summary":"半截"'),
    (error) => (
        error instanceof SettingOrganizerError
        && error.code === ERROR_CODES.INVALID_JSON
        && error.message.includes('疑似被截断')
    ),
);

assert.throws(
    () => parseValidateNormalizeCampaignState('{"characters":{}}'),
    (error) => (
        error instanceof SettingOrganizerError
        && error.code === ERROR_CODES.SCHEMA_VALIDATION_FAILED
        && error.message.includes('characters 必须是数组')
    ),
);

const prompt = buildExtractStatePrompt('林月抵达旧城区。', { sourceMessageRange: '0-1' });
assert.ok(prompt.includes(EXTRACT_STATE_PROMPT_VERSION));
assert.ok(prompt.includes(CAMPAIGN_STATE_SCHEMA_VERSION));
assert.ok(prompt.includes('只输出一个压缩 JSON 对象'));
assert.ok(prompt.includes('sourceMessageRange: 0-1'));
assert.ok(prompt.length < 5000);

const settingParsed = parseValidateNormalize('{"characters":[{"name":"林月"}],"lorebookEntries":[]}');
assert.equal(settingParsed.characters[0].name, '林月');

console.log('stateParser tests passed');
