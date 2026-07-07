import { createPanel } from './src/ui/panel.js';

function initExtension() {
    try {
        createPanel();
        console.info('[setting-organizer] loaded');
    } catch (error) {
        console.error('[setting-organizer] failed to load', error);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initExtension);
} else {
    initExtension();
}
