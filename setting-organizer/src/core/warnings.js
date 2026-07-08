import { estimateTextTokens, resolveBudget } from './tokenEstimate.js';

const SHORT_KEYWORD_LENGTH = 2;
const LONG_INPUT_TOKENS = 6000;
const MAX_CONSTANT_ENTRIES = 3;
const GENERIC_KEYWORDS = new Set([
    '他',
    '她',
    '它',
    '你',
    '我',
    '这里',
    '那里',
    '这个',
    '那个',
    '世界',
    '人类',
    '角色',
    '设定',
    '地方',
    '东西',
]);

export function applyWarnings(result, sourceText, options = {}) {
    const budget = resolveBudget(options.tokenBudgetMode, options.customBudget);
    const warnings = [...(result.warnings || [])];
    const inputTokens = estimateTextTokens(sourceText);

    if (inputTokens > LONG_INPUT_TOKENS) {
        warnings.push(`输入内容较长，粗估 ${inputTokens} tokens，可能超过模型上下文或预算。`);
    }

    const characters = (result.characters || []).map((character, index) => {
        const itemWarnings = [...(character.warnings || [])];
        const duplicateNameIndexes = findDuplicateIndexes(result.characters || [], 'name', character.name);

        if (!character.name.trim()) {
            itemWarnings.push(`角色 ${index + 1} 名称为空。`);
        }

        if (duplicateNameIndexes.length > 1 && character.name.trim()) {
            itemWarnings.push(`角色名称“${character.name}”重复，涉及第 ${formatIndexes(duplicateNameIndexes)} 个角色。`);
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
        const duplicateTitleIndexes = findDuplicateIndexes(result.lorebookEntries || [], 'title', entry.title);
        const duplicateContentIndexes = findDuplicateContentIndexes(result.lorebookEntries || [], entry.content);
        const duplicateKeyIndexes = findDuplicateKeySetIndexes(result.lorebookEntries || [], keys);

        if (!entry.title.trim()) {
            itemWarnings.push(`世界书 ${index + 1} 标题为空。`);
        }

        if (duplicateTitleIndexes.length > 1 && entry.title.trim()) {
            itemWarnings.push(`世界书标题“${entry.title}”重复，涉及第 ${formatIndexes(duplicateTitleIndexes)} 个条目。`);
        }

        if (duplicateContentIndexes.length > 1 && entry.content.trim()) {
            itemWarnings.push(`世界书“${entry.title || index + 1}”正文与第 ${formatIndexes(duplicateContentIndexes)} 个条目完全相同。`);
        }

        if (duplicateKeyIndexes.length > 1 && keys.length) {
            itemWarnings.push(`世界书“${entry.title || index + 1}”关键词组合与第 ${formatIndexes(duplicateKeyIndexes)} 个条目完全相同。`);
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

            if (GENERIC_KEYWORDS.has(normalizeComparableText(key))) {
                itemWarnings.push(`世界书 ${entry.title || index + 1} 关键词“${key}”过于泛化。`);
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

function findDuplicateIndexes(items, field, value) {
    const normalizedValue = normalizeComparableText(value);
    if (!normalizedValue) {
        return [];
    }

    return items
        .map((item, index) => ({ index, value: normalizeComparableText(item[field]) }))
        .filter((item) => item.value === normalizedValue)
        .map((item) => item.index);
}

function findDuplicateContentIndexes(entries, content) {
    const normalizedContent = normalizeComparableText(content);
    if (!normalizedContent) {
        return [];
    }

    return entries
        .map((entry, index) => ({ index, content: normalizeComparableText(entry.content) }))
        .filter((entry) => entry.content === normalizedContent)
        .map((entry) => entry.index);
}

function findDuplicateKeySetIndexes(entries, keys) {
    const normalizedKeys = normalizeKeySet(keys);
    if (!normalizedKeys) {
        return [];
    }

    return entries
        .map((entry, index) => ({ index, keys: normalizeKeySet(entry.keys) }))
        .filter((entry) => entry.keys === normalizedKeys)
        .map((entry) => entry.index);
}

function normalizeKeySet(keys) {
    if (!Array.isArray(keys) || !keys.length) {
        return '';
    }

    return [...new Set(keys.map(normalizeComparableText).filter(Boolean))].sort().join('|');
}

function normalizeComparableText(value) {
    return String(value || '').trim().replace(/\s+/g, ' ').toLowerCase();
}

function formatIndexes(indexes) {
    return indexes.map((index) => index + 1).join('、');
}
