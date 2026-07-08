export function toSillyTavernWorldInfo(result) {
    const entries = {};

    (result.lorebookEntries || []).forEach((entry, index) => {
        entries[index] = {
            uid: index,
            key: entry.keys || [],
            keysecondary: entry.secondaryKeys || [],
            comment: entry.title || '',
            content: entry.content || '',
            constant: Boolean(entry.constant),
            selective: Array.isArray(entry.secondaryKeys) && entry.secondaryKeys.length > 0,
            order: Number.isFinite(Number(entry.priority)) ? Number(entry.priority) : 100,
            disable: !entry.enabled,
            addMemo: true,
            extensions: {
                settingOrganizer: {
                    sourceDraftId: entry.id,
                    category: entry.category,
                    stability: entry.stability,
                    confidence: entry.confidence,
                },
            },
        };
    });

    return {
        entries,
    };
}
