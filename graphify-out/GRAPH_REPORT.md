# Graph Report - BrainTrade-Training  (2026-08-08)

## Corpus Check
- 281 files · ~143,859 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1141 nodes · 2807 edges · 85 communities (71 shown, 14 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 17 edges (avg confidence: 0.82)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `8ff46a90`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- scoreColor
- ai-eval.ts
- CourseHub.tsx
- agent-training/index.tsx
- EvaluatorDashboard.tsx
- agent.ts
- TrainingPeriod
- agents.ts
- animations.ts
- CohortHeatmap.tsx
- approval-service.ts
- index.ts
- CertificateModal.tsx
- AdminDashboard.tsx
- LearnEditor.tsx
- server.ts
- AdjustmentsTab.tsx
- compilerOptions
- quiz-data.ts
- getAdminDb
- devDependencies
- StaffTab.tsx
- Dashboard.tsx
- getServerUser
- sync-session-memory.js
- react
- ReturningUserBanner.tsx
- ai-eval/index.tsx
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
- OverviewPanel.tsx
- db.ts
- seed-mock-agents.mjs
- next-env.d.ts
- git-auto-commit.sh
- AgentStats
- dependencies
- tailwind.config.ts
- SemanticAuditService
- telesales-coaching.ts
- lib/constants.ts
- semantic-audit-service.ts
- agy-start.sh
- session/route.ts
- CongratulationsCard.tsx
- server/courses.ts
- ReportsTab.tsx
- usePresentation.ts
- EvaluationsTab.tsx
- HistorySections.tsx
- ensure-dev-server.js
- LoginForm.tsx

## God Nodes (most connected - your core abstractions)
1. `getAdminDb()` - 50 edges
2. `getServerUser` - 45 edges
3. `AgentStats` - 38 edges
4. `TrainingPeriod` - 27 edges
5. `fsSet()` - 26 edges
6. `fsGetAll()` - 24 edges
7. `getAgentSession()` - 24 edges
8. `scoreColor()` - 23 edges
9. `fsUpdate()` - 23 edges
10. `updateAgentOverallScore()` - 23 edges

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

## Communities (85 total, 14 thin omitted)

### Community 0 - "scoreColor"
Cohesion: 0.18
Nodes (18): ProfileHeader(), AgentDetailModal(), ApprovalsTab(), DetailedEvaluation(), DetailedEvaluationProps, EvalRow(), EvaluationsDashboard(), EvaluationsDashboardProps (+10 more)

### Community 1 - "ai-eval.ts"
Cohesion: 0.05
Nodes (39): AMBER, buildIndividualSheet(), buildOverviewSheet(), GET(), GREEN, RED, scoreFill(), POST() (+31 more)

### Community 2 - "CourseHub.tsx"
Cohesion: 0.15
Nodes (18): CourseCard, CourseCardProps, CourseHeader, CourseHeaderProps, LanguagePicker, LanguagePickerProps, PlaceholderCard, PlaceholderCardProps (+10 more)

### Community 3 - "agent-training/index.tsx"
Cohesion: 0.18
Nodes (19): HRAnalyticsTab(), BackgroundEffects, AgentTrainingHub(), CongratulationsCard, ModuleCard, ModuleCardProps, ModuleHeader, ProfileSidebar (+11 more)

### Community 4 - "EvaluatorDashboard.tsx"
Cohesion: 0.16
Nodes (23): EvaluatorPageContent(), AgentPerformancePanel(), EvalForm(), EvalFormProps, EvalHistoryCard(), EvalHistoryCardProps, EvaluatorDashboard(), EvaluatorDashboardProps (+15 more)

### Community 5 - "agent.ts"
Cohesion: 0.07
Nodes (43): AiEvalLayout(), DashboardLayout(), DashboardPage(), dmMono, dmSans, LearnLayout(), QuizLayout(), normalizeName() (+35 more)

### Community 6 - "TrainingPeriod"
Cohesion: 0.09
Nodes (36): Tab, LivePulse(), DayRecordForm, DayRecordFormProps, DaysTab(), DaysTabProps, DisciplineSubTabProps, DisciplineTab() (+28 more)

### Community 7 - "agents.ts"
Cohesion: 0.13
Nodes (21): POST(), GET(), GET(), GET(), QuizResult, buildAiEval(), computeBadge(), computeOverallScore() (+13 more)

### Community 8 - "animations.ts"
Cohesion: 0.15
Nodes (16): EntryAvatar(), EntryAvatarProps, MobileHeader(), MobileHeaderProps, MobileModuleChips(), ModuleChip, MODULES, AgentEntry() (+8 more)

### Community 9 - "CohortHeatmap.tsx"
Cohesion: 0.33
Nodes (5): AgentSkillRow, CohortHeatmap(), CohortHeatmapProps, DEFAULT_ROWS, CoachingBrief

### Community 10 - "approval-service.ts"
Cohesion: 0.15
Nodes (19): DELETE, PATCH, GET, POST, POST(), DELETE(), PATCH(), GET (+11 more)

### Community 11 - "index.ts"
Cohesion: 0.14
Nodes (17): CompletionGrid(), CompletionGridProps, KpiSection(), KpiSectionProps, TrainingWavesSection(), TrainingWavesSectionProps, AdminOverviewData, AgentProgress (+9 more)

### Community 12 - "CertificateModal.tsx"
Cohesion: 0.29
Nodes (5): CertificateConfig, DEFAULT_CERT_CONFIG, COLOR_PRESETS, CertificateModal(), CertificateModalProps

### Community 13 - "AdminDashboard.tsx"
Cohesion: 0.11
Nodes (23): AdminPageContent(), AdminHeader(), AdminHeaderProps, AdminSidebar(), AdminSidebarProps, NavGroupProps, AdminTabContent(), AdminTabContentProps (+15 more)

### Community 14 - "LearnEditor.tsx"
Cohesion: 0.15
Nodes (16): AiEvalConfig, AiEvalEditor(), LearnConfig, LearnEditor(), LearnModule, PresentationInfo, QuizDefinition, QuizQuestion (+8 more)

### Community 15 - "server.ts"
Cohesion: 0.13
Nodes (23): GET(), POST(), POST(), DELETE(), PATCH(), GET(), POST(), GET() (+15 more)

### Community 16 - "AdjustmentsTab.tsx"
Cohesion: 0.16
Nodes (11): OverridesManager(), FeaturesConfig, SystemEditor(), AdjustmentsTab(), ConfigType, TABS, SkeletonProps, SkeletonTable() (+3 more)

### Community 17 - "compilerOptions"
Cohesion: 0.07
Nodes (27): dom, dom.iterable, esnext, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules, **/*.ts (+19 more)

### Community 18 - "quiz-data.ts"
Cohesion: 0.06
Nodes (51): C, ICON_MAP, QuizIndexPage(), QuizSystem(), QuizBriefing, reveal, PhaseBreakdown, PhaseBreakdownProps (+43 more)

### Community 19 - "getAdminDb"
Cohesion: 0.18
Nodes (17): GET(), PATCH(), GET(), maxDuration, POST(), GET(), GET(), fsIncrement() (+9 more)

### Community 20 - "devDependencies"
Cohesion: 0.04
Nodes (46): autoprefixer, babel-plugin-react-compiler, eslint, eslint-config-next, @eslint/eslintrc, @eslint/js, eslint-plugin-jsx-a11y, eslint-plugin-react-hooks (+38 more)

### Community 21 - "StaffTab.tsx"
Cohesion: 0.21
Nodes (7): BulkImportModal(), BulkImportModalProps, AccessNotes(), AgentSection(), EditState, ROLE_COLORS, StaffSection()

### Community 22 - "Dashboard.tsx"
Cohesion: 0.15
Nodes (10): BrandingPanel(), MODULES, STATS_CONFIG, FloatingDecoration(), ModuleItem, MODULES, BrandedTitle(), BrandedTitleProps (+2 more)

### Community 23 - "getServerUser"
Cohesion: 0.17
Nodes (23): DELETE(), GET(), POST(), GET(), POST(), GET(), POST(), POST() (+15 more)

### Community 24 - "sync-session-memory.js"
Cohesion: 0.38
Nodes (6): { execSync }, fs, getRecentBranch(), getRecentGitCommits(), path, syncSessionMemory()

### Community 25 - "react"
Cohesion: 0.29
Nodes (6): AiSkillGapReport(), CRITERIA_MAP, SkillGapItem, PresentationViewer(), react, react

### Community 26 - "ReturningUserBanner.tsx"
Cohesion: 0.60
Nodes (4): getInitials(), normalizeName(), ReturningUserBanner(), ReturningUserBannerProps

### Community 27 - "ai-eval/index.tsx"
Cohesion: 0.08
Nodes (30): DiagnosticResult, DiagnosticRunner(), HealthManager(), AuditFlow(), AuditFlowProps, CallSimulatorHud(), CallSimulatorHudProps, ChatView (+22 more)

### Community 28 - "fsGetAll"
Cohesion: 0.23
Nodes (10): FeedItem, GET(), EMPTY, GET(), normalizeName(), POST(), fsCount(), fsGetAll() (+2 more)

### Community 29 - "seed.mjs"
Cohesion: 0.39
Nodes (7): __dirname, envPath, initAdmin(), main(), seedAdmin(), seedQuizzes(), seedScenarios()

### Community 33 - "seed-scenarios.mjs"
Cohesion: 0.40
Nodes (5): __dirname, envPath, FULL_CURRICULUM_SCENARIOS, initAdmin(), seed()

### Community 50 - "OverviewPanel.tsx"
Cohesion: 0.23
Nodes (10): GraduationRoster(), STATUS_ORDER, StatusPipeline(), OverviewPanel(), OverviewPanelProps, CompletionConfig, CompletionInfo, CompletionStatus (+2 more)

### Community 51 - "db.ts"
Cohesion: 0.11
Nodes (22): DELETE(), GET(), PATCH(), POST(), defaults(), POST(), ProgressRecord, MOCKUP_AGENTS (+14 more)

### Community 52 - "seed-mock-agents.mjs"
Cohesion: 0.40
Nodes (5): __dirname, envPath, initAdmin(), MOCKUP_AGENTS, seed()

### Community 55 - "AgentStats"
Cohesion: 0.23
Nodes (11): ProfileHeaderProps, GraduationRosterProps, LeaderboardTable(), LeaderboardTableProps, BadgePill(), Props, ModuleHeaderProps, AgentPerformancePanelProps (+3 more)

### Community 56 - "dependencies"
Cohesion: 0.09
Nodes (23): firebase, firebase-admin, framer-motion, @google-cloud/storage, lucide-react, next, next-intl, nodemailer (+15 more)

### Community 72 - "telesales-coaching.ts"
Cohesion: 0.33
Nodes (7): POST(), @google/generative-ai, generateText(), getGeminiModel(), getOpenAI(), generateCoachingBrief(), @google/generative-ai

### Community 73 - "lib/constants.ts"
Cohesion: 0.28
Nodes (7): DEFAULT_GEMINI_MODEL, DEFAULT_LOCALE, DEFAULT_OPENAI_MODEL, SCORE_THRESHOLDS, SUPPORTED_LOCALES, SupportedLocale, config

### Community 74 - "semantic-audit-service.ts"
Cohesion: 0.31
Nodes (6): POST(), maxDuration, POST(), getGeminiModel(), getOpenAI(), SemanticAuditResult

### Community 76 - "session/route.ts"
Cohesion: 0.27
Nodes (8): POST(), GET(), createCustomTokenSafe(), POST(), setSession(), fsGetWhere(), getAdminAuth(), makeSessionToken()

### Community 77 - "CongratulationsCard.tsx"
Cohesion: 0.38
Nodes (4): Confetti, CongratulationsCard, CongratulationsCardProps, TrophyHero

### Community 78 - "server/courses.ts"
Cohesion: 0.30
Nodes (6): GET(), GET(), LearnPageContent(), LearnIndexPage(), getCourseModule(), getCourseModules()

### Community 79 - "ReportsTab.tsx"
Cohesion: 0.24
Nodes (9): getCompletionStatus(), ReportsTab(), statusPill(), CourseHub(), cache, CacheEntry, fetchWithCache(), invalidateCache() (+1 more)

### Community 80 - "usePresentation.ts"
Cohesion: 0.29
Nodes (9): DrawingCanvas(), DrawingCanvasProps, slideKey(), usePresentation(), viewedKey(), DrawingPath, LiveSessionState, Point (+1 more)

### Community 81 - "EvaluationsTab.tsx"
Cohesion: 0.25
Nodes (7): ActiveBatchHeader(), ActiveBatchHeaderProps, ArchiveSelectionGrid(), ArchiveSelectionGridProps, EvalTab, useEvaluationsData(), EvaluationsTab()

### Community 82 - "HistorySections.tsx"
Cohesion: 0.33
Nodes (6): BypassModal(), BypassModalProps, DetailedAiEvalHistory(), DetailedHumanEvaluations(), DetailedQuizHistory(), requestOverride()

### Community 83 - "ensure-dev-server.js"
Cohesion: 0.32
Nodes (7): checkServerReady(), ensureDevServer(), fs, http, logStderr(), path, { spawn, execSync }

### Community 84 - "LoginForm.tsx"
Cohesion: 0.38
Nodes (5): DEV_MOCK_AGENTS, DevMockAgent, DevMockupSelector(), LoginForm(), LoginFormProps

## Knowledge Gaps
- **261 isolated node(s):** `dmSans`, `dmMono`, `Tab`, `ICON_MAP`, `C` (+256 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **14 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `dependencies` to `telesales-coaching.ts`, `react`, `devDependencies`, `ai-eval.ts`?**
  _High betweenness centrality (0.088) - this node is a cross-community bridge._
- **Why does `react` connect `react` to `dependencies`, `agent-training/index.tsx`?**
  _High betweenness centrality (0.046) - this node is a cross-community bridge._
- **Why does `AgentStats` connect `AgentStats` to `scoreColor`, `ai-eval.ts`, `CourseHub.tsx`, `agent-training/index.tsx`, `EvaluatorDashboard.tsx`, `agent.ts`, `TrainingPeriod`, `agents.ts`, `index.ts`, `ReportsTab.tsx`, `HistorySections.tsx`, `OverviewPanel.tsx`, `getServerUser`, `fsGetAll`?**
  _High betweenness centrality (0.036) - this node is a cross-community bridge._
- **What connects `dmSans`, `dmMono`, `Tab` to the rest of the system?**
  _261 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `ai-eval.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.053994732221246705 - nodes in this community are weakly interconnected._
- **Should `CourseHub.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.14624505928853754 - nodes in this community are weakly interconnected._
- **Should `agent.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06554019457245264 - nodes in this community are weakly interconnected._