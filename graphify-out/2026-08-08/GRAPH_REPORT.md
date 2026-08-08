# Graph Report - BrainTrade-Training  (2026-08-08)

## Corpus Check
- 275 files · ~139,803 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1107 nodes · 2754 edges · 75 communities (58 shown, 17 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 14 edges (avg confidence: 0.89)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `4d6c51fc`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- scoreColor
- fsSet
- CourseHub.tsx
- agent-training/index.tsx
- AgentStats
- getServerUser
- TrainingPeriod
- getAdminDb
- AgentEntry.tsx
- [locale]/layout.tsx
- approval-service.ts
- dependencies
- fsDelete
- AdminDashboard.tsx
- AdjustmentsTab.tsx
- fsGetAll
- index.ts
- compilerOptions
- quiz/index.tsx
- scripts
- devDependencies
- export/route.ts
- package.json
- db.ts
- eslint-config-next
- quiz-data.ts
- eslint-plugin-jsx-a11y
- ai-eval/index.tsx
- fsQuery
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
- animations.ts
- requireAdminOrManager
- seed-mock-agents.mjs
- next-env.d.ts
- git-auto-commit.sh
- postcss
- tailwindcss
- tailwind.config.ts
- server.ts
- LoginForm.tsx
- agy-start.sh
- CongratulationsCard.tsx

## God Nodes (most connected - your core abstractions)
1. `getAdminDb()` - 50 edges
2. `getServerUser` - 45 edges
3. `AgentStats` - 38 edges
4. `TrainingPeriod` - 27 edges
5. `fsGetAll()` - 24 edges
6. `fsSet()` - 24 edges
7. `getAgentSession()` - 24 edges
8. `scoreColor()` - 23 edges
9. `fsUpdate()` - 23 edges
10. `updateAgentOverallScore()` - 23 edges

## Surprising Connections (you probably didn't know these)
- `QuizIndexPage()` --indirect_call--> `key()`  [INFERRED]
  app/[locale]/quiz/page.tsx → lib/localCache.ts
- `POST()` --calls--> `fsAdd()`  [EXTRACTED]
  app/api/admin/seed/route.ts → lib/server/db.ts
- `GET()` --calls--> `getAgentStats()`  [EXTRACTED]
  app/api/agent/progress/route.ts → lib/agents.ts
- `DashboardHeader()` --calls--> `getAgentSession()`  [EXTRACTED]
  components/features/Dashboard.tsx → lib/session/agent.ts
- `ModuleHeaderProps` --references--> `AgentStats`  [EXTRACTED]
  components/features/agent-training/ModuleHeader.tsx → types/index.ts

## Import Cycles
- None detected.

## Communities (75 total, 17 thin omitted)

### Community 0 - "scoreColor"
Cohesion: 0.08
Nodes (41): BypassModal(), BypassModalProps, DetailedAiEvalHistory(), DetailedHumanEvaluations(), DetailedQuizHistory(), requestOverride(), ProfileHeader(), AgentDetailModal() (+33 more)

### Community 1 - "fsSet"
Cohesion: 0.06
Nodes (42): POST(), defaults(), POST(), ProgressRecord, maxDuration, POST(), MOCKUP_AGENTS, POST() (+34 more)

### Community 2 - "CourseHub.tsx"
Cohesion: 0.07
Nodes (43): GET(), GET(), LearnPageContent(), LearnIndexPage(), OverridesManager(), CourseCard, CourseCardProps, CourseHeader (+35 more)

### Community 3 - "agent-training/index.tsx"
Cohesion: 0.08
Nodes (42): DashboardPage(), HRAnalyticsTab(), AiSkillGapReport(), CRITERIA_MAP, SkillGapItem, BackgroundEffects, AgentTrainingHub(), CongratulationsCard (+34 more)

### Community 4 - "AgentStats"
Cohesion: 0.10
Nodes (39): ProfileHeaderProps, GraduationRoster(), GraduationRosterProps, STATUS_ORDER, LeaderboardTableProps, StatusPipeline(), AgentPerformancePanel(), AgentPerformancePanelProps (+31 more)

### Community 5 - "getServerUser"
Cohesion: 0.10
Nodes (28): POST(), GET(), AiEvalLayout(), DashboardLayout(), EvaluatorPageContent(), LearnLayout(), QuizLayout(), normalizeName() (+20 more)

### Community 6 - "TrainingPeriod"
Cohesion: 0.09
Nodes (35): ActiveBatchHeader(), ActiveBatchHeaderProps, ArchiveSelectionGrid(), ArchiveSelectionGridProps, LivePulse(), DayRecordForm, DayRecordFormProps, DaysTab() (+27 more)

### Community 7 - "getAdminDb"
Cohesion: 0.07
Nodes (49): DELETE(), GET(), POST(), POST(), maxDuration, POST(), GET(), POST() (+41 more)

### Community 8 - "AgentEntry.tsx"
Cohesion: 0.14
Nodes (13): Tab, EntryAvatar(), EntryAvatarProps, getInitials(), normalizeName(), ReturningUserBanner(), ReturningUserBannerProps, AgentEntry() (+5 more)

### Community 9 - "[locale]/layout.tsx"
Cohesion: 0.08
Nodes (24): POST(), dmMono, dmSans, AgentSkillRow, CohortHeatmap(), CohortHeatmapProps, DEFAULT_ROWS, CommandPalette() (+16 more)

### Community 10 - "approval-service.ts"
Cohesion: 0.17
Nodes (13): DELETE, PATCH, GET, POST, GET, PATCH, POST, apiError() (+5 more)

### Community 11 - "dependencies"
Cohesion: 0.10
Nodes (21): firebase, firebase-admin, framer-motion, @google-cloud/storage, lucide-react, next, next-intl, openai (+13 more)

### Community 12 - "fsDelete"
Cohesion: 0.33
Nodes (7): DELETE(), DELETE(), PATCH(), DELETE(), PATCH(), fsDelete(), requireTrainer()

### Community 13 - "AdminDashboard.tsx"
Cohesion: 0.13
Nodes (20): AdminHeader(), AdminHeaderProps, AdminSidebar(), AdminSidebarProps, NavGroupProps, AdminTabContent(), AdminTabContentProps, TAB_REGISTRY (+12 more)

### Community 14 - "AdjustmentsTab.tsx"
Cohesion: 0.08
Nodes (29): AiEvalConfig, AiEvalEditor(), DiagnosticResult, DiagnosticRunner(), HealthManager(), LearnConfig, LearnEditor(), LearnModule (+21 more)

### Community 15 - "fsGetAll"
Cohesion: 0.14
Nodes (15): GET(), EMPTY, GET(), GET(), POST(), GET(), POST(), GET() (+7 more)

### Community 16 - "index.ts"
Cohesion: 0.13
Nodes (17): POST(), GET(), POST(), createCustomTokenSafe(), POST(), setSession(), fsGetWhere(), makeSessionToken() (+9 more)

### Community 17 - "compilerOptions"
Cohesion: 0.07
Nodes (27): dom, dom.iterable, esnext, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules, **/*.ts (+19 more)

### Community 18 - "quiz/index.tsx"
Cohesion: 0.12
Nodes (31): QuizSystem(), QuizBriefing, reveal, PhaseBreakdown, PhaseBreakdownProps, QuizResult(), ResultView, ResultViewProps (+23 more)

### Community 19 - "scripts"
Cohesion: 0.18
Nodes (11): scripts, agy:check, agy:commit, agy:start, build, check, dev, lint (+3 more)

### Community 20 - "devDependencies"
Cohesion: 0.10
Nodes (21): autoprefixer, babel-plugin-react-compiler, eslint, @eslint/eslintrc, @eslint/js, eslint-plugin-react-hooks, devDependencies, autoprefixer (+13 more)

### Community 21 - "export/route.ts"
Cohesion: 0.08
Nodes (24): AMBER, buildIndividualSheet(), buildOverviewSheet(), GET(), GREEN, RED, scoreFill(), AiScenarioImportModal() (+16 more)

### Community 22 - "package.json"
Cohesion: 0.50
Nodes (3): name, private, version

### Community 23 - "db.ts"
Cohesion: 0.37
Nodes (8): POST(), PATCH(), POST(), fsGet(), fsUpdate(), fsUpdateMany(), BatchService, updateAgentOverallScore()

### Community 25 - "quiz-data.ts"
Cohesion: 0.07
Nodes (23): C, ICON_MAP, QuizIndexPage(), CERT_PART1, CERT_PART2, CERT_PART3, CERT_PART4, CERT_PART5 (+15 more)

### Community 27 - "ai-eval/index.tsx"
Cohesion: 0.10
Nodes (22): AuditFlow(), AuditFlowProps, CallSimulatorHud(), CallSimulatorHudProps, ChatView, CoachingCard, ScoreTrend, AiEvaluation() (+14 more)

### Community 28 - "fsQuery"
Cohesion: 0.28
Nodes (5): FeedItem, GET(), normalizeName(), POST(), fsQuery()

### Community 29 - "seed.mjs"
Cohesion: 0.39
Nodes (7): __dirname, envPath, initAdmin(), main(), seedAdmin(), seedQuizzes(), seedScenarios()

### Community 33 - "seed-scenarios.mjs"
Cohesion: 0.40
Nodes (5): __dirname, envPath, FULL_CURRICULUM_SCENARIOS, initAdmin(), seed()

### Community 50 - "animations.ts"
Cohesion: 0.10
Nodes (21): BrandingPanel(), MODULES, STATS_CONFIG, FloatingDecoration(), MobileHeader(), MobileHeaderProps, MobileModuleChips(), ModuleChip (+13 more)

### Community 51 - "requireAdminOrManager"
Cohesion: 0.27
Nodes (11): DELETE(), GET(), PATCH(), POST(), GET(), PATCH(), GET(), DELETE() (+3 more)

### Community 52 - "seed-mock-agents.mjs"
Cohesion: 0.40
Nodes (5): __dirname, envPath, initAdmin(), MOCKUP_AGENTS, seed()

### Community 72 - "server.ts"
Cohesion: 0.31
Nodes (11): GET(), POST(), resolveApprovalRequest(), hasRole(), requireAdmin(), requireAdminOrIT(), requireAuth(), requireEvaluator() (+3 more)

### Community 73 - "LoginForm.tsx"
Cohesion: 0.38
Nodes (5): DEV_MOCK_AGENTS, DevMockAgent, DevMockupSelector(), LoginForm(), LoginFormProps

### Community 77 - "CongratulationsCard.tsx"
Cohesion: 0.38
Nodes (4): Confetti, CongratulationsCard, CongratulationsCardProps, TrophyHero

## Knowledge Gaps
- **248 isolated node(s):** `dmSans`, `dmMono`, `Tab`, `ICON_MAP`, `C` (+243 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **17 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `dependencies` to `[locale]/layout.tsx`, `agent-training/index.tsx`, `export/route.ts`, `package.json`?**
  _High betweenness centrality (0.103) - this node is a cross-community bridge._
- **Why does `xlsx` connect `export/route.ts` to `index.ts`, `dependencies`, `AdjustmentsTab.tsx`?**
  _High betweenness centrality (0.046) - this node is a cross-community bridge._
- **What connects `dmSans`, `dmMono`, `Tab` to the rest of the system?**
  _248 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `scoreColor` be split into smaller, more focused modules?**
  _Cohesion score 0.07878787878787878 - nodes in this community are weakly interconnected._
- **Should `fsSet` be split into smaller, more focused modules?**
  _Cohesion score 0.05569620253164557 - nodes in this community are weakly interconnected._
- **Should `CourseHub.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.0655367231638418 - nodes in this community are weakly interconnected._
- **Should `agent-training/index.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.07644110275689223 - nodes in this community are weakly interconnected._