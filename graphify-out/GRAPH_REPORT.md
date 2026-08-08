# Graph Report - BrainTrade-Training  (2026-08-08)

## Corpus Check
- 275 files · ~139,674 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1107 nodes · 2745 edges · 79 communities (62 shown, 17 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 14 edges (avg confidence: 0.89)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `73f28be1`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- scoreColor
- fsSet
- CourseHub.tsx
- agent-training/index.tsx
- EvaluatorDashboard.tsx
- agent.ts
- TrainingPeriod
- agents.ts
- AgentEntry.tsx
- [locale]/layout.tsx
- db.ts
- stats-service.ts
- animations.ts
- AdminDashboard.tsx
- AdjustmentsTab.tsx
- server.ts
- session/route.ts
- compilerOptions
- quiz/index.tsx
- getAdminDb
- devDependencies
- export/route.ts
- dependencies
- index.ts
- scripts
- quiz-data.ts
- quiz/page.tsx
- ReportsTab.tsx
- fsGetAll
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
- FADE_IN
- getServerUser
- seed-mock-agents.mjs
- next-env.d.ts
- git-auto-commit.sh
- package.json
- tailwind.config.ts
- AgentEvaluation
- eslint-config-next
- eslint-plugin-react-hooks
- postcss
- agy-start.sh
- tailwindcss
- HistorySections.tsx
- EvaluationsTab.tsx

## God Nodes (most connected - your core abstractions)
1. `getAdminDb()` - 50 edges
2. `getServerUser` - 45 edges
3. `AgentStats` - 38 edges
4. `TrainingPeriod` - 27 edges
5. `fsGetAll()` - 24 edges
6. `fsSet()` - 24 edges
7. `scoreColor()` - 23 edges
8. `fsUpdate()` - 23 edges
9. `updateAgentOverallScore()` - 23 edges
10. `getAgentSession()` - 23 edges

## Surprising Connections (you probably didn't know these)
- `AiEvalLayout()` --calls--> `getServerUser`  [EXTRACTED]
  app/[locale]/ai-eval/layout.tsx → lib/session/server.ts
- `LearnLayout()` --calls--> `getServerUser`  [EXTRACTED]
  app/[locale]/learn/layout.tsx → lib/session/server.ts
- `QuizLayout()` --calls--> `getServerUser`  [EXTRACTED]
  app/[locale]/quiz/layout.tsx → lib/session/server.ts
- `QuizIndexPage()` --indirect_call--> `key()`  [INFERRED]
  app/[locale]/quiz/page.tsx → lib/localCache.ts
- `GET()` --calls--> `requireAdminOrIT()`  [EXTRACTED]
  app/api/admin/approvals/route.ts → lib/session/server.ts

## Import Cycles
- None detected.

## Communities (79 total, 17 thin omitted)

### Community 0 - "scoreColor"
Cohesion: 0.19
Nodes (17): ProfileHeader(), ApprovalsTab(), DetailedEvaluation(), DetailedEvaluationProps, EvalRow(), EvaluationsDashboard(), EvaluationsDashboardProps, AdminEval (+9 more)

### Community 1 - "fsSet"
Cohesion: 0.06
Nodes (37): POST(), defaults(), POST(), ProgressRecord, maxDuration, POST(), MOCKUP_AGENTS, POST() (+29 more)

### Community 2 - "CourseHub.tsx"
Cohesion: 0.07
Nodes (43): GET(), GET(), LearnPageContent(), LearnIndexPage(), OverridesManager(), CourseCard, CourseCardProps, CourseHeader (+35 more)

### Community 3 - "agent-training/index.tsx"
Cohesion: 0.08
Nodes (42): DashboardPage(), HRAnalyticsTab(), AiSkillGapReport(), CRITERIA_MAP, SkillGapItem, BackgroundEffects, AgentTrainingHub(), CongratulationsCard (+34 more)

### Community 4 - "EvaluatorDashboard.tsx"
Cohesion: 0.15
Nodes (28): StatusPipeline(), AgentPerformancePanel(), AgentPerformancePanelProps, EvalForm(), EvalFormProps, EvalHistoryCard(), EvaluatorDashboard(), EvaluatorDashboardProps (+20 more)

### Community 5 - "agent.ts"
Cohesion: 0.19
Nodes (13): AiEvalLayout(), DashboardLayout(), LearnLayout(), QuizLayout(), AgentAuthGuard(), NAV_ITEMS, NavBar(), AGENT_ID_KEY (+5 more)

### Community 6 - "TrainingPeriod"
Cohesion: 0.09
Nodes (37): LivePulse(), DayRecordForm, DayRecordFormProps, DaysTab(), DaysTabProps, DisciplineSubTabProps, DisciplineTab(), NewPeriodModal() (+29 more)

### Community 7 - "agents.ts"
Cohesion: 0.12
Nodes (24): GET(), POST(), defaults(), GET(), POST(), ProgressRecord, GET(), buildAiEval() (+16 more)

### Community 8 - "AgentEntry.tsx"
Cohesion: 0.05
Nodes (43): Tab, BrandingPanel(), MODULES, STATS_CONFIG, DEV_MOCK_AGENTS, DevMockAgent, DevMockupSelector(), EntryAvatar() (+35 more)

### Community 9 - "[locale]/layout.tsx"
Cohesion: 0.08
Nodes (25): POST(), dmMono, dmSans, AgentSkillRow, CohortHeatmap(), CohortHeatmapProps, DEFAULT_ROWS, CommandPalette() (+17 more)

### Community 10 - "db.ts"
Cohesion: 0.10
Nodes (23): DELETE, PATCH, GET, POST, GET(), POST(), GET, PATCH (+15 more)

### Community 11 - "stats-service.ts"
Cohesion: 0.25
Nodes (15): DELETE(), POST(), POST(), POST(), PATCH(), POST(), fsUpdate(), AuditAction (+7 more)

### Community 12 - "animations.ts"
Cohesion: 0.11
Nodes (23): AuditFlow(), AuditFlowProps, CallSimulatorHud(), CallSimulatorHudProps, ChatView, CoachingCard, ScoreTrend, AiEvaluation() (+15 more)

### Community 13 - "AdminDashboard.tsx"
Cohesion: 0.13
Nodes (20): AdminHeader(), AdminHeaderProps, AdminSidebar(), AdminSidebarProps, NavGroupProps, AdminTabContent(), AdminTabContentProps, TAB_REGISTRY (+12 more)

### Community 14 - "AdjustmentsTab.tsx"
Cohesion: 0.08
Nodes (29): AiEvalConfig, AiEvalEditor(), DiagnosticResult, DiagnosticRunner(), HealthManager(), LearnConfig, LearnEditor(), LearnModule (+21 more)

### Community 15 - "server.ts"
Cohesion: 0.12
Nodes (23): FeedItem, GET(), DELETE(), PATCH(), GET(), POST(), GET(), POST() (+15 more)

### Community 16 - "session/route.ts"
Cohesion: 0.26
Nodes (8): POST(), POST(), createCustomTokenSafe(), POST(), setSession(), fsGetWhere(), makeSessionToken(), StaffAccount

### Community 17 - "compilerOptions"
Cohesion: 0.07
Nodes (27): dom, dom.iterable, esnext, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules, **/*.ts (+19 more)

### Community 18 - "quiz/index.tsx"
Cohesion: 0.16
Nodes (26): QuizSystem(), PhaseBreakdown, PhaseBreakdownProps, QuizResult(), ResultView, ResultViewProps, QuestionCard, QuestionCardProps (+18 more)

### Community 19 - "getAdminDb"
Cohesion: 0.13
Nodes (20): GET(), maxDuration, POST(), POST(), GET(), GET(), GET(), GET() (+12 more)

### Community 20 - "devDependencies"
Cohesion: 0.10
Nodes (21): autoprefixer, babel-plugin-react-compiler, eslint, @eslint/eslintrc, @eslint/js, eslint-plugin-jsx-a11y, devDependencies, autoprefixer (+13 more)

### Community 21 - "export/route.ts"
Cohesion: 0.08
Nodes (24): AMBER, buildIndividualSheet(), buildOverviewSheet(), GET(), GREEN, RED, scoreFill(), AiScenarioImportModal() (+16 more)

### Community 22 - "dependencies"
Cohesion: 0.10
Nodes (21): firebase, firebase-admin, framer-motion, @google-cloud/storage, lucide-react, next, next-intl, openai (+13 more)

### Community 23 - "index.ts"
Cohesion: 0.12
Nodes (23): ProfileHeaderProps, CompletionGridProps, GraduationRoster(), GraduationRosterProps, STATUS_ORDER, KpiSection(), KpiSectionProps, LeaderboardTable() (+15 more)

### Community 24 - "scripts"
Cohesion: 0.18
Nodes (11): scripts, agy:check, agy:commit, agy:start, build, check, dev, lint (+3 more)

### Community 25 - "quiz-data.ts"
Cohesion: 0.10
Nodes (19): CERT_PART1, CERT_PART2, CERT_PART3, CERT_PART4, CERT_PART5, FOUND_PART1, FOUND_PART2, FOUND_PART3 (+11 more)

### Community 26 - "quiz/page.tsx"
Cohesion: 0.25
Nodes (4): C, ICON_MAP, QuizIndexPage(), MODULE_QUIZ_MAP

### Community 27 - "ReportsTab.tsx"
Cohesion: 0.53
Nodes (4): getCompletionStatus(), ReportsTab(), statusPill(), fetchWithCache()

### Community 28 - "fsGetAll"
Cohesion: 0.27
Nodes (8): GET(), EMPTY, GET(), normalizeName(), POST(), fsCount(), fsGetAll(), getGlobalStats()

### Community 29 - "seed.mjs"
Cohesion: 0.39
Nodes (7): __dirname, envPath, initAdmin(), main(), seedAdmin(), seedQuizzes(), seedScenarios()

### Community 33 - "seed-scenarios.mjs"
Cohesion: 0.40
Nodes (5): __dirname, envPath, FULL_CURRICULUM_SCENARIOS, initAdmin(), seed()

### Community 50 - "FADE_IN"
Cohesion: 0.19
Nodes (8): DashboardHeader(), ModuleItem, MODULES, QuizBriefing, reveal, ActiveAgentUI(), ActiveAgentUIProps, FADE_IN

### Community 51 - "getServerUser"
Cohesion: 0.16
Nodes (16): GET(), DELETE(), GET(), PATCH(), POST(), POST(), GET(), PATCH() (+8 more)

### Community 52 - "seed-mock-agents.mjs"
Cohesion: 0.40
Nodes (5): __dirname, envPath, initAdmin(), MOCKUP_AGENTS, seed()

### Community 55 - "package.json"
Cohesion: 0.50
Nodes (3): name, private, version

### Community 71 - "AgentEvaluation"
Cohesion: 0.29
Nodes (5): EvalHistoryCardProps, OverviewPanelProps, SemanticAuditService, Agent, AgentEvaluation

### Community 79 - "HistorySections.tsx"
Cohesion: 0.26
Nodes (8): BypassModal(), BypassModalProps, DetailedAiEvalHistory(), DetailedHumanEvaluations(), DetailedQuizHistory(), requestOverride(), AgentDetailModal(), Target()

### Community 87 - "EvaluationsTab.tsx"
Cohesion: 0.25
Nodes (7): ActiveBatchHeader(), ActiveBatchHeaderProps, ArchiveSelectionGrid(), ArchiveSelectionGridProps, EvalTab, useEvaluationsData(), EvaluationsTab()

## Knowledge Gaps
- **248 isolated node(s):** `dmSans`, `dmMono`, `Tab`, `ICON_MAP`, `C` (+243 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **17 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `dependencies` to `[locale]/layout.tsx`, `agent-training/index.tsx`, `export/route.ts`, `package.json`?**
  _High betweenness centrality (0.103) - this node is a cross-community bridge._
- **Why does `xlsx` connect `export/route.ts` to `getServerUser`, `AdjustmentsTab.tsx`, `dependencies`?**
  _High betweenness centrality (0.046) - this node is a cross-community bridge._
- **What connects `dmSans`, `dmMono`, `Tab` to the rest of the system?**
  _248 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `fsSet` be split into smaller, more focused modules?**
  _Cohesion score 0.060718252499074414 - nodes in this community are weakly interconnected._
- **Should `CourseHub.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.0655367231638418 - nodes in this community are weakly interconnected._
- **Should `agent-training/index.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.07644110275689223 - nodes in this community are weakly interconnected._
- **Should `TrainingPeriod` be split into smaller, more focused modules?**
  _Cohesion score 0.09351432880844646 - nodes in this community are weakly interconnected._