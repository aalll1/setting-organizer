export const STATE_TEMPLATE_IDS = Object.freeze({
    GENERIC: 'generic',
    HISTORICAL: 'historical',
    DND: 'dnd',
});

const TEMPLATES = Object.freeze({
    [STATE_TEMPLATE_IDS.GENERIC]: { id: STATE_TEMPLATE_IDS.GENERIC, label: '通用', focus: '提取人物、势力、任务、道具和当前剧情状态。', uiGroups: ['campaign', 'characters', 'factions', 'missions', 'items'] },
    [STATE_TEMPLATE_IDS.HISTORICAL]: { id: STATE_TEMPLATE_IDS.HISTORICAL, label: '历史模拟', focus: '优先记录时间、地点、政治立场、组织关系与事件因果；不把现代游戏数值当作历史事实。', uiGroups: ['campaign', 'characters', 'factions', 'missions', 'items'] },
    [STATE_TEMPLATE_IDS.DND]: { id: STATE_TEMPLATE_IDS.DND, label: '跑团 / DND', focus: '优先记录队伍位置、任务阶段、阵营关系、关键物品、风险与资源；不编造未出现的规则数值。', uiGroups: ['campaign', 'characters', 'factions', 'missions', 'items'] },
});

export function getStateTemplate(templateId) {
    return TEMPLATES[templateId] || TEMPLATES[STATE_TEMPLATE_IDS.GENERIC];
}

export function listStateTemplates() {
    return Object.values(TEMPLATES);
}
