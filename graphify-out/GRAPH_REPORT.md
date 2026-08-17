# Graph Report - BrainTrade-Training  (2026-08-17)

## Corpus Check
- 304 files · ~174,138 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1260 nodes · 3115 edges · 88 communities (70 shown, 18 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 19 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `5f831594`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- scoreColor
- export/route.ts
- getServerUser
- agent-training/index.tsx
- animations.ts
- agent.ts
- TrainingPeriod
- agents.ts
- AgentEntry
- EvaluatorDashboard.tsx
- index.ts
- dependencies
- fsDelete
- dashboard-policy.ts
- AdjustmentsTab.tsx
- fsSet
- server.ts
- compilerOptions
- quiz-data.ts
- scripts
- devDependencies
- fsGetAll
- db.ts
- package.json
- sync-session-memory.js
- @types/node
- OverviewTab.tsx
- ai-eval/index.tsx
- getAdminDb
- seed.mjs
- Pitch Prompt
- deploy.sh
- LiveFeed.tsx
- seed-scenarios.mjs
- App Hosting Config
- next.config.ts
- debug-firebase.mjs
- AnalyticsHub.tsx
- Cloud Build Pipeline
- Environment Variables
- GEMINI.md
- HRAnalyticsTab.tsx
- seed-mock-agents.mjs
- next-env.d.ts
- git-auto-commit.sh
- CourseHub.tsx
- 🎯 Core Token Reduction Strategies
- tailwind.config.ts
- lib/quiz/types.ts
- 🤝 BrainTrade Training Platform - System Handoff & Architecture Guide
- [locale]/layout.tsx
- @types/react
- agy-start.sh
- LoginForm.tsx
- CongratulationsCard.tsx
- AgentStats
- ReturningUserBanner.tsx
- EvaluationsDashboard.tsx
- HistorySections.tsx
- @eslint/js
- ensure-dev-server.js
- Karpathy Guidelines
- FeatureSpotlightTour.tsx
- tailwindcss
- typescript

## God Nodes (most connected - your core abstractions)
1. `getAdminDb()` - 51 edges
2. `getServerUser` - 45 edges
3. `AgentStats` - 38 edges
4. `TrainingPeriod` - 28 edges
5. `fsSet()` - 26 edges
6. `fsGetAll()` - 24 edges
7. `getAgentSession()` - 24 edges
8. `scoreColor()` - 23 edges
9. `fsAdd()` - 23 edges
10. `fsUpdate()` - 23 edges

## Surprising Connections (you probably didn't know these)
- `EvaluatorPageContent()` --calls--> `getServerUser`  [EXTRACTED]
  app/[locale]/evaluator/page.tsx → lib/session/server.ts
- `QuizIndexPage()` --indirect_call--> `key()`  [INFERRED]
  app/[locale]/quiz/page.tsx → lib/localCache.ts
- `SandboxManagerModal()` --references--> `xlsx`  [EXTRACTED]
  components/features/admin/SandboxManagerModal.tsx → package.json
- `ArchiveSelectionGridProps` --references--> `TrainingPeriod`  [EXTRACTED]
  components/features/admin/evaluations/ArchiveSelectionGrid.tsx → types/index.ts
- `LeaderboardTableProps` --references--> `AgentStats`  [EXTRACTED]
  components/features/admin/overview/LeaderboardTable.tsx → types/index.ts

## Import Cycles
- None detected.

## Communities (88 total, 18 thin omitted)

### Community 0 - "scoreColor"
Cohesion: 0.26
Nodes (13): ProfileHeader(), DetailedEvaluation(), DetailedEvaluationProps, EvalRow(), GraduationRoster(), LeaderboardTable(), LeaderboardTableProps, BadgePill() (+5 more)

### Community 1 - "export/route.ts"
Cohesion: 0.08
Nodes (25): AMBER, buildIndividualSheet(), buildOverviewSheet(), GET(), GREEN, RED, scoreFill(), GET() (+17 more)

### Community 2 - "getServerUser"
Cohesion: 0.19
Nodes (13): POST(), GET(), createCustomTokenSafe(), POST(), setSession(), GET(), AiEvalLayout(), LearnLayout() (+5 more)

### Community 3 - "agent-training/index.tsx"
Cohesion: 0.17
Nodes (19): BackgroundEffects, CongratulationsCard, ModuleCard, ModuleCardProps, ModuleHeader, ProfileSidebar, ProfileSidebarProps, SectionDivider (+11 more)

### Community 4 - "animations.ts"
Cohesion: 0.10
Nodes (23): BrandingPanel(), MODULES, STATS_CONFIG, EntryAvatar(), EntryAvatarProps, FloatingDecoration(), MobileHeader(), MobileHeaderProps (+15 more)

### Community 5 - "agent.ts"
Cohesion: 0.09
Nodes (35): DashboardLayout(), DashboardPage(), normalizeName(), useAgentEntry(), DashboardHeader(), AgentAuthGuard(), SessionContext, SessionContextType (+27 more)

### Community 6 - "TrainingPeriod"
Cohesion: 0.09
Nodes (35): ActiveBatchHeader(), ActiveBatchHeaderProps, LivePulse(), DayRecordForm, DayRecordFormProps, DaysTab(), DaysTabProps, DisciplineSubTabProps (+27 more)

### Community 7 - "agents.ts"
Cohesion: 0.12
Nodes (22): GET(), defaults(), GET(), POST(), ProgressRecord, GET(), POST(), buildAiEval() (+14 more)

### Community 8 - "AgentEntry"
Cohesion: 0.40
Nodes (3): AgentEntry(), getInitials(), normalizeName()

### Community 9 - "EvaluatorDashboard.tsx"
Cohesion: 0.16
Nodes (23): EvaluatorPageContent(), AgentPerformancePanel(), EvalForm(), EvalFormProps, EvalHistoryCard(), EvalHistoryCardProps, EvaluatorDashboard(), EvaluatorDashboardProps (+15 more)

### Community 10 - "index.ts"
Cohesion: 0.10
Nodes (26): DELETE, PATCH, GET, POST, POST(), GET, PATCH, POST (+18 more)

### Community 11 - "dependencies"
Cohesion: 0.09
Nodes (23): firebase, firebase-admin, framer-motion, @google-cloud/storage, lucide-react, next, next-intl, nodemailer (+15 more)

### Community 12 - "fsDelete"
Cohesion: 0.21
Nodes (13): DELETE(), GET(), PATCH(), POST(), GET(), PATCH(), GET(), DELETE() (+5 more)

### Community 13 - "dashboard-policy.ts"
Cohesion: 0.10
Nodes (29): AdminHeader(), AdminHeaderProps, AdminSidebar(), AdminSidebarProps, AdminTabContent(), AdminTabContentProps, TAB_REGISTRY, ChangePasswordModal() (+21 more)

### Community 14 - "AdjustmentsTab.tsx"
Cohesion: 0.08
Nodes (34): AiEvalConfig, AiEvalEditor(), LearnConfig, LearnEditor(), LearnModule, PresentationInfo, OverridesManager(), QuizDefinition (+26 more)

### Community 15 - "fsSet"
Cohesion: 0.05
Nodes (43): POST(), GET(), defaults(), POST(), ProgressRecord, POST(), POST(), maxDuration (+35 more)

### Community 16 - "server.ts"
Cohesion: 0.12
Nodes (24): FeedItem, GET(), POST(), POST(), DELETE(), PATCH(), GET(), POST() (+16 more)

### Community 17 - "compilerOptions"
Cohesion: 0.07
Nodes (27): dom, dom.iterable, esnext, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules, **/*.ts (+19 more)

### Community 18 - "quiz-data.ts"
Cohesion: 0.06
Nodes (70): C, ICON_MAP, QuizIndexPage(), ArcadeStageCard(), ArcadeStageCardProps, ConfettiBurst(), getNextRankProgress(), getRankForXp() (+62 more)

### Community 19 - "scripts"
Cohesion: 0.17
Nodes (12): scripts, agy:check, agy:commit, agy:start, build, check, dev, dev:auto (+4 more)

### Community 20 - "devDependencies"
Cohesion: 0.10
Nodes (21): autoprefixer, babel-plugin-react-compiler, eslint, eslint-config-next, @eslint/eslintrc, eslint-plugin-jsx-a11y, eslint-plugin-react-hooks, devDependencies (+13 more)

### Community 21 - "fsGetAll"
Cohesion: 0.25
Nodes (7): GET(), EMPTY, GET(), MOCKUP_AGENTS, fsCount(), fsGetAll(), getGlobalStats()

### Community 22 - "db.ts"
Cohesion: 0.19
Nodes (15): POST(), POST(), normalizeName(), POST(), PATCH(), POST(), fsGet(), fsQuery() (+7 more)

### Community 23 - "package.json"
Cohesion: 0.50
Nodes (3): name, private, version

### Community 24 - "sync-session-memory.js"
Cohesion: 0.38
Nodes (6): { execSync }, fs, getRecentBranch(), getRecentGitCommits(), path, syncSessionMemory()

### Community 26 - "OverviewTab.tsx"
Cohesion: 0.17
Nodes (13): ApprovalsTab(), HistoryTab(), OperationsHubProps, OperationsSubTab, CompletionGrid(), CompletionGridProps, KpiSection(), KpiSectionProps (+5 more)

### Community 27 - "ai-eval/index.tsx"
Cohesion: 0.10
Nodes (25): AuditFlow(), AuditFlowProps, CallSimulatorHud(), CallSimulatorHudProps, ChatView, CoachingCard, ScoreTrend, AiEvaluation() (+17 more)

### Community 28 - "getAdminDb"
Cohesion: 0.11
Nodes (30): DELETE(), GET(), POST(), POST(), POST(), GET(), GET(), POST() (+22 more)

### Community 29 - "seed.mjs"
Cohesion: 0.39
Nodes (7): __dirname, envPath, initAdmin(), main(), seedAdmin(), seedQuizzes(), seedScenarios()

### Community 33 - "seed-scenarios.mjs"
Cohesion: 0.40
Nodes (5): __dirname, envPath, FULL_CURRICULUM_SCENARIOS, initAdmin(), seed()

### Community 46 - "AnalyticsHub.tsx"
Cohesion: 0.12
Nodes (13): DiagnosticResult, DiagnosticRunner(), HealthManager(), AnalyticsHubProps, AnalyticsSubTab, CertificateTab(), COLOR_PRESETS, SystemHealthRadar() (+5 more)

### Community 51 - "HRAnalyticsTab.tsx"
Cohesion: 0.22
Nodes (9): HRAnalyticsTab(), AiSkillGapReport(), CRITERIA_MAP, SkillGapItem, AgentTrainingHub(), deriveSteps(), scoreColor(), react (+1 more)

### Community 52 - "seed-mock-agents.mjs"
Cohesion: 0.40
Nodes (5): __dirname, envPath, initAdmin(), MOCKUP_AGENTS, seed()

### Community 55 - "CourseHub.tsx"
Cohesion: 0.05
Nodes (56): GET(), GET(), LearnPageContent(), LearnIndexPage(), Tab, getCompletionStatus(), ReportsTab(), statusPill() (+48 more)

### Community 56 - "🎯 Core Token Reduction Strategies"
Cohesion: 0.22
Nodes (8): 1. Flash-Tier Subagent Delegation for File Operations, 2. Knowledge Graph & Handoff Memory Lookups, 3. Tight Line-Range Slicing (`view_file`), 4. Subagent Handoff & State Synchronization Protocol, 5. Safe Context Compaction Protocol, 🎯 Core Token Reduction Strategies, ⚙️ Recommended Local Compaction Config (`.gemini/settings.json`), Token Optimization & Subagent Handoff Skill

### Community 71 - "lib/quiz/types.ts"
Cohesion: 0.22
Nodes (8): Language, PASS_THRESHOLD, QuestionData, QuestionType, QuizDefinition, QuizPhase, QuizUIOverrides, UI_STRINGS

### Community 72 - "🤝 BrainTrade Training Platform - System Handoff & Architecture Guide"
Cohesion: 0.14
Nodes (13): 1. Anti-Hardcoding Rules (Mandatory Compliance), 1. Executive Summary & Current Project State, 2. Audio & Haptic User Feedback, 2. Directory Architecture & Topology, 3. Core Architectural Conventions & Guidelines, 3. Session & Access Control, 4. Primary Knowledge Graph God Nodes (Graphify), 5. Outstanding Tasks & Roadmap for `hands-on-agent` (+5 more)

### Community 73 - "[locale]/layout.tsx"
Cohesion: 0.08
Nodes (24): POST(), dmMono, dmSans, AgentSkillRow, CohortHeatmap(), CohortHeatmapProps, DEFAULT_ROWS, CommandPalette() (+16 more)

### Community 76 - "LoginForm.tsx"
Cohesion: 0.38
Nodes (5): DEV_MOCK_AGENTS, DevMockAgent, DevMockupSelector(), LoginForm(), LoginFormProps

### Community 77 - "CongratulationsCard.tsx"
Cohesion: 0.38
Nodes (4): Confetti, CongratulationsCard, CongratulationsCardProps, TrophyHero

### Community 78 - "AgentStats"
Cohesion: 0.22
Nodes (14): ProfileHeaderProps, GraduationRosterProps, STATUS_ORDER, StatusPipeline(), Props, ModuleHeaderProps, AgentPerformancePanelProps, OverviewPanel() (+6 more)

### Community 79 - "ReturningUserBanner.tsx"
Cohesion: 0.60
Nodes (4): getInitials(), normalizeName(), ReturningUserBanner(), ReturningUserBannerProps

### Community 80 - "EvaluationsDashboard.tsx"
Cohesion: 0.21
Nodes (10): ArchiveSelectionGrid(), ArchiveSelectionGridProps, EvaluationsDashboard(), EvaluationsDashboardProps, AdminEval, EvalTab, useEvaluationsData(), EvaluationsTab() (+2 more)

### Community 81 - "HistorySections.tsx"
Cohesion: 0.33
Nodes (6): BypassModal(), BypassModalProps, DetailedAiEvalHistory(), DetailedHumanEvaluations(), DetailedQuizHistory(), requestOverride()

### Community 83 - "ensure-dev-server.js"
Cohesion: 0.32
Nodes (7): checkServerReady(), ensureDevServer(), fs, http, logStderr(), path, { spawn, execSync }

### Community 84 - "Karpathy Guidelines"
Cohesion: 0.33
Nodes (5): 1. Think Before Coding, 2. Simplicity First, 3. Surgical Changes, 4. Goal-Driven Execution, Karpathy Guidelines

### Community 85 - "FeatureSpotlightTour.tsx"
Cohesion: 0.33
Nodes (5): DEFAULT_STEPS, ElementRect, FeatureSpotlightTour(), FeatureSpotlightTourProps, SpotlightStep

## Knowledge Gaps
- **308 isolated node(s):** `dmSans`, `dmMono`, `Tab`, `ICON_MAP`, `C` (+303 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **18 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `dependencies` to `[locale]/layout.tsx`, `HRAnalyticsTab.tsx`, `export/route.ts`, `package.json`?**
  _High betweenness centrality (0.079) - this node is a cross-community bridge._
- **Why does `react` connect `HRAnalyticsTab.tsx` to `quiz-data.ts`, `dependencies`, `CourseHub.tsx`?**
  _High betweenness centrality (0.045) - this node is a cross-community bridge._
- **Why does `AgentStats` connect `AgentStats` to `scoreColor`, `export/route.ts`, `agent-training/index.tsx`, `agent.ts`, `TrainingPeriod`, `agents.ts`, `EvaluatorDashboard.tsx`, `index.ts`, `HistorySections.tsx`, `HRAnalyticsTab.tsx`, `fsGetAll`, `CourseHub.tsx`, `OverviewTab.tsx`, `getAdminDb`?**
  _High betweenness centrality (0.038) - this node is a cross-community bridge._
- **What connects `dmSans`, `dmMono`, `Tab` to the rest of the system?**
  _308 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `export/route.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08095238095238096 - nodes in this community are weakly interconnected._
- **Should `animations.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.10121457489878542 - nodes in this community are weakly interconnected._
- **Should `agent.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.09183673469387756 - nodes in this community are weakly interconnected._