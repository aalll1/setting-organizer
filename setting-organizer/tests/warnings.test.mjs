import assert from 'node:assert/strict';
import { applyWarnings } from '../src/core/warnings.js';

const result = applyWarnings({
    characters: [{ id: 'c1', name: '', description: 'x'.repeat(100), warnings: [] }],
    lorebookEntries: [
        { id: 'l1', title: '', keys: [], content: '', constant: true, warnings: [] },
        { id: 'l2', title: '重复关键词', keys: ['A', 'A'], content: '内容', constant: true, warnings: [] },
        { id: 'l3', title: '常驻1', keys: ['常驻1'], content: '内容', constant: true, warnings: [] },
        { id: 'l4', title: '常驻2', keys: ['常驻2'], content: '内容', constant: true, warnings: [] },
    ],
    warnings: [],
}, '输入', { tokenBudgetMode: 'light' });

assert.ok(result.warnings.some((warning) => warning.includes('名称为空')));
assert.ok(result.warnings.some((warning) => warning.includes('标题为空')));
assert.ok(result.warnings.some((warning) => warning.includes('关键词为空')));
assert.ok(result.warnings.some((warning) => warning.includes('关键词“A”过短')));
assert.ok(result.warnings.some((warning) => warning.includes('关键词“A”重复')));
assert.ok(result.warnings.some((warning) => warning.includes('常驻世界书条目数量')));
assert.ok(result.characters[0].warnings.length > 0);
assert.ok(result.lorebookEntries[0].warnings.length > 0);

console.log('warnings tests passed');
