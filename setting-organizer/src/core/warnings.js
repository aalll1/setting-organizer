import { estimateTextTokens, resolveBudget } from './tokenEstimate.js';

const SHORT_KEYWORD_LENGTH = 2;
const LONG_INPUT_TOKENS = 6000;
const MAX_CONSTANT_ENTRIES = 3;

export function applyWarnings(result, sourceText, options = {}) {
    const budget = resolveBudget(options.tokenBudgetMode, options.customBudget);
    const warnings = [...(result.warnings || [])];
    const inputTokens = estimateTextTokens(sourceText);

    if (inputTokens > LONG_INPUT_TOKENS) {
        warnings.push(`输入内容较长，粗估 ${inputTokens} tokens，可能超过模型上下文或预算。`);
    }

    const characters = (result.characters || []).map((character, index) => {
        const itemWarnings = [...(character.warnings || [])];

        if (!character.name.trim()) {
            itemWarnings.push(`角色 ${index + 1} 名称为空。`);
        }

        const characterTokens = estimateTextTokens([
            character.description,
            character.personality,
            character.scenario,
            character.firstMes,
            character.creatorNotes,
        ].join('\n'));

        if (characterTokens > budget.character) {
            itemWarnings.push(`角色 ${character.name || index + 1} 内容约 ${characterTokens} tokens，超过当前角色卡预算 ${budget.character}。`);
        }

        warnings.push(...itemWarnings);
        return { ...character, warnings: dedupeWarnings(itemWarnings) };
    });

    const constantCount = (result.lorebookEntries || []).filter((entry) => entry.constant).length;
    if (constantCount > MAX_CONSTANT_ENTRIES) {
        warnings.push(`常驻世界书条目数量为 ${constantCount}，可能占用过多上下文。`);
    }

    const lorebookEntries = (result.lorebookEntries || []).map((entry, index) => {
        const itemWarnings = [...(entry.warnings || [])];
        const keys = Array.isArray(entry.keys) ? entry.keys : [];

        if (!entry.title.trim()) {
            itemWarnings.push(`世界书 ${index + 1} 标题为空。`);
        }

        if (!entry.content.trim()) {
            itemWarnings.push(`世界书 ${entry.title || index + 1} 正文为空。`);
        }

        if (!keys.length) {
            itemWarnings.push(`世界书 ${entry.title || index + 1} 关键词为空。`);
        }

        const seenKeys = new Set();
        keys.forEach((key) => {
            if (key.length < SHORT_KEYWORD_LENGTH) {
                itemWarnings.push(`世界书 ${entry.title || index + 1} 关键词“${key}”过短。`);
            }

            if (seenKeys.has(key)) {
                itemWarnings.push(`世界书 ${entry.title || index + 1} 关键词“${key}”重复。`);
            }

            seenKeys.add(key);
        });

        const contentTokens = estimateTextTokens(entry.content);
        if (contentTokens > budget.lorebookEntry) {
            itemWarnings.push(`世界书 ${entry.title || index + 1} 正文约 ${contentTokens} tokens，超过单条预算 ${budget.lorebookEntry}。`);
        }

        warnings.push(...itemWarnings);
        return { ...entry, warnings: dedupeWarnings(itemWarnings) };
    });

    return {
        ...result,
        characters,
        lorebookEntries,
        warnings: dedupeWarnings(warnings),
    };
}

function dedupeWarnings(warnings) {
    return [...new Set(warnings.filter(Boolean))];
}
