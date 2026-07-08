import { buildDiagnosticSnapshot, clearLogs, logInfo } from '../core/logger.js';

export function renderDiagnosticsControls() {
    return `
        <div class="setting-organizer-diagnostics">
            <button type="button" data-export-diagnostics>导出诊断日志</button>
            <button type="button" data-clear-diagnostics>清空诊断日志</button>
            <span data-diagnostics-status hidden></span>
        </div>
    `;
}

export function bindDiagnosticsControls(container) {
    const exportButton = container.querySelector('[data-export-diagnostics]');
    const clearButton = container.querySelector('[data-clear-diagnostics]');
    const status = container.querySelector('[data-diagnostics-status]');

    if (exportButton) {
        exportButton.addEventListener('click', () => {
            const snapshot = buildDiagnosticSnapshot({
                source: 'manual-export',
            });
            downloadJson(JSON.stringify(snapshot, null, 2), createDiagnosticsFilename());
            logInfo('diagnostics-exported', {
                logCount: snapshot.logs.length,
            });
            showStatus(status, `已导出诊断日志：${snapshot.logs.length} 条`);
        });
    }

    if (clearButton) {
        clearButton.addEventListener('click', () => {
            clearLogs();
            showStatus(status, '诊断日志已清空。');
        });
    }
}

function downloadJson(jsonText, filename) {
    const blob = new Blob([jsonText], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
}

function createDiagnosticsFilename() {
    const stamp = new Date().toISOString().replace(/[-:.TZ]/g, '');
    return `setting-organizer-diagnostics-${stamp}.json`;
}

function showStatus(container, message) {
    if (!container) {
        return;
    }

    container.hidden = false;
    container.textContent = message;
}
