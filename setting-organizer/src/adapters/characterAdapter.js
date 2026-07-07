export function toSillyTavernCharacter(character) {
    return {
        name: character.name || '',
        description: character.description || '',
        personality: character.personality || '',
        scenario: character.scenario || '',
        first_mes: character.firstMes || '',
        mes_example: character.mesExample || '',
        creator_notes: character.creatorNotes || '',
        tags: [],
        extensions: {
            settingOrganizer: {
                sourceDraftId: character.id,
                confidence: character.confidence,
            },
        },
    };
}

export function toSillyTavernCharacters(result) {
    return (result.characters || []).map(toSillyTavernCharacter);
}
