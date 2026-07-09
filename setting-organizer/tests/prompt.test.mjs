import assert from 'node:assert/strict';
import { buildExtractSettingPrompt, EXTRACT_SETTING_PROMPT_VERSION } from '../src/prompts/extractSetting.js';

const prompt = buildExtractSettingPrompt('林月是一名银月教会的见习祭司。', {
    targets: { character: true, lorebook: true },
    tokenBudgetMode: 'standard',
});

assert.ok(prompt.includes(EXTRACT_SETTING_PROMPT_VERSION));
assert.ok(prompt.includes('只输出一个压缩 JSON 对象'));
assert.ok(prompt.includes('不要输出 Markdown 代码块'));
assert.ok(prompt.includes('不要在 JSON 前后添加说明'));
assert.ok(prompt.includes('不要编造原文没有出现的信息'));
assert.ok(prompt.includes('顶层必须包含 characters 和 lorebookEntries'));
assert.ok(prompt.includes('AI 不能执行写入'));
assert.ok(prompt.includes('"characters"'));
assert.ok(prompt.includes('"lorebookEntries"'));
assert.ok(prompt.includes('林月是一名银月教会的见习祭司。'));
assert.equal(prompt.includes('\n  "schemaVersion"'), false);

const oldPrettyShapeLength = JSON.stringify({
    schemaVersion: '0.1.0',
    promptVersion: EXTRACT_SETTING_PROMPT_VERSION,
    characters: [
        {
            id: '',
            name: '',
            description: '',
            personality: '',
            scenario: '',
            firstMes: '',
            mesExample: '',
            creatorNotes: '',
            sourceText: '',
            confidence: 0.8,
            warnings: [],
        },
    ],
    lorebookEntries: [
        {
            id: '',
            title: '',
            category: 'general',
            keys: [],
            secondaryKeys: [],
            content: '',
            constant: false,
            enabled: true,
            priority: 100,
            stability: 'permanent',
            confidence: 0.8,
            warnings: [],
        },
    ],
    warnings: [],
    tokenEstimate: {
        inputTokens: 0,
        outputTokens: 0,
        totalTokens: 0,
    },
}, null, 2).length;

const compactShapeMatch = prompt.match(/\{"schemaVersion":"0\.1\.0"[\s\S]*"tokenEstimate":\{"inputTokens":0,"outputTokens":0,"totalTokens":0\}\}/);
assert.ok(compactShapeMatch);
assert.ok(compactShapeMatch[0].length < oldPrettyShapeLength);

console.log('prompt tests passed');
