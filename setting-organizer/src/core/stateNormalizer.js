import {
    CAMPAIGN_STATE_SCHEMA_VERSION,
    MISSION_STATUSES,
    STATE_ENTITY_TYPES,
    createEmptyCampaignState,
} from './stateTypes.js';

const VALID_MISSION_STATUSES = new Set(Object.values(MISSION_STATUSES));

export function normalizeCampaignState(value) {
    const source = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
    const warnings = [];
    const state = createEmptyCampaignState({
        ...source,
        campaign: normalizeCampaign(source.campaign, warnings),
    });

    state.schemaVersion = CAMPAIGN_STATE_SCHEMA_VERSION;
    state.plotSummary = normalizeString(source.plotSummary, '');
    state.characters = normalizeArray(source.characters).map((item, index) => normalizeCharacterState(item, index, warnings));
    state.factions = normalizeArray(source.factions).map((item, index) => normalizeFactionState(item, index, warnings));
    state.missions = normalizeArray(source.missions).map((item, index) => normalizeMissionState(item, index, warnings));
    state.items = normalizeArray(source.items).map((item, index) => normalizeItemState(item, index, warnings));
    state.warnings = [...normalizeStringArray(source.warnings), ...warnings];

    return { result: state, warnings };
}

function normalizeCampaign(value, globalWarnings) {
    const campaign = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
    const warnings = normalizeStringArray(campaign.warnings);

    return {
        id: normalizeString(campaign.id, ''),
        name: normalizeString(campaign.name, ''),
        genre: normalizeString(campaign.genre, ''),
        currentTime: normalizeString(campaign.currentTime, ''),
        currentLocation: normalizeString(campaign.currentLocation, ''),
        summary: normalizeString(campaign.summary, ''),
        lastUpdatedAtMessage: normalizeNumber(campaign.lastUpdatedAtMessage, 0),
        sourceMessageRange: normalizeString(campaign.sourceMessageRange, ''),
        confidence: normalizeConfidence(campaign.confidence, warnings, '剧情概况'),
        warnings: collectWarnings(warnings, globalWarnings),
    };
}

function normalizeCharacterState(value, index, globalWarnings) {
    const item = normalizeStateBase(value, `character_state_${index + 1}`, '人物状态', index, globalWarnings);
    const warnings = item.warnings;

    item.type = STATE_ENTITY_TYPES.CHARACTER;
    item.name = normalizeString(value?.name, '');
    item.aliases = normalizeStringArray(value?.aliases);
    item.role = normalizeString(value?.role, '');
    item.faction = normalizeString(value?.faction, '');
    item.location = normalizeString(value?.location, '');
    item.status = normalizeString(value?.status, '');
    item.currentTask = normalizeString(value?.currentTask, '');
    item.attitudeToPlayer = normalizeString(value?.attitudeToPlayer, '');
    item.resources = normalizeStringArray(value?.resources);
    item.relationships = normalizeStringArray(value?.relationships);
    warnIfMissing(item.name, `人物状态 ${index + 1} 名称为空。`, warnings, globalWarnings);

    return item;
}

function normalizeFactionState(value, index, globalWarnings) {
    const item = normalizeStateBase(value, `faction_state_${index + 1}`, '势力状态', index, globalWarnings);
    const warnings = item.warnings;

    item.type = STATE_ENTITY_TYPES.FACTION;
    item.name = normalizeString(value?.name, '');
    item.leader = normalizeString(value?.leader, '');
    item.controlledRegions = normalizeStringArray(value?.controlledRegions);
    item.stance = normalizeString(value?.stance, '');
    item.attitudeToPlayer = normalizeString(value?.attitudeToPlayer, '');
    item.resources = normalizeString(value?.resources, '');
    item.militaryStatus = normalizeString(value?.militaryStatus, '');
    item.economicStatus = normalizeString(value?.economicStatus, '');
    item.currentGoal = normalizeString(value?.currentGoal, '');
    item.allies = normalizeStringArray(value?.allies);
    item.enemies = normalizeStringArray(value?.enemies);
    warnIfMissing(item.name, `势力状态 ${index + 1} 名称为空。`, warnings, globalWarnings);

    return item;
}

