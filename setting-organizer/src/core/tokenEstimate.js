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

export function estimateTextTokens(text) {
    const value = String(text || '');
    if (!value) {
        return 0;
    }

    const chineseChars = value.match(/[\u4e00-\u9fff]/g)?.length || 0;
    const nonChineseChars = value.length - chineseChars;

    return Math.ceil(chineseChars + nonChineseChars / 4);
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
