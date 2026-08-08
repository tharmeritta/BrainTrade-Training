const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn, execSync } = require('child_process');

function logStderr(msg) {
  process.stderr.write(`[ensure-dev-server] ${msg}\n`);
}

function checkServerReady(url, timeoutMs = 2000) {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => {
      resolve(true);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(timeoutMs, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function ensureDevServer(projectRoot = process.cwd(), port = 3000) {
  const url = `http://localhost:${port}`;
  logStderr(`Checking local server status at ${url}...`);

  const isAlive = await checkServerReady(url);
  if (isAlive) {
    logStderr(`✓ Localhost dev server is ALREADY running at ${url}`);
    return { running: true, spawned: false, url };
  }

  logStderr(`⚡ Localhost dev server is NOT running. Spawning background 'npm run dev'...`);

  const logsDir = path.join(projectRoot, '.gemini', 'logs');
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
  const logFile = path.join(logsDir, 'dev-server.log');
  const out = fs.openSync(logFile, 'a');
  const err = fs.openSync(logFile, 'a');

  // Spawn Next.js dev server detached
  const child = spawn('npm', ['run', 'dev'], {
    cwd: projectRoot,
    detached: true,
    stdio: ['ignore', out, err],
    env: { ...process.env, PORT: String(port) }
  });

  child.unref();

  // Poll for readiness up to 15 seconds
  let attempts = 0;
  while (attempts < 15) {
    await new Promise(r => setTimeout(r, 1000));
    attempts++;
    const ready = await checkServerReady(url);
    if (ready) {
      logStderr(`🚀 Localhost dev server launched successfully! Active at ${url}`);
      return { running: true, spawned: true, url, pid: child.pid };
    }
  }

  logStderr(`⚠ Dev server spawned (PID ${child.pid}), but warm-up takes extra time. Logged to ${logFile}`);
  return { running: false, spawned: true, url, pid: child.pid };
}

if (require.main === module) {
  ensureDevServer().catch(err => {
    logStderr(`Error in ensureDevServer: ${err.message}`);
  });
}

module.exports = { ensureDevServer, checkServerReady };
