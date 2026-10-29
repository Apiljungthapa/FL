// Starts the FastAPI backend and the Vite frontend together: `npm start`.
// Both are launched through their interpreters (python -m uvicorn,
// node vite.js) rather than .exe/.cmd shims, which Windows Application
// Control policies can block.
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const venvPython = process.platform === 'win32'
  ? join(root, '.venv', 'Scripts', 'python.exe')
  : join(root, '.venv', 'bin', 'python');
const python = existsSync(venvPython) ? venvPython : 'python';

const procs = [
  ['api', python, ['-m', 'uvicorn', 'backend.main:app', '--host', '127.0.0.1', '--port', '8000']],
  ['web', process.execPath, [join(root, 'node_modules', 'vite', 'bin', 'vite.js'), '--port', '5173', '--strictPort']],
].map(([name, cmd, args]) => {
  const child = spawn(cmd, args, { cwd: root, stdio: ['ignore', 'pipe', 'pipe'] });
  const prefix = (chunk) => chunk.toString().replace(/^(?=.)/gm, `[${name}] `);
  child.stdout.on('data', (d) => process.stdout.write(prefix(d)));
  child.stderr.on('data', (d) => process.stderr.write(prefix(d)));
  child.on('exit', (code) => {
    console.log(`[${name}] exited with code ${code}`);
    shutdown(code ?? 1);
  });
  return child;
});

let stopping = false;
function shutdown(code = 0) {
  if (stopping) return;
  stopping = true;
  for (const p of procs) p.kill();
  process.exit(code);
}
process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));
