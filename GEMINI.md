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

## Anti-Hardcoding & Configuration Governance Rules

All subagents and code edits MUST enforce the following anti-hardcoding rules:
1. **Credentials & Endpoints**: NEVER hardcode API keys, tokens, or environment endpoints. Use `process.env` and reference centralized constants in `lib/constants.ts`.
2. **UI Styling & Colors**: NEVER hardcode static colors (e.g. `#ffffff`, `bg-white`). Use Tailwind CSS variables (`bg-background`, `text-foreground`) to maintain theme responsiveness (per `.gemini/MEMORY.md`).
3. **i18n & Text Strings**: NEVER hardcode user-facing display text directly inside TSX components. Always use `next-intl` dictionaries (`messages/en.json`, `messages/th.json`).
4. **Magic Numbers**: NEVER hardcode raw business logic thresholds (e.g. pass scores, timeouts). Export named constants in `lib/constants.ts`.

## System Architecture & Graphify Orchestration Rules

Before executing multi-module requests, run system architecture analysis:
1. **Pre-Execution Architectural Planning (`solution-architect-planning-agent`)**:
   - For complex feature requests or multi-module refactors, spawn a planning subagent to analyze the knowledge graph (`graphify query` / `GRAPH_REPORT.md`), generate a step-by-step implementation proposal, and outline exact file impact BEFORE delegating execution to other subagents.
2. **Lead Architecture Analysis (`system-architecture-graphify-orchestrator`)**:
   - The lead agent MUST consult `graphify-out/GRAPH_REPORT.md` (using `graphify query`, `graphify path`, or `graphify explain`) to inspect God Nodes (`getAdminDb()`, `getServerUser`, `AgentStats`), community structures, and cross-module caller dependencies before assigning tasks.
3. **Subagent Task Breakdown & Routing**:
   - Based on graph topology and approved plans, the orchestrator breaks down the request and delegates targeted tasks to Component Specialists (`staffing-suite-component-specialist`, `ux-ui-layout-component-specialist`, `api-route-security-and-contract-tester`).
4. **Graph Topology Update & Re-verification**:
   - Once task execution completes, trigger `graphify update .` to sync AST relationships and execute `npm run check` (`tsc --noEmit` + `eslint .`) in parallel.

## Subagent Automation & Delegation Rules