function normalizeMissionState(value, index, globalWarnings) {
    const item = normalizeStateBase(value, `mission_state_${index + 1}`, '任务状态', index, globalWarnings);
    const warnings = item.warnings;
    const rawStatus = normalizeString(value?.status, MISSION_STATUSES.UNKNOWN);

    item.type = STATE_ENTITY_TYPES.MISSION;
    item.title = normalizeString(value?.title, '');
    item.assignee = normalizeString(value?.assignee, '');
    item.assignedAt = normalizeString(value?.assignedAt, '');
    item.destination = normalizeString(value?.destination, '');
    item.objective = normalizeString(value?.objective, '');
    item.status = VALID_MISSION_STATUSES.has(rawStatus) ? rawStatus : MISSION_STATUSES.UNKNOWN;
    item.progress = normalizeString(value?.progress, '');
    item.expectedUpdate = normalizeString(value?.expectedUpdate, '');
    item.result = normalizeString(value?.result, '');
    item.relatedCharacters = normalizeStringArray(value?.relatedCharacters);
    item.relatedFactions = normalizeStringArray(value?.relatedFactions);
    item.relatedItems = normalizeStringArray(value?.relatedItems);

    if (item.status !== rawStatus) {
        const warning = `任务状态 ${index + 1} status 无效，已重置为 unknown。`;
        warnings.push(warning);
        globalWarnings.push(warning);
    }

    warnIfMissing(item.title, `任务状态 ${index + 1} 标题为空。`, warnings, globalWarnings);
    return item;
}

function normalizeItemState(value, index, globalWarnings) {
    const item = normalizeStateBase(value, `item_state_${index + 1}`, '道具状态', index, globalWarnings);
    const warnings = item.warnings;

    item.type = STATE_ENTITY_TYPES.ITEM;
    item.name = normalizeString(value?.name, '');
    item.holder = normalizeString(value?.holder, '');
    item.origin = normalizeString(value?.origin, '');
    item.purpose = normalizeString(value?.purpose, '');
    item.status = normalizeString(value?.status, '');
    item.risk = normalizeString(value?.risk, '');
    item.isUnique = typeof value?.isUnique === 'boolean' ? value.isUnique : true;
    item.isConsumed = typeof value?.isConsumed === 'boolean' ? value.isConsumed : false;
    item.relatedCharacters = normalizeStringArray(value?.relatedCharacters);
    item.relatedMissions = normalizeStringArray(value?.relatedMissions);
    warnIfMissing(item.name, `道具状态 ${index + 1} 名称为空。`, warnings, globalWarnings);

    return item;
}

function normalizeStateBase(value, fallbackId, label, index, globalWarnings) {
    const item = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
    const warnings = normalizeStringArray(item.warnings);

    return {
        id: normalizeString(item.id, fallbackId),
        sourceMessageRange: normalizeString(item.sourceMessageRange, ''),
        confidence: normalizeConfidence(item.confidence, warnings, `${label} ${index + 1}`),
        warnings: collectWarnings(warnings, globalWarnings),
        isActive: typeof item.isActive === 'boolean' ? item.isActive : true,
        isArchived: typeof item.isArchived === 'boolean' ? item.isArchived : false,
        lastKnownUpdate: normalizeString(item.lastKnownUpdate, ''),
    };
}

function collectWarnings(warnings, globalWarnings) {
    globalWarnings.push(...warnings);
    return warnings;
}

function warnIfMissing(value, message, warnings, globalWarnings) {
    if (value) {
        return;
    }

    warnings.push(message);
    globalWarnings.push(message);
}

function normalizeArray(value) {
    return Array.isArray(value) ? value : [];
}

function normalizeString(value, fallback) {
    return typeof value === 'string' ? value : fallback;
}

function normalizeStringArray(value) {
    if (Array.isArray(value)) {
        return value.map((item) => String(item).trim()).filter(Boolean);
    }

    if (typeof value === 'string' && value.trim()) {
        return [value.trim()];
    }

    return [];
}

function normalizeConfidence(value, warnings, label) {
    if (value === undefined || value === null || value === '') {
        return 0.8;
    }

    const numberValue = Number(value);
    if (!Number.isFinite(numberValue)) {
        warnings.push(`${label} confidence 非数字，已重置为 0.8。`);
        return 0.8;
    }

    if (numberValue < 0 || numberValue > 1) {
        warnings.push(`${label} confidence 超出 0 到 1，已截断。`);
        return Math.min(1, Math.max(0, numberValue));
    }

    return numberValue;
}

function normalizeNumber(value, fallback) {
    const numberValue = Number(value);
    return Number.isFinite(numberValue) ? numberValue : fallback;
}
