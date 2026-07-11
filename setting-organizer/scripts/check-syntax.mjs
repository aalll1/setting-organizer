import { readdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const files = await listJavaScriptFiles(root);

for (const file of files) {
    const result = spawnSync(process.execPath, ['--check', file], { stdio: 'inherit' });
    if (result.status !== 0) process.exit(result.status || 1);
}

console.log(`checked ${files.length} JavaScript files`);

async function listJavaScriptFiles(directory) {
    const entries = await readdir(directory, { withFileTypes: true });
    const files = [];
    for (const entry of entries) {
        if (['node_modules', '.git'].includes(entry.name)) continue;
        const fullPath = resolve(directory, entry.name);
        if (entry.isDirectory()) files.push(...await listJavaScriptFiles(fullPath));
        if (entry.isFile() && entry.name.endsWith('.js')) files.push(fullPath);
    }
    return files.sort();
}
