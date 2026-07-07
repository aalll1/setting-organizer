import assert from 'node:assert/strict';
import { estimateAnalysisTokens, estimateTextTokens, resolveBudget } from '../src/core/tokenEstimate.js';

assert.equal(estimateTextTokens('林月'), 2);
assert.equal(estimateTextTokens('abcd'), 1);
assert.equal(estimateTextTokens('林月abcd'), 3);

const estimate = estimateAnalysisTokens('林月是一名祭司', {
    characters: [{ name: '林月', description: '见习祭司' }],
    lorebookEntries: [{ title: '银月教会', keys: ['银月教会'], content: '负责治疗' }],
});

assert.ok(estimate.inputTokens > 0);
assert.ok(estimate.characterTokens > 0);
assert.ok(estimate.lorebookTokens > 0);
assert.equal(estimate.totalTokens, estimate.inputTokens + estimate.outputTokens);

assert.equal(resolveBudget('light').character, 1200);
assert.equal(resolveBudget('custom', { character: 99, lorebookEntry: 88, constantLore: 77 }).character, 99);
assert.equal(resolveBudget('unknown').character, 2000);

console.log('token estimate tests passed');
