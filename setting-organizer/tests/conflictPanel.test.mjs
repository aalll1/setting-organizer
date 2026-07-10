import assert from 'node:assert/strict';
import { renderConflictPanelHtml } from '../src/ui/conflictPanel.js';

const html = renderConflictPanelHtml([
    {
        ruleId: 'character-location-conflict',
        severity: 'warning',
        entityType: 'character',
        label: '人物',
        identity: '林月',
        field: 'location',
        values: ['旧城区', '钟楼'],
        itemIds: ['c1', 'c2'],
        sourceMessageRanges: ['0-1', '2-3'],
        message: '同名人物存在多个当前位置。',
        suggestion: '确认最新位置，并将旧位置归档。',
    },
]);

assert.ok(html.includes('状态冲突检测'));
assert.ok(html.includes('1 条提示'));
assert.ok(html.includes('中风险'));
assert.ok(html.includes('人物：林月'));
assert.ok(html.includes('location'));
assert.ok(html.includes('旧城区, 钟楼'));
assert.ok(html.includes('c1, c2'));
assert.ok(html.includes('0-1, 2-3'));
assert.ok(html.includes('确认最新位置'));

const cleanHtml = renderConflictPanelHtml([]);
assert.ok(cleanHtml.includes('未发现规则级冲突。'));

assert.equal(renderConflictPanelHtml(null), '');

console.log('conflictPanel tests passed');
