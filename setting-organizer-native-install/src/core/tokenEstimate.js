export const TOKEN_BUDGETS = Object.freeze({
    light: {
        character: 1200,
        constantLore: 700,
        lorebookEntry: 200,
        authorNote: 150,
        dynamicState: 400,
    },
    standard: {
        character: 2000,
        constantLore: 1200,
        lorebookEntry: 350,
        authorNote: 250,
        dynamicState: 800,
    },
    long: {
        character: 3500,
        constantLore: 2500,
        lorebookEntry: 600,
        authorNote: 400,
        dynamicState: 1500,
    },
});

export const TEXT_LENGTH_THRESHOLDS = Object.freeze({
    SUGGEST_SPLIT: 3000,
    WARN_TRUNCATION_RISK: 8000,
    REQUIRE_CONFIRMATION: 15000,
});

export function estimateTextTokens(text) {
    const value = String(text || '');
    if (!value) {
        return 0;
    }

    const chineseChars = value.match(/[\u4e00-\u9fff]/g)?.length || 0;
    const nonChineseChars = value.length - chineseChars;

    return Math.ceil(chineseChars + nonChineseChars / 4);
}

export function assessInputScale(text) {
    const value = String(text || '');
    const characterCount = value.length;
    const tokenEstimate = estimateTextTokens(value);
    const warnings = [];

    if (characterCount > TEXT_LENGTH_THRESHOLDS.SUGGEST_SPLIT) {
        warnings.push(`输入超过 ${TEXT_LENGTH_THRESHOLDS.SUGGEST_SPLIT} 字符，建议使用最近 20 条或分批整理。`);
    }

    if (characterCount > TEXT_LENGTH_THRESHOLDS.WARN_TRUNCATION_RISK) {
        warnings.push(`输入超过 ${TEXT_LENGTH_THRESHOLDS.WARN_TRUNCATION_RISK} 字符，真实模型输出可能被截断。`);
    }

    if (characterCount > TEXT_LENGTH_THRESHOLDS.REQUIRE_CONFIRMATION) {
        warnings.push(`输入超过 ${TEXT_LENGTH_THRESHOLDS.REQUIRE_CONFIRMATION} 字符，建议先分批处理或使用模拟结果验证流程。`);
    }

    return {
        characterCount,
        tokenEstimate,
        warnings,
        shouldSuggestSplit: characterCount > TEXT_LENGTH_THRESHOLDS.SUGGEST_SPLIT,
        hasTruncationRisk: characterCount > TEXT_LENGTH_THRESHOLDS.WARN_TRUNCATION_RISK,
        requiresConfirmation: characterCount > TEXT_LENGTH_THRESHOLDS.REQUIRE_CONFIRMATION,
    };
}

export function estimateAnalysisTokens(sourceText, result) {
    const characterTokens = (result.characters || []).reduce((sum, character) => {
        return sum + estimateTextTokens([
            character.name,
            character.description,
            character.personality,
            character.scenario,
            character.firstMes,
            character.mesExample,
            character.creatorNotes,
        ].join('\n'));
    }, 0);

    const lorebookTokens = (result.lorebookEntries || []).reduce((sum, entry) => {
        return sum + estimateTextTokens([
            entry.title,
            (entry.keys || []).join('\n'),
            entry.content,
        ].join('\n'));
    }, 0);

    const inputTokens = estimateTextTokens(sourceText);
    const outputTokens = characterTokens + lorebookTokens;

    return {
        inputTokens,
        outputTokens,
        totalTokens: inputTokens + outputTokens,
        characterTokens,
        lorebookTokens,
    };
}

export function resolveBudget(mode, customBudget = {}) {
    if (mode === 'custom') {
        return {
            character: normalizePositiveInteger(customBudget.character, TOKEN_BUDGETS.standard.character),
            constantLore: normalizePositiveInteger(customBudget.constantLore, TOKEN_BUDGETS.standard.constantLore),
            lorebookEntry: normalizePositiveInteger(customBudget.lorebookEntry, TOKEN_BUDGETS.standard.lorebookEntry),
            authorNote: TOKEN_BUDGETS.standard.authorNote,
            dynamicState: TOKEN_BUDGETS.standard.dynamicState,
        };
    }

    return TOKEN_BUDGETS[mode] || TOKEN_BUDGETS.standard;
}

function normalizePositiveInteger(value, fallback) {
    const numberValue = Number(value);
    if (!Number.isFinite(numberValue) || numberValue <= 0) {
        return fallback;
    }

    return Math.round(numberValue);
}
