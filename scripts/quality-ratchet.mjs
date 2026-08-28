import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const mode = process.argv[2];
const update = process.argv.includes('--update');

if (!['typecheck', 'lint'].includes(mode)) {
  console.error('Usage: node scripts/quality-ratchet.mjs <typecheck|lint> [--update]');
  process.exit(2);
}

function run(command, args) {
  try {
    return execFileSync(command, args, {
      cwd: root,
      encoding: 'utf8',
      maxBuffer: 50 * 1024 * 1024,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
  } catch (error) {
    return `${error.stdout ?? ''}${error.stderr ?? ''}`;
  }
}

function normalizePath(path) {
  return path.replaceAll('\\', '/').replace(`${root.replaceAll('\\', '/')}/`, '');
}

function typecheckDiagnostics() {
  const output = run(process.execPath, [
    'node_modules/typescript/bin/tsc',
    '--noEmit',
    '--pretty',
    'false',
  ]);
  return output
    .split('\n')
    .map((line) => line.match(/^(.+\.(?:ts|tsx))\((\d+),(\d+)\): error (TS\d+): (.+)$/))
    .filter(Boolean)
    .map(([, file, line, column, rule, message]) =>
      `${normalizePath(file)}:${line}:${column} ${rule} ${message.trim()}`,
    );
}

function lintDiagnostics() {
  const output = run(process.execPath, [
    'node_modules/eslint/bin/eslint.js',
    '.',
    '--format',
    'json',
  ]);
  const results = JSON.parse(output);
  return results.flatMap(({ filePath, messages }) =>
    messages.map(({ severity, line, column, ruleId, message }) =>
      `${normalizePath(relative(root, filePath))}:${line}:${column} ${severity === 2 ? 'error' : 'warning'} ${ruleId ?? 'unknown'} ${message}`,
    ),
  );
}

const diagnostics = [...new Set(mode === 'typecheck' ? typecheckDiagnostics() : lintDiagnostics())].sort();
const baselinePath = resolve(root, `quality-baselines/${mode}.json`);

if (update) {
  writeFileSync(baselinePath, `${JSON.stringify(diagnostics, null, 2)}\n`);
  console.log(`Updated ${normalizePath(baselinePath)} with ${diagnostics.length} diagnostics.`);
  process.exit(0);
}

const baseline = JSON.parse(readFileSync(baselinePath, 'utf8'));
const accepted = new Set(baseline);
const current = new Set(diagnostics);
const added = diagnostics.filter((diagnostic) => !accepted.has(diagnostic));
const removed = baseline.filter((diagnostic) => !current.has(diagnostic));

console.log(`${mode}: ${diagnostics.length} current diagnostics; ${baseline.length} accepted.`);
if (added.length) {
  console.error('\nNew diagnostics (not accepted):\n' + added.join('\n'));
}
if (removed.length) {
  console.error('\nResolved diagnostics (remove these from the baseline):\n' + removed.join('\n'));
}
if (added.length || removed.length) {
  console.error(`\nRatchet failed. Review the change, then run npm run baseline:${mode} to record only intentional legacy-debt changes.`);
  process.exit(1);
}

console.log(`${mode} historical-debt ratchet passed with no change.`);
