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
assert.ok(overviewHtml.includes('人物状态'));
assert.ok(overviewHtml.includes('关键道具'));
assert.ok(overviewHtml.includes('confidence 1.00'));

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
