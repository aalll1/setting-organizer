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

export function toCharacterCreateFormFields(character) {
    return {
        ch_name: character.name || '未命名角色',
        description: character.description || '',
        personality: character.personality || '',
        scenario: character.scenario || '',
        first_mes: character.firstMes || '',
        mes_example: character.mesExample || '',
        creator_notes: character.creatorNotes || '',
        system_prompt: character.systemPrompt || '',
        post_history_instructions: '',
        character_version: '',
        tags: '',
        creator: 'Setting Organizer',
        talkativeness: '0.5',
        fav: 'false',
        world: '',
        json_data: JSON.stringify({
            extensions: {
                settingOrganizer: {
                    sourceDraftId: character.id,
                    confidence: character.confidence,
                },
            },
        }),
    };
}
