# Graph Report - BrainTrade-Training  (2026-08-12)

## Corpus Check
- 290 files · ~160,921 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1186 nodes · 2940 edges · 92 communities (73 shown, 19 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 18 edges (avg confidence: 0.82)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `c29be81f`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- scoreColor
- ai-eval.ts
- server.ts
- agent-training/index.tsx
- server/courses.ts
- agent.ts
- TrainingPeriod
- agents.ts
- animations.ts
- EvaluatorDashboard.tsx
- db.ts
- dependencies
- PresentationViewer.tsx
- AdminDashboard.tsx
- AdjustmentsTab.tsx
- PresenterViewModal.tsx
- ReportsTab.tsx
- compilerOptions
- quiz-data.ts
- getAdminDb
- devDependencies
- scripts
- index.ts
- fsAdd
- sync-session-memory.js
- StaffTab.tsx
- session/route.ts
- ai-eval/index.tsx
- getServerUser
- seed.mjs
- Pitch Prompt
- deploy.sh
- LiveFeed.tsx
- seed-scenarios.mjs
- App Hosting Config
- next.config.ts
- debug-firebase.mjs
- slide/route.ts
- Cloud Build Pipeline
- Environment Variables
- GEMINI.md
- PresentationSystemTab.tsx
- EvaluationsTab.tsx
- seed-mock-agents.mjs
- next-env.d.ts
- git-auto-commit.sh
- CourseHub.tsx
- HRAnalyticsTab.tsx
- tailwind.config.ts
- lib/quiz/types.ts
- firebase.ts
- getGeminiModel
- package.json
- agy-start.sh
- @types/node
- FADE_IN
- @eslint/js
- @types/react
- tailwindcss
- OverviewTab.tsx
- typescript
- ensure-dev-server.js
- Karpathy Guidelines
- AgentStats
- HistorySections.tsx
- BrandingPanel.tsx
- export/route.ts
- LoginForm.tsx
- ShowcaseTab.tsx
- AgentEntry.tsx

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

## Communities (92 total, 19 thin omitted)

### Community 0 - "scoreColor"
Cohesion: 0.21
Nodes (16): ProfileHeader(), ProfileHeaderProps, DetailedEvaluation(), DetailedEvaluationProps, EvalRow(), EvaluationsDashboard(), HistoryTab(), LeaderboardTable() (+8 more)

### Community 1 - "ai-eval.ts"
Cohesion: 0.07
Nodes (32): POST(), DIFF, DIFF_ORDER, EMPTY_FORM, inputCls, textareaCls, AI_SUGGESTIONS, ScenarioForm() (+24 more)

### Community 2 - "server.ts"
Cohesion: 0.12
Nodes (24): GET(), POST(), FeedItem, GET(), EMPTY, GET(), GET(), POST() (+16 more)

### Community 3 - "agent-training/index.tsx"
Cohesion: 0.19
Nodes (19): BackgroundEffects, AgentTrainingHub(), CongratulationsCard, Props, ModuleCard, ModuleCardProps, ModuleHeader, ModuleHeaderProps (+11 more)

### Community 4 - "server/courses.ts"
Cohesion: 0.30
Nodes (6): GET(), GET(), LearnPageContent(), LearnIndexPage(), getCourseModule(), getCourseModules()

### Community 5 - "agent.ts"
Cohesion: 0.06
Nodes (44): AiEvalLayout(), DashboardLayout(), DashboardPage(), dmMono, dmSans, LearnLayout(), QuizLayout(), C (+36 more)

### Community 6 - "TrainingPeriod"
Cohesion: 0.12
Nodes (30): LivePulse(), DayRecordForm, DayRecordFormProps, DaysTab(), DaysTabProps, DisciplineSubTabProps, DisciplineTab(), NewPeriodModal() (+22 more)

### Community 7 - "agents.ts"
Cohesion: 0.12
Nodes (23): GET(), POST(), GET(), GET(), GET(), QuizResult, buildAiEval(), computeBadge() (+15 more)

### Community 8 - "animations.ts"
Cohesion: 0.13
Nodes (15): EntryAvatar(), EntryAvatarProps, MobileHeader(), MobileHeaderProps, MobileModuleChips(), ModuleChip, MODULES, ModuleItem (+7 more)

### Community 9 - "EvaluatorDashboard.tsx"
Cohesion: 0.16
Nodes (23): EvaluatorPageContent(), AgentPerformancePanel(), EvalForm(), EvalFormProps, EvalHistoryCard(), EvalHistoryCardProps, EvaluatorDashboard(), EvaluatorDashboardProps (+15 more)

### Community 10 - "db.ts"
Cohesion: 0.09
Nodes (34): DELETE, PATCH, GET, POST, DELETE(), PATCH(), POST(), defaults() (+26 more)

### Community 11 - "dependencies"
Cohesion: 0.09
Nodes (23): firebase, firebase-admin, framer-motion, @google-cloud/storage, lucide-react, next, next-intl, nodemailer (+15 more)

### Community 12 - "PresentationViewer.tsx"
Cohesion: 0.23
Nodes (12): PresentationControls(), PresentationControlsProps, PresentationViewer(), PresentationViewerProps, slideKey(), usePresentation(), viewedKey(), CourseModule (+4 more)

### Community 13 - "AdminDashboard.tsx"
Cohesion: 0.08
Nodes (28): AdminPageContent(), AdminHeader(), AdminHeaderProps, AdminSidebar(), AdminSidebarProps, NavGroupProps, AdminTabContent(), AdminTabContentProps (+20 more)

### Community 14 - "AdjustmentsTab.tsx"
Cohesion: 0.09
Nodes (29): AiEvalConfig, AiEvalEditor(), LearnConfig, LearnEditor(), LearnModule, PresentationInfo, OverridesManager(), QuizDefinition (+21 more)

### Community 15 - "PresenterViewModal.tsx"
Cohesion: 0.56
Nodes (6): DrawingCanvas(), DrawingCanvasProps, PresenterViewModalProps, DrawingPath, LiveSessionState, Point

### Community 16 - "ReportsTab.tsx"
Cohesion: 0.53
Nodes (4): getCompletionStatus(), ReportsTab(), statusPill(), fetchWithCache()

### Community 17 - "compilerOptions"
Cohesion: 0.07
Nodes (27): dom, dom.iterable, esnext, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules, **/*.ts (+19 more)

### Community 18 - "quiz-data.ts"
Cohesion: 0.07
Nodes (57): ConfettiBurst(), getNextRankProgress(), getRankForXp(), playGamifiedSound(), RankInfo, RANKS, SoundWaveIndicator(), triggerHaptic() (+49 more)

### Community 19 - "getAdminDb"
Cohesion: 0.13
Nodes (21): POST(), GET(), GET(), PATCH(), GET(), maxDuration, POST(), GET() (+13 more)

### Community 20 - "devDependencies"
Cohesion: 0.10
Nodes (21): autoprefixer, babel-plugin-react-compiler, eslint, eslint-config-next, @eslint/eslintrc, eslint-plugin-jsx-a11y, eslint-plugin-react-hooks, devDependencies (+13 more)

### Community 21 - "scripts"
Cohesion: 0.17
Nodes (12): scripts, agy:check, agy:commit, agy:start, build, check, dev, dev:auto (+4 more)

### Community 22 - "index.ts"
Cohesion: 0.17
Nodes (11): ApprovalsTab(), AgentProgress, ApprovalActionType, ApprovalRequest, EvaluationCriteria, EvaluationSessionType, Evaluator, LiveSessionRecord (+3 more)

### Community 23 - "fsAdd"
Cohesion: 0.17
Nodes (14): POST(), defaults(), GET(), POST(), ProgressRecord, POST(), fsAdd(), fsGet() (+6 more)

### Community 24 - "sync-session-memory.js"
Cohesion: 0.38
Nodes (6): { execSync }, fs, getRecentBranch(), getRecentGitCommits(), path, syncSessionMemory()

### Community 25 - "StaffTab.tsx"
Cohesion: 0.21
Nodes (7): BulkImportModal(), BulkImportModalProps, AccessNotes(), AgentSection(), EditState, ROLE_COLORS, StaffSection()

### Community 26 - "session/route.ts"
Cohesion: 0.20
Nodes (10): POST(), POST(), normalizeName(), POST(), createCustomTokenSafe(), POST(), setSession(), fsGetWhere() (+2 more)

### Community 27 - "ai-eval/index.tsx"
Cohesion: 0.10
Nodes (23): AuditFlow(), AuditFlowProps, CallSimulatorHud(), CallSimulatorHudProps, ChatView, CoachingCard, ScoreTrend, AiEvaluation() (+15 more)

### Community 28 - "getServerUser"
Cohesion: 0.16
Nodes (23): DELETE(), GET(), POST(), POST(), GET(), POST(), POST(), POST() (+15 more)

### Community 29 - "seed.mjs"
Cohesion: 0.39
Nodes (7): __dirname, envPath, initAdmin(), main(), seedAdmin(), seedQuizzes(), seedScenarios()

### Community 33 - "seed-scenarios.mjs"
Cohesion: 0.40
Nodes (5): __dirname, envPath, FULL_CURRICULUM_SCENARIOS, initAdmin(), seed()

### Community 38 - "slide/route.ts"
Cohesion: 0.67
Nodes (3): GET(), getSlideIds(), slideIdCache

### Community 50 - "PresentationSystemTab.tsx"
Cohesion: 0.15
Nodes (11): DiagnosticResult, DiagnosticRunner(), HealthManager(), PresenterViewModal(), PresentationSystemTab(), PresentationSystemTabProps, TrainerPanelProps, TrainingSubDomain (+3 more)

### Community 51 - "EvaluationsTab.tsx"
Cohesion: 0.21
Nodes (9): ActiveBatchHeader(), ActiveBatchHeaderProps, ArchiveSelectionGrid(), ArchiveSelectionGridProps, EvaluationsDashboardProps, AdminEval, EvalTab, useEvaluationsData() (+1 more)

### Community 52 - "seed-mock-agents.mjs"
Cohesion: 0.40
Nodes (5): __dirname, envPath, initAdmin(), MOCKUP_AGENTS, seed()

### Community 55 - "CourseHub.tsx"
Cohesion: 0.12
Nodes (19): CourseCard, CourseCardProps, CourseHeader, CourseHeaderProps, CourseHub(), LanguagePicker, LanguagePickerProps, PlaceholderCard (+11 more)

### Community 56 - "HRAnalyticsTab.tsx"
Cohesion: 0.28
Nodes (5): HRAnalyticsTab(), AiSkillGapReport(), CRITERIA_MAP, SkillGapItem, deriveSteps()

### Community 71 - "lib/quiz/types.ts"
Cohesion: 0.22
Nodes (8): Language, PASS_THRESHOLD, QuestionData, QuestionType, QuizDefinition, QuizPhase, QuizUIOverrides, UI_STRINGS

### Community 72 - "firebase.ts"
Cohesion: 0.22
Nodes (5): Tab, auth, db, firebaseConfig, rtdb

### Community 73 - "getGeminiModel"
Cohesion: 0.07
Nodes (26): maxDuration, POST(), POST(), POST(), AgentSkillRow, CohortHeatmap(), CohortHeatmapProps, DEFAULT_ROWS (+18 more)

### Community 74 - "package.json"
Cohesion: 0.50
Nodes (3): name, private, version

### Community 77 - "FADE_IN"
Cohesion: 0.32
Nodes (5): Confetti, CongratulationsCard, CongratulationsCardProps, TrophyHero, FADE_IN

### Community 81 - "OverviewTab.tsx"
Cohesion: 0.24
Nodes (9): AgentDetailModal(), CompletionGrid(), CompletionGridProps, KpiSection(), KpiSectionProps, TrainingWavesSection(), TrainingWavesSectionProps, KpiCard() (+1 more)

### Community 83 - "ensure-dev-server.js"
Cohesion: 0.32
Nodes (7): checkServerReady(), ensureDevServer(), fs, http, logStderr(), path, { spawn, execSync }

### Community 84 - "Karpathy Guidelines"
Cohesion: 0.33
Nodes (5): 1. Think Before Coding, 2. Simplicity First, 3. Surgical Changes, 4. Goal-Driven Execution, Karpathy Guidelines

### Community 85 - "AgentStats"
Cohesion: 0.24
Nodes (13): GraduationRoster(), GraduationRosterProps, STATUS_ORDER, LeaderboardTableProps, StatusPipeline(), AgentPerformancePanelProps, OverviewPanel(), CompletionConfig (+5 more)

### Community 86 - "HistorySections.tsx"
Cohesion: 0.33
Nodes (6): BypassModal(), BypassModalProps, DetailedAiEvalHistory(), DetailedHumanEvaluations(), DetailedQuizHistory(), requestOverride()

### Community 87 - "BrandingPanel.tsx"
Cohesion: 0.28
Nodes (6): BrandingPanel(), MODULES, STATS_CONFIG, FloatingDecoration(), StatCounter(), StatCounterProps

### Community 88 - "export/route.ts"
Cohesion: 0.36
Nodes (7): AMBER, buildIndividualSheet(), buildOverviewSheet(), GET(), GREEN, RED, scoreFill()

### Community 89 - "LoginForm.tsx"
Cohesion: 0.38
Nodes (5): DEV_MOCK_AGENTS, DevMockAgent, DevMockupSelector(), LoginForm(), LoginFormProps

### Community 92 - "AgentEntry.tsx"
Cohesion: 0.22
Nodes (10): getInitials(), normalizeName(), ReturningUserBanner(), ReturningUserBannerProps, normalizeName(), useAgentEntry(), AgentEntry(), AgentEntryProps (+2 more)

## Knowledge Gaps
- **277 isolated node(s):** `dmSans`, `dmMono`, `Tab`, `ICON_MAP`, `C` (+272 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **19 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `dependencies` to `getGeminiModel`, `package.json`, `PresentationViewer.tsx`, `ai-eval.ts`?**
  _High betweenness centrality (0.084) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `devDependencies` to `package.json`, `@types/node`, `@eslint/js`, `@types/react`, `tailwindcss`, `typescript`?**
  _High betweenness centrality (0.048) - this node is a cross-community bridge._
- **Why does `react` connect `PresentationViewer.tsx` to `HRAnalyticsTab.tsx`, `dependencies`, `agent-training/index.tsx`?**
  _High betweenness centrality (0.042) - this node is a cross-community bridge._
- **What connects `dmSans`, `dmMono`, `Tab` to the rest of the system?**
  _277 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `ai-eval.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07329462989840348 - nodes in this community are weakly interconnected._
- **Should `server.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.12310606060606061 - nodes in this community are weakly interconnected._
- **Should `agent.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05970149253731343 - nodes in this community are weakly interconnected._