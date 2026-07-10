import assert from 'node:assert/strict';
import { renderStateDiffPanelHtml } from '../src/ui/stateDiffPanel.js';

const html = renderStateDiffPanelHtml({
    operationId: 'op1',
    summary: {
        added: 1,
        updated: 1,
        archived: 1,
        unchanged: 0,
    },
    conflicts: [
        { message: '林月存在多个当前位置。' },
    ],
    diff: [
        {
            action: 'added',
            entityType: 'mission',
            label: '任务',
            identity: '寻找银钥匙',
            changes: [],
        },
        {
            action: 'updated',
            entityType: 'character',
            label: '人物',
            identity: '林月',
            changes: [
                { field: 'location', before: '旧城区', after: '钟楼' },
            ],
        },
        {
            action: 'archived',
            entityType: 'item',
            label: '道具',
            identity: '银钥匙',
            changes: [],
        },
        {
            action: 'unchanged',
            entityType: 'faction',
            label: '势力',
            identity: '守夜人',
            changes: [],
        },
    ],
});

assert.ok(html.includes('状态合并预览'));
assert.ok(html.includes('operation op1'));
assert.ok(html.includes('新增'));
assert.ok(html.includes('修改'));
assert.ok(html.includes('归档'));
assert.ok(html.includes('冲突'));
assert.ok(html.includes('林月存在多个当前位置。'));
assert.ok(html.includes('旧城区'));
assert.ok(html.includes('钟楼'));
assert.ok(html.includes('确认保存合并结果'));
assert.ok(html.includes('取消'));
assert.equal(html.includes('守夜人'), false);

assert.equal(renderStateDiffPanelHtml(null), '');

console.log('stateDiffPanel tests passed');
