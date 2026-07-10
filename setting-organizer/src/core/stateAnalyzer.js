import { callCurrentStateModel } from '../adapters/sillytavernApi.js';
import { ERROR_CODES, SettingOrganizerError } from './errors.js';
import { parseValidateNormalizeCampaignState } from './stateParser.js';
import { MISSION_STATUSES } from './stateTypes.js';

export async function analyzeCampaignStateText(sourceText, options = {}) {
    validateStateSourceText(sourceText);

    if (options.analysisMode === 'sillytavern') {
        return parseValidateNormalizeCampaignState(await callCurrentStateModel(sourceText, options));
    }

    await wait(250);
    return parseValidateNormalizeCampaignState(JSON.stringify(createMockState(sourceText, options)));
}

function validateStateSourceText(sourceText) {
    if (typeof sourceText !== 'string') {
        throw new SettingOrganizerError(ERROR_CODES.INVALID_INPUT, '输入内容必须是文本。');
    }

    if (!sourceText.trim()) {
        throw new SettingOrganizerError(ERROR_CODES.EMPTY_INPUT, '输入内容为空。');
    }
}

function createMockState(sourceText, options) {
    const trimmedText = sourceText.trim();
    const firstLine = trimmedText.split(/\r?\n/).find(Boolean) || trimmedText;
    const name = inferName(firstLine);
    const place = inferPlace(trimmedText);

    return {
        schemaVersion: 'campaign-state-v0.1',
        campaign: {
            id: 'campaign_mock',
            name: options.campaignName || '未命名剧情',
            genre: '',
            currentTime: '',
            currentLocation: place,
            summary: firstLine,
            lastUpdatedAtMessage: 0,
            sourceMessageRange: options.sourceMessageRange || '',
            confidence: 0.8,
            warnings: [],
        },
        plotSummary: firstLine,
        characters: [
            {
                id: 'character_state_mock_1',
                type: 'character',
                name,
                location: place,
                status: '待确认',
                currentTask: firstLine,
                sourceMessageRange: options.sourceMessageRange || '',
                confidence: 0.8,
                warnings: ['当前为 mock 剧情状态草稿，用于验证展示和编辑流程。'],
            },
        ],
        factions: [],
        missions: [
            {
                id: 'mission_state_mock_1',
                type: 'mission',
                title: inferMissionTitle(trimmedText),
                objective: firstLine,
                status: MISSION_STATUSES.UNKNOWN,
                progress: '',
                sourceMessageRange: options.sourceMessageRange || '',
                confidence: 0.7,
                warnings: [],
            },
        ],
        items: [],
        warnings: ['当前为 mock 剧情状态草稿，未写入、未保存、未同步世界书。'],
    };
}

function inferName(text) {
    const match = text.match(/^([\u4e00-\u9fa5A-Za-z0-9_]{2,12})(?:是|为|，|,|\s)/);
    return match ? match[1] : '未命名人物';
}

function inferPlace(text) {
    const match = text.match(/(?:在|抵达|前往)([\u4e00-\u9fa5A-Za-z0-9_]{2,16})/);
    return match ? match[1] : '';
}

function inferMissionTitle(text) {
    const candidates = text.match(/[\u4e00-\u9fa5A-Za-z0-9_]{2,16}/g) || [];
    return candidates.find((item) => item.length >= 2) || '未命名任务';
}

function wait(ms) {
    return new Promise((resolve) => {
        window.setTimeout(resolve, ms);
    });
}
