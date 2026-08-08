# Graph Report - BrainTrade-Training  (2026-08-08)

## Corpus Check
- 276 files · ~140,580 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1114 nodes · 2763 edges · 84 communities (67 shown, 17 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 15 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `e821a482`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- AgentStats
- ai-eval.ts
- CourseHub.tsx
- agent-training/index.tsx
- EvaluatorDashboard.tsx
- agent.ts
- TrainingPeriod
- agents.ts
- animations.ts
- [locale]/layout.tsx
- staff/route.ts
- AgentEvaluation
- fsUpdate
- AdminDashboard.tsx
- AdjustmentsTab.tsx
- server.ts
- session/route.ts
- compilerOptions
- quiz-data.ts
- getAdminDb
- devDependencies
- StaffTab.tsx
- Dashboard.tsx
- getServerUser
- sync-session-memory.js
- HRAnalyticsTab.tsx
- ReturningUserBanner.tsx
- ai-eval/index.tsx
- db.ts
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
- [locale]/page.tsx
- fsSet
- seed-mock-agents.mjs
- next-env.d.ts
- git-auto-commit.sh
- index.ts
- dependencies
- tailwind.config.ts
- OverviewPanel.tsx
- EvaluationsTab.tsx
- scripts
- HistorySections.tsx
- agy-start.sh
- LoginForm.tsx
- FADE_IN
- ReportsTab.tsx
- package.json
- @eslint/js
- @types/node
- @types/react
- @types/react-dom

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
- `AiEvalLayout()` --calls--> `getServerUser`  [EXTRACTED]
  app/[locale]/ai-eval/layout.tsx → lib/session/server.ts
- `EvaluatorPageContent()` --calls--> `getServerUser`  [EXTRACTED]
  app/[locale]/evaluator/page.tsx → lib/session/server.ts
- `LearnLayout()` --calls--> `getServerUser`  [EXTRACTED]
  app/[locale]/learn/layout.tsx → lib/session/server.ts
- `QuizLayout()` --calls--> `getServerUser`  [EXTRACTED]
  app/[locale]/quiz/layout.tsx → lib/session/server.ts
- `QuizIndexPage()` --indirect_call--> `key()`  [INFERRED]
  app/[locale]/quiz/page.tsx → lib/localCache.ts

## Import Cycles
- None detected.

## Communities (84 total, 17 thin omitted)

### Community 0 - "AgentStats"
Cohesion: 0.15
Nodes (24): ProfileHeader(), ProfileHeaderProps, ApprovalsTab(), DetailedEvaluation(), DetailedEvaluationProps, EvalRow(), EvaluationsDashboard(), EvaluationsDashboardProps (+16 more)

### Community 1 - "ai-eval.ts"
Cohesion: 0.07
Nodes (30): POST(), DIFF, DIFF_ORDER, EMPTY_FORM, inputCls, textareaCls, AI_SUGGESTIONS, ScenarioForm() (+22 more)

### Community 2 - "CourseHub.tsx"
Cohesion: 0.06
Nodes (45): GET(), GET(), LearnPageContent(), LearnIndexPage(), OverridesManager(), CourseCard, CourseCardProps, CourseHeader (+37 more)

### Community 3 - "agent-training/index.tsx"
Cohesion: 0.18
Nodes (21): HRAnalyticsTab(), BackgroundEffects, AgentTrainingHub(), CongratulationsCard, Props, ModuleCard, ModuleCardProps, ModuleHeader (+13 more)

### Community 4 - "EvaluatorDashboard.tsx"
Cohesion: 0.17
Nodes (22): EvaluatorPageContent(), AgentPerformancePanel(), EvalForm(), EvalFormProps, EvalHistoryCard(), EvaluatorDashboard(), EvaluatorDashboardProps, useKeyboardShortcuts() (+14 more)

### Community 5 - "agent.ts"
Cohesion: 0.09
Nodes (37): AiEvalLayout(), DashboardLayout(), DashboardPage(), LearnLayout(), QuizLayout(), normalizeName(), useAgentEntry(), AgentAuthGuard() (+29 more)

### Community 6 - "TrainingPeriod"
Cohesion: 0.10
Nodes (34): LivePulse(), DayRecordForm, DayRecordFormProps, DaysTab(), DaysTabProps, DisciplineSubTabProps, DisciplineTab(), NewPeriodModal() (+26 more)

### Community 7 - "agents.ts"
Cohesion: 0.09
Nodes (30): AMBER, buildIndividualSheet(), buildOverviewSheet(), GET(), GREEN, RED, scoreFill(), GET() (+22 more)

### Community 8 - "animations.ts"
Cohesion: 0.18
Nodes (12): EntryAvatar(), EntryAvatarProps, MobileHeader(), MobileHeaderProps, MobileModuleChips(), ModuleChip, MODULES, AgentEntry() (+4 more)

### Community 9 - "[locale]/layout.tsx"
Cohesion: 0.09
Nodes (22): POST(), dmMono, dmSans, AgentSkillRow, CohortHeatmap(), CohortHeatmapProps, DEFAULT_ROWS, CommandPalette() (+14 more)

### Community 10 - "staff/route.ts"
Cohesion: 0.19
Nodes (11): DELETE, PATCH, GET, POST, GET, PATCH, POST, apiError() (+3 more)

### Community 11 - "AgentEvaluation"
Cohesion: 0.12
Nodes (14): POST(), POST(), maxDuration, POST(), POST(), EvalHistoryCardProps, OverviewPanelProps, getGeminiModel() (+6 more)

### Community 12 - "fsUpdate"
Cohesion: 0.21
Nodes (14): DELETE(), DELETE(), PATCH(), GET(), POST(), DELETE(), PATCH(), fsDelete() (+6 more)

### Community 13 - "AdminDashboard.tsx"
Cohesion: 0.12
Nodes (22): AdminHeader(), AdminHeaderProps, AdminSidebar(), AdminSidebarProps, NavGroupProps, AdminTabContent(), AdminTabContentProps, TAB_REGISTRY (+14 more)

### Community 14 - "AdjustmentsTab.tsx"
Cohesion: 0.08
Nodes (30): AiEvalConfig, AiEvalEditor(), DiagnosticResult, DiagnosticRunner(), HealthManager(), LearnConfig, LearnEditor(), LearnModule (+22 more)

### Community 15 - "server.ts"
Cohesion: 0.13
Nodes (22): GET(), POST(), FeedItem, GET(), EMPTY, GET(), GET(), POST() (+14 more)

### Community 16 - "session/route.ts"
Cohesion: 0.20
Nodes (10): POST(), POST(), normalizeName(), POST(), createCustomTokenSafe(), POST(), setSession(), fsGetWhere() (+2 more)

### Community 17 - "compilerOptions"
Cohesion: 0.07
Nodes (27): dom, dom.iterable, esnext, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules, **/*.ts (+19 more)

### Community 18 - "quiz-data.ts"
Cohesion: 0.06
Nodes (51): C, ICON_MAP, QuizIndexPage(), QuizSystem(), QuizBriefing, reveal, PhaseBreakdown, PhaseBreakdownProps (+43 more)

### Community 19 - "getAdminDb"
Cohesion: 0.17
Nodes (16): GET(), GET(), maxDuration, POST(), GET(), GET(), fsGetAll(), fsIncrement() (+8 more)

### Community 20 - "devDependencies"
Cohesion: 0.10
Nodes (21): autoprefixer, babel-plugin-react-compiler, eslint, eslint-config-next, @eslint/eslintrc, eslint-plugin-jsx-a11y, eslint-plugin-react-hooks, devDependencies (+13 more)

### Community 21 - "StaffTab.tsx"
Cohesion: 0.21
Nodes (7): BulkImportModal(), BulkImportModalProps, AccessNotes(), AgentSection(), EditState, ROLE_COLORS, StaffSection()

### Community 22 - "Dashboard.tsx"
Cohesion: 0.14
Nodes (11): BrandingPanel(), MODULES, STATS_CONFIG, FloatingDecoration(), DashboardHeader(), ModuleItem, MODULES, BrandedTitle() (+3 more)

### Community 23 - "getServerUser"
Cohesion: 0.20
Nodes (19): DELETE(), GET(), POST(), POST(), POST(), POST(), GET(), PATCH() (+11 more)

### Community 24 - "sync-session-memory.js"
Cohesion: 0.38
Nodes (6): { execSync }, fs, getRecentBranch(), getRecentGitCommits(), path, syncSessionMemory()

### Community 25 - "HRAnalyticsTab.tsx"
Cohesion: 0.29
Nodes (4): AiSkillGapReport(), CRITERIA_MAP, SkillGapItem, STAGGER_CONTAINER

### Community 26 - "ReturningUserBanner.tsx"
Cohesion: 0.60
Nodes (4): getInitials(), normalizeName(), ReturningUserBanner(), ReturningUserBannerProps

### Community 27 - "ai-eval/index.tsx"
Cohesion: 0.10
Nodes (25): AuditFlow(), AuditFlowProps, CallSimulatorHud(), CallSimulatorHudProps, ChatView, CoachingCard, ScoreTrend, AiEvaluation() (+17 more)

### Community 28 - "db.ts"
Cohesion: 0.20
Nodes (10): defaults(), GET(), POST(), ProgressRecord, POST(), fsAdd(), fsGet(), getActiveTrainingPeriod() (+2 more)

### Community 29 - "seed.mjs"
Cohesion: 0.39
Nodes (7): __dirname, envPath, initAdmin(), main(), seedAdmin(), seedQuizzes(), seedScenarios()

### Community 33 - "seed-scenarios.mjs"
Cohesion: 0.40
Nodes (5): __dirname, envPath, FULL_CURRICULUM_SCENARIOS, initAdmin(), seed()

### Community 50 - "[locale]/page.tsx"
Cohesion: 0.28
Nodes (4): Tab, BackgroundEffects, EASE, auth

### Community 51 - "fsSet"
Cohesion: 0.15
Nodes (17): DELETE(), GET(), PATCH(), POST(), defaults(), POST(), ProgressRecord, GET() (+9 more)

### Community 52 - "seed-mock-agents.mjs"
Cohesion: 0.40
Nodes (5): __dirname, envPath, initAdmin(), MOCKUP_AGENTS, seed()

### Community 55 - "index.ts"
Cohesion: 0.14
Nodes (17): AgentDetailModal(), CompletionGrid(), CompletionGridProps, KpiSection(), KpiSectionProps, TrainingWavesSection(), TrainingWavesSectionProps, AdminOverviewData (+9 more)

### Community 56 - "dependencies"
Cohesion: 0.09
Nodes (23): firebase, firebase-admin, framer-motion, @google-cloud/storage, @google/generative-ai, lucide-react, next, next-intl (+15 more)

### Community 71 - "OverviewPanel.tsx"
Cohesion: 0.35
Nodes (8): GraduationRoster(), STATUS_ORDER, StatusPipeline(), OverviewPanel(), CompletionConfig, CompletionInfo, CompletionStatus, getCompletionStatus()

### Community 72 - "EvaluationsTab.tsx"
Cohesion: 0.25
Nodes (7): ActiveBatchHeader(), ActiveBatchHeaderProps, ArchiveSelectionGrid(), ArchiveSelectionGridProps, EvalTab, useEvaluationsData(), EvaluationsTab()

### Community 73 - "scripts"
Cohesion: 0.18
Nodes (11): scripts, agy:check, agy:commit, agy:start, build, check, dev, lint (+3 more)

### Community 74 - "HistorySections.tsx"
Cohesion: 0.33
Nodes (6): BypassModal(), BypassModalProps, DetailedAiEvalHistory(), DetailedHumanEvaluations(), DetailedQuizHistory(), requestOverride()

### Community 76 - "LoginForm.tsx"
Cohesion: 0.38
Nodes (5): DEV_MOCK_AGENTS, DevMockAgent, DevMockupSelector(), LoginForm(), LoginFormProps

### Community 77 - "FADE_IN"
Cohesion: 0.32
Nodes (5): Confetti, CongratulationsCard, CongratulationsCardProps, TrophyHero, FADE_IN

### Community 78 - "ReportsTab.tsx"
Cohesion: 0.53
Nodes (4): getCompletionStatus(), ReportsTab(), statusPill(), fetchWithCache()

### Community 79 - "package.json"
Cohesion: 0.50
Nodes (3): name, private, version

## Knowledge Gaps
- **251 isolated node(s):** `dmSans`, `dmMono`, `Tab`, `ICON_MAP`, `C` (+246 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **17 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `dependencies` to `ai-eval.ts`, `CourseHub.tsx`, `package.json`?**
  _High betweenness centrality (0.102) - this node is a cross-community bridge._
- **Why does `react` connect `CourseHub.tsx` to `dependencies`, `HRAnalyticsTab.tsx`?**
  _High betweenness centrality (0.045) - this node is a cross-community bridge._
- **Why does `xlsx` connect `ai-eval.ts` to `agents.ts`, `AdjustmentsTab.tsx`, `fsSet`, `StaffTab.tsx`, `dependencies`?**
  _High betweenness centrality (0.038) - this node is a cross-community bridge._
- **What connects `dmSans`, `dmMono`, `Tab` to the rest of the system?**
  _251 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `ai-eval.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07058001397624039 - nodes in this community are weakly interconnected._
- **Should `CourseHub.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06240084611316764 - nodes in this community are weakly interconnected._
- **Should `agent.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08705882352941176 - nodes in this community are weakly interconnected._