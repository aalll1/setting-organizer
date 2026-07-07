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
        return `${error.code} ${error.message}`;
    }

    return '未知错误';
}
