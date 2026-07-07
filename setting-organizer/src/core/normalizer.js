export function normalizeAnalysisResult(value) {
    const result = value && typeof value === 'object' && !Array.isArray(value) ? { ...value } : value;
    const warnings = [];

    if (!result || typeof result !== 'object' || Array.isArray(result)) {
        return { result, warnings };
    }

    if (!Array.isArray(result.characters)) {
        result.characters = [];
    }

    if (!Array.isArray(result.lorebookEntries)) {
        result.lorebookEntries = [];
    }

    if (!Array.isArray(result.warnings)) {
        result.warnings = [];
    }

    result.schemaVersion = typeof result.schemaVersion === 'string' ? result.schemaVersion : '0.1.0';
    result.promptVersion = typeof result.promptVersion === 'string' ? result.promptVersion : '';
    result.characters = result.characters.map((character, index) => normalizeCharacter(character, index, warnings));
    result.lorebookEntries = result.lorebookEntries.map((entry, index) => normalizeLorebookEntry(entry, index, warnings));
    result.warnings = [...result.warnings.filter((item) => typeof item === 'string'), ...warnings];
    result.tokenEstimate = normalizeTokenEstimate(result.tokenEstimate);

    return { result, warnings };
}

function normalizeCharacter(value, index, globalWarnings) {
    const character = value && typeof value === 'object' && !Array.isArray(value) ? { ...value } : {};
    const warnings = Array.isArray(character.warnings)
        ? character.warnings.filter((item) => typeof item === 'string')
        : [];

    character.id = normalizeString(character.id, `char_draft_${index + 1}`);
    character.name = normalizeString(character.name, '');
    character.description = normalizeString(character.description, '');
    character.personality = normalizeString(character.personality, '');
    character.scenario = normalizeString(character.scenario, '');
    character.firstMes = normalizeString(character.firstMes, '');
    character.mesExample = normalizeString(character.mesExample, '');
    character.creatorNotes = normalizeString(character.creatorNotes, '');
    character.sourceText = normalizeString(character.sourceText, '');
    character.confidence = normalizeConfidence(character.confidence, warnings, `角色 ${index + 1}`);
    character.warnings = warnings;

    if (!character.name) {
        const warning = `角色 ${index + 1} 名称为空，导入前必须补全。`;
        character.warnings.push(warning);
        globalWarnings.push(warning);
    }

    globalWarnings.push(...character.warnings);
    return character;
}

function normalizeLorebookEntry(value, index, globalWarnings) {
    const entry = value && typeof value === 'object' && !Array.isArray(value) ? { ...value } : {};
    const warnings = Array.isArray(entry.warnings)
        ? entry.warnings.filter((item) => typeof item === 'string')
        : [];

    entry.id = normalizeString(entry.id, `lore_draft_${index + 1}`);
    entry.title = normalizeString(entry.title, '');
    entry.category = normalizeString(entry.category, 'general');
    entry.keys = normalizeStringArray(entry.keys, warnings, `世界书 ${index + 1} 关键词`);
    entry.secondaryKeys = normalizeStringArray(entry.secondaryKeys, warnings, `世界书 ${index + 1} 次级关键词`);
    entry.content = normalizeString(entry.content, '');
    entry.constant = Boolean(entry.constant);
    entry.enabled = typeof entry.enabled === 'boolean' ? entry.enabled : true;
    entry.priority = normalizeNumber(entry.priority, 100);
    entry.stability = normalizeString(entry.stability, 'permanent');
    entry.confidence = normalizeConfidence(entry.confidence, warnings, `世界书 ${index + 1}`);
    entry.warnings = warnings;

    if (!entry.title) {
        const warning = `世界书 ${index + 1} 标题为空，导入前必须补全。`;
        entry.warnings.push(warning);
        globalWarnings.push(warning);
    }

    if (!entry.keys.length) {
        const warning = `世界书 ${index + 1} 关键词为空，导入前必须补全。`;
        entry.warnings.push(warning);
        globalWarnings.push(warning);
    }

    globalWarnings.push(...entry.warnings);
    return entry;
}

function normalizeTokenEstimate(value) {
    const estimate = value && typeof value === 'object' && !Array.isArray(value) ? value : {};

    return {
        inputTokens: normalizeNumber(estimate.inputTokens, 0),
        outputTokens: normalizeNumber(estimate.outputTokens, 0),
        totalTokens: normalizeNumber(estimate.totalTokens, 0),
    };
}

function normalizeString(value, fallback) {
    return typeof value === 'string' ? value : fallback;
}

function normalizeStringArray(value, warnings, label) {
    if (Array.isArray(value)) {
        return value.map((item) => String(item).trim()).filter(Boolean);
    }

    if (typeof value === 'string' && value.trim()) {
        warnings.push(`${label} 从字符串修正为数组。`);
        return [value.trim()];
    }

    return [];
}

function normalizeConfidence(value, warnings, label) {
    if (value === undefined || value === null || value === '') {
        return 0.8;
    }

    const numberValue = Number(value);
    if (!Number.isFinite(numberValue)) {
        warnings.push(`${label} confidence 非数字，已重置为 0.8。`);
        return 0.8;
    }

    if (numberValue < 0 || numberValue > 1) {
        warnings.push(`${label} confidence 超出 0 到 1，已截断。`);
        return Math.min(1, Math.max(0, numberValue));
    }

    return numberValue;
}

function normalizeNumber(value, fallback) {
    const numberValue = Number(value);
    return Number.isFinite(numberValue) ? numberValue : fallback;
}
