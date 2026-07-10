import assert from 'node:assert/strict';
import { detectCampaignStateConflicts } from '../src/core/conflictDetector.js';
import { createEmptyCampaignState, MISSION_STATUSES } from '../src/core/stateTypes.js';

const state = createEmptyCampaignState({
    characters: [
        {
            id: 'c1',
            type: 'character',
            name: '林月',
            location: '旧城区',
            status: '存活',
            sourceMessageRange: '0-1',
            confidence: 0.8,
            warnings: [],
        },
        {
            id: 'c2',
            type: 'character',
            name: '林月',
            location: '钟楼',
            status: '死亡',
            sourceMessageRange: '2-3',
            confidence: 0.8,
            warnings: [],
        },
        {
            id: 'c3',
            type: 'character',
            name: '阿岚',
            location: '码头',
            status: '存活',
            sourceMessageRange: '2-3',
            confidence: 0.8,
            warnings: [],
            isArchived: true,
            isActive: true,
        },
    ],
    factions: [
        {
            id: 'f1',
            type: 'faction',
            name: '守夜人',
            attitudeToPlayer: '友好',
            sourceMessageRange: '0-1',
            confidence: 0.8,
            warnings: [],
        },
        {
            id: 'f2',
            type: 'faction',
            name: '守夜人',
            attitudeToPlayer: '敌对',
            sourceMessageRange: '2-3',
            confidence: 0.8,
            warnings: [],
        },
    ],
    missions: [
        {
            id: 'm1',
            type: 'mission',
            title: '寻找银钥匙',
            status: MISSION_STATUSES.ACTIVE,
            sourceMessageRange: '0-1',
            confidence: 0.8,
            warnings: [],
        },
        {
            id: 'm2',
            type: 'mission',
            title: '寻找银钥匙',
            status: MISSION_STATUSES.COMPLETED,
            sourceMessageRange: '2-3',
            confidence: 0.8,
            warnings: [],
        },
    ],
    items: [
        {
            id: 'i1',
            type: 'item',
            name: '银钥匙',
            holder: '林月',
            sourceMessageRange: '0-1',
            confidence: 0.8,
            warnings: [],
        },
        {
            id: 'i2',
            type: 'item',
            name: '银钥匙',
            holder: '阿岚',
            sourceMessageRange: '2-3',
            confidence: 0.8,
            warnings: [],
        },
    ],
});

const before = JSON.stringify(state);
const conflicts = detectCampaignStateConflicts(state);
assert.equal(JSON.stringify(state), before);

assert.ok(conflicts.some((conflict) => conflict.ruleId === 'character-location-conflict'));
assert.ok(conflicts.some((conflict) => conflict.ruleId === 'character-status-conflict'));
assert.ok(conflicts.some((conflict) => conflict.ruleId === 'mission-status-conflict'));
assert.ok(conflicts.some((conflict) => conflict.ruleId === 'item-holder-conflict'));
assert.ok(conflicts.some((conflict) => conflict.ruleId === 'faction-attitude-conflict'));
assert.ok(conflicts.some((conflict) => (
    conflict.ruleId === 'active-archived-conflict'
    && conflict.itemIds.includes('c3')
)));

const characterLocation = conflicts.find((conflict) => conflict.ruleId === 'character-location-conflict');
assert.deepEqual(characterLocation.values.sort(), ['旧城区', '钟楼'].sort());
assert.ok(characterLocation.message.includes('林月'.toLocaleLowerCase()));
assert.equal(characterLocation.severity, 'warning');

const cleanState = createEmptyCampaignState({
    characters: [
        {
            id: 'c1',
            type: 'character',
            name: '林月',
            location: '旧城区',
            status: '存活',
            sourceMessageRange: '0-1',
            confidence: 0.8,
            warnings: [],
        },
    ],
});

assert.equal(detectCampaignStateConflicts(cleanState).length, 0);

console.log('conflictDetector tests passed');
