export const EXTRACT_SETTING_PROMPT_VERSION = 'extract-setting-v0.1.0';

export function buildExtractSettingPrompt(sourceText, options = {}) {
    const targets = describeTargets(options.targets);
    const budgetMode = options.tokenBudgetMode || 'standard';

    return [
        '你是 SillyTavern 设定整理器的数据抽取模块。',
        '任务：把用户提供的设定文本整理为严格 JSON，供程序校验和人工编辑。',
        '',
        '硬性输出规则：',
        '- 只输出 JSON 对象。',
        '- 不要输出 Markdown 代码块。',
        '- 不要输出自然语言解释。',
        '- 不要编造原文没有出现的信息；无法判断时留空字符串或写入 warnings。',
        '- 区分永久设定和动态剧情状态；第一版只输出角色草稿和世界书草稿。',
        '- AI 不能执行写入、导入、覆盖或删除操作。',
        '',
        `promptVersion: ${EXTRACT_SETTING_PROMPT_VERSION}`,
        'schemaVersion: 0.1.0',
        `整理目标: ${targets}`,
        `Token预算模式: ${budgetMode}`,
        '',
        '必须返回以下 JSON 结构：',
        JSON.stringify(createOutputShape(), null, 2),
        '',
        '字段要求：',
        '- characters[].name：角色名，无法确认则为空字符串。',
        '- characters[].description：角色外貌、身份、背景等稳定描述。',
        '- characters[].personality：性格、行为倾向、说话风格。',
        '- characters[].scenario：适合写入角色卡的初始场景。',
        '- characters[].firstMes：可选首条消息，无法判断则为空。',
        '- characters[].mesExample：可选对话示例，无法判断则为空。',
        '- characters[].creatorNotes：整理说明、来源提醒或风险提示。',
        '- lorebookEntries[].title：世界书条目标题，无法确认则为空字符串。',
        '- lorebookEntries[].keys：具体关键词数组，不要只用“他”“她”“这里”“世界”“人类”等泛词。',
        '- lorebookEntries[].content：稳定设定正文，不要混入临时状态。',
        '- lorebookEntries[].constant：只有必须常驻上下文的核心规则才为 true。',
        '- confidence：0 到 1 的数字。',
        '',
        '用户原文：',
        sourceText,
    ].join('\n');
}

function describeTargets(targets = {}) {
    const labels = [];
    if (targets.character !== false) {
        labels.push('角色卡');
    }
    if (targets.lorebook !== false) {
        labels.push('世界书');
    }

    return labels.length ? labels.join('、') : '未指定';
}

function createOutputShape() {
    return {
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
    };
}
