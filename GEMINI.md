## Session Startup & Mandatory Context Loading

On every session launch for this project:
1. **Load Knowledge Graph & Architecture**: Immediately read `graphify-out/GRAPH_REPORT.md` for project architecture, god nodes, and community structure. If `graphify-out/wiki/index.md` exists, navigate it first.
2. **Load Project Documentation & Memories**: Read all `.md` files in the project root and subdirectories to ensure full project memory and requirements are retained.
3. **Skills & Cross-Module Queries**:
   - Prefer `graphify query "<question>"`, `graphify path "<A>" "<B>"`, or `graphify explain "<concept>"` for cross-module architecture questions.
   - Activate relevant project skills (such as `graphify`, `modern-web-guidance`, `antigravity-guide`) automatically.
4. **Graph Maintenance**: After modifying code files in any session, run `graphify update .` to keep the knowledge graph up to date.

### Startup Automation Status: ACTIVE 🚀
This process is now **fully automated** in this workspace!
- **Local Settings**: `.gemini/settings.json` is configured to trigger a `SessionStart` command-line hook and enable automatic context compression (compaction) once the context window reaches the configured threshold.
- **Hook Script**: `.gemini/hooks/init.js` automatically runs on every launch of `gemini` or `agy` in this project. It scans, compiles, and dynamically loads `GEMINI.md`, `graphify-out/GRAPH_REPORT.md`, and any local or private project memories into the agent's startup context.
- **Auto-Compaction**: Automatic context compression (`/compress`) triggers dynamically when the session token count reaches the `compressionThreshold` (set to 30% of the model window) to keep your chat history clean and fast without user intervention.

## graphify

This project has a graphify knowledge graph at `graphify-out/`.

