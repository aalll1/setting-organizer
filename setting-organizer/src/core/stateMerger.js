import { archiveStateItem, isArchivedStateItem } from './stateArchive.js';
import { validateAndNormalizeCampaignState } from './stateValidator.js';

const COLLECTIONS = Object.freeze([
    {
        key: 'characters',
        entityType: 'character',
        label: '人物',
        identityField: 'name',
        compareFields: [
            'name',
            'aliases',
            'role',
            'faction',
            'location',
            'status',
            'currentTask',
            'attitudeToPlayer',
            'resources',
            'relationships',
        ],
    },
    {
        key: 'factions',
        entityType: 'faction',
        label: '势力',
        identityField: 'name',
        compareFields: [
            'name',
            'leader',
            'controlledRegions',
            'stance',
            'attitudeToPlayer',
            'resources',
            'militaryStatus',
            'economicStatus',
            'currentGoal',
            'allies',
            'enemies',
        ],
    },
    {
        key: 'missions',
        entityType: 'mission',
        label: '任务',
        identityField: 'title',
        compareFields: [
            'title',
            'assignee',
            'assignedAt',
            'destination',
            'objective',
            'status',
            'progress',
            'expectedUpdate',
            'result',
            'relatedCharacters',
            'relatedFactions',
            'relatedItems',
        ],
    },
    {
        key: 'items',
        entityType: 'item',
        label: '道具',
        identityField: 'name',
        compareFields: [
            'name',
            'holder',
            'origin',
            'purpose',
            'status',
            'risk',
            'isUnique',
            'isConsumed',
            'relatedCharacters',
            'relatedMissions',
        ],
    },
]);

export function mergeCampaignStates(existingState, incomingState, options = {}) {
    const operationId = options.operationId || createOperationId();
    const archivedAt = options.archivedAt || new Date().toISOString();
    const existing = validateAndNormalizeCampaignState(existingState);
    const incoming = validateAndNormalizeCampaignState(incomingState);
    const diff = [];

    const merged = {
        ...existing,
        campaign: mergeCampaignMeta(existing.campaign, incoming.campaign),
        plotSummary: incoming.plotSummary || existing.plotSummary,
        warnings: mergeWarnings(existing.warnings, incoming.warnings),
    };

    for (const definition of COLLECTIONS) {
        const result = mergeCollection(existing[definition.key], incoming[definition.key], definition, {
            operationId,
            archivedAt,
        });

        merged[definition.key] = result.items;
        diff.push(...result.diff);
    }

    return {
        operationId,
        state: merged,
        diff,
        summary: summarizeDiff(diff),
    };
}

function mergeCollection(existingItems, incomingItems, definition, context) {
    const activeItems = [];
    const archivedItems = [];

    for (const item of existingItems) {
        if (isArchivedStateItem(item)) {
            archivedItems.push(item);
        } else {
            activeItems.push(item);
        }
    }

    const activeByIdentity = new Map(activeItems.map((item) => [getIdentity(item, definition), item]));
    const resultItems = [...archivedItems];
    const consumedActiveIds = new Set();
    const diff = [];

    for (const incomingItem of incomingItems) {
        const identity = getIdentity(incomingItem, definition);
        const existingItem = activeByIdentity.get(identity);

        if (!existingItem) {
            resultItems.push(prepareActiveItem(incomingItem));
            diff.push(createDiffEntry('added', definition, identity, null, incomingItem, []));
            continue;
        }

        consumedActiveIds.add(existingItem.id);
        const changes = getItemChanges(existingItem, incomingItem, definition.compareFields);

        if (changes.length === 0) {
            resultItems.push(existingItem);
            diff.push(createDiffEntry('unchanged', definition, identity, existingItem, existingItem, []));
            continue;
        }

        const archivedItem = archiveStateItem(existingItem, context);
        const nextItem = prepareActiveItem(incomingItem, {
            fallbackId: existingItem.id,
            operationId: context.operationId,
        });

        resultItems.push(archivedItem, nextItem);
        diff.push(createDiffEntry('archived', definition, identity, existingItem, archivedItem, []));
        diff.push(createDiffEntry('updated', definition, identity, existingItem, nextItem, changes));
    }

    for (const item of activeItems) {
        if (!consumedActiveIds.has(item.id)) {
            resultItems.push(item);
        }
    }

    return { items: resultItems, diff };
}

function mergeCampaignMeta(existing, incoming) {
    return {
        ...existing,
        ...compactObject(incoming),
        warnings: mergeWarnings(existing.warnings, incoming.warnings),
    };
}

function prepareActiveItem(item, { fallbackId = '', operationId = '' } = {}) {
    const id = item.id && item.id !== fallbackId
        ? item.id
        : buildUpdatedId(item.id || fallbackId, operationId);

    return {
        ...item,
        id,
        isActive: true,
        isArchived: false,
    };
}

function buildUpdatedId(id, operationId) {
    if (!operationId || !id) {
        return id;
    }

    return `${id}_${operationId}`;
}

function getItemChanges(before, after, fields) {
    const changes = [];

    for (const field of fields) {
        if (!areValuesEqual(before[field], after[field])) {
            changes.push({
                field,
                before: before[field],
                after: after[field],
            });
        }
    }

    return changes;
}

function createDiffEntry(action, definition, identity, before, after, changes) {
    return {
        action,
        entityType: definition.entityType,
        label: definition.label,
        identity,
        beforeId: before?.id || '',
        afterId: after?.id || '',
        changes,
    };
}

function summarizeDiff(diff) {
    return diff.reduce((summary, entry) => {
        summary[entry.action] = (summary[entry.action] || 0) + 1;
        return summary;
    }, {
        added: 0,
        updated: 0,
        archived: 0,
        unchanged: 0,
    });
}

function getIdentity(item, definition) {
    const value = item?.[definition.identityField] || item?.id || '';
    return normalizeIdentity(value);
}

function normalizeIdentity(value) {
    return String(value).trim().toLocaleLowerCase();
}

function mergeWarnings(existingWarnings = [], incomingWarnings = []) {
    return [...new Set([...existingWarnings, ...incomingWarnings].filter(Boolean))];
}

function compactObject(value) {
    const result = {};

    for (const [key, item] of Object.entries(value || {})) {
        if (item === '' || item === undefined || item === null) {
            continue;
        }

        result[key] = item;
    }

    return result;
}

function areValuesEqual(left, right) {
    return JSON.stringify(normalizeComparableValue(left)) === JSON.stringify(normalizeComparableValue(right));
}

function normalizeComparableValue(value) {
    if (Array.isArray(value)) {
        return value.map((item) => String(item).trim()).filter(Boolean);
    }

    if (typeof value === 'string') {
        return value.trim();
    }

    return value;
}

function createOperationId() {
    return `state_merge_${Date.now()}`;
}
