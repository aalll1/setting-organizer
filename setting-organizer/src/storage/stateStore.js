import { ERROR_CODES, SettingOrganizerError } from '../core/errors.js';
import { buildCampaignStateExportPayload } from '../core/stateExporter.js';

const STATE_STORAGE_KEY = 'setting-organizer.campaign-state.recent.v1';

export function saveRecentCampaignState(campaignState, storage = window.localStorage) {
    try {
        const normalized = buildCampaignStateExportPayload(campaignState);
        storage.setItem(STATE_STORAGE_KEY, JSON.stringify({
            savedAt: new Date().toISOString(),
            campaignState: normalized,
        }));
        return normalized;
    } catch (error) {
        if (error instanceof SettingOrganizerError) {
            throw error;
        }

        throw new SettingOrganizerError(ERROR_CODES.EXPORT_FAILED, '保存最近剧情状态草稿失败。', {
            cause: error.message,
        });
    }
}

export function loadRecentCampaignState(storage = window.localStorage) {
    try {
        const raw = storage.getItem(STATE_STORAGE_KEY);
        if (!raw) {
            return null;
        }

        const parsed = JSON.parse(raw);
        return buildCampaignStateExportPayload(parsed.campaignState);
    } catch (error) {
        if (error instanceof SettingOrganizerError) {
            throw error;
        }

        throw new SettingOrganizerError(ERROR_CODES.SCHEMA_VALIDATION_FAILED, '读取最近剧情状态草稿失败。', {
            cause: error.message,
        });
    }
}
