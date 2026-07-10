import { parseModelJson } from './parser.js';
import { validateAndNormalizeCampaignState } from './stateValidator.js';

export function parseCampaignStateJson(rawText) {
    return parseModelJson(rawText);
}

export function parseValidateNormalizeCampaignState(rawText) {
    const parsed = parseCampaignStateJson(rawText);
    return validateAndNormalizeCampaignState(parsed);
}
