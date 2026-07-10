export const CAMPAIGN_STATE_SCHEMA_VERSION = 'campaign-state-v0.1';

export const STATE_ENTITY_TYPES = Object.freeze({
    CHARACTER: 'character',
    FACTION: 'faction',
    MISSION: 'mission',
    ITEM: 'item',
});

export const MISSION_STATUSES = Object.freeze({
    PENDING: 'pending',
    ACTIVE: 'active',
    COMPLETED: 'completed',
    FAILED: 'failed',
    UNKNOWN: 'unknown',
});

export const STATE_BOUNDARIES = Object.freeze({
    CURRENT_STATE: 'current_state',
    HISTORY_ARCHIVE: 'history_archive',
    PERMANENT_LORE: 'permanent_lore',
});

/**
 * @typedef {Object} StateEvidence
 * @property {string} sourceMessageRange - Human-readable source range, such as "12-18".
 * @property {number} confidence - Model confidence from 0 to 1.
 * @property {string[]} warnings - Deterministic or model-provided warnings.
 */

/**
 * @typedef {Object} CampaignState
 * @property {'campaign-state-v0.1'} schemaVersion
 * @property {Object} campaign
 * @property {string} plotSummary
 * @property {Array<Object>} characters
 * @property {Array<Object>} factions
 * @property {Array<Object>} missions
 * @property {Array<Object>} items
 * @property {string[]} warnings
 */

export function createEmptyCampaignState(overrides = {}) {
    return {
        schemaVersion: CAMPAIGN_STATE_SCHEMA_VERSION,
        campaign: {
            id: '',
            name: '',
            genre: '',
            currentTime: '',
            currentLocation: '',
            summary: '',
            lastUpdatedAtMessage: 0,
            sourceMessageRange: '',
            confidence: 1,
            warnings: [],
            ...(overrides.campaign || {}),
        },
        plotSummary: '',
        characters: [],
        factions: [],
        missions: [],
        items: [],
        warnings: [],
        ...withoutCampaignOverride(overrides),
    };
}

function withoutCampaignOverride(overrides) {
    const { campaign, ...rest } = overrides;
    return rest;
}
