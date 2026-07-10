const ACTION_LABELS = Object.freeze({
    added: '新增',
    updated: '修改',
    archived: '归档',
    unchanged: '未变化',
    conflict: '冲突',
});

export function renderStateDiffPanelHtml(preview) {
    if (!preview) {
        return '';
    }

    const visibleDiff = (preview.diff || []).filter((entry) => entry.action !== 'unchanged');
    const conflicts = preview.conflicts || [];

    return `
        <section class="setting-organizer-state-diff" data-state-diff-panel>
            <div class="setting-organizer-card-header">
                <h4>状态合并预览</h4>
                <span class="setting-organizer-confidence">operation ${escapeHtml(preview.operationId || '')}</span>
            </div>
            ${renderDiffSummary(preview.summary, conflicts.length)}
            ${renderConflictList(conflicts)}
            ${renderDiffList(visibleDiff)}
            <div class="setting-organizer-export-actions">
                <button type="button" data-confirm-state-merge>确认保存合并结果</button>
                <button type="button" data-cancel-state-merge>取消</button>
            </div>
        </section>
    `;
}

function renderDiffSummary(summary = {}, conflictCount = 0) {
    const items = [
        ['added', summary.added || 0],
        ['updated', summary.updated || 0],
        ['archived', summary.archived || 0],
        ['conflict', conflictCount],
    ];

    return `<div class="setting-organizer-state-diff-summary">
        ${items.map(([action, count]) => `
            <span><strong>${count}</strong>${ACTION_LABELS[action]}</span>
        `).join('')}
    </div>`;
}

function renderConflictList(conflicts) {
    if (!conflicts.length) {
        return '<p class="setting-organizer-empty">未发现冲突。</p>';
    }

    return `<ul class="setting-organizer-warning-list">
        ${conflicts.map((conflict) => `<li>${escapeHtml(formatConflict(conflict))}</li>`).join('')}
    </ul>`;
}

function renderDiffList(diff) {
    if (!diff.length) {
        return '<p class="setting-organizer-empty">没有需要保存的差异。</p>';
    }

    return `<div class="setting-organizer-state-diff-list">
        ${diff.map(renderDiffEntry).join('')}
    </div>`;
}

function renderDiffEntry(entry) {
    return `
        <article class="setting-organizer-state-diff-entry" data-diff-action="${escapeHtml(entry.action)}">
            <div class="setting-organizer-state-diff-title">
                <strong>${escapeHtml(ACTION_LABELS[entry.action] || entry.action)}</strong>
                <span>${escapeHtml(entry.label || entry.entityType || '')}：${escapeHtml(entry.identity || '未命名')}</span>
            </div>
            ${renderChangeList(entry.changes || [])}
        </article>
    `;
}

function renderChangeList(changes) {
    if (!changes.length) {
        return '<p class="setting-organizer-empty">保留旧状态归档记录。</p>';
    }

    return `<ul class="setting-organizer-state-diff-changes">
        ${changes.map((change) => `
            <li>
                <span>${escapeHtml(change.field)}</span>
                <code>${escapeHtml(formatValue(change.before))}</code>
                <strong>→</strong>
                <code>${escapeHtml(formatValue(change.after))}</code>
            </li>
        `).join('')}
    </ul>`;
}

function formatConflict(conflict) {
    if (typeof conflict === 'string') {
        return conflict;
    }

    return conflict?.message || conflict?.reason || '未命名冲突';
}

function formatValue(value) {
    if (Array.isArray(value)) {
        return value.join(', ');
    }

    if (value === undefined || value === null || value === '') {
        return '空';
    }

    return String(value);
}

function escapeHtml(value) {
    return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;');
}
