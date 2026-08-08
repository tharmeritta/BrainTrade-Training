# Graph Report - BrainTrade-Training  (2026-08-08)

## Corpus Check
- 275 files · ~139,789 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1107 nodes · 2751 edges · 79 communities (66 shown, 13 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 14 edges (avg confidence: 0.89)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `5df944a9`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- scoreColor
- fsSet
- CourseHub.tsx
- agent-training/index.tsx
- EvaluatorDashboard.tsx
- getServerUser
- TrainingPeriod
- agents.ts
- AgentEntry.tsx
- [locale]/layout.tsx
- staff/route.ts
- getAdminDb
- ScenarioPicker.tsx
- AdminDashboard.tsx
- AdjustmentsTab.tsx
- server.ts
- session/route.ts
- compilerOptions
- quiz/index.tsx
- firebase-admin.ts
- devDependencies
- dependencies
- index.ts
- db.ts
- HistorySections.tsx
- quiz-data.ts
- AgentEvaluation
- animations.ts
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
- Dashboard.tsx
- requireAdminOrManager
- seed-mock-agents.mjs
- next-env.d.ts
- git-auto-commit.sh
- EvaluationsTab.tsx
- QuizResult.tsx
- tailwind.config.ts
- BrandingPanel.tsx
- approval-service.ts
- LoginForm.tsx
- ReportsTab.tsx
- agy-start.sh
- ReturningUserBanner.tsx
- STAGGER_CONTAINER
- [locale]/page.tsx

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
- `AdminPageContent()` --calls--> `requireAdminManagerOrTrainer()`  [EXTRACTED]
  app/[locale]/admin/page.tsx → lib/session/server.ts
- `QuizIndexPage()` --indirect_call--> `key()`  [INFERRED]
  app/[locale]/quiz/page.tsx → lib/localCache.ts
- `GET()` --calls--> `requireAdminOrIT()`  [EXTRACTED]
  app/api/admin/approvals/route.ts → lib/session/server.ts
- `POST()` --calls--> `fsAdd()`  [EXTRACTED]
  app/api/admin/seed/route.ts → lib/server/db.ts
- `GET()` --calls--> `getAgentStats()`  [EXTRACTED]
  app/api/agent/progress/route.ts → lib/agents.ts

## Import Cycles
- None detected.

## Communities (79 total, 13 thin omitted)

### Community 0 - "scoreColor"
Cohesion: 0.19
Nodes (17): ProfileHeader(), ApprovalsTab(), DetailedEvaluation(), DetailedEvaluationProps, EvalRow(), EvaluationsDashboard(), EvaluationsDashboardProps, AdminEval (+9 more)

### Community 1 - "fsSet"
Cohesion: 0.06
Nodes (42): POST(), defaults(), POST(), ProgressRecord, maxDuration, POST(), MOCKUP_AGENTS, POST() (+34 more)

### Community 2 - "CourseHub.tsx"
Cohesion: 0.07
Nodes (43): GET(), GET(), LearnPageContent(), LearnIndexPage(), OverridesManager(), CourseCard, CourseCardProps, CourseHeader (+35 more)

### Community 3 - "agent-training/index.tsx"
Cohesion: 0.11
Nodes (29): HRAnalyticsTab(), AiSkillGapReport(), CRITERIA_MAP, SkillGapItem, BackgroundEffects, AgentTrainingHub(), CongratulationsCard, Props (+21 more)

### Community 4 - "EvaluatorDashboard.tsx"
Cohesion: 0.15
Nodes (28): StatusPipeline(), AgentPerformancePanel(), AgentPerformancePanelProps, EvalForm(), EvalFormProps, EvalHistoryCard(), EvaluatorDashboard(), EvaluatorDashboardProps (+20 more)

### Community 5 - "getServerUser"
Cohesion: 0.07
Nodes (41): POST(), GET(), AiEvalLayout(), DashboardLayout(), DashboardPage(), EvaluatorPageContent(), LearnLayout(), QuizLayout() (+33 more)

### Community 6 - "TrainingPeriod"
Cohesion: 0.11
Nodes (31): LivePulse(), DayRecordForm, DayRecordFormProps, DaysTab(), DaysTabProps, DisciplineSubTabProps, DisciplineTab(), NewPeriodModal() (+23 more)

### Community 7 - "agents.ts"
Cohesion: 0.07
Nodes (35): AMBER, buildIndividualSheet(), buildOverviewSheet(), GET(), GREEN, RED, scoreFill(), GET() (+27 more)

### Community 8 - "AgentEntry.tsx"
Cohesion: 0.18
Nodes (12): EntryAvatar(), EntryAvatarProps, MobileHeader(), MobileHeaderProps, MobileModuleChips(), ModuleChip, MODULES, AgentEntry() (+4 more)

### Community 9 - "[locale]/layout.tsx"
Cohesion: 0.08
Nodes (24): POST(), dmMono, dmSans, AgentSkillRow, CohortHeatmap(), CohortHeatmapProps, DEFAULT_ROWS, CommandPalette() (+16 more)

### Community 10 - "staff/route.ts"
Cohesion: 0.21
Nodes (10): DELETE, PATCH, GET, POST, GET, PATCH, POST, apiError() (+2 more)

### Community 11 - "getAdminDb"
Cohesion: 0.21
Nodes (15): DELETE(), GET(), POST(), POST(), POST(), GET(), fsIncrement(), getAdminDb() (+7 more)

### Community 12 - "ScenarioPicker.tsx"
Cohesion: 0.27
Nodes (7): IntroView, IntroViewProps, DIFFICULTY_MAP, ScenarioPicker, StepProgress(), ActiveAgentUI(), ActiveAgentUIProps

### Community 13 - "AdminDashboard.tsx"
Cohesion: 0.11
Nodes (22): AdminPageContent(), AdminHeader(), AdminHeaderProps, AdminSidebar(), AdminSidebarProps, NavGroupProps, AdminTabContent(), AdminTabContentProps (+14 more)

### Community 14 - "AdjustmentsTab.tsx"
Cohesion: 0.08
Nodes (29): AiEvalConfig, AiEvalEditor(), DiagnosticResult, DiagnosticRunner(), HealthManager(), LearnConfig, LearnEditor(), LearnModule (+21 more)

### Community 15 - "server.ts"
Cohesion: 0.18
Nodes (18): DELETE(), PATCH(), GET(), POST(), GET(), POST(), DELETE(), PATCH() (+10 more)

### Community 16 - "session/route.ts"
Cohesion: 0.26
Nodes (8): POST(), POST(), createCustomTokenSafe(), POST(), setSession(), fsGetWhere(), makeSessionToken(), StaffAccount

### Community 17 - "compilerOptions"
Cohesion: 0.07
Nodes (27): dom, dom.iterable, esnext, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules, **/*.ts (+19 more)

### Community 18 - "quiz/index.tsx"
Cohesion: 0.13
Nodes (16): QuizSystem(), QuizBriefing, reveal, QuizResult(), QuestionCard, QuestionMap, QuestionMapProps, QuizSession() (+8 more)

### Community 19 - "firebase-admin.ts"
Cohesion: 0.27
Nodes (10): maxDuration, POST(), GET(), cleanEmail(), cleanId(), cleanValue(), getAdminApp(), getAdminAuth() (+2 more)

### Community 20 - "devDependencies"
Cohesion: 0.05
Nodes (43): autoprefixer, babel-plugin-react-compiler, eslint, eslint-config-next, @eslint/eslintrc, @eslint/js, eslint-plugin-jsx-a11y, eslint-plugin-react-hooks (+35 more)

### Community 21 - "dependencies"
Cohesion: 0.05
Nodes (38): AiScenarioImportModal(), AiScenarioImportModalProps, BulkImportModal(), BulkImportModalProps, SandboxManagerModal(), SandboxManagerModalProps, AccessNotes(), AgentSection() (+30 more)

### Community 22 - "index.ts"
Cohesion: 0.12
Nodes (23): ProfileHeaderProps, CompletionGridProps, GraduationRoster(), GraduationRosterProps, STATUS_ORDER, KpiSection(), KpiSectionProps, LeaderboardTable() (+15 more)

### Community 23 - "db.ts"
Cohesion: 0.24
Nodes (11): FeedItem, GET(), POST(), PATCH(), POST(), fsGet(), fsQuery(), fsUpdate() (+3 more)

### Community 24 - "HistorySections.tsx"
Cohesion: 0.26
Nodes (8): BypassModal(), BypassModalProps, DetailedAiEvalHistory(), DetailedHumanEvaluations(), DetailedQuizHistory(), requestOverride(), AgentDetailModal(), Target()

### Community 25 - "quiz-data.ts"
Cohesion: 0.10
Nodes (19): CERT_PART1, CERT_PART2, CERT_PART3, CERT_PART4, CERT_PART5, FOUND_PART1, FOUND_PART2, FOUND_PART3 (+11 more)

### Community 26 - "AgentEvaluation"
Cohesion: 0.29
Nodes (5): EvalHistoryCardProps, OverviewPanelProps, SemanticAuditService, Agent, AgentEvaluation

### Community 27 - "animations.ts"
Cohesion: 0.13
Nodes (18): AuditFlow(), AuditFlowProps, CallSimulatorHud(), CallSimulatorHudProps, ChatView, CoachingCard, ScoreTrend, AiEvaluation() (+10 more)

### Community 28 - "fsGetAll"
Cohesion: 0.27
Nodes (8): GET(), EMPTY, GET(), normalizeName(), POST(), fsCount(), fsGetAll(), getGlobalStats()

### Community 29 - "seed.mjs"
Cohesion: 0.39
Nodes (7): __dirname, envPath, initAdmin(), main(), seedAdmin(), seedQuizzes(), seedScenarios()

### Community 33 - "seed-scenarios.mjs"
Cohesion: 0.40
Nodes (5): __dirname, envPath, FULL_CURRICULUM_SCENARIOS, initAdmin(), seed()

### Community 50 - "Dashboard.tsx"
Cohesion: 0.25
Nodes (5): DashboardHeader(), ModuleItem, MODULES, BrandedTitle(), BrandedTitleProps

### Community 51 - "requireAdminOrManager"
Cohesion: 0.19
Nodes (14): DELETE(), GET(), PATCH(), POST(), GET(), PATCH(), GET(), GET() (+6 more)

### Community 52 - "seed-mock-agents.mjs"
Cohesion: 0.40
Nodes (5): __dirname, envPath, initAdmin(), MOCKUP_AGENTS, seed()

### Community 55 - "EvaluationsTab.tsx"
Cohesion: 0.25
Nodes (7): ActiveBatchHeader(), ActiveBatchHeaderProps, ArchiveSelectionGrid(), ArchiveSelectionGridProps, EvalTab, useEvaluationsData(), EvaluationsTab()

### Community 56 - "QuizResult.tsx"
Cohesion: 0.33
Nodes (13): PhaseBreakdown, PhaseBreakdownProps, ResultView, ResultViewProps, QuestionCardProps, QuizBriefingProps, QuizResultProps, QuizSessionProps (+5 more)

### Community 71 - "BrandingPanel.tsx"
Cohesion: 0.28
Nodes (6): BrandingPanel(), MODULES, STATS_CONFIG, FloatingDecoration(), StatCounter(), StatCounterProps

### Community 72 - "approval-service.ts"
Cohesion: 0.33
Nodes (8): GET(), POST(), executeApprovedAction(), resolveApprovalRequest(), updateGlobalAgentCounts(), requireAdmin(), ApprovalActionType, ApprovalRequest

### Community 73 - "LoginForm.tsx"
Cohesion: 0.38
Nodes (5): DEV_MOCK_AGENTS, DevMockAgent, DevMockupSelector(), LoginForm(), LoginFormProps

### Community 74 - "ReportsTab.tsx"
Cohesion: 0.53
Nodes (4): getCompletionStatus(), ReportsTab(), statusPill(), fetchWithCache()

### Community 76 - "ReturningUserBanner.tsx"
Cohesion: 0.60
Nodes (4): getInitials(), normalizeName(), ReturningUserBanner(), ReturningUserBannerProps

### Community 77 - "STAGGER_CONTAINER"
Cohesion: 0.32
Nodes (5): Confetti, CongratulationsCard, CongratulationsCardProps, TrophyHero, STAGGER_CONTAINER

### Community 78 - "[locale]/page.tsx"
Cohesion: 0.24
Nodes (5): Tab, BackgroundEffects, LangToggle(), EASE, auth

## Knowledge Gaps
- **248 isolated node(s):** `dmSans`, `dmMono`, `Tab`, `ICON_MAP`, `C` (+243 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **13 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `dependencies` to `[locale]/layout.tsx`, `agent-training/index.tsx`, `devDependencies`?**
  _High betweenness centrality (0.103) - this node is a cross-community bridge._
- **Why does `xlsx` connect `dependencies` to `requireAdminOrManager`, `AdjustmentsTab.tsx`, `agents.ts`?**
  _High betweenness centrality (0.046) - this node is a cross-community bridge._
- **Why does `AiSkillGapReport()` connect `agent-training/index.tsx` to `getServerUser`?**
  _High betweenness centrality (0.035) - this node is a cross-community bridge._
- **What connects `dmSans`, `dmMono`, `Tab` to the rest of the system?**
  _248 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `fsSet` be split into smaller, more focused modules?**
  _Cohesion score 0.05569620253164557 - nodes in this community are weakly interconnected._
- **Should `CourseHub.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.0655367231638418 - nodes in this community are weakly interconnected._
- **Should `agent-training/index.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.10685249709639953 - nodes in this community are weakly interconnected._