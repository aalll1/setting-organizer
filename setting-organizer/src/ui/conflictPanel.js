const SEVERITY_LABELS = Object.freeze({
    error: '高',
    warning: '中',
    info: '低',
});

const SEVERITY_ORDER = Object.freeze({
    error: 0,
    warning: 1,
    info: 2,
});

export function renderConflictPanelHtml(conflicts) {
    if (!Array.isArray(conflicts)) {
        return '';
    }

    const sorted = [...conflicts].sort((left, right) => getSeverityOrder(left) - getSeverityOrder(right));

    return `
        <section class="setting-organizer-conflict-panel" data-conflict-panel>
            <div class="setting-organizer-card-header">
                <h4>状态冲突检测</h4>
                <span class="setting-organizer-confidence">${sorted.length} 条提示</span>
            </div>
            ${renderConflictList(sorted)}
        </section>
    `;
}

function renderConflictList(conflicts) {
    if (!conflicts.length) {
        return '<p class="setting-organizer-empty">未发现规则级冲突。</p>';
    }

    return `<div class="setting-organizer-conflict-list">
        ${conflicts.map(renderConflictEntry).join('')}
    </div>`;
}

function renderConflictEntry(conflict) {
    return `
        <article class="setting-organizer-conflict-entry" data-conflict-severity="${escapeHtml(conflict.severity || 'warning')}">
            <div class="setting-organizer-state-diff-title">
                <strong>${escapeHtml(SEVERITY_LABELS[conflict.severity] || SEVERITY_LABELS.warning)}风险</strong>
                <span>${escapeHtml(conflict.label || conflict.entityType || '')}：${escapeHtml(conflict.identity || '未命名')}</span>
            </div>
            <p>${escapeHtml(conflict.message || '检测到状态冲突。')}</p>
            <dl class="setting-organizer-conflict-meta">
                <dt>字段</dt>
                <dd>${escapeHtml(conflict.field || '未记录')}</dd>
                <dt>取值</dt>
                <dd>${escapeHtml(formatValues(conflict.values))}</dd>
                <dt>来源 ID</dt>
                <dd>${escapeHtml(formatValues(conflict.itemIds))}</dd>
                <dt>来源范围</dt>
                <dd>${escapeHtml(formatValues(conflict.sourceMessageRanges))}</dd>
            </dl>
            <p class="setting-organizer-conflict-suggestion">${escapeHtml(conflict.suggestion || '请确认最新状态，并按需归档旧状态。')}</p>
        </article>
    `;
}

function getSeverityOrder(conflict) {
    return SEVERITY_ORDER[conflict?.severity] ?? SEVERITY_ORDER.warning;
}

function formatValues(values) {
    if (!Array.isArray(values) || !values.length) {
        return '未记录';
    }

    return values.join(', ');
}

function escapeHtml(value) {
    return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;');
}
