import { callCurrentModel } from '../adapters/sillytavernApi.js';
import { parseValidateNormalize, validateAndNormalizeAnalysisResult } from './validator.js';

export async function analyzeSettingText(sourceText, options) {
    if (options.analysisMode === 'sillytavern') {
        const rawText = await callCurrentModel(sourceText, options);
        return parseValidateNormalize(rawText);
    }

    await wait(250);

    const trimmedText = sourceText.trim();
    const firstLine = trimmedText.split(/\r?\n/).find(Boolean) || trimmedText;

    const rawResult = {
        schemaVersion: '0.1.0',
        promptVersion: 'mock-analysis-v0.1.0',
        characters: [
            {
                id: createId('char'),
                name: inferCharacterName(firstLine),
                description: firstLine,
                personality: '待整理：请在后续编辑阶段补充性格描述。',
                scenario: '待整理：请在后续编辑阶段补充开场场景。',
                firstMes: '',
                mesExample: '',
                creatorNotes: `来源文本长度：${trimmedText.length} 字符。`,
                sourceText: trimmedText,
                confidence: 0.8,
                warnings: [],
            },
        ],
        lorebookEntries: [
            {
                id: createId('lore'),
                title: inferLoreTitle(trimmedText),
                category: 'general',
                keys: inferKeywords(trimmedText),
                secondaryKeys: [],
                content: firstLine,
                constant: false,
                enabled: Boolean(options.targets.lorebook),
                priority: 100,
                stability: 'permanent',
                confidence: 0.8,
                warnings: [],
            },
        ],
        warnings: ['当前为 mock 分析结果，用于验证展示和编辑流程。'],
        tokenEstimate: {
            inputTokens: estimateTokens(trimmedText),
            outputTokens: 0,
            totalTokens: estimateTokens(trimmedText),
        },
    };

    return validateAndNormalizeAnalysisResult(rawResult);
}

function inferCharacterName(text) {
    const match = text.match(/^([\u4e00-\u9fa5A-Za-z0-9_]{2,12})(?:是|为|，|,|\s)/);
    return match ? match[1] : '未命名角色';
}

function inferLoreTitle(text) {
    const candidates = text.match(/[\u4e00-\u9fa5A-Za-z0-9_]{2,16}/g) || [];
    return candidates.find((item) => item.length >= 2) || '未命名设定';
}

function inferKeywords(text) {
    const matches = text.match(/[\u4e00-\u9fa5A-Za-z0-9_]{2,12}/g) || [];
    return [...new Set(matches)].slice(0, 4);
}

function estimateTokens(text) {
    return Math.ceil(text.length / 2);
}

function createId(prefix) {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function wait(ms) {
    return new Promise((resolve) => {
        window.setTimeout(resolve, ms);
    });
}
