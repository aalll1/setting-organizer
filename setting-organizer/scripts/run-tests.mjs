import { readdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

const testsDirectory = resolve(import.meta.dirname, '..', 'tests');
const testFiles = (await readdir(testsDirectory))
    .filter((name) => name.endsWith('.test.mjs'))
    .sort();

for (const file of testFiles) {
    const result = spawnSync(process.execPath, [resolve(testsDirectory, file)], { stdio: 'inherit' });
    if (result.status !== 0) process.exit(result.status || 1);
}

console.log(`ran ${testFiles.length} unit tests; cdp-check.mjs is excluded because it requires a websocket URL.`);
