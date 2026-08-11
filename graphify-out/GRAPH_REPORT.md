# Graph Report - BrainTrade-Training  (2026-08-11)

## Corpus Check
- 285 files · ~152,297 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1159 nodes · 2854 edges · 85 communities (70 shown, 15 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 17 edges (avg confidence: 0.82)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `ff01dca7`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- EvaluatorDashboard.tsx
- ai-eval.ts
- index.ts
- agent-training/index.tsx
- scoreColor
- agent.ts
- TrainingPeriod
- agents.ts
- AgentEntry.tsx
- server.ts
- staff/route.ts
- AgentEvaluation
- db.ts
- AdminDashboard.tsx
- AdjustmentsTab.tsx
- Agent
- quiz-data.ts
- compilerOptions
- quiz/index.tsx
- session/route.ts
- devDependencies
- QuizResult.tsx
- Dashboard.tsx
- getServerUser
- sync-session-memory.js
- StaffTab.tsx
- fsUpdate
- ai-eval/index.tsx
- ScenarioPicker.tsx
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
- getAdminDb
- seed-mock-agents.mjs
- next-env.d.ts
- git-auto-commit.sh
- CourseHub.tsx
- HRAnalyticsTab.tsx
- tailwind.config.ts
- lib/quiz/types.ts
- fsSet
- dependencies
- ai-eval/page.tsx
- agy-start.sh
- HistorySections.tsx
- animations.ts
- OverviewPanel.tsx
- AgentStats
- OverviewTab.tsx
- ReportsTab.tsx
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

## Communities (85 total, 15 thin omitted)

### Community 0 - "EvaluatorDashboard.tsx"
Cohesion: 0.16
Nodes (23): EvaluatorPageContent(), AgentPerformancePanel(), AgentPerformancePanelProps, EvalForm(), EvalFormProps, EvalHistoryCard(), EvaluatorDashboard(), EvaluatorDashboardProps (+15 more)

### Community 1 - "ai-eval.ts"
Cohesion: 0.07
Nodes (33): POST(), DIFF, DIFF_ORDER, EMPTY_FORM, inputCls, textareaCls, AI_SUGGESTIONS, ScenarioForm() (+25 more)

### Community 2 - "index.ts"
Cohesion: 0.17
Nodes (11): ApprovalsTab(), AgentProgress, ApprovalActionType, ApprovalRequest, EvaluationCriteria, EvaluationSessionType, Evaluator, LiveSessionRecord (+3 more)

### Community 3 - "agent-training/index.tsx"
Cohesion: 0.18
Nodes (21): HRAnalyticsTab(), BackgroundEffects, AgentTrainingHub(), CongratulationsCard, Props, ModuleCard, ModuleCardProps, ModuleHeader (+13 more)

### Community 4 - "scoreColor"
Cohesion: 0.15
Nodes (18): DetailedEvaluation(), DetailedEvaluationProps, ActiveBatchHeader(), ActiveBatchHeaderProps, ArchiveSelectionGrid(), ArchiveSelectionGridProps, EvalRow(), EvaluationsDashboard() (+10 more)

### Community 5 - "agent.ts"
Cohesion: 0.06
Nodes (46): AiEvalLayout(), DashboardLayout(), DashboardPage(), dmMono, dmSans, LearnLayout(), QuizLayout(), C (+38 more)

### Community 6 - "TrainingPeriod"
Cohesion: 0.09
Nodes (36): Tab, LivePulse(), DayRecordForm, DayRecordFormProps, DaysTab(), DaysTabProps, DisciplineSubTabProps, DisciplineTab() (+28 more)

### Community 7 - "agents.ts"
Cohesion: 0.09
Nodes (32): AMBER, buildIndividualSheet(), buildOverviewSheet(), GET(), GREEN, RED, scoreFill(), GET() (+24 more)

### Community 8 - "AgentEntry.tsx"
Cohesion: 0.17
Nodes (12): DEV_MOCK_AGENTS, DevMockAgent, DevMockupSelector(), EntryAvatar(), EntryAvatarProps, LoginForm(), LoginFormProps, AgentEntry() (+4 more)

### Community 9 - "server.ts"
Cohesion: 0.18
Nodes (16): FeedItem, GET(), EMPTY, GET(), GET(), POST(), GET(), fsCount() (+8 more)

### Community 10 - "staff/route.ts"
Cohesion: 0.19
Nodes (11): DELETE, PATCH, GET, POST, GET, PATCH, POST, apiError() (+3 more)

### Community 11 - "AgentEvaluation"
Cohesion: 0.09
Nodes (19): POST(), POST(), maxDuration, POST(), POST(), COLOR_PRESETS, CertificateModal(), CertificateModalProps (+11 more)

### Community 12 - "db.ts"
Cohesion: 0.20
Nodes (14): POST(), defaults(), POST(), ProgressRecord, POST(), fsAdd(), fsGet(), fsIncrement() (+6 more)

### Community 13 - "AdminDashboard.tsx"
Cohesion: 0.10
Nodes (23): AdminPageContent(), AdminHeader(), AdminHeaderProps, AdminSidebar(), AdminSidebarProps, NavGroupProps, AdminTabContent(), AdminTabContentProps (+15 more)

### Community 14 - "AdjustmentsTab.tsx"
Cohesion: 0.08
Nodes (30): AiEvalConfig, AiEvalEditor(), DiagnosticResult, DiagnosticRunner(), HealthManager(), LearnConfig, LearnEditor(), LearnModule (+22 more)

### Community 15 - "Agent"
Cohesion: 0.22
Nodes (5): MOCKUP_AGENTS, POST(), normalizeName(), POST(), Agent

### Community 16 - "quiz-data.ts"
Cohesion: 0.10
Nodes (19): CERT_PART1, CERT_PART2, CERT_PART3, CERT_PART4, CERT_PART5, FOUND_PART1, FOUND_PART2, FOUND_PART3 (+11 more)

### Community 17 - "compilerOptions"
Cohesion: 0.07
Nodes (27): dom, dom.iterable, esnext, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules, **/*.ts (+19 more)

### Community 18 - "quiz/index.tsx"
Cohesion: 0.14
Nodes (15): QuizSystem(), QuizBriefing, reveal, QuizResult(), QuestionCard, QuestionMap, QuestionMapProps, QuizSession() (+7 more)

### Community 19 - "session/route.ts"
Cohesion: 0.21
Nodes (10): POST(), POST(), GET(), createCustomTokenSafe(), POST(), setSession(), fsGetWhere(), getAdminAuth() (+2 more)

### Community 20 - "devDependencies"
Cohesion: 0.04
Nodes (46): autoprefixer, babel-plugin-react-compiler, eslint, eslint-config-next, @eslint/eslintrc, @eslint/js, eslint-plugin-jsx-a11y, eslint-plugin-react-hooks (+38 more)

### Community 21 - "QuizResult.tsx"
Cohesion: 0.33
Nodes (13): PhaseBreakdown, PhaseBreakdownProps, ResultView, ResultViewProps, QuestionCardProps, QuizBriefingProps, QuizResultProps, QuizSessionProps (+5 more)

### Community 22 - "Dashboard.tsx"
Cohesion: 0.15
Nodes (10): MobileHeader(), MobileHeaderProps, MobileModuleChips(), ModuleChip, MODULES, DashboardHeader(), ModuleItem, MODULES (+2 more)

### Community 23 - "getServerUser"
Cohesion: 0.21
Nodes (17): DELETE(), GET(), POST(), POST(), POST(), POST(), POST(), PATCH() (+9 more)

### Community 24 - "sync-session-memory.js"
Cohesion: 0.38
Nodes (6): { execSync }, fs, getRecentBranch(), getRecentGitCommits(), path, syncSessionMemory()

### Community 25 - "StaffTab.tsx"
Cohesion: 0.21
Nodes (7): BulkImportModal(), BulkImportModalProps, AccessNotes(), AgentSection(), EditState, ROLE_COLORS, StaffSection()

### Community 26 - "fsUpdate"
Cohesion: 0.25
Nodes (11): DELETE(), PATCH(), DELETE(), DELETE(), PATCH(), POST(), DELETE(), PATCH() (+3 more)

### Community 27 - "ai-eval/index.tsx"
Cohesion: 0.15
Nodes (17): AuditFlow(), AuditFlowProps, CallSimulatorHud(), CallSimulatorHudProps, ChatView, CoachingCard, ScoreTrend, DEFAULT_CRITERIA (+9 more)

### Community 28 - "ScenarioPicker.tsx"
Cohesion: 0.27
Nodes (7): IntroView, IntroViewProps, DIFFICULTY_MAP, ScenarioPicker, StepProgress(), ActiveAgentUI(), ActiveAgentUIProps

### Community 29 - "seed.mjs"
Cohesion: 0.39
Nodes (7): __dirname, envPath, initAdmin(), main(), seedAdmin(), seedQuizzes(), seedScenarios()

### Community 33 - "seed-scenarios.mjs"
Cohesion: 0.40
Nodes (5): __dirname, envPath, FULL_CURRICULUM_SCENARIOS, initAdmin(), seed()

### Community 50 - "BrandingPanel.tsx"
Cohesion: 0.28
Nodes (6): BrandingPanel(), MODULES, STATS_CONFIG, FloatingDecoration(), StatCounter(), StatCounterProps

### Community 51 - "getAdminDb"
Cohesion: 0.19
Nodes (15): GET(), GET(), GET(), PATCH(), GET(), GET(), GET(), fsGetAll() (+7 more)

### Community 52 - "seed-mock-agents.mjs"
Cohesion: 0.40
Nodes (5): __dirname, envPath, initAdmin(), MOCKUP_AGENTS, seed()

### Community 55 - "CourseHub.tsx"
Cohesion: 0.06
Nodes (47): maxDuration, POST(), GET(), GET(), LearnPageContent(), LearnIndexPage(), CourseCard, CourseCardProps (+39 more)

### Community 56 - "HRAnalyticsTab.tsx"
Cohesion: 0.33
Nodes (3): AiSkillGapReport(), CRITERIA_MAP, SkillGapItem

### Community 71 - "lib/quiz/types.ts"
Cohesion: 0.22
Nodes (8): Language, PASS_THRESHOLD, QuestionData, QuestionType, QuizDefinition, QuizPhase, QuizUIOverrides, UI_STRINGS

### Community 72 - "fsSet"
Cohesion: 0.18
Nodes (16): DELETE(), PATCH(), POST(), GET(), POST(), defaults(), POST(), ProgressRecord (+8 more)

### Community 73 - "dependencies"
Cohesion: 0.05
Nodes (42): POST(), AgentSkillRow, CohortHeatmap(), CohortHeatmapProps, DEFAULT_ROWS, firebase, firebase-admin, framer-motion (+34 more)

### Community 76 - "HistorySections.tsx"
Cohesion: 0.26
Nodes (8): BypassModal(), BypassModalProps, DetailedAiEvalHistory(), DetailedHumanEvaluations(), DetailedQuizHistory(), requestOverride(), AgentDetailModal(), Target()

### Community 77 - "animations.ts"
Cohesion: 0.21
Nodes (8): Confetti, CongratulationsCard, CongratulationsCardProps, TrophyHero, BackgroundEffects, EASE, FADE_IN, STAGGER_CONTAINER

### Community 78 - "OverviewPanel.tsx"
Cohesion: 0.35
Nodes (8): GraduationRoster(), STATUS_ORDER, StatusPipeline(), OverviewPanel(), CompletionConfig, CompletionInfo, CompletionStatus, getCompletionStatus()

### Community 79 - "AgentStats"
Cohesion: 0.30
Nodes (9): ProfileHeader(), ProfileHeaderProps, GraduationRosterProps, LeaderboardTableProps, BadgePill(), BADGE_CONFIG, MODULE_LABELS, setAgentSession() (+1 more)

### Community 80 - "OverviewTab.tsx"
Cohesion: 0.25
Nodes (9): HistoryTab(), CompletionGrid(), CompletionGridProps, KpiSection(), KpiSectionProps, TrainingWavesSection(), TrainingWavesSectionProps, scoreBg() (+1 more)

### Community 81 - "ReportsTab.tsx"
Cohesion: 0.53
Nodes (4): getCompletionStatus(), ReportsTab(), statusPill(), fetchWithCache()

### Community 83 - "ensure-dev-server.js"
Cohesion: 0.32
Nodes (7): checkServerReady(), ensureDevServer(), fs, http, logStderr(), path, { spawn, execSync }

### Community 92 - "ReturningUserBanner.tsx"
Cohesion: 0.60
Nodes (4): getInitials(), normalizeName(), ReturningUserBanner(), ReturningUserBannerProps

## Knowledge Gaps
- **270 isolated node(s):** `dmSans`, `dmMono`, `Tab`, `ICON_MAP`, `C` (+265 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **15 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `dependencies` to `ai-eval.ts`, `devDependencies`, `CourseHub.tsx`?**
  _High betweenness centrality (0.069) - this node is a cross-community bridge._
- **Why does `AgentStats` connect `AgentStats` to `EvaluatorDashboard.tsx`, `index.ts`, `agent-training/index.tsx`, `agent.ts`, `TrainingPeriod`, `agents.ts`, `server.ts`, `AgentEvaluation`, `HistorySections.tsx`, `db.ts`, `OverviewPanel.tsx`, `OverviewTab.tsx`, `ReportsTab.tsx`, `CourseHub.tsx`, `HRAnalyticsTab.tsx`?**
  _High betweenness centrality (0.040) - this node is a cross-community bridge._
- **What connects `dmSans`, `dmMono`, `Tab` to the rest of the system?**
  _270 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `ai-eval.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07205387205387205 - nodes in this community are weakly interconnected._
- **Should `agent.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.058385093167701865 - nodes in this community are weakly interconnected._
- **Should `TrainingPeriod` be split into smaller, more focused modules?**
  _Cohesion score 0.08708272859216255 - nodes in this community are weakly interconnected._
- **Should `agents.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08710801393728224 - nodes in this community are weakly interconnected._