import { isArchivedStateItem } from './stateArchive.js';
import { validateAndNormalizeCampaignState } from './stateValidator.js';

const CATEGORY_DEFINITIONS = Object.freeze([
    { collection: 'characters', category: 'character_state', label: '人物状态', identity: (item) => item.name, content: formatCharacter },
    { collection: 'factions', category: 'faction_state', label: '势力状态', identity: (item) => item.name, content: formatFaction },
    { collection: 'missions', category: 'mission_state', label: '任务状态', identity: (item) => item.title, content: formatMission },
    { collection: 'items', category: 'item_state', label: '关键道具', identity: (item) => item.name, content: formatItem },
]);

export function buildWorldbookSyncDraft(campaignState, options = {}) {
    const state = validateAndNormalizeCampaignState(campaignState);
    const entries = [buildPermanentLoreEntry(state), buildCurrentStateEntry(state)]
        .filter(Boolean);

    for (const definition of CATEGORY_DEFINITIONS) {
        for (const item of state[definition.collection]) {
            entries.push(buildStateEntry(item, definition));
        }
    }

    const preview = buildWorldbookSyncPreview(entries, options.previousEntries || []);
    return { lorebookEntries: entries, preview };
}

export function buildWorldbookSyncPreview(nextEntries, previousEntries = []) {
    const previousByStateId = new Map(previousEntries
        .filter((entry) => entry?.sourceStateId)
        .map((entry) => [entry.sourceStateId, entry]));
    const nextIds = new Set(nextEntries.map((entry) => entry.sourceStateId));
    const diff = nextEntries.map((entry) => createPreviewEntry(entry, previousByStateId.get(entry.sourceStateId)));

    for (const entry of previousEntries) {
        if (entry?.sourceStateId && !nextIds.has(entry.sourceStateId)) {
            diff.push({ action: 'removed', sourceStateId: entry.sourceStateId, title: entry.title, category: entry.category });
        }
    }

    return {
        diff,
        summary: diff.reduce((summary, entry) => ({ ...summary, [entry.action]: summary[entry.action] + 1 }), {
            added: 0,
            updated: 0,
            unchanged: 0,
            removed: 0,
        }),
    };
}

function buildPermanentLoreEntry(state) {
    const content = [state.campaign.genre, state.plotSummary].filter(Boolean).join('\n');
    if (!content) return null;
    return createEntry({
        sourceStateId: state.campaign.id || 'campaign-permanent-lore',
        category: 'permanent_lore',
        title: `${state.campaign.name || '当前战役'}：永久设定`,
        keys: unique([state.campaign.name, state.campaign.genre]),
        content,
        constant: true,
        sourceMessageRange: state.campaign.sourceMessageRange,
        confidence: state.campaign.confidence,
    });
}

function buildCurrentStateEntry(state) {
    const content = [
        state.campaign.currentTime && `时间：${state.campaign.currentTime}`,
        state.campaign.currentLocation && `地点：${state.campaign.currentLocation}`,
        state.campaign.summary && `摘要：${state.campaign.summary}`,
    ].filter(Boolean).join('\n');
    if (!content) return null;
    return createEntry({
        sourceStateId: state.campaign.id ? `${state.campaign.id}:current` : 'campaign-current-state',
        category: 'current_state',
        title: `${state.campaign.name || '当前战役'}：当前状态`,
        keys: unique([state.campaign.name, state.campaign.currentLocation]),
        content,
        sourceMessageRange: state.campaign.sourceMessageRange,
        confidence: state.campaign.confidence,
    });
}

function buildStateEntry(item, definition) {
    const archived = isArchivedStateItem(item);
    const identity = definition.identity(item) || item.id;
    return createEntry({
        sourceStateId: item.id,
        category: archived ? 'history_archive' : definition.category,
        title: `${archived ? '历史归档' : definition.label}：${identity}`,
        keys: unique([identity]),
        content: definition.content(item, archived),
        enabled: !archived,
        sourceMessageRange: item.sourceMessageRange,
        confidence: item.confidence,
        warnings: item.warnings,
    });
}

function createEntry({ sourceStateId, category, title, keys, content, constant = false, enabled = true, sourceMessageRange = '', confidence = 0.8, warnings = [] }) {
    return {
        id: `state_lore_${sourceStateId}`,
        sourceStateId,
        sourceBoundary: category,
        title,
        category,
        keys,
        secondaryKeys: [],
        content,
        constant,
        enabled,
        priority: category === 'permanent_lore' ? 10 : 100,
        stability: category === 'permanent_lore' ? 'permanent' : category === 'history_archive' ? 'archived' : 'dynamic',
        confidence,
        warnings: [...warnings],
        sourceMessageRange,
    };
}

function formatCharacter(item, archived) { return [`人物：${item.name}`, `地点：${item.location}`, `状态：${item.status}`, item.currentTask && `当前任务：${item.currentTask}`, archived && '该记录为历史归档。'].filter(Boolean).join('\n'); }
function formatFaction(item, archived) { return [`势力：${item.name}`, item.leader && `领袖：${item.leader}`, item.stance && `立场：${item.stance}`, item.currentGoal && `当前目标：${item.currentGoal}`, item.attitudeToPlayer && `对玩家态度：${item.attitudeToPlayer}`, archived && '该记录为历史归档。'].filter(Boolean).join('\n'); }
function formatMission(item, archived) { return [`任务：${item.title}`, `状态：${item.status}`, item.objective && `目标：${item.objective}`, item.progress && `进展：${item.progress}`, archived && '该记录为历史归档。'].filter(Boolean).join('\n'); }
function formatItem(item, archived) { return [`道具：${item.name}`, item.holder && `持有人：${item.holder}`, item.status && `状态：${item.status}`, item.purpose && `用途：${item.purpose}`, archived && '该记录为历史归档。'].filter(Boolean).join('\n'); }
function unique(values) { return [...new Set(values.map((value) => String(value || '').trim()).filter(Boolean))]; }
function createPreviewEntry(entry, previous) { return { action: !previous ? 'added' : sameEntry(entry, previous) ? 'unchanged' : 'updated', sourceStateId: entry.sourceStateId, title: entry.title, category: entry.category }; }
function sameEntry(left, right) { return ['title', 'category', 'content', 'constant', 'enabled', 'priority'].every((key) => JSON.stringify(left[key]) === JSON.stringify(right[key])); }
