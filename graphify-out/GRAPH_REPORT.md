# Graph Report - BrainTrade-Training  (2026-08-08)

## Corpus Check
- 278 files · ~142,271 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1124 nodes · 2778 edges · 81 communities (63 shown, 18 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 15 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `0e8265fb`
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
- animations.ts
- [locale]/layout.tsx
- approval-service.ts
- AgentStats
- CertificateModal.tsx
- AdminDashboard.tsx
- AdjustmentsTab.tsx
- server.ts
- eslint-plugin-react-hooks
- compilerOptions
- quiz-data.ts
- firebase-admin.ts
- devDependencies
- export/route.ts
- Dashboard.tsx
- getAdminDb
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
- @types/nodemailer
- getServerUser
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
- CongratulationsCard.tsx
- package.json
- @types/node
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

## Communities (81 total, 18 thin omitted)

### Community 0 - "scoreColor"
Cohesion: 0.15
Nodes (21): AgentDetailModal(), ApprovalsTab(), DetailedEvaluation(), DetailedEvaluationProps, EvalRow(), EvaluationsDashboard(), EvaluationsDashboardProps, AdminEval (+13 more)

### Community 1 - "fsSet"
Cohesion: 0.05
Nodes (41): POST(), defaults(), POST(), ProgressRecord, POST(), maxDuration, POST(), MOCKUP_AGENTS (+33 more)

### Community 2 - "CourseHub.tsx"
Cohesion: 0.06
Nodes (46): GET(), GET(), LearnPageContent(), LearnIndexPage(), OverridesManager(), CourseCard, CourseCardProps, CourseHeader (+38 more)

### Community 3 - "agent-training/index.tsx"
Cohesion: 0.20
Nodes (19): HRAnalyticsTab(), BackgroundEffects, AgentTrainingHub(), CongratulationsCard, ModuleCard, ModuleCardProps, ModuleHeader, ProfileSidebar (+11 more)

### Community 4 - "EvaluatorDashboard.tsx"
Cohesion: 0.15
Nodes (25): EvaluatorPageContent(), AgentPerformancePanel(), AgentPerformancePanelProps, EvalForm(), EvalFormProps, EvalHistoryCard(), EvalHistoryCardProps, EvaluatorDashboard() (+17 more)

### Community 5 - "agent.ts"
Cohesion: 0.08
Nodes (39): AiEvalLayout(), DashboardLayout(), DashboardPage(), LearnLayout(), QuizLayout(), normalizeName(), useAgentEntry(), DashboardHeader() (+31 more)

### Community 6 - "TrainingPeriod"
Cohesion: 0.11
Nodes (32): LivePulse(), DayRecordForm, DayRecordFormProps, DaysTab(), DaysTabProps, DisciplineSubTabProps, DisciplineTab(), NewPeriodModal() (+24 more)

### Community 7 - "agents.ts"
Cohesion: 0.11
Nodes (25): GET(), GET(), POST(), GET(), GET(), GET(), QuizResult, buildAiEval() (+17 more)

### Community 8 - "animations.ts"
Cohesion: 0.13
Nodes (17): Tab, EntryAvatar(), EntryAvatarProps, MobileHeader(), MobileHeaderProps, MobileModuleChips(), ModuleChip, MODULES (+9 more)

### Community 9 - "[locale]/layout.tsx"
Cohesion: 0.09
Nodes (22): POST(), dmMono, dmSans, AgentSkillRow, CohortHeatmap(), CohortHeatmapProps, DEFAULT_ROWS, CommandPalette() (+14 more)

### Community 10 - "approval-service.ts"
Cohesion: 0.14
Nodes (17): DELETE, PATCH, GET, POST, GET(), POST(), GET, PATCH (+9 more)

### Community 11 - "AgentStats"
Cohesion: 0.27
Nodes (10): ProfileHeader(), ProfileHeaderProps, GraduationRosterProps, LeaderboardTable(), LeaderboardTableProps, BadgePill(), Props, ModuleHeaderProps (+2 more)

### Community 13 - "AdminDashboard.tsx"
Cohesion: 0.12
Nodes (22): AdminHeader(), AdminHeaderProps, AdminSidebar(), AdminSidebarProps, NavGroupProps, AdminTabContent(), AdminTabContentProps, TAB_REGISTRY (+14 more)

### Community 14 - "AdjustmentsTab.tsx"
Cohesion: 0.07
Nodes (32): AiEvalConfig, AiEvalEditor(), DiagnosticResult, DiagnosticRunner(), HealthManager(), LearnConfig, LearnEditor(), LearnModule (+24 more)

### Community 15 - "server.ts"
Cohesion: 0.15
Nodes (20): POST(), DELETE(), PATCH(), GET(), POST(), GET(), POST(), DELETE() (+12 more)

### Community 17 - "compilerOptions"
Cohesion: 0.07
Nodes (27): dom, dom.iterable, esnext, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules, **/*.ts (+19 more)

### Community 18 - "quiz-data.ts"
Cohesion: 0.06
Nodes (51): C, ICON_MAP, QuizIndexPage(), QuizSystem(), QuizBriefing, reveal, PhaseBreakdown, PhaseBreakdownProps (+43 more)

### Community 19 - "firebase-admin.ts"
Cohesion: 0.16
Nodes (16): POST(), maxDuration, POST(), GET(), createCustomTokenSafe(), POST(), setSession(), fsGetWhere() (+8 more)

### Community 20 - "devDependencies"
Cohesion: 0.09
Nodes (23): autoprefixer, babel-plugin-react-compiler, eslint, eslint-config-next, @eslint/eslintrc, @eslint/js, eslint-plugin-jsx-a11y, devDependencies (+15 more)

### Community 21 - "export/route.ts"
Cohesion: 0.08
Nodes (25): AMBER, buildIndividualSheet(), buildOverviewSheet(), GET(), GREEN, RED, scoreFill(), GET() (+17 more)

### Community 22 - "Dashboard.tsx"
Cohesion: 0.15
Nodes (10): BrandingPanel(), MODULES, STATS_CONFIG, FloatingDecoration(), ModuleItem, MODULES, BrandedTitle(), BrandedTitleProps (+2 more)

### Community 23 - "getAdminDb"
Cohesion: 0.17
Nodes (23): DELETE(), GET(), POST(), POST(), POST(), POST(), GET(), PATCH() (+15 more)

### Community 24 - "sync-session-memory.js"
Cohesion: 0.38
Nodes (6): { execSync }, fs, getRecentBranch(), getRecentGitCommits(), path, syncSessionMemory()

### Community 25 - "HRAnalyticsTab.tsx"
Cohesion: 0.33
Nodes (3): AiSkillGapReport(), CRITERIA_MAP, SkillGapItem

### Community 26 - "ReturningUserBanner.tsx"
Cohesion: 0.60
Nodes (4): getInitials(), normalizeName(), ReturningUserBanner(), ReturningUserBannerProps

### Community 27 - "ai-eval/index.tsx"
Cohesion: 0.10
Nodes (25): AuditFlow(), AuditFlowProps, CallSimulatorHud(), CallSimulatorHudProps, ChatView, CoachingCard, ScoreTrend, AiEvaluation() (+17 more)

### Community 28 - "db.ts"
Cohesion: 0.14
Nodes (13): GET(), GET(), FeedItem, GET(), EMPTY, GET(), normalizeName(), POST() (+5 more)

### Community 29 - "seed.mjs"
Cohesion: 0.39
Nodes (7): __dirname, envPath, initAdmin(), main(), seedAdmin(), seedQuizzes(), seedScenarios()

### Community 33 - "seed-scenarios.mjs"
Cohesion: 0.40
Nodes (5): __dirname, envPath, FULL_CURRICULUM_SCENARIOS, initAdmin(), seed()

### Community 51 - "getServerUser"
Cohesion: 0.19
Nodes (16): DELETE(), GET(), PATCH(), POST(), GET(), PATCH(), DELETE(), PATCH() (+8 more)

### Community 52 - "seed-mock-agents.mjs"
Cohesion: 0.40
Nodes (5): __dirname, envPath, initAdmin(), MOCKUP_AGENTS, seed()

### Community 55 - "index.ts"
Cohesion: 0.16
Nodes (15): CompletionGrid(), CompletionGridProps, KpiSection(), KpiSectionProps, TrainingWavesSection(), TrainingWavesSectionProps, AdminOverviewData, AgentProgress (+7 more)

### Community 56 - "dependencies"
Cohesion: 0.08
Nodes (25): firebase, firebase-admin, framer-motion, @google-cloud/storage, @google/generative-ai, lucide-react, next, next-intl (+17 more)

### Community 71 - "OverviewPanel.tsx"
Cohesion: 0.29
Nodes (10): GraduationRoster(), STATUS_ORDER, StatusPipeline(), OverviewPanel(), OverviewPanelProps, CompletionConfig, CompletionInfo, CompletionStatus (+2 more)

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

### Community 77 - "CongratulationsCard.tsx"
Cohesion: 0.38
Nodes (4): Confetti, CongratulationsCard, CongratulationsCardProps, TrophyHero

### Community 79 - "package.json"
Cohesion: 0.50
Nodes (3): name, private, version

## Knowledge Gaps
- **255 isolated node(s):** `dmSans`, `dmMono`, `Tab`, `ICON_MAP`, `C` (+250 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **18 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `dependencies` to `CourseHub.tsx`, `export/route.ts`, `package.json`?**
  _High betweenness centrality (0.096) - this node is a cross-community bridge._
- **Why does `react` connect `CourseHub.tsx` to `dependencies`, `HRAnalyticsTab.tsx`, `agent-training/index.tsx`?**
  _High betweenness centrality (0.052) - this node is a cross-community bridge._
- **Why does `AgentStats` connect `AgentStats` to `scoreColor`, `CourseHub.tsx`, `agent-training/index.tsx`, `EvaluatorDashboard.tsx`, `agent.ts`, `TrainingPeriod`, `OverviewPanel.tsx`, `agents.ts`, `HistorySections.tsx`, `getAdminDb`, `export/route.ts`, `index.ts`, `HRAnalyticsTab.tsx`, `db.ts`?**
  _High betweenness centrality (0.037) - this node is a cross-community bridge._
- **What connects `dmSans`, `dmMono`, `Tab` to the rest of the system?**
  _255 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `scoreColor` be split into smaller, more focused modules?**
  _Cohesion score 0.14516129032258066 - nodes in this community are weakly interconnected._
- **Should `fsSet` be split into smaller, more focused modules?**
  _Cohesion score 0.05088919288645691 - nodes in this community are weakly interconnected._
- **Should `CourseHub.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.061955965181771634 - nodes in this community are weakly interconnected._