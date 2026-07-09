import assert from 'node:assert/strict';
import { assessInputScale, estimateAnalysisTokens, estimateTextTokens, resolveBudget } from '../src/core/tokenEstimate.js';

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

const shortScale = assessInputScale('短文本');
assert.equal(shortScale.requiresConfirmation, false);
assert.equal(shortScale.warnings.length, 0);

const splitScale = assessInputScale('a'.repeat(3001));
assert.equal(splitScale.shouldSuggestSplit, true);
assert.equal(splitScale.hasTruncationRisk, false);
assert.equal(splitScale.requiresConfirmation, false);
assert.ok(splitScale.warnings.some((warning) => warning.includes('3000')));

const truncationScale = assessInputScale('a'.repeat(8001));
assert.equal(truncationScale.hasTruncationRisk, true);
assert.equal(truncationScale.requiresConfirmation, false);
assert.ok(truncationScale.warnings.some((warning) => warning.includes('8000')));

const confirmationScale = assessInputScale('a'.repeat(15001));
assert.equal(confirmationScale.requiresConfirmation, true);
assert.ok(confirmationScale.warnings.some((warning) => warning.includes('15000')));

console.log('token estimate tests passed');
