import { ERROR_CODES, SettingOrganizerError } from './errors.js';
import { CAMPAIGN_STATE_SCHEMA_VERSION, MISSION_STATUSES, STATE_ENTITY_TYPES } from './stateTypes.js';
import { normalizeCampaignState } from './stateNormalizer.js';

const VALID_ENTITY_TYPES = new Set(Object.values(STATE_ENTITY_TYPES));
const VALID_MISSION_STATUSES = new Set(Object.values(MISSION_STATUSES));

export function validateAndNormalizeCampaignState(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        throw new SettingOrganizerError(ERROR_CODES.SCHEMA_VALIDATION_FAILED, '剧情状态顶层必须是对象。');
    }

    validateRawStateShape(value);
    const { result } = normalizeCampaignState(value);
    validateNormalizedStateShape(result);

    return result;
}

function validateRawStateShape(value) {
    if ('schemaVersion' in value && value.schemaVersion !== CAMPAIGN_STATE_SCHEMA_VERSION) {
        throw new SettingOrganizerError(ERROR_CODES.SCHEMA_VALIDATION_FAILED, '剧情状态 schemaVersion 不兼容。');
    }

    for (const key of ['characters', 'factions', 'missions', 'items']) {
        if (key in value && !Array.isArray(value[key])) {
            throw new SettingOrganizerError(ERROR_CODES.SCHEMA_VALIDATION_FAILED, `${key} 必须是数组。`);
        }
    }

    if ('campaign' in value && (!value.campaign || typeof value.campaign !== 'object' || Array.isArray(value.campaign))) {
        throw new SettingOrganizerError(ERROR_CODES.SCHEMA_VALIDATION_FAILED, 'campaign 必须是对象。');
    }
}

function validateNormalizedStateShape(result) {
    if (result.schemaVersion !== CAMPAIGN_STATE_SCHEMA_VERSION) {
        throw new SettingOrganizerError(ERROR_CODES.SCHEMA_VALIDATION_FAILED, '剧情状态 schemaVersion 不兼容。');
    }

    if (!result.campaign || typeof result.campaign !== 'object' || Array.isArray(result.campaign)) {
        throw new SettingOrganizerError(ERROR_CODES.SCHEMA_VALIDATION_FAILED, '剧情状态缺少 campaign 对象。');
    }

    for (const key of ['characters', 'factions', 'missions', 'items', 'warnings']) {
        if (!Array.isArray(result[key])) {
            throw new SettingOrganizerError(ERROR_CODES.SCHEMA_VALIDATION_FAILED, `剧情状态 ${key} 必须是数组。`);
        }
    }

    for (const collection of [result.characters, result.factions, result.missions, result.items]) {
        const invalid = collection.find((item) => !isValidStateItem(item));
        if (invalid) {
            throw new SettingOrganizerError(ERROR_CODES.SCHEMA_VALIDATION_FAILED, '剧情状态条目结构不完整。');
        }
    }

    const invalidMission = result.missions.find((mission) => !VALID_MISSION_STATUSES.has(mission.status));
    if (invalidMission) {
        throw new SettingOrganizerError(ERROR_CODES.SCHEMA_VALIDATION_FAILED, '任务状态 status 不兼容。');
    }
}

function isValidStateItem(item) {
    return item
        && typeof item === 'object'
        && !Array.isArray(item)
        && typeof item.id === 'string'
        && typeof item.sourceMessageRange === 'string'
        && typeof item.confidence === 'number'
        && Array.isArray(item.warnings)
        && VALID_ENTITY_TYPES.has(item.type);
}
