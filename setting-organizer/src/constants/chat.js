export const CHAT_RANGES = Object.freeze({
    RECENT_20: 'recent20',
    RECENT_50: 'recent50',
    ALL: 'all',
    MANUAL: 'manual',
});

export const CHAT_RANGE_LIMITS = Object.freeze({
    [CHAT_RANGES.RECENT_20]: 20,
    [CHAT_RANGES.RECENT_50]: 50,
});
