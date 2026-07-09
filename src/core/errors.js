export const ERROR_CODES = Object.freeze({
    MODEL_CALL_FAILED: 'E001',
    INVALID_JSON: 'E002',
    SCHEMA_VALIDATION_FAILED: 'E003',
    EMPTY_RESULT: 'E004',
    TOKEN_BUDGET_EXCEEDED: 'E005',
    EXPORT_FAILED: 'E006',
    BACKUP_FAILED: 'E007',
    CHARACTER_CREATE_FAILED: 'E008',
    LOREBOOK_CREATE_FAILED: 'E009',
    INCOMPATIBLE_API: 'E010',
    LEGACY_DATA_CHANGED: 'E011',
    CHAT_READ_FAILED: 'E012',
    CHARACTER_WORLD_BIND_FAILED: 'E013',
    INVALID_INPUT: 'E014',
    EMPTY_INPUT: 'E015',
    INPUT_CONFIRMATION_CANCELLED: 'E016',
});

export const ERROR_HELP = Object.freeze({
    [ERROR_CODES.MODEL_CALL_FAILED]: {
        title: '模型调用失败',
        message: '无法通过当前 SillyTavern 模型完成设定整理。',
        suggestions: [
            '检查当前 SillyTavern 模型连接是否可用。',
            '先切换到“模拟结果”确认插件界面和导出流程正常。',
            '导出诊断日志后查看 model-call-failed 事件。',
        ],
    },
    [ERROR_CODES.INVALID_JSON]: {
        title: '模型输出格式错误',
        message: '模型返回内容不是插件可解析的 JSON。',
        suggestions: [
            '重新分析一次，或缩短输入内容。',
            '如果连续出现，先使用“模拟结果”验证流程。',
            '检查诊断日志中的原始解析错误摘要。',
        ],
    },
    [ERROR_CODES.SCHEMA_VALIDATION_FAILED]: {
        title: '分析结果结构不完整',
        message: '模型输出缺少必要字段，或字段类型不符合草稿结构。',
        suggestions: [
            '重新分析，或调整输入让角色和世界书信息更明确。',
            '检查模型是否按 JSON 草稿结构输出。',
            '导出诊断日志并查看校验失败详情。',
        ],
    },
    [ERROR_CODES.EMPTY_RESULT]: {
        title: '没有提取到可用设定',
        message: '本次分析没有得到角色草稿或世界书条目。',
        suggestions: [
            '增加输入内容，明确角色、地点、阵营或规则信息。',
            '确认整理目标至少选择了角色卡或世界书。',
            '可以先用“模拟结果”确认插件流程正常。',
        ],
    },
    [ERROR_CODES.TOKEN_BUDGET_EXCEEDED]: {
        title: '内容超过 Token 预算',
        message: '输入或草稿内容超过当前预算设置。',
        suggestions: [
            '缩短输入内容。',
            '切换到更高预算模式。',
            '拆分长文本后分批整理。',
        ],
    },
    [ERROR_CODES.EXPORT_FAILED]: {
        title: '导出失败',
        message: '当前草稿无法生成下载文件。',
        suggestions: [
            '检查草稿内容是否仍可正常显示。',
            '导出诊断日志查看 export-failed 事件。',
            '刷新页面前先保留当前错误信息。',
        ],
    },
    [ERROR_CODES.BACKUP_FAILED]: {
        title: '备份失败',
        message: '插件无法把草稿备份写入浏览器本地存储。',
        suggestions: [
            '检查浏览器 localStorage 是否可用。',
            '清理浏览器存储空间后重试。',
            '先导出草稿 JSON 作为手动备份。',
        ],
    },
    [ERROR_CODES.CHARACTER_CREATE_FAILED]: {
        title: '创建角色失败',
        message: '无法通过 SillyTavern 角色创建接口完成写入。',
        suggestions: [
            '确认 SillyTavern 页面仍在线。',
            '检查当前版本是否兼容 /api/characters/create。',
            '导出诊断日志后查看 character-create-failed 事件。',
        ],
    },
    [ERROR_CODES.LOREBOOK_CREATE_FAILED]: {
        title: '创建世界书失败',
        message: '无法通过 SillyTavern 世界书接口完成写入。',
        suggestions: [
            '确认世界书名称没有重名。',
            '检查当前版本是否兼容 saveWorldInfo。',
            '导出诊断日志后查看 worldbook-create-failed 事件。',
        ],
    },
    [ERROR_CODES.INCOMPATIBLE_API]: {
        title: '当前 SillyTavern 接口不兼容',
        message: '插件没有找到当前操作所需的 SillyTavern 运行时接口。',
        suggestions: [
            '确认扩展运行在 SillyTavern 页面内。',
            '查看 API_COMPATIBILITY.md 中的兼容性记录。',
            '升级或更换 SillyTavern 版本后重新做 smoke test。',
        ],
    },
    [ERROR_CODES.LEGACY_DATA_CHANGED]: {
        title: '旧数据校验失败',
        message: '写入后发现旧角色或旧世界书摘要不符合预期。',
        suggestions: [
            '停止继续写入。',
            '在 SillyTavern 原生界面手动检查旧数据。',
            '保留备份标识和诊断日志用于恢复或排查。',
        ],
    },
    [ERROR_CODES.CHAT_READ_FAILED]: {
        title: '读取当前聊天失败',
        message: '插件无法从当前页面读取聊天内容。',
        suggestions: [
            '确认当前页面存在聊天记录。',
            '切换到手动粘贴文本模式。',
            '导出诊断日志后查看 chat-read-failed 事件。',
        ],
    },
    [ERROR_CODES.CHARACTER_WORLD_BIND_FAILED]: {
        title: '角色绑定世界书失败',
        message: '角色或世界书可能已经创建，但绑定步骤没有完成。',
        suggestions: [
            '查看创建报告中的步骤状态。',
            '在 SillyTavern 原生角色面板手动绑定世界书。',
            '导出诊断日志后查看 character-world-bind-failed 事件。',
        ],
    },
    [ERROR_CODES.INVALID_INPUT]: {
        title: '输入内容无效',
        message: '当前输入不是插件可分析的文本。',
        suggestions: [
            '确认输入框内容是普通文本。',
            '如果从外部复制内容，请先粘贴为纯文本后重试。',
            '仍然失败时导出诊断日志并记录触发步骤。',
        ],
    },
    [ERROR_CODES.EMPTY_INPUT]: {
        title: '输入内容为空',
        message: '没有可整理的设定文本或聊天内容。',
        suggestions: [
            '在输入框粘贴设定文本。',
            '或点击“读取当前聊天”后再开始分析。',
            '确认读取范围不是空结果。',
        ],
    },
    [ERROR_CODES.INPUT_CONFIRMATION_CANCELLED]: {
        title: '已取消超长输入分析',
        message: '本次真实模型分析已取消，避免长输入导致模型输出截断。',
        suggestions: [
            '缩短输入内容。',
            '改用最近 20 条聊天或手动索引分批整理。',
            '如只想测试界面流程，可以切换到“模拟结果”。',
        ],
    },
});

export class SettingOrganizerError extends Error {
    constructor(code, message, details = null) {
        super(message);
        this.name = 'SettingOrganizerError';
        this.code = code;
        this.details = details;
    }
}

export function formatError(error) {
    if (error instanceof SettingOrganizerError) {
        const help = ERROR_HELP[error.code] || {};
        const title = help.title || '操作失败';
        const message = help.message || error.message;
        const suggestions = Array.isArray(help.suggestions) ? help.suggestions : [];
        const lines = [
            title,
            message,
            '',
            '建议：',
            ...suggestions.map((suggestion, index) => `${index + 1}. ${suggestion}`),
            '',
            `错误码：${error.code}`,
        ];

        if (error.message && error.message !== message) {
            lines.push(`技术详情：${error.message}`);
        }

        if (error.details?.cause) {
            lines.push(`原因：${error.details.cause}`);
        }

        return lines.join('\n');
    }

    return [
        '未知错误',
        '插件遇到未分类的异常。',
        '',
        '建议：',
        '1. 导出诊断日志。',
        '2. 记录触发操作并重试。',
    ].join('\n');
}
