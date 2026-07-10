import { isArchivedStateItem } from './stateArchive.js';
import { validateAndNormalizeCampaignState } from './stateValidator.js';

const COLLECTION_RULES = Object.freeze([
    {
        collection: 'characters',
        entityType: 'character',
        label: '人物',
        identityField: 'name',
        field: 'location',
        ruleId: 'character-location-conflict',
        message: '同名人物存在多个当前位置。',
        suggestion: '确认最新位置，并将旧位置归档。',
    },
    {
        collection: 'characters',
        entityType: 'character',
        label: '人物',
        identityField: 'name',
        field: 'status',
        ruleId: 'character-status-conflict',
        message: '同名人物存在多个当前状态。',
        suggestion: '确认人物当前生死或状态，并归档旧状态。',
    },
    {
        collection: 'missions',
        entityType: 'mission',
        label: '任务',
        identityField: 'title',
        field: 'status',
        ruleId: 'mission-status-conflict',
        message: '同一任务存在多个状态。',
        suggestion: '确认任务当前状态，并归档旧状态。',
    },
    {
        collection: 'items',
        entityType: 'item',
        label: '道具',
        identityField: 'name',
        field: 'holder',
        ruleId: 'item-holder-conflict',
        message: '同一道具存在多个持有人。',
        suggestion: '确认道具当前持有人，并归档旧持有人记录。',
    },
    {
        collection: 'factions',
        entityType: 'faction',
        label: '势力',
        identityField: 'name',
        field: 'attitudeToPlayer',
        ruleId: 'faction-attitude-conflict',
        message: '同一势力存在多个对玩家态度。',
        suggestion: '确认势力当前态度，并归档旧态度记录。',
    },
]);

const ARCHIVE_COLLECTIONS = Object.freeze([
    ['characters', 'character', '人物'],
    ['factions', 'faction', '势力'],
    ['missions', 'mission', '任务'],
    ['items', 'item', '道具'],
]);

export function detectCampaignStateConflicts(campaignState) {
    const state = validateAndNormalizeCampaignState(campaignState);
    const conflicts = [];

    for (const rule of COLLECTION_RULES) {
        conflicts.push(...detectFieldConflicts(state[rule.collection], rule));
    }

    for (const [collection, entityType, label] of ARCHIVE_COLLECTIONS) {
        conflicts.push(...detectActiveArchivedConflicts(state[collection], { collection, entityType, label }));
    }

    return conflicts;
}

function detectFieldConflicts(items, rule) {
    const grouped = new Map();

    for (const item of items) {
        if (isArchivedStateItem(item)) {
            continue;
        }

        const identity = normalizeKey(item[rule.identityField] || item.id);
        const value = normalizeValue(item[rule.field]);
        if (!identity || !value) {
            continue;
        }

        if (!grouped.has(identity)) {
            grouped.set(identity, new Map());
        }

        const values = grouped.get(identity);
        if (!values.has(value)) {
            values.set(value, []);
        }

        values.get(value).push(item);
    }

    const conflicts = [];
    for (const [identity, values] of grouped.entries()) {
        if (values.size < 2) {
            continue;
        }

        conflicts.push({
            ruleId: rule.ruleId,
            severity: 'warning',
            entityType: rule.entityType,
            label: rule.label,
            identity,
            field: rule.field,
            values: [...values.keys()],
            itemIds: [...values.values()].flat().map((item) => item.id),
            message: `${rule.message}（${identity}）`,
            suggestion: rule.suggestion,
        });
    }

    return conflicts;
}

function detectActiveArchivedConflicts(items, { collection, entityType, label }) {
    return items
        .filter((item) => item.isArchived === true && item.isActive === true)
        .map((item) => ({
            ruleId: 'active-archived-conflict',
            severity: 'warning',
            entityType,
            label,
            identity: normalizeKey(item.name || item.title || item.id),
            field: 'isArchived',
            values: ['isArchived:true', 'isActive:true'],
            itemIds: [item.id],
            message: `${label}条目同时标记为当前状态和历史归档。`,
            suggestion: '确认该条目应为当前状态还是历史归档，不要同时启用两个边界。',
            collection,
        }));
}

function normalizeKey(value) {
    return String(value || '').trim().toLocaleLowerCase();
}

function normalizeValue(value) {
    if (Array.isArray(value)) {
        return value.map((item) => String(item).trim()).filter(Boolean).join(', ');
    }

    return String(value || '').trim();
}
