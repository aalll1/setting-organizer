import assert from 'node:assert/strict';
import { buildWorldbookSyncDraft } from '../src/core/worldbookSyncBuilder.js';
import { createEmptyCampaignState } from '../src/core/stateTypes.js';

const state = createEmptyCampaignState({
    campaign: { id: 'campaign-1', name: '雾城', genre: '悬疑', currentTime: '雨夜', currentLocation: '旧城区', summary: '调查仍在继续。', sourceMessageRange: '0-2', confidence: 0.9 },
    plotSummary: '城内出现失踪案。',
    characters: [{ id: 'c1', type: 'character', name: '林月', location: '旧城区', status: '存活', currentTask: '寻找钥匙', sourceMessageRange: '1-2', confidence: 0.8, warnings: [] }, { id: 'c2', type: 'character', name: '阿岚', location: '码头', status: '失踪', sourceMessageRange: '0-1', confidence: 0.7, warnings: [], isArchived: true, isActive: false }],
    factions: [{ id: 'f1', type: 'faction', name: '守夜人', leader: '钟伯', stance: '秘密组织', currentGoal: '封锁消息', attitudeToPlayer: '警惕', sourceMessageRange: '0-2', confidence: 0.8, warnings: [] }],
    missions: [{ id: 'm1', type: 'mission', title: '寻找银钥匙', status: 'active', objective: '进入钟楼', progress: '已获得地图', sourceMessageRange: '1-2', confidence: 0.8, warnings: [] }],
    items: [{ id: 'i1', type: 'item', name: '银钥匙', holder: '林月', status: '持有', purpose: '开启钟楼', sourceMessageRange: '1-2', confidence: 0.8, warnings: [] }],
});

const draft = buildWorldbookSyncDraft(state);
assert.ok(draft.lorebookEntries.some((entry) => entry.category === 'permanent_lore' && entry.constant));
assert.ok(draft.lorebookEntries.some((entry) => entry.category === 'current_state'));
assert.ok(draft.lorebookEntries.some((entry) => entry.category === 'character_state' && entry.sourceStateId === 'c1'));
const archived = draft.lorebookEntries.find((entry) => entry.sourceStateId === 'c2');
assert.equal(archived.category, 'history_archive');
assert.equal(archived.enabled, false);
assert.ok(archived.content.includes('历史归档'));
assert.ok(draft.preview.summary.added > 0);

const unchanged = buildWorldbookSyncDraft(state, { previousEntries: draft.lorebookEntries });
assert.equal(unchanged.preview.summary.unchanged, draft.lorebookEntries.length);

const changed = buildWorldbookSyncDraft(state, { previousEntries: [{ ...draft.lorebookEntries.find((entry) => entry.sourceStateId === 'c1'), content: '旧内容' }] });
assert.ok(changed.preview.diff.some((entry) => entry.sourceStateId === 'c1' && entry.action === 'updated'));

console.log('worldbookSyncBuilder tests passed');
