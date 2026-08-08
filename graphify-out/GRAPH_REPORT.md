# Graph Report - BrainTrade-Training  (2026-08-08)

## Corpus Check
- 266 files · ~131,386 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1066 nodes · 2677 edges · 75 communities (57 shown, 18 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 14 edges (avg confidence: 0.89)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `90d413ee`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- index.ts
- ai-eval.ts
- CourseHub.tsx
- animations.ts
- EvaluatorDashboard.tsx
- agent.ts
- TrainingPeriod
- agents.ts
- agent-training/index.tsx
- [locale]/layout.tsx
- staff/route.ts
- stats-service.ts
- ai-eval/index.tsx
- AdminDashboard.tsx
- AdjustmentsTab.tsx
- fsUpdate
- getServerUser
- compilerOptions
- quiz-data.ts
- getAdminDb
- devDependencies
- dependencies
- server.ts
- Dashboard.tsx
- HRAnalyticsTab.tsx
- fsGetAll
- StaffTab.tsx
- getGeminiModel
- CongratulationsCard.tsx
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
- ReturningUserBanner.tsx
- db.ts
- openai
- next-env.d.ts
- git-auto-commit.sh
- @types/node
- package.json
- tailwind.config.ts
- eslint-plugin-jsx-a11y
- tailwindcss
- @types/react
- agy-start.sh

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

## Communities (75 total, 18 thin omitted)

### Community 0 - "index.ts"
Cohesion: 0.06
Nodes (57): BypassModal(), BypassModalProps, DetailedAiEvalHistory(), DetailedHumanEvaluations(), DetailedQuizHistory(), requestOverride(), ProfileHeader(), ProfileHeaderProps (+49 more)

### Community 1 - "ai-eval.ts"
Cohesion: 0.09
Nodes (26): DELETE(), POST(), DIFF, DIFF_ORDER, EMPTY_FORM, inputCls, textareaCls, ScenarioForm() (+18 more)

### Community 2 - "CourseHub.tsx"
Cohesion: 0.07
Nodes (43): GET(), GET(), LearnPageContent(), LearnIndexPage(), OverridesManager(), CourseCard, CourseCardProps, CourseHeader (+35 more)

### Community 3 - "animations.ts"
Cohesion: 0.14
Nodes (18): EntryAvatar(), EntryAvatarProps, LoginForm(), LoginFormProps, MobileHeader(), MobileHeaderProps, MobileModuleChips(), ModuleChip (+10 more)

### Community 4 - "EvaluatorDashboard.tsx"
Cohesion: 0.11
Nodes (35): EvaluatorPageContent(), GraduationRoster(), GraduationRosterProps, STATUS_ORDER, StatusPipeline(), AgentPerformancePanel(), AgentPerformancePanelProps, EvalForm() (+27 more)

### Community 5 - "agent.ts"
Cohesion: 0.08
Nodes (37): AiEvalLayout(), DashboardLayout(), DashboardPage(), LearnLayout(), QuizLayout(), normalizeName(), useAgentEntry(), AgentAuthGuard() (+29 more)

### Community 6 - "TrainingPeriod"
Cohesion: 0.10
Nodes (33): Tab, LivePulse(), DayRecordForm, DayRecordFormProps, DaysTab(), DaysTabProps, DisciplineSubTabProps, DisciplineTab() (+25 more)

### Community 7 - "agents.ts"
Cohesion: 0.11
Nodes (27): AMBER, buildIndividualSheet(), buildOverviewSheet(), GET(), GREEN, RED, scoreFill(), POST() (+19 more)

### Community 8 - "agent-training/index.tsx"
Cohesion: 0.19
Nodes (19): BackgroundEffects, AgentTrainingHub(), CongratulationsCard, Props, ModuleCard, ModuleCardProps, ModuleHeader, ModuleHeaderProps (+11 more)

### Community 9 - "[locale]/layout.tsx"
Cohesion: 0.08
Nodes (23): POST(), dmMono, dmSans, AgentSkillRow, CohortHeatmap(), CohortHeatmapProps, DEFAULT_ROWS, CommandPalette() (+15 more)

### Community 10 - "staff/route.ts"
Cohesion: 0.19
Nodes (11): DELETE, PATCH, GET, POST, GET, PATCH, POST, apiError() (+3 more)

### Community 11 - "stats-service.ts"
Cohesion: 0.20
Nodes (17): DELETE(), POST(), POST(), GET(), POST(), POST(), PATCH(), POST() (+9 more)

### Community 12 - "ai-eval/index.tsx"
Cohesion: 0.10
Nodes (25): AuditFlow(), AuditFlowProps, CallSimulatorHud(), CallSimulatorHudProps, ChatView, CoachingCard, ScoreTrend, AiEvaluation() (+17 more)

### Community 13 - "AdminDashboard.tsx"
Cohesion: 0.11
Nodes (23): AdminPageContent(), AdminHeader(), AdminHeaderProps, AdminSidebar(), AdminSidebarProps, NavGroupProps, AdminTabContent(), AdminTabContentProps (+15 more)

### Community 14 - "AdjustmentsTab.tsx"
Cohesion: 0.09
Nodes (28): AiEvalConfig, AiEvalEditor(), DiagnosticResult, DiagnosticRunner(), HealthManager(), LearnConfig, LearnEditor(), LearnModule (+20 more)

### Community 15 - "fsUpdate"
Cohesion: 0.40
Nodes (9): DELETE(), PATCH(), POST(), DELETE(), PATCH(), fsDelete(), fsUpdate(), executeApprovedAction() (+1 more)

### Community 16 - "getServerUser"
Cohesion: 0.20
Nodes (14): DELETE(), PATCH(), POST(), defaults(), POST(), ProgressRecord, POST(), POST() (+6 more)

### Community 17 - "compilerOptions"
Cohesion: 0.07
Nodes (27): dom, dom.iterable, esnext, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules, **/*.ts (+19 more)

### Community 18 - "quiz-data.ts"
Cohesion: 0.06
Nodes (51): C, ICON_MAP, QuizIndexPage(), QuizSystem(), QuizBriefing, reveal, PhaseBreakdown, PhaseBreakdownProps (+43 more)

### Community 19 - "getAdminDb"
Cohesion: 0.13
Nodes (21): GET(), GET(), PATCH(), maxDuration, POST(), GET(), GET(), POST() (+13 more)

### Community 20 - "devDependencies"
Cohesion: 0.10
Nodes (21): autoprefixer, babel-plugin-react-compiler, eslint, eslint-config-next, @eslint/eslintrc, @eslint/js, eslint-plugin-react-hooks, devDependencies (+13 more)

### Community 21 - "dependencies"
Cohesion: 0.09
Nodes (23): firebase, firebase-admin, framer-motion, @google-cloud/storage, @google/generative-ai, lucide-react, next, next-intl (+15 more)

### Community 22 - "server.ts"
Cohesion: 0.14
Nodes (21): GET(), POST(), FeedItem, GET(), EMPTY, GET(), GET(), POST() (+13 more)

### Community 23 - "Dashboard.tsx"
Cohesion: 0.14
Nodes (11): BrandingPanel(), MODULES, STATS_CONFIG, FloatingDecoration(), DashboardHeader(), ModuleItem, MODULES, BrandedTitle() (+3 more)

### Community 24 - "HRAnalyticsTab.tsx"
Cohesion: 0.28
Nodes (5): HRAnalyticsTab(), StatusBadge(), StatusBadgeProps, StatusType, deriveSteps()

### Community 25 - "fsGetAll"
Cohesion: 0.13
Nodes (14): GET(), GET(), GET(), GET(), POST(), DELETE(), PATCH(), normalizeName() (+6 more)

### Community 26 - "StaffTab.tsx"
Cohesion: 0.21
Nodes (7): BulkImportModal(), BulkImportModalProps, AccessNotes(), AgentSection(), EditState, ROLE_COLORS, StaffSection()

### Community 27 - "getGeminiModel"
Cohesion: 0.18
Nodes (8): maxDuration, POST(), POST(), getGeminiModel(), getOpenAI(), AiAuditService, SemanticAuditService, requireAdminOrIT()

### Community 28 - "CongratulationsCard.tsx"
Cohesion: 0.38
Nodes (4): Confetti, CongratulationsCard, CongratulationsCardProps, TrophyHero

### Community 29 - "seed.mjs"
Cohesion: 0.39
Nodes (7): __dirname, envPath, initAdmin(), main(), seedAdmin(), seedQuizzes(), seedScenarios()

### Community 33 - "scripts"
Cohesion: 0.20
Nodes (10): scripts, agy:check, agy:commit, agy:start, build, check, dev, lint (+2 more)

### Community 50 - "ReturningUserBanner.tsx"
Cohesion: 0.60
Nodes (4): getInitials(), normalizeName(), ReturningUserBanner(), ReturningUserBannerProps

### Community 51 - "db.ts"
Cohesion: 0.24
Nodes (10): defaults(), GET(), POST(), ProgressRecord, POST(), fsAdd(), fsGet(), getActiveTrainingPeriod() (+2 more)

### Community 56 - "package.json"
Cohesion: 0.50
Nodes (3): name, private, version

## Knowledge Gaps
- **230 isolated node(s):** `dmSans`, `dmMono`, `Tab`, `ICON_MAP`, `C` (+225 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **18 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `dependencies` to `package.json`, `ai-eval.ts`, `openai`?**
  _High betweenness centrality (0.109) - this node is a cross-community bridge._
- **Why does `xlsx` connect `ai-eval.ts` to `agents.ts`, `AdjustmentsTab.tsx`, `dependencies`, `fsGetAll`, `StaffTab.tsx`?**
  _High betweenness centrality (0.078) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `devDependencies` to `eslint-plugin-jsx-a11y`, `tailwindcss`, `@types/react`, `@types/node`, `package.json`?**
  _High betweenness centrality (0.061) - this node is a cross-community bridge._
- **What connects `dmSans`, `dmMono`, `Tab` to the rest of the system?**
  _230 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.060784313725490195 - nodes in this community are weakly interconnected._
- **Should `ai-eval.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08503401360544217 - nodes in this community are weakly interconnected._
- **Should `CourseHub.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.0655367231638418 - nodes in this community are weakly interconnected._