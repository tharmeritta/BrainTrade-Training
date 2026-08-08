# Graph Report - BrainTrade-Training  (2026-08-08)

## Corpus Check
- 265 files · ~131,150 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1063 nodes · 2675 edges · 77 communities (59 shown, 18 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 14 edges (avg confidence: 0.89)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `90d413ee`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- AgentStats
- AiEvalScenario
- PresentationViewer.tsx
- animations.ts
- EvaluatorDashboard.tsx
- agent.ts
- TrainingPeriod
- agents.ts
- CourseHub.tsx
- [locale]/layout.tsx
- staff/route.ts
- getAdminDb
- ai-eval/index.tsx
- AdminDashboard.tsx
- AdjustmentsTab.tsx
- fsDelete
- fsSet
- compilerOptions
- quiz-data.ts
- firebase-admin.ts
- devDependencies
- dependencies
- server.ts
- index.ts
- scoreColor
- db.ts
- StaffTab.tsx
- ai-eval-service.ts
- EvaluationsDashboard.tsx
- seed.mjs
- Pitch Prompt
- deploy.sh
- LiveFeed.tsx
- scripts
- App Hosting Config
- next.config.ts
- debug-firebase.mjs
- Cloud Build Pipeline
- Environment Variables
- GEMINI.md
- OverviewPanel.tsx
- progress/route.ts
- SemanticAuditService
- next-env.d.ts
- zod
- @types/node
- package.json
- tailwind.config.ts
- eslint-plugin-jsx-a11y
- tailwindcss
- server/courses.ts
- @types/react
- agy-start.sh
- usePresentation.ts

## God Nodes (most connected - your core abstractions)
1. `getAdminDb()` - 50 edges
2. `getServerUser` - 45 edges
3. `AgentStats` - 38 edges
4. `TrainingPeriod` - 27 edges
5. `scoreColor()` - 23 edges
6. `fsGetAll()` - 23 edges
7. `fsUpdate()` - 23 edges
8. `updateAgentOverallScore()` - 23 edges
9. `getAgentSession()` - 23 edges
10. `fsSet()` - 22 edges

## Surprising Connections (you probably didn't know these)
- `AdminPageContent()` --calls--> `requireAdminManagerOrTrainer()`  [EXTRACTED]
  app/[locale]/admin/page.tsx → lib/session/server.ts
- `AiEvalLayout()` --calls--> `getServerUser`  [EXTRACTED]
  app/[locale]/ai-eval/layout.tsx → lib/session/server.ts
- `EvaluatorPageContent()` --calls--> `getServerUser`  [EXTRACTED]
  app/[locale]/evaluator/page.tsx → lib/session/server.ts
- `LearnLayout()` --calls--> `getServerUser`  [EXTRACTED]
  app/[locale]/learn/layout.tsx → lib/session/server.ts
- `QuizLayout()` --calls--> `getServerUser`  [EXTRACTED]
  app/[locale]/quiz/layout.tsx → lib/session/server.ts

## Import Cycles
- None detected.

## Communities (77 total, 18 thin omitted)

### Community 0 - "AgentStats"
Cohesion: 0.19
Nodes (15): ProfileHeaderProps, ApprovalsTab(), HistoryTab(), GraduationRosterProps, LeaderboardTable(), LeaderboardTableProps, BadgePill(), KpiCard() (+7 more)

### Community 1 - "AiEvalScenario"
Cohesion: 0.10
Nodes (19): POST(), DIFF, DIFF_ORDER, EMPTY_FORM, inputCls, textareaCls, ScenarioForm(), DifficultySection() (+11 more)

### Community 2 - "PresentationViewer.tsx"
Cohesion: 0.18
Nodes (15): CourseCardProps, CourseHeaderProps, LanguagePickerProps, PlaceholderCardProps, PresentationControls(), PresentationControlsProps, PresentationHeader(), PresentationHeaderProps (+7 more)

### Community 3 - "animations.ts"
Cohesion: 0.05
Nodes (57): HRAnalyticsTab(), BrandingPanel(), MODULES, STATS_CONFIG, EntryAvatar(), EntryAvatarProps, FloatingDecoration(), LoginForm() (+49 more)

### Community 4 - "EvaluatorDashboard.tsx"
Cohesion: 0.17
Nodes (24): AgentPerformancePanel(), AgentPerformancePanelProps, EvalForm(), EvalFormProps, EvalHistoryCard(), EvalHistoryCardProps, EvaluatorDashboard(), EvaluatorDashboardProps (+16 more)

### Community 5 - "agent.ts"
Cohesion: 0.08
Nodes (37): AiEvalLayout(), DashboardLayout(), DashboardPage(), LearnLayout(), QuizLayout(), normalizeName(), useAgentEntry(), DashboardHeader() (+29 more)

### Community 6 - "TrainingPeriod"
Cohesion: 0.08
Nodes (37): Tab, LivePulse(), DayRecordForm, DayRecordFormProps, DaysTab(), DaysTabProps, DisciplineSubTabProps, DisciplineTab() (+29 more)

### Community 7 - "agents.ts"
Cohesion: 0.09
Nodes (32): AMBER, buildIndividualSheet(), buildOverviewSheet(), GET(), GREEN, RED, scoreFill(), GET() (+24 more)

### Community 8 - "CourseHub.tsx"
Cohesion: 0.16
Nodes (14): getCompletionStatus(), ReportsTab(), statusPill(), CourseCard, CourseHeader, CourseHub(), LanguagePicker, PlaceholderCard (+6 more)

### Community 9 - "[locale]/layout.tsx"
Cohesion: 0.08
Nodes (23): POST(), dmMono, dmSans, AgentSkillRow, CohortHeatmap(), CohortHeatmapProps, DEFAULT_ROWS, CommandPalette() (+15 more)

### Community 10 - "staff/route.ts"
Cohesion: 0.21
Nodes (10): DELETE, PATCH, GET, POST, GET, PATCH, POST, apiError() (+2 more)

### Community 11 - "getAdminDb"
Cohesion: 0.19
Nodes (24): DELETE(), GET(), POST(), POST(), POST(), POST(), GET(), PATCH() (+16 more)

### Community 12 - "ai-eval/index.tsx"
Cohesion: 0.08
Nodes (29): DiagnosticResult, DiagnosticRunner(), HealthManager(), AuditFlow(), AuditFlowProps, CallSimulatorHud(), CallSimulatorHudProps, ChatView (+21 more)

### Community 13 - "AdminDashboard.tsx"
Cohesion: 0.11
Nodes (23): AdminPageContent(), AdminHeader(), AdminHeaderProps, AdminSidebar(), AdminSidebarProps, NavGroupProps, AdminTabContent(), AdminTabContentProps (+15 more)

### Community 14 - "AdjustmentsTab.tsx"
Cohesion: 0.11
Nodes (26): GET(), AiEvalConfig, AiEvalEditor(), LearnConfig, LearnEditor(), LearnModule, PresentationInfo, OverridesManager() (+18 more)

### Community 15 - "fsDelete"
Cohesion: 0.33
Nodes (7): DELETE(), DELETE(), PATCH(), DELETE(), PATCH(), fsDelete(), requireTrainer()

### Community 16 - "fsSet"
Cohesion: 0.12
Nodes (23): DELETE(), GET(), PATCH(), POST(), defaults(), POST(), ProgressRecord, POST() (+15 more)

### Community 17 - "compilerOptions"
Cohesion: 0.07
Nodes (27): dom, dom.iterable, esnext, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules, **/*.ts (+19 more)

### Community 18 - "quiz-data.ts"
Cohesion: 0.06
Nodes (51): C, ICON_MAP, QuizIndexPage(), QuizSystem(), QuizBriefing, reveal, PhaseBreakdown, PhaseBreakdownProps (+43 more)

### Community 19 - "firebase-admin.ts"
Cohesion: 0.20
Nodes (13): maxDuration, POST(), GET(), POST(), setSession(), fsGetWhere(), cleanEmail(), cleanId() (+5 more)

### Community 20 - "devDependencies"
Cohesion: 0.10
Nodes (21): autoprefixer, babel-plugin-react-compiler, eslint, eslint-config-next, @eslint/eslintrc, @eslint/js, eslint-plugin-react-hooks, devDependencies (+13 more)

### Community 21 - "dependencies"
Cohesion: 0.09
Nodes (23): firebase, firebase-admin, framer-motion, @google-cloud/storage, @google/generative-ai, lucide-react, next, next-intl (+15 more)

### Community 22 - "server.ts"
Cohesion: 0.13
Nodes (19): GET(), POST(), POST(), GET(), POST(), GET(), POST(), GET() (+11 more)

### Community 23 - "index.ts"
Cohesion: 0.16
Nodes (15): CompletionGrid(), CompletionGridProps, KpiSection(), KpiSectionProps, TrainingWavesSection(), TrainingWavesSectionProps, AdminOverviewData, AgentProgress (+7 more)

### Community 24 - "scoreColor"
Cohesion: 0.20
Nodes (12): BypassModal(), BypassModalProps, DetailedAiEvalHistory(), DetailedHumanEvaluations(), DetailedQuizHistory(), requestOverride(), ProfileHeader(), AgentDetailModal() (+4 more)

### Community 25 - "db.ts"
Cohesion: 0.20
Nodes (11): GET(), FeedItem, GET(), EMPTY, GET(), normalizeName(), POST(), fsCount() (+3 more)

### Community 26 - "StaffTab.tsx"
Cohesion: 0.21
Nodes (7): BulkImportModal(), BulkImportModalProps, AccessNotes(), AgentSection(), EditState, ROLE_COLORS, StaffSection()

### Community 27 - "ai-eval-service.ts"
Cohesion: 0.16
Nodes (13): POST(), maxDuration, POST(), POST(), getGeminiModel(), getOpenAI(), AiAuditService, SemanticAuditResult (+5 more)

### Community 28 - "EvaluationsDashboard.tsx"
Cohesion: 0.20
Nodes (11): ActiveBatchHeader(), ActiveBatchHeaderProps, ArchiveSelectionGrid(), ArchiveSelectionGridProps, EvalRow(), EvaluationsDashboard(), EvaluationsDashboardProps, AdminEval (+3 more)

### Community 29 - "seed.mjs"
Cohesion: 0.39
Nodes (7): __dirname, envPath, initAdmin(), main(), seedAdmin(), seedQuizzes(), seedScenarios()

### Community 33 - "scripts"
Cohesion: 0.22
Nodes (9): scripts, agy:check, agy:start, build, check, dev, lint, seed (+1 more)

### Community 50 - "OverviewPanel.tsx"
Cohesion: 0.29
Nodes (10): GraduationRoster(), STATUS_ORDER, StatusPipeline(), OverviewPanel(), OverviewPanelProps, CompletionConfig, CompletionInfo, CompletionStatus (+2 more)

### Community 51 - "progress/route.ts"
Cohesion: 0.36
Nodes (7): defaults(), POST(), ProgressRecord, POST(), getActiveTrainingPeriod(), updateGlobalLearningStats(), MOCKUP_AGENT_ID

### Community 56 - "package.json"
Cohesion: 0.50
Nodes (3): name, private, version

### Community 73 - "server/courses.ts"
Cohesion: 0.27
Nodes (7): GET(), GET(), LearnPageContent(), LearnIndexPage(), PresentationViewer(), getCourseModule(), getCourseModules()

### Community 76 - "usePresentation.ts"
Cohesion: 0.29
Nodes (9): DrawingCanvas(), DrawingCanvasProps, slideKey(), usePresentation(), viewedKey(), DrawingPath, LiveSessionState, Point (+1 more)

## Knowledge Gaps
- **228 isolated node(s):** `dmSans`, `dmMono`, `Tab`, `ICON_MAP`, `C` (+223 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **18 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `dependencies` to `package.json`, `zod`, `AdjustmentsTab.tsx`?**
  _High betweenness centrality (0.099) - this node is a cross-community bridge._
- **Why does `xlsx` connect `AdjustmentsTab.tsx` to `AiEvalScenario`, `StaffTab.tsx`, `dependencies`, `agents.ts`?**
  _High betweenness centrality (0.073) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `devDependencies` to `eslint-plugin-jsx-a11y`, `tailwindcss`, `@types/react`, `@types/node`, `package.json`?**
  _High betweenness centrality (0.060) - this node is a cross-community bridge._
- **What connects `dmSans`, `dmMono`, `Tab` to the rest of the system?**
  _228 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AiEvalScenario` be split into smaller, more focused modules?**
  _Cohesion score 0.10384068278805121 - nodes in this community are weakly interconnected._
- **Should `animations.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05158324821246169 - nodes in this community are weakly interconnected._
- **Should `agent.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08326530612244898 - nodes in this community are weakly interconnected._