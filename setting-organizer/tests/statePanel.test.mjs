import assert from 'node:assert/strict';
import { removeStateItem, renderStatePanelHtml, updateStateField } from '../src/ui/statePanel.js';
import { createEmptyCampaignState } from '../src/core/stateTypes.js';

const state = createEmptyCampaignState({
    campaign: {
        name: '雾城',
        summary: '调查员抵达旧城区入口。',
    },
    characters: [
        {
            id: 'c1',
            type: 'character',
            name: '林月',
            location: '旧城区',
            sourceMessageRange: '0-2',
            confidence: 0.8,
            warnings: ['需要确认位置。'],
        },
    ],
    missions: [
        {
            id: 'm1',
            type: 'mission',
            title: '寻找银钥匙',
            status: 'active',
            sourceMessageRange: '1-2',
            confidence: 0.7,
            warnings: [],
        },
    ],
});

const overviewHtml = renderStatePanelHtml(state);
assert.ok(overviewHtml.includes('剧情状态草稿，未写入、未保存、未同步世界书。'));
assert.ok(overviewHtml.includes('导出状态 JSON'));
assert.ok(overviewHtml.includes('导入状态 JSON'));
assert.ok(overviewHtml.includes('保存最近状态草稿'));
assert.ok(overviewHtml.includes('载入最近状态草稿'));
assert.ok(overviewHtml.includes('预览合并最近草稿'));
assert.ok(overviewHtml.includes('人物状态'));
assert.ok(overviewHtml.includes('关键道具'));
assert.ok(overviewHtml.includes('confidence 1.00'));

const diffHtml = renderStatePanelHtml(state, 'overview', {
    operationId: 'op1',
    summary: { added: 0, updated: 1, archived: 1, unchanged: 0 },
    diff: [
        {
            action: 'updated',
            entityType: 'character',
            label: '人物',
            identity: '林月',
            changes: [{ field: 'location', before: '旧城区', after: '钟楼' }],
        },
    ],
});
assert.ok(diffHtml.includes('状态合并预览'));
assert.ok(diffHtml.includes('确认保存合并结果'));

const characterHtml = renderStatePanelHtml(state, 'characters');
assert.ok(characterHtml.includes('林月'));
assert.ok(characterHtml.includes('来源：0-2'));
assert.ok(characterHtml.includes('需要确认位置。'));

const updated = updateStateField(state, 'characters', 'c1', 'location', '钟楼');
assert.equal(updated.characters[0].location, '钟楼');
assert.equal(state.characters[0].location, '旧城区');

const removed = removeStateItem(state, 'missions', 'm1');
assert.equal(removed.missions.length, 0);
assert.equal(state.missions.length, 1);

console.log('statePanel tests passed');
