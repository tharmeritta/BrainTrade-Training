# Graph Report - BrainTrade-Training  (2026-08-08)

## Corpus Check
- 280 files · ~143,558 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1132 nodes · 2797 edges · 77 communities (63 shown, 14 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 15 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `692d6a0a`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- AgentStats
- ai-eval.ts
- CourseHub.tsx
- agent-training/index.tsx
- EvaluatorDashboard.tsx
- agent.ts
- index.ts
- agents.ts
- AgentEntry.tsx
- telesales-coaching.ts
- approval-service.ts
- quiz-data.ts
- certificate-config/route.ts
- AdminDashboard.tsx
- AdjustmentsTab.tsx
- server.ts
- getCanonicalQuizKey
- compilerOptions
- quiz/index.tsx
- firebase-admin.ts
- devDependencies
- StaffTab.tsx
- BrandingPanel.tsx
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
- ScenarioPicker.tsx
- getServerUser
- seed-mock-agents.mjs
- next-env.d.ts
- git-auto-commit.sh
- export/route.ts
- dependencies
- tailwind.config.ts
- SemanticAuditService
- ai.ts
- lib/constants.ts
- getGeminiModel
- agy-start.sh
- animations.ts

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

## Communities (77 total, 14 thin omitted)

### Community 0 - "AgentStats"
Cohesion: 0.07
Nodes (51): BypassModal(), BypassModalProps, DetailedAiEvalHistory(), DetailedHumanEvaluations(), DetailedQuizHistory(), requestOverride(), ProfileHeader(), ProfileHeaderProps (+43 more)

### Community 1 - "ai-eval.ts"
Cohesion: 0.06
Nodes (37): maxDuration, POST(), POST(), DELETE(), POST(), DIFF, DIFF_ORDER, EMPTY_FORM (+29 more)

### Community 2 - "CourseHub.tsx"
Cohesion: 0.07
Nodes (42): GET(), GET(), LearnPageContent(), LearnIndexPage(), OverridesManager(), CourseCard, CourseCardProps, CourseHeader (+34 more)

### Community 3 - "agent-training/index.tsx"
Cohesion: 0.22
Nodes (17): BackgroundEffects, AgentTrainingHub(), CongratulationsCard, ModuleCard, ModuleCardProps, ModuleHeader, ProfileSidebar, ProfileSidebarProps (+9 more)

### Community 4 - "EvaluatorDashboard.tsx"
Cohesion: 0.12
Nodes (32): EvaluatorPageContent(), GraduationRoster(), STATUS_ORDER, StatusPipeline(), AgentPerformancePanel(), AgentPerformancePanelProps, EvalForm(), EvalFormProps (+24 more)

### Community 5 - "agent.ts"
Cohesion: 0.06
Nodes (48): AiEvalLayout(), DashboardLayout(), DashboardPage(), dmMono, dmSans, LearnLayout(), QuizLayout(), DEV_MOCK_AGENTS (+40 more)

### Community 6 - "index.ts"
Cohesion: 0.09
Nodes (42): ActiveBatchHeader(), ActiveBatchHeaderProps, ArchiveSelectionGrid(), ArchiveSelectionGridProps, LivePulse(), DayRecordForm, DayRecordFormProps, DaysTab() (+34 more)

### Community 7 - "agents.ts"
Cohesion: 0.16
Nodes (17): GET(), POST(), GET(), buildAiEval(), computeBadge(), computeOverallScore(), EvalRecord, getAgentStats() (+9 more)

### Community 8 - "AgentEntry.tsx"
Cohesion: 0.17
Nodes (13): EntryAvatar(), EntryAvatarProps, MobileHeader(), MobileHeaderProps, MobileModuleChips(), ModuleChip, MODULES, AgentEntry() (+5 more)

### Community 9 - "telesales-coaching.ts"
Cohesion: 0.27
Nodes (7): POST(), AgentSkillRow, CohortHeatmap(), CohortHeatmapProps, DEFAULT_ROWS, CoachingBrief, generateCoachingBrief()

### Community 10 - "approval-service.ts"
Cohesion: 0.11
Nodes (25): DELETE, PATCH, GET, POST, GET(), GET(), PATCH(), GET() (+17 more)

### Community 11 - "quiz-data.ts"
Cohesion: 0.07
Nodes (23): C, ICON_MAP, QuizIndexPage(), CERT_PART1, CERT_PART2, CERT_PART3, CERT_PART4, CERT_PART5 (+15 more)

### Community 12 - "certificate-config/route.ts"
Cohesion: 0.29
Nodes (5): CertificateConfig, DEFAULT_CERT_CONFIG, COLOR_PRESETS, CertificateModal(), CertificateModalProps

### Community 13 - "AdminDashboard.tsx"
Cohesion: 0.11
Nodes (23): AdminPageContent(), AdminHeader(), AdminHeaderProps, AdminSidebar(), AdminSidebarProps, NavGroupProps, AdminTabContent(), AdminTabContentProps (+15 more)

### Community 14 - "AdjustmentsTab.tsx"
Cohesion: 0.06
Nodes (34): Tab, AiEvalConfig, AiEvalEditor(), DiagnosticResult, DiagnosticRunner(), HealthManager(), LearnConfig, LearnEditor() (+26 more)

### Community 15 - "server.ts"
Cohesion: 0.15
Nodes (23): GET(), POST(), DELETE(), PATCH(), GET(), POST(), GET(), POST() (+15 more)

### Community 16 - "getCanonicalQuizKey"
Cohesion: 0.25
Nodes (9): POST(), GET(), GET(), QuizResult, POST(), getModuleStats(), CanonicalQuizKey, getCanonicalQuizKey() (+1 more)

### Community 17 - "compilerOptions"
Cohesion: 0.07
Nodes (27): dom, dom.iterable, esnext, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules, **/*.ts (+19 more)

### Community 18 - "quiz/index.tsx"
Cohesion: 0.13
Nodes (28): QuizSystem(), QuizBriefing, reveal, PhaseBreakdown, PhaseBreakdownProps, QuizResult(), ResultView, ResultViewProps (+20 more)

### Community 19 - "firebase-admin.ts"
Cohesion: 0.19
Nodes (14): maxDuration, POST(), GET(), createCustomTokenSafe(), POST(), setSession(), fsGetWhere(), cleanEmail() (+6 more)

### Community 20 - "devDependencies"
Cohesion: 0.04
Nodes (45): autoprefixer, babel-plugin-react-compiler, eslint, eslint-config-next, @eslint/eslintrc, @eslint/js, eslint-plugin-jsx-a11y, eslint-plugin-react-hooks (+37 more)

### Community 21 - "StaffTab.tsx"
Cohesion: 0.21
Nodes (7): BulkImportModal(), BulkImportModalProps, AccessNotes(), AgentSection(), EditState, ROLE_COLORS, StaffSection()

### Community 22 - "BrandingPanel.tsx"
Cohesion: 0.28
Nodes (6): BrandingPanel(), MODULES, STATS_CONFIG, FloatingDecoration(), StatCounter(), StatCounterProps

### Community 23 - "getAdminDb"
Cohesion: 0.20
Nodes (21): DELETE(), GET(), POST(), POST(), POST(), GET(), PATCH(), POST() (+13 more)

### Community 24 - "sync-session-memory.js"
Cohesion: 0.38
Nodes (6): { execSync }, fs, getRecentBranch(), getRecentGitCommits(), path, syncSessionMemory()

### Community 25 - "HRAnalyticsTab.tsx"
Cohesion: 0.19
Nodes (8): HRAnalyticsTab(), AiSkillGapReport(), CRITERIA_MAP, SkillGapItem, StatusBadge(), StatusBadgeProps, StatusType, deriveSteps()

### Community 26 - "ReturningUserBanner.tsx"
Cohesion: 0.60
Nodes (4): getInitials(), normalizeName(), ReturningUserBanner(), ReturningUserBannerProps

### Community 27 - "ai-eval/index.tsx"
Cohesion: 0.12
Nodes (18): AuditFlow(), AuditFlowProps, CallSimulatorHud(), CallSimulatorHudProps, ChatView, CoachingCard, ScoreTrend, AiEvaluation() (+10 more)

### Community 28 - "db.ts"
Cohesion: 0.12
Nodes (16): GET(), FeedItem, GET(), EMPTY, GET(), normalizeName(), POST(), OverviewPanelProps (+8 more)

### Community 29 - "seed.mjs"
Cohesion: 0.39
Nodes (7): __dirname, envPath, initAdmin(), main(), seedAdmin(), seedQuizzes(), seedScenarios()

### Community 33 - "seed-scenarios.mjs"
Cohesion: 0.40
Nodes (5): __dirname, envPath, FULL_CURRICULUM_SCENARIOS, initAdmin(), seed()

### Community 50 - "ScenarioPicker.tsx"
Cohesion: 0.27
Nodes (7): IntroView, IntroViewProps, DIFFICULTY_MAP, ScenarioPicker, StepProgress(), ActiveAgentUI(), ActiveAgentUIProps

### Community 51 - "getServerUser"
Cohesion: 0.12
Nodes (20): DELETE(), PATCH(), POST(), defaults(), POST(), ProgressRecord, POST(), POST() (+12 more)

### Community 52 - "seed-mock-agents.mjs"
Cohesion: 0.40
Nodes (5): __dirname, envPath, initAdmin(), MOCKUP_AGENTS, seed()

### Community 55 - "export/route.ts"
Cohesion: 0.36
Nodes (7): AMBER, buildIndividualSheet(), buildOverviewSheet(), GET(), GREEN, RED, scoreFill()

### Community 56 - "dependencies"
Cohesion: 0.09
Nodes (23): firebase, firebase-admin, framer-motion, @google-cloud/storage, lucide-react, next, next-intl, nodemailer (+15 more)

### Community 72 - "ai.ts"
Cohesion: 0.38
Nodes (6): @google/generative-ai, generateText(), getGeminiModel(), getOpenAI(), DEFAULT_OPENAI_MODEL, @google/generative-ai

### Community 73 - "lib/constants.ts"
Cohesion: 0.47
Nodes (4): DEFAULT_LOCALE, SUPPORTED_LOCALES, SupportedLocale, config

### Community 74 - "getGeminiModel"
Cohesion: 0.60
Nodes (3): POST(), DEFAULT_GEMINI_MODEL, getGeminiModel()

### Community 77 - "animations.ts"
Cohesion: 0.14
Nodes (11): Confetti, CongratulationsCard, CongratulationsCardProps, TrophyHero, DashboardHeader(), ModuleItem, MODULES, BrandedTitle() (+3 more)

## Knowledge Gaps
- **256 isolated node(s):** `dmSans`, `dmMono`, `Tab`, `ICON_MAP`, `C` (+251 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **14 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `dependencies` to `ai.ts`, `ai-eval.ts`, `CourseHub.tsx`, `devDependencies`?**
  _High betweenness centrality (0.080) - this node is a cross-community bridge._
- **Why does `react` connect `CourseHub.tsx` to `dependencies`, `HRAnalyticsTab.tsx`, `agent-training/index.tsx`?**
  _High betweenness centrality (0.046) - this node is a cross-community bridge._
- **Why does `AgentStats` connect `AgentStats` to `CourseHub.tsx`, `agent-training/index.tsx`, `EvaluatorDashboard.tsx`, `agent.ts`, `index.ts`, `agents.ts`, `getAdminDb`, `export/route.ts`, `HRAnalyticsTab.tsx`, `db.ts`?**
  _High betweenness centrality (0.037) - this node is a cross-community bridge._
- **What connects `dmSans`, `dmMono`, `Tab` to the rest of the system?**
  _256 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AgentStats` be split into smaller, more focused modules?**
  _Cohesion score 0.06596035543403965 - nodes in this community are weakly interconnected._
- **Should `ai-eval.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.055900621118012424 - nodes in this community are weakly interconnected._
- **Should `CourseHub.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06836055656382335 - nodes in this community are weakly interconnected._