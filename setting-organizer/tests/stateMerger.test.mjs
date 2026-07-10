import assert from 'node:assert/strict';
import { archiveStateItem, isArchivedStateItem } from '../src/core/stateArchive.js';
import { mergeCampaignStates } from '../src/core/stateMerger.js';
import { createEmptyCampaignState, MISSION_STATUSES } from '../src/core/stateTypes.js';

function buildState(overrides = {}) {
    return createEmptyCampaignState({
        campaign: {
            name: '雾城',
            summary: '旧摘要',
            warnings: [],
        },
        ...overrides,
    });
}

const archived = archiveStateItem(
    {
        id: 'c0',
        type: 'character',
        name: '林月',
        isActive: true,
        isArchived: false,
    },
    { operationId: 'op0', archivedAt: '2026-07-10T00:00:00.000Z' },
);

assert.equal(archived.isActive, false);
assert.equal(archived.isArchived, true);
assert.equal(archived.archiveOperationId, 'op0');
assert.equal(isArchivedStateItem(archived), true);

const existing = buildState({
    characters: [
        {
            id: 'char-linyue',
            type: 'character',
            name: '林月',
            location: '旧城区入口',
            status: '受伤',
            sourceMessageRange: '0-2',
            confidence: 0.8,
            warnings: [],
            isActive: true,
            isArchived: false,
        },
    ],
    items: [
        {
            id: 'item-key',
            type: 'item',
            name: '银钥匙',
            holder: '林月',
            status: '未使用',
            sourceMessageRange: '0-2',
            confidence: 0.8,
            warnings: [],
            isActive: true,
            isArchived: false,
        },
    ],
});

const incoming = buildState({
    campaign: {
        name: '雾城',
        summary: '林月抵达钟楼。',
        warnings: [],
    },
    characters: [
        {
            id: 'char-linyue',
            type: 'character',
            name: '林月',
            location: '钟楼',
            status: '受伤',
            sourceMessageRange: '3-5',
            confidence: 0.9,
            warnings: [],
        },
    ],
    items: [
        {
            id: 'item-key',
            type: 'item',
            name: '银钥匙',
            holder: '阿岚',
            status: '未使用',
            sourceMessageRange: '3-5',
            confidence: 0.9,
            warnings: [],
        },
    ],
    missions: [
        {
            id: 'mission-key',
            type: 'mission',
            title: '寻找银钥匙',
            status: MISSION_STATUSES.ACTIVE,
            sourceMessageRange: '3-5',
            confidence: 0.9,
            warnings: [],
        },
    ],
});

const merged = mergeCampaignStates(existing, incoming, {
    operationId: 'op1',
    archivedAt: '2026-07-10T01:00:00.000Z',
});

assert.equal(merged.operationId, 'op1');
assert.equal(merged.summary.updated, 2);
assert.equal(merged.summary.archived, 2);
assert.equal(merged.summary.added, 1);
assert.equal(merged.state.campaign.summary, '林月抵达钟楼。');

const archivedCharacter = merged.state.characters.find((item) => item.isArchived);
const activeCharacter = merged.state.characters.find((item) => !item.isArchived);
assert.equal(archivedCharacter.location, '旧城区入口');
assert.equal(archivedCharacter.archiveOperationId, 'op1');
assert.equal(activeCharacter.location, '钟楼');
assert.equal(activeCharacter.id, 'char-linyue_op1');
assert.ok(merged.diff.some((entry) => (
    entry.action === 'updated'
    && entry.entityType === 'character'
    && entry.changes.some((change) => change.field === 'location')
)));

const updatedItem = merged.diff.find((entry) => entry.action === 'updated' && entry.entityType === 'item');
assert.ok(updatedItem.changes.some((change) => (
    change.field === 'holder'
    && change.before === '林月'
    && change.after === '阿岚'
)));

assert.equal(merged.state.missions.length, 1);
assert.equal(merged.state.missions[0].title, '寻找银钥匙');

const repeated = mergeCampaignStates(merged.state, incoming, {
    operationId: 'op2',
    archivedAt: '2026-07-10T02:00:00.000Z',
});

assert.equal(repeated.summary.updated, 0);
assert.equal(repeated.summary.archived, 0);
assert.equal(repeated.state.characters.filter((item) => item.name === '林月' && !item.isArchived).length, 1);
assert.equal(repeated.state.items.filter((item) => item.name === '银钥匙' && !item.isArchived).length, 1);

console.log('stateMerger tests passed');
