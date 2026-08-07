# Graph Report - BrainTrade-Training  (2026-08-07)

## Corpus Check
- 264 files · ~130,402 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1057 nodes · 2662 edges · 68 communities (50 shown, 18 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 14 edges (avg confidence: 0.89)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `96a9439b`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- AgentStats
- ai-eval.ts
- CourseHub.tsx
- animations.ts
- index.ts
- agent.ts
- TrainingPeriod
- agents.ts
- fsUpdate
- [locale]/layout.tsx
- staff/route.ts
- getAdminDb
- ai-eval/index.tsx
- AdminDashboard.tsx
- AdjustmentsTab.tsx
- server.ts
- progress/route.ts
- compilerOptions
- quiz-data.ts
- firebase-admin.ts
- devDependencies
- dependencies
- requireAdminOrManager
- db.ts
- StaffTab.tsx
- scripts
- seed.mjs
- Pitch Prompt
- deploy.sh
- LiveFeed.tsx
- CallSimulatorHud.tsx
- App Hosting Config
- next.config.ts
- debug-firebase.mjs
- Cloud Build Pipeline
- Environment Variables
- GEMINI.md
- @eslint/js
- eslint-plugin-react-hooks
- framer-motion
- next-env.d.ts
- zod
- @types/node
- typescript
- tailwind.config.ts

## God Nodes (most connected - your core abstractions)
1. `getAdminDb()` - 50 edges
2. `getServerUser()` - 46 edges
3. `AgentStats` - 38 edges
4. `TrainingPeriod` - 27 edges
5. `fsGetAll()` - 24 edges
6. `scoreColor()` - 23 edges
7. `fsUpdate()` - 23 edges
8. `updateAgentOverallScore()` - 23 edges
9. `getAgentSession()` - 23 edges
10. `fsSet()` - 22 edges

## Surprising Connections (you probably didn't know these)
- `AiEvalLayout()` --calls--> `getServerUser()`  [EXTRACTED]
  app/[locale]/ai-eval/layout.tsx → lib/session/server.ts
- `EvaluatorPageContent()` --calls--> `getServerUser()`  [EXTRACTED]
  app/[locale]/evaluator/page.tsx → lib/session/server.ts
- `LearnLayout()` --calls--> `getServerUser()`  [EXTRACTED]
  app/[locale]/learn/layout.tsx → lib/session/server.ts
- `QuizLayout()` --calls--> `getServerUser()`  [EXTRACTED]
  app/[locale]/quiz/layout.tsx → lib/session/server.ts
- `QuizIndexPage()` --indirect_call--> `key()`  [INFERRED]
  app/[locale]/quiz/page.tsx → lib/localCache.ts

## Import Cycles
- None detected.

## Communities (68 total, 18 thin omitted)

### Community 0 - "AgentStats"
Cohesion: 0.08
Nodes (41): BypassModal(), BypassModalProps, DetailedAiEvalHistory(), DetailedHumanEvaluations(), DetailedQuizHistory(), requestOverride(), ProfileHeader(), ProfileHeaderProps (+33 more)

### Community 1 - "ai-eval.ts"
Cohesion: 0.06
Nodes (34): POST(), maxDuration, POST(), POST(), POST(), DIFF, DIFF_ORDER, EMPTY_FORM (+26 more)

### Community 2 - "CourseHub.tsx"
Cohesion: 0.07
Nodes (44): maxDuration, GET(), GET(), LearnPageContent(), LearnIndexPage(), CourseCard, CourseCardProps, CourseHeader (+36 more)

### Community 3 - "animations.ts"
Cohesion: 0.05
Nodes (57): HRAnalyticsTab(), BrandingPanel(), MODULES, STATS_CONFIG, EntryAvatar(), EntryAvatarProps, FloatingDecoration(), LoginForm() (+49 more)

### Community 4 - "index.ts"
Cohesion: 0.08
Nodes (47): normalizeName(), POST(), EvaluatorPageContent(), GraduationRoster(), GraduationRosterProps, STATUS_ORDER, StatusPipeline(), AgentPerformancePanel() (+39 more)

### Community 5 - "agent.ts"
Cohesion: 0.08
Nodes (37): AiEvalLayout(), DashboardLayout(), DashboardPage(), LearnLayout(), QuizLayout(), normalizeName(), useAgentEntry(), DashboardHeader() (+29 more)

### Community 6 - "TrainingPeriod"
Cohesion: 0.07
Nodes (40): Tab, ActiveBatchHeader(), ActiveBatchHeaderProps, ArchiveSelectionGrid(), ArchiveSelectionGridProps, LivePulse(), DayRecordForm, DayRecordFormProps (+32 more)

### Community 7 - "agents.ts"
Cohesion: 0.07
Nodes (35): AMBER, buildIndividualSheet(), buildOverviewSheet(), GET(), GREEN, RED, scoreFill(), GET() (+27 more)

### Community 8 - "fsUpdate"
Cohesion: 0.18
Nodes (16): defaults(), POST(), ProgressRecord, POST(), DELETE(), DELETE(), PATCH(), DELETE() (+8 more)

### Community 9 - "[locale]/layout.tsx"
Cohesion: 0.08
Nodes (23): POST(), dmMono, dmSans, AgentSkillRow, CohortHeatmap(), CohortHeatmapProps, DEFAULT_ROWS, CommandPalette() (+15 more)

### Community 10 - "staff/route.ts"
Cohesion: 0.19
Nodes (11): DELETE, PATCH, GET, POST, GET, PATCH, POST, apiError() (+3 more)

### Community 11 - "getAdminDb"
Cohesion: 0.17
Nodes (24): DELETE(), GET(), POST(), GET(), POST(), POST(), POST(), GET() (+16 more)

### Community 12 - "ai-eval/index.tsx"
Cohesion: 0.11
Nodes (23): AuditFlow(), AuditFlowProps, ChatView, CoachingCard, ScoreTrend, AiEvaluation(), DEFAULT_CRITERIA, IntroView (+15 more)

### Community 13 - "AdminDashboard.tsx"
Cohesion: 0.12
Nodes (22): AdminHeader(), AdminHeaderProps, AdminSidebar(), AdminSidebarProps, NavGroupProps, AdminTabContent(), AdminTabContentProps, TAB_REGISTRY (+14 more)

### Community 14 - "AdjustmentsTab.tsx"
Cohesion: 0.09
Nodes (29): AiEvalConfig, AiEvalEditor(), DiagnosticResult, DiagnosticRunner(), HealthManager(), LearnConfig, LearnEditor(), LearnModule (+21 more)

### Community 15 - "server.ts"
Cohesion: 0.22
Nodes (13): GET(), POST(), GET(), POST(), AdminPageContent(), hasRole(), requireAdmin(), requireAdminManagerOrTrainer() (+5 more)

### Community 16 - "progress/route.ts"
Cohesion: 0.31
Nodes (8): defaults(), GET(), POST(), ProgressRecord, POST(), getActiveTrainingPeriod(), updateGlobalLearningStats(), updateGlobalQuizStats()

### Community 17 - "compilerOptions"
Cohesion: 0.07
Nodes (27): dom, dom.iterable, esnext, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules, **/*.ts (+19 more)

### Community 18 - "quiz-data.ts"
Cohesion: 0.07
Nodes (47): QuizSystem(), QuizBriefing, reveal, PhaseBreakdown, PhaseBreakdownProps, QuizResult(), ResultView, ResultViewProps (+39 more)

### Community 19 - "firebase-admin.ts"
Cohesion: 0.23
Nodes (12): GET(), POST(), setSession(), fsGetWhere(), cleanEmail(), cleanId(), cleanValue(), getAdminApp() (+4 more)

### Community 20 - "devDependencies"
Cohesion: 0.10
Nodes (21): autoprefixer, babel-plugin-react-compiler, eslint, eslint-config-next, @eslint/eslintrc, eslint-plugin-jsx-a11y, devDependencies, autoprefixer (+13 more)

### Community 21 - "dependencies"
Cohesion: 0.10
Nodes (21): firebase, firebase-admin, @google-cloud/storage, @google/generative-ai, lucide-react, next, next-intl, openai (+13 more)

### Community 22 - "requireAdminOrManager"
Cohesion: 0.20
Nodes (14): DELETE(), GET(), PATCH(), POST(), GET(), PATCH(), GET(), POST() (+6 more)

### Community 23 - "db.ts"
Cohesion: 0.15
Nodes (14): FeedItem, GET(), EMPTY, GET(), POST(), GET(), POST(), GET() (+6 more)

### Community 25 - "StaffTab.tsx"
Cohesion: 0.21
Nodes (7): BulkImportModal(), BulkImportModalProps, AccessNotes(), AgentSection(), EditState, ROLE_COLORS, StaffSection()

### Community 26 - "scripts"
Cohesion: 0.18
Nodes (10): name, private, scripts, build, check, dev, lint, seed (+2 more)

### Community 29 - "seed.mjs"
Cohesion: 0.39
Nodes (7): __dirname, envPath, initAdmin(), main(), seedAdmin(), seedQuizzes(), seedScenarios()

## Knowledge Gaps
- **224 isolated node(s):** `dmSans`, `dmMono`, `Tab`, `ICON_MAP`, `C` (+219 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **18 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `dependencies` to `ai-eval.ts`, `scripts`, `framer-motion`, `zod`?**
  _High betweenness centrality (0.106) - this node is a cross-community bridge._
- **Why does `xlsx` connect `ai-eval.ts` to `agents.ts`, `AdjustmentsTab.tsx`, `dependencies`, `requireAdminOrManager`, `StaffTab.tsx`?**
  _High betweenness centrality (0.082) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `devDependencies` to `@eslint/js`, `eslint-plugin-react-hooks`, `@types/node`, `typescript`, `scripts`?**
  _High betweenness centrality (0.052) - this node is a cross-community bridge._
- **What connects `dmSans`, `dmMono`, `Tab` to the rest of the system?**
  _224 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AgentStats` be split into smaller, more focused modules?**
  _Cohesion score 0.08251748251748252 - nodes in this community are weakly interconnected._
- **Should `ai-eval.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.060764587525150904 - nodes in this community are weakly interconnected._
- **Should `CourseHub.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06557377049180328 - nodes in this community are weakly interconnected._