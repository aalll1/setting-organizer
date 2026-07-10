import assert from 'node:assert/strict';
import { getStateTemplate, listStateTemplates, STATE_TEMPLATE_IDS } from '../src/templates/stateTemplates.js';
import { buildExtractStatePrompt } from '../src/prompts/extractState.js';

assert.equal(getStateTemplate(STATE_TEMPLATE_IDS.GENERIC).label, '通用');
assert.equal(getStateTemplate('missing').id, STATE_TEMPLATE_IDS.GENERIC);
assert.deepEqual(listStateTemplates().map((template) => template.id), ['generic', 'historical', 'dnd']);
for (const template of listStateTemplates()) {
    const prompt = buildExtractStatePrompt('测试输入', { stateTemplate: template.id });
    assert.ok(prompt.includes(`stateTemplate: ${template.id}`));
    assert.ok(prompt.includes(template.focus));
}
console.log('stateTemplates tests passed');