On session startup or when performing multi-step tasks:
1. **Turn-1 Automatic Background QA Subagent**: On session launch, immediately spawn a background subagent to run `npm run check` (`tsc --noEmit` and `eslint .`) in parallel to catch any syntax, type, or linting issues automatically without waiting for user instruction.
2. **AI & Prompt Evaluation**: Delegate auditing and testing of Gemini/OpenAI pipelines (`lib/services/semantic-audit-service.ts`, `lib/services/telesales-coaching.ts`) to dedicated subagents.
3. **Instruction-Based Subagent Mapping**:
   - **UI & Theme tasks**: Delegate to `ui-theme-and-a11y-checker` (enforce Light Theme default, semantic CSS variables & accessibility).
   - **Auth & Session Guard tasks**: Delegate to `auth-guard-and-session-auditor` (test Virtual Admin Preview & cookie guards).
   - **AI & Scenario tasks**: Delegate to `ai-eval-and-scenario-tester` (audit Gemini/OpenAI fallbacks & bilingual outputs).
   - **i18n & Translation tasks**: Delegate to `i18n-localization-auditor` (audit missing keys & prevent blank screen crashes).
   - **Firestore & Data tasks**: Delegate to `firestore-schema-and-seed-runner` (validate db helpers & seed scripts).
   - **Performance & Bundle tasks**: Delegate to `performance-and-bundle-auditor` (audit heavy imports, client bundle size & memory leaks).
   - **Backend & Core API Server tasks**: Delegate to `backend-architecture-and-services-specialist` (audit Next.js Route Handlers, Firestore db helpers, session cookies, and withApiAuth HOF wrappers).
   - **API Security & Validation tasks**: Delegate to `api-route-security-and-contract-tester` (audit app/api routes, Zod schemas & auth guards).
   - **Data Architecture & Curriculum tasks**: Delegate to `curriculum-and-data-modularizer` (modularize quiz data & course structures).
   - **Cloud Build & Deployment tasks**: Delegate to `cloud-build-and-app-hosting-deployer` (validate apphosting.yaml, Dockerfile & next build).
   - **HR Analytics & Telemetry tasks**: Delegate to `telemetry-and-excel-analytics-checker` (audit score math, CohortHeatmap & xlsx exports).
   - **Certificate & Graduation tasks**: Delegate to `certificate-and-pdf-exporter` (validate CertificateModal, canvas generation & presets).
   - **Live Presentation & Sync tasks**: Delegate to `realtime-presence-and-slide-sync` (audit DrawingCanvas, slide index broadcasts & presence).
   - **Cloud Storage & Media tasks**: Delegate to `media-and-cloud-storage-auditor` (validate GCS buckets, audio uploads & storage.rules).
   - **Email & Notification tasks**: Delegate to `notification-and-email-deliverability-checker` (audit nodemailer, HTML templates & dispatch routes).
   - **Offline & Cache Resilience tasks**: Delegate to `offline-resilience-and-presence-auditor` (audit localCache.ts, offline retry queues & presence heartbeat).
   - **E2E User Journey & Integration tasks**: Delegate to `e2e-integration-and-playwright-tester` (audit full login -> quiz -> certificate flow).
   - **Security Vulnerability & Package tasks**: Delegate to `security-vulnerability-and-dependency-auditor` (audit npm dependencies, CVEs & secret leaks).
   - **Keyboard & Screen Reader A11y tasks**: Delegate to `a11y-screen-reader-and-keyboard-navigator` (audit modal keyboard focus traps & ARIA attributes).
   - **Code Refactoring & Clean Code tasks**: Delegate to `codebase-refactoring-and-clean-code-specialist` (decouple monolithic files, extract DRY helpers, eliminate duplicate logic & enforce clean architecture).
   - **Code Modifications & Builds**: Delegate to `qa-build-and-graph-maintainer` (background QA & graphify update).

### Component-Level Specialist Subagent Mapping
Whenever an instruction targets a specific UI or component subsystem, delegate to its dedicated Component Specialist subagent:
- **Admin Suite Components** (`components/features/admin/`, `AdminDashboard`, `StaffTab`, `AdjustmentsTab`, `ScenarioForm`, `BypassModal`): Delegate to `admin-suite-component-specialist`.
- **AI Eval & Call Simulator Components** (`components/features/ai-eval/`, `CallSimulatorHud`, `DiagnosticRunner`, `EvaluatorDashboard`, `CoachingBrief`): Delegate to `ai-eval-simulator-component-specialist`.
- **Learning & Presentation Components** (`components/features/learn/`, `CourseHub`, `LearnEditor`, `PresentationViewer`, `DrawingCanvas`): Delegate to `learning-presentation-component-specialist`.
- **Quiz & Assessment Components** (`components/features/quiz/`, `QuizSystem`, `PhaseBreakdown`, `LeaderboardTable`, `CertificateModal`): Delegate to `quiz-assessment-component-specialist`.
- **Dashboard & Analytics Components** (`components/features/dashboard/`, `Dashboard`, `CohortHeatmap`, `KpiSection`, `ReturningUserBanner`): Delegate to `dashboard-analytics-component-specialist`.
- **Staffing & Roster Components** (`components/features/admin/staff/`, `StaffTab`, `StaffSection`, `BulkImportModal`, `AccessNotes`, `StaffAiCopilot`): Delegate to `staffing-suite-component-specialist`.
- **UX, UI & Layout Components** (`components/ui/`, `GlassCard`, `NavBar`, `CommandPalette`, `ScoreRing`, `BackgroundEffects`, `app/[locale]/**/layout.tsx`): Delegate to `ux-ui-layout-component-specialist`.
- **Shared, Layout & Auth Components** (`components/ui/`, `LoginForm`, `ProfileHeader`, `LanguagePicker`): Delegate to `shared-layout-auth-component-specialist`.
4. **Graph Maintenance**: After modifying code files in any session, trigger `graphify update .` to keep the architecture knowledge graph current.

## graphify

This project has a graphify knowledge graph at `graphify-out/`.

