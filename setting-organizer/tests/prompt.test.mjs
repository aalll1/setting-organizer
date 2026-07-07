import assert from 'node:assert/strict';
import { buildExtractSettingPrompt, EXTRACT_SETTING_PROMPT_VERSION } from '../src/prompts/extractSetting.js';

const prompt = buildExtractSettingPrompt('林月是一名银月教会的见习祭司。', {
    targets: { character: true, lorebook: true },
    tokenBudgetMode: 'standard',
});

assert.ok(prompt.includes(EXTRACT_SETTING_PROMPT_VERSION));
assert.ok(prompt.includes('只输出 JSON 对象'));
assert.ok(prompt.includes('不要输出 Markdown 代码块'));
assert.ok(prompt.includes('不要编造原文没有出现的信息'));
assert.ok(prompt.includes('AI 不能执行写入'));
assert.ok(prompt.includes('"characters"'));
assert.ok(prompt.includes('"lorebookEntries"'));
assert.ok(prompt.includes('林月是一名银月教会的见习祭司。'));

console.log('prompt tests passed');
