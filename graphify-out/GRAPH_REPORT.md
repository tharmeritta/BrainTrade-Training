# Graph Report - BrainTrade-Training  (2026-08-11)

## Corpus Check
- 286 files · ~155,855 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1168 nodes · 2892 edges · 84 communities (65 shown, 19 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 18 edges (avg confidence: 0.82)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `e1ca65a7`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- AgentStats
- ai-eval.ts
- db.ts
- agent-training/index.tsx
- fsSet
- agent.ts
- TrainingPeriod
- agents.ts
- AgentEntry.tsx
- index.ts
- staff/route.ts
- dependencies
- xlsx
- AdminDashboard.tsx
- AdjustmentsTab.tsx
- ai-audit-service.ts
- animations.ts
- compilerOptions
- quiz-data.ts
- firebase-admin.ts
- devDependencies
- scripts
- SemanticAuditService
- getAdminDb
- sync-session-memory.js
- StaffTab.tsx
- server.ts
- ai-eval/index.tsx
- bulk-progress/route.ts
- seed.mjs
- Pitch Prompt
- deploy.sh
- LiveFeed.tsx
- seed-scenarios.mjs
- App Hosting Config
- next.config.ts
- debug-firebase.mjs
- Cloud Build Pipeline
- Environment Variables
- GEMINI.md
- BrandingPanel.tsx
- LoginForm.tsx
- seed-mock-agents.mjs
- next-env.d.ts
- git-auto-commit.sh
- CourseHub.tsx
- HRAnalyticsTab.tsx
- tailwind.config.ts
- lib/quiz/types.ts
- getServerUser
- [locale]/layout.tsx
- package.json
- agy-start.sh
- @types/node
- CongratulationsCard.tsx
- @types/nodemailer
- @types/react
- typescript
- ensure-dev-server.js
- ShowcaseTab.tsx
- ReturningUserBanner.tsx

## God Nodes (most connected - your core abstractions)
1. `getAdminDb()` - 50 edges
2. `getServerUser` - 45 edges
3. `AgentStats` - 38 edges
4. `TrainingPeriod` - 27 edges
5. `fsSet()` - 26 edges
6. `fsGetAll()` - 24 edges
7. `getAgentSession()` - 24 edges
8. `scoreColor()` - 23 edges
9. `fsAdd()` - 23 edges
10. `fsUpdate()` - 23 edges

## Surprising Connections (you probably didn't know these)
- `AiEvalLayout()` --calls--> `getServerUser`  [EXTRACTED]
  app/[locale]/ai-eval/layout.tsx → lib/session/server.ts
- `EvaluatorPageContent()` --calls--> `getServerUser`  [EXTRACTED]
  app/[locale]/evaluator/page.tsx → lib/session/server.ts
- `LearnLayout()` --calls--> `getServerUser`  [EXTRACTED]
  app/[locale]/learn/layout.tsx → lib/session/server.ts
- `QuizLayout()` --calls--> `getServerUser`  [EXTRACTED]
  app/[locale]/quiz/layout.tsx → lib/session/server.ts
- `POST()` --calls--> `fsAdd()`  [EXTRACTED]
  app/api/admin/seed/route.ts → lib/server/db.ts

## Import Cycles
- None detected.

## Communities (84 total, 19 thin omitted)

### Community 0 - "AgentStats"
Cohesion: 0.05
Nodes (76): EvaluatorPageContent(), BypassModal(), BypassModalProps, DetailedAiEvalHistory(), DetailedHumanEvaluations(), DetailedQuizHistory(), requestOverride(), ProfileHeader() (+68 more)

### Community 1 - "ai-eval.ts"
Cohesion: 0.13
Nodes (18): DIFF, DIFF_ORDER, EMPTY_FORM, inputCls, textareaCls, AI_SUGGESTIONS, ScenarioForm(), ScenarioCard() (+10 more)

### Community 2 - "db.ts"
Cohesion: 0.13
Nodes (15): FeedItem, GET(), EMPTY, GET(), POST(), GET(), POST(), GET() (+7 more)

### Community 3 - "agent-training/index.tsx"
Cohesion: 0.20
Nodes (17): BackgroundEffects, CongratulationsCard, Props, ModuleCard, ModuleCardProps, ModuleHeader, ModuleHeaderProps, ProfileSidebar (+9 more)

### Community 4 - "fsSet"
Cohesion: 0.25
Nodes (8): POST(), POST(), fsSet(), getActiveTrainingPeriod(), AiEvalService, AiEvalScenario, AiEvalSession, AiEvalTurnResponse

### Community 5 - "agent.ts"
Cohesion: 0.07
Nodes (43): AiEvalLayout(), DashboardLayout(), DashboardPage(), LearnLayout(), QuizLayout(), C, ICON_MAP, QuizIndexPage() (+35 more)

### Community 6 - "TrainingPeriod"
Cohesion: 0.07
Nodes (41): Tab, ActiveBatchHeader(), ActiveBatchHeaderProps, ArchiveSelectionGrid(), ArchiveSelectionGridProps, LivePulse(), DayRecordForm, DayRecordFormProps (+33 more)

### Community 7 - "agents.ts"
Cohesion: 0.08
Nodes (36): AMBER, buildIndividualSheet(), buildOverviewSheet(), GET(), GREEN, RED, scoreFill(), GET() (+28 more)

### Community 8 - "AgentEntry.tsx"
Cohesion: 0.18
Nodes (12): EntryAvatar(), EntryAvatarProps, MobileHeader(), MobileHeaderProps, MobileModuleChips(), ModuleChip, MODULES, AgentEntry() (+4 more)

### Community 9 - "index.ts"
Cohesion: 0.11
Nodes (19): GET(), MOCKUP_AGENTS, POST(), normalizeName(), POST(), OverviewPanelProps, fsGetAll(), SemanticAuditResult (+11 more)

### Community 10 - "staff/route.ts"
Cohesion: 0.17
Nodes (12): DELETE, PATCH, GET, POST, GET, PATCH, POST, apiError() (+4 more)

### Community 11 - "dependencies"
Cohesion: 0.08
Nodes (25): firebase, firebase-admin, framer-motion, @google-cloud/storage, @google/generative-ai, lucide-react, next, next-intl (+17 more)

### Community 12 - "xlsx"
Cohesion: 0.19
Nodes (11): GET(), AiScenarioImportModal(), AiScenarioImportModalProps, SandboxManagerModal(), SandboxManagerModalProps, AI_SCENARIO_TEMPLATE, DEFAULT_CRITERIA, downloadScenarioTemplate() (+3 more)

### Community 13 - "AdminDashboard.tsx"
Cohesion: 0.08
Nodes (28): POST(), AdminHeader(), AdminHeaderProps, AdminSidebar(), AdminSidebarProps, NavGroupProps, AdminTabContent(), AdminTabContentProps (+20 more)

### Community 14 - "AdjustmentsTab.tsx"
Cohesion: 0.08
Nodes (30): AiEvalConfig, AiEvalEditor(), DiagnosticResult, DiagnosticRunner(), HealthManager(), LearnConfig, LearnEditor(), LearnModule (+22 more)

### Community 15 - "ai-audit-service.ts"
Cohesion: 0.27
Nodes (7): POST(), maxDuration, POST(), POST(), getGeminiModel(), getOpenAI(), AiAuditService

### Community 16 - "animations.ts"
Cohesion: 0.20
Nodes (8): ModuleItem, MODULES, BackgroundEffects, BrandedTitle(), BrandedTitleProps, EASE, FADE_IN, STAGGER_CONTAINER

### Community 17 - "compilerOptions"
Cohesion: 0.07
Nodes (27): dom, dom.iterable, esnext, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules, **/*.ts (+19 more)

### Community 18 - "quiz-data.ts"
Cohesion: 0.07
Nodes (56): ConfettiBurst(), getNextRankProgress(), getRankForXp(), playGamifiedSound(), RankInfo, RANKS, SoundWaveIndicator(), triggerHaptic() (+48 more)

### Community 19 - "firebase-admin.ts"
Cohesion: 0.17
Nodes (14): POST(), GET(), GET(), createCustomTokenSafe(), POST(), setSession(), fsGetWhere(), cleanEmail() (+6 more)

### Community 20 - "devDependencies"
Cohesion: 0.09
Nodes (23): autoprefixer, babel-plugin-react-compiler, eslint, eslint-config-next, @eslint/eslintrc, @eslint/js, eslint-plugin-jsx-a11y, eslint-plugin-react-hooks (+15 more)

### Community 21 - "scripts"
Cohesion: 0.17
Nodes (12): scripts, agy:check, agy:commit, agy:start, build, check, dev, dev:auto (+4 more)

### Community 23 - "getAdminDb"
Cohesion: 0.18
Nodes (24): DELETE(), GET(), POST(), POST(), POST(), POST(), PATCH(), GET() (+16 more)

### Community 24 - "sync-session-memory.js"
Cohesion: 0.38
Nodes (6): { execSync }, fs, getRecentBranch(), getRecentGitCommits(), path, syncSessionMemory()

### Community 25 - "StaffTab.tsx"
Cohesion: 0.21
Nodes (7): BulkImportModal(), BulkImportModalProps, AccessNotes(), AgentSection(), EditState, ROLE_COLORS, StaffSection()

### Community 26 - "server.ts"
Cohesion: 0.16
Nodes (20): GET(), POST(), DELETE(), DELETE(), PATCH(), DELETE(), PATCH(), fsDelete() (+12 more)

### Community 27 - "ai-eval/index.tsx"
Cohesion: 0.09
Nodes (24): AuditFlow(), AuditFlowProps, CallSimulatorHud(), CallSimulatorHudProps, ChatView, CoachingCard, ScoreTrend, AiEvaluation() (+16 more)

### Community 28 - "bulk-progress/route.ts"
Cohesion: 0.67
Nodes (3): defaults(), POST(), ProgressRecord

### Community 29 - "seed.mjs"
Cohesion: 0.39
Nodes (7): __dirname, envPath, initAdmin(), main(), seedAdmin(), seedQuizzes(), seedScenarios()

### Community 33 - "seed-scenarios.mjs"
Cohesion: 0.40
Nodes (5): __dirname, envPath, FULL_CURRICULUM_SCENARIOS, initAdmin(), seed()

### Community 50 - "BrandingPanel.tsx"
Cohesion: 0.28
Nodes (6): BrandingPanel(), MODULES, STATS_CONFIG, FloatingDecoration(), StatCounter(), StatCounterProps

### Community 51 - "LoginForm.tsx"
Cohesion: 0.38
Nodes (5): DEV_MOCK_AGENTS, DevMockAgent, DevMockupSelector(), LoginForm(), LoginFormProps

### Community 52 - "seed-mock-agents.mjs"
Cohesion: 0.40
Nodes (5): __dirname, envPath, initAdmin(), MOCKUP_AGENTS, seed()

### Community 55 - "CourseHub.tsx"
Cohesion: 0.06
Nodes (46): maxDuration, POST(), GET(), GET(), LearnPageContent(), LearnIndexPage(), CourseCard, CourseCardProps (+38 more)

### Community 56 - "HRAnalyticsTab.tsx"
Cohesion: 0.25
Nodes (7): HRAnalyticsTab(), AiSkillGapReport(), CRITERIA_MAP, SkillGapItem, AgentTrainingHub(), deriveSteps(), scoreColor()

### Community 71 - "lib/quiz/types.ts"
Cohesion: 0.22
Nodes (8): Language, PASS_THRESHOLD, QuestionData, QuestionType, QuizDefinition, QuizPhase, QuizUIOverrides, UI_STRINGS

### Community 72 - "getServerUser"
Cohesion: 0.22
Nodes (14): DELETE(), GET(), PATCH(), POST(), GET(), PATCH(), GET(), DELETE() (+6 more)

### Community 73 - "[locale]/layout.tsx"
Cohesion: 0.09
Nodes (22): POST(), dmMono, dmSans, AgentSkillRow, CohortHeatmap(), CohortHeatmapProps, DEFAULT_ROWS, CommandPalette() (+14 more)

### Community 74 - "package.json"
Cohesion: 0.50
Nodes (3): name, private, version

### Community 77 - "CongratulationsCard.tsx"
Cohesion: 0.38
Nodes (4): Confetti, CongratulationsCard, CongratulationsCardProps, TrophyHero

### Community 83 - "ensure-dev-server.js"
Cohesion: 0.32
Nodes (7): checkServerReady(), ensureDevServer(), fs, http, logStderr(), path, { spawn, execSync }

### Community 92 - "ReturningUserBanner.tsx"
Cohesion: 0.60
Nodes (4): getInitials(), normalizeName(), ReturningUserBanner(), ReturningUserBannerProps

## Knowledge Gaps
- **270 isolated node(s):** `dmSans`, `dmMono`, `Tab`, `ICON_MAP`, `C` (+265 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **19 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `dependencies` to `package.json`, `xlsx`, `CourseHub.tsx`?**
  _High betweenness centrality (0.070) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `devDependencies` to `package.json`, `@types/node`, `@types/nodemailer`, `@types/react`, `typescript`?**
  _High betweenness centrality (0.040) - this node is a cross-community bridge._
- **Why does `AgentStats` connect `AgentStats` to `db.ts`, `agent-training/index.tsx`, `agent.ts`, `TrainingPeriod`, `agents.ts`, `index.ts`, `getAdminDb`, `CourseHub.tsx`, `HRAnalyticsTab.tsx`?**
  _High betweenness centrality (0.038) - this node is a cross-community bridge._
- **What connects `dmSans`, `dmMono`, `Tab` to the rest of the system?**
  _270 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AgentStats` be split into smaller, more focused modules?**
  _Cohesion score 0.05030274802049371 - nodes in this community are weakly interconnected._
- **Should `ai-eval.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.13230769230769232 - nodes in this community are weakly interconnected._
- **Should `db.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.13227513227513227 - nodes in this community are weakly interconnected._