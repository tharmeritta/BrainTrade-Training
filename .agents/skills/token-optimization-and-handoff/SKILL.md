---
name: token-optimization-and-handoff
description: >-
  Protocol for reducing token consumption by 50-80% using subagent delegation,
  graphify knowledge graph lookups, tight line-range inspections, aggressive auto-compaction,
  and handoff.md architecture synchronization.
---

# Token Optimization & Subagent Handoff Skill

This skill defines the mandatory protocol for minimizing model context window token usage while preserving 100% architectural memory and execution safety across subagents.

---

## 🎯 Core Token Reduction Strategies

### 1. Flash-Tier Subagent Delegation for File Operations
- **Rule**: Never view or parse large source files (>150 lines) directly in the main conversation context.
- **Action**: Delegate research, file scanning, and bulk code edits to subagents running on the `flash` model tier (`hands-on-agent`, `research`). Subagent file reads remain inside isolated containers and do NOT inflate the primary context window.

### 2. Knowledge Graph & Handoff Memory Lookups
- **Rule**: Do NOT print entire codebase files to understand architecture or dependencies.
- **Action**:
  1. Read **[`handoff.md`](file:///Users/prinmacpro/Documents/Antigravity%20Projects/BrainTrade-Training/handoff.md)** for high-level state, god nodes, and current task roadmaps.
  2. Use **`graphify query "<question>"`**, **`graphify path "<A>" "<B>"`**, or inspect `graphify-out/GRAPH_REPORT.md` to query AST relationships without loading raw code tokens.

### 3. Tight Line-Range Slicing (`view_file`)
- **Rule**: Never call `view_file` without line range constraints on large files.
- **Action**: Always specify `StartLine` and `EndLine` (e.g. `StartLine: 40, EndLine: 85`) to inspect only the targeted function, hook, or component section.

### 4. Subagent Handoff & State Synchronization Protocol
- **`handoff-agent`**: Analyzes system architecture, maintains `handoff.md`, breaks down features into step-by-step technical plans, and enforces anti-hardcoding rules.
- **`hands-on-agent`**: Executes concrete code modifications, runs QA verification (`npx tsc --noEmit`), and updates the knowledge graph (`graphify update .`).

### 5. Safe Context Compaction Protocol
- **Rule**: Context compression (`/compress`) is 100% safe when `handoff.md` and `graphify` are updated.
- **Action**:
  - After completing major feature milestones, have `handoff-agent` update `handoff.md`.
  - Execute `/compress` to clear chat history tokens.
  - On turn 1 post-compaction, the agent loads `handoff.md` and `graphify-out/GRAPH_REPORT.md` to regain complete context using **<5,000 tokens**.

---

## ⚙️ Recommended Local Compaction Config (`.gemini/settings.json`)

```json
{
  "model": {
    "compressionThreshold": 0.20
  },
  "contextManagement": {
    "historyWindow": {
      "maxTokens": 80000,
      "retainedTokens": 15000
    }
  }
}
```
