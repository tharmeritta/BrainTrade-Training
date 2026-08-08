# Graph Report - BrainTrade-Training  (2026-08-08)

## Corpus Check
- 276 files · ~140,305 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1114 nodes · 2762 edges · 72 communities (59 shown, 13 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 15 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `a2c9df67`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- index.ts
- ai-eval.ts
- CourseHub.tsx
- agent-training/index.tsx
- EvaluatorDashboard.tsx
- agent.ts
- TrainingPeriod
- agents.ts
- animations.ts
- dependencies
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
- BrandingPanel.tsx
- getServerUser
- sync-session-memory.js
- AiSkillGapReport.tsx
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
- Dashboard.tsx
- fsSet
- seed-mock-agents.mjs
- next-env.d.ts
- git-auto-commit.sh
- FADE_IN
- tailwind.config.ts
- agy-start.sh
- STAGGER_CONTAINER

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

## Communities (72 total, 13 thin omitted)

### Community 0 - "index.ts"
Cohesion: 0.06
Nodes (57): BypassModal(), BypassModalProps, DetailedAiEvalHistory(), DetailedHumanEvaluations(), DetailedQuizHistory(), requestOverride(), ProfileHeader(), ProfileHeaderProps (+49 more)

### Community 1 - "ai-eval.ts"
Cohesion: 0.07
Nodes (30): POST(), DIFF, DIFF_ORDER, EMPTY_FORM, inputCls, textareaCls, AI_SUGGESTIONS, ScenarioForm() (+22 more)

### Community 2 - "CourseHub.tsx"
Cohesion: 0.07
Nodes (43): GET(), GET(), LearnPageContent(), LearnIndexPage(), OverridesManager(), CourseCard, CourseCardProps, CourseHeader (+35 more)

### Community 3 - "agent-training/index.tsx"
Cohesion: 0.18
Nodes (19): HRAnalyticsTab(), BackgroundEffects, AgentTrainingHub(), CongratulationsCard, Props, ModuleCard, ModuleCardProps, ProfileSidebar (+11 more)

### Community 4 - "EvaluatorDashboard.tsx"
Cohesion: 0.12
Nodes (31): EvaluatorPageContent(), GraduationRosterProps, STATUS_ORDER, StatusPipeline(), AgentPerformancePanel(), AgentPerformancePanelProps, EvalForm(), EvalFormProps (+23 more)

### Community 5 - "agent.ts"
Cohesion: 0.07
Nodes (42): AiEvalLayout(), DashboardLayout(), DashboardPage(), dmMono, dmSans, LearnLayout(), QuizLayout(), normalizeName() (+34 more)

### Community 6 - "TrainingPeriod"
Cohesion: 0.10
Nodes (34): LivePulse(), DayRecordForm, DayRecordFormProps, DaysTab(), DaysTabProps, DisciplineSubTabProps, DisciplineTab(), NewPeriodModal() (+26 more)

### Community 7 - "agents.ts"
Cohesion: 0.09
Nodes (30): AMBER, buildIndividualSheet(), buildOverviewSheet(), GET(), GREEN, RED, scoreFill(), GET() (+22 more)

### Community 8 - "animations.ts"
Cohesion: 0.13
Nodes (17): DEV_MOCK_AGENTS, DevMockAgent, DevMockupSelector(), EntryAvatar(), EntryAvatarProps, LoginForm(), LoginFormProps, MobileHeader() (+9 more)

### Community 9 - "dependencies"
Cohesion: 0.05
Nodes (40): POST(), AgentSkillRow, CohortHeatmap(), CohortHeatmapProps, DEFAULT_ROWS, firebase, firebase-admin, framer-motion (+32 more)

### Community 10 - "staff/route.ts"
Cohesion: 0.19
Nodes (11): DELETE, PATCH, GET, POST, GET, PATCH, POST, apiError() (+3 more)

### Community 11 - "AgentEvaluation"
Cohesion: 0.12
Nodes (14): POST(), POST(), maxDuration, POST(), POST(), EvalHistoryCardProps, OverviewPanelProps, getGeminiModel() (+6 more)

### Community 12 - "fsUpdate"
Cohesion: 0.18
Nodes (16): GET(), POST(), DELETE(), DELETE(), PATCH(), POST(), DELETE(), PATCH() (+8 more)

### Community 13 - "AdminDashboard.tsx"
Cohesion: 0.12
Nodes (22): AdminHeader(), AdminHeaderProps, AdminSidebar(), AdminSidebarProps, NavGroupProps, AdminTabContent(), AdminTabContentProps, TAB_REGISTRY (+14 more)

### Community 14 - "AdjustmentsTab.tsx"
Cohesion: 0.08
Nodes (30): AiEvalConfig, AiEvalEditor(), DiagnosticResult, DiagnosticRunner(), HealthManager(), LearnConfig, LearnEditor(), LearnModule (+22 more)

### Community 15 - "server.ts"
Cohesion: 0.14
Nodes (20): FeedItem, GET(), EMPTY, GET(), GET(), POST(), GET(), GET() (+12 more)

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
Cohesion: 0.05
Nodes (43): autoprefixer, babel-plugin-react-compiler, eslint, eslint-config-next, @eslint/eslintrc, @eslint/js, eslint-plugin-jsx-a11y, eslint-plugin-react-hooks (+35 more)

### Community 21 - "StaffTab.tsx"
Cohesion: 0.21
Nodes (7): BulkImportModal(), BulkImportModalProps, AccessNotes(), AgentSection(), EditState, ROLE_COLORS, StaffSection()

### Community 22 - "BrandingPanel.tsx"
Cohesion: 0.28
Nodes (6): BrandingPanel(), MODULES, STATS_CONFIG, FloatingDecoration(), StatCounter(), StatCounterProps

### Community 23 - "getServerUser"
Cohesion: 0.20
Nodes (19): DELETE(), GET(), POST(), POST(), POST(), POST(), GET(), PATCH() (+11 more)

### Community 24 - "sync-session-memory.js"
Cohesion: 0.38
Nodes (6): { execSync }, fs, getRecentBranch(), getRecentGitCommits(), path, syncSessionMemory()

### Community 25 - "AiSkillGapReport.tsx"
Cohesion: 0.33
Nodes (5): AiSkillGapReport(), CRITERIA_MAP, SkillGapItem, react, react

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

### Community 50 - "Dashboard.tsx"
Cohesion: 0.14
Nodes (9): Tab, DashboardHeader(), ModuleItem, MODULES, BackgroundEffects, BrandedTitle(), BrandedTitleProps, EASE (+1 more)

### Community 51 - "fsSet"
Cohesion: 0.15
Nodes (17): DELETE(), GET(), PATCH(), POST(), defaults(), POST(), ProgressRecord, GET() (+9 more)

### Community 52 - "seed-mock-agents.mjs"
Cohesion: 0.40
Nodes (5): __dirname, envPath, initAdmin(), MOCKUP_AGENTS, seed()

### Community 55 - "FADE_IN"
Cohesion: 0.50
Nodes (3): ModuleHeader, ModuleHeaderProps, FADE_IN

### Community 77 - "STAGGER_CONTAINER"
Cohesion: 0.32
Nodes (5): Confetti, CongratulationsCard, CongratulationsCardProps, TrophyHero, STAGGER_CONTAINER

## Knowledge Gaps
- **251 isolated node(s):** `dmSans`, `dmMono`, `Tab`, `ICON_MAP`, `C` (+246 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **13 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `dependencies` to `AiSkillGapReport.tsx`, `devDependencies`, `ai-eval.ts`?**
  _High betweenness centrality (0.102) - this node is a cross-community bridge._
- **Why does `xlsx` connect `ai-eval.ts` to `agents.ts`, `dependencies`, `AdjustmentsTab.tsx`, `fsSet`, `StaffTab.tsx`?**
  _High betweenness centrality (0.046) - this node is a cross-community bridge._
- **Why does `AiSkillGapReport()` connect `AiSkillGapReport.tsx` to `agent-training/index.tsx`, `agent.ts`?**
  _High betweenness centrality (0.035) - this node is a cross-community bridge._
- **What connects `dmSans`, `dmMono`, `Tab` to the rest of the system?**
  _251 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06190476190476191 - nodes in this community are weakly interconnected._
- **Should `ai-eval.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07058001397624039 - nodes in this community are weakly interconnected._
- **Should `CourseHub.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.0655367231638418 - nodes in this community are weakly interconnected._