import { ERROR_CODES, SettingOrganizerError } from './errors.js';
import { validateAndNormalizeCampaignState } from './stateValidator.js';

export function buildCampaignStateExportPayload(campaignState) {
    return validateAndNormalizeCampaignState(campaignState);
}

export function buildCampaignStateExportJson(campaignState) {
    try {
        return JSON.stringify(buildCampaignStateExportPayload(campaignState), null, 2);
    } catch (error) {
        if (error instanceof SettingOrganizerError) {
            throw error;
        }

        throw new SettingOrganizerError(ERROR_CODES.EXPORT_FAILED, '剧情状态导出 JSON 序列化失败。', {
            cause: error.message,
        });
    }
}

export function parseCampaignStateImportJson(jsonText) {
    try {
        return validateAndNormalizeCampaignState(JSON.parse(jsonText));
    } catch (error) {
        if (error instanceof SettingOrganizerError) {
            throw error;
        }

        throw new SettingOrganizerError(ERROR_CODES.SCHEMA_VALIDATION_FAILED, '剧情状态导入 JSON 无法解析。', {
            cause: error.message,
        });
    }
}
