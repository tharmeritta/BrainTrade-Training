const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function getRecentGitCommits(projectRoot) {
  try {
    const output = execSync('git log -n 6 --pretty=format:"- %h (%ad): %s" --date=short', {
      cwd: projectRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore']
    });
    return output.trim();
  } catch (err) {
    return '- No git commit history found.';
  }
}

function getRecentBranch(projectRoot) {
  try {
    return execSync('git branch --show-current', {
      cwd: projectRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore']
    }).trim();
  } catch {
    return 'main';
  }
}

function syncSessionMemory(projectRoot) {
  const memoryPath = path.join(projectRoot, '.gemini', 'MEMORY.md');
  let memoryContent = '';

  if (fs.existsSync(memoryPath)) {
    memoryContent = fs.readFileSync(memoryPath, 'utf8');
  }

  const gitHistory = getRecentGitCommits(projectRoot);
  const currentBranch = getRecentBranch(projectRoot);
  const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC';

  const historyHeader = '## Recent Session History & Auto-Memorized Context';
  const autoMemoryBlock = historyHeader + '\n' +
'*Last Auto-Synced: ' + nowStr + ' (Branch: ' + currentBranch + ')*\n\n' +
'### 📜 Recent Commit & Task Memory\n' +
gitHistory + '\n\n' +
'### ⚡ Active System State & Configuration\n' +
'- **Default Visual Standard**: Light Theme standard (html tag without hardcoded dark class, ThemeScript & ThemeToggle default to light).\n' +
'- **Admin Preview Mode**: getAgentSession() in lib/session/agent.ts auto-provides a Virtual Admin Preview Agent session (admin-preview-agent) when a staff session cookie exists, avoiding auth redirects.\n' +
'- **AI Scenario Quiz Engine**: 10 bilingual (Thai & English) situational decision scenarios seeded in Firestore (aiev_scenarios).\n' +
'- **Staff AI Copilot**: Scoped strictly to staff users (hasStaffSession() === true).\n' +
'- **Knowledge Graph**: Kept up to date via graphify update .\n';

  if (memoryContent.includes(historyHeader)) {
    const parts = memoryContent.split(historyHeader);
    memoryContent = parts[0].trim() + '\n\n' + autoMemoryBlock;
  } else {
    memoryContent = memoryContent.trim() + '\n\n' + autoMemoryBlock;
  }

  fs.writeFileSync(memoryPath, memoryContent, 'utf8');
  return memoryPath;
}

module.exports = { syncSessionMemory };

if (require.main === module) {
  syncSessionMemory(process.cwd());
  console.log('✓ Session memory auto-synchronized successfully!');
}
