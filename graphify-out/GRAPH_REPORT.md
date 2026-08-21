# Graph Report - BrainTrade-Training  (2026-08-21)

## Corpus Check
- 304 files · ~176,211 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1312 nodes · 3195 edges · 93 communities (75 shown, 18 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 16 edges (avg confidence: 0.75)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `1f071f90`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- animations.ts
- RosterHub.tsx
- firebase-admin.ts
- agent-training/index.tsx
- Dashboard.tsx
- agent.ts
- TrainingPeriod
- agents.ts
- AgentEntry.tsx
- EvaluatorDashboard.tsx
- fsSet
- dependencies
- db.ts
- AdminTabContent.tsx
- AdjustmentsTab.tsx
- ScenarioForm.tsx
- server.ts
- compilerOptions
- quiz-data.ts
- scripts
- devDependencies
- export/route.ts
- index.ts
- package.json
- sync-session-memory.js
- @types/node
- AgentStats
- ai-eval/index.tsx
- getAdminDb
- seed.mjs
- Pitch Prompt
- deploy.sh
- LiveFeed.tsx
- seed-scenarios.mjs
- App Hosting Config
- next.config.ts
- debug-firebase.mjs
- lucide-react
- Cloud Build Pipeline
- Environment Variables
- GEMINI.md
- HRAnalyticsTab.tsx
- seed-mock-agents.mjs
- next-env.d.ts
- git-auto-commit.sh
- PresentationViewer.tsx
- 🎯 Core Token Reduction Strategies
- tailwind.config.ts
- lib/quiz/types.ts
- 🤝 BrainTrade Training Platform - System Handoff & Architecture Guide
- lib/constants.ts
- zod
- agy-start.sh
- LoginForm.tsx
- CongratulationsCard.tsx
- PresentationSystemTab.tsx
- @types/nodemailer
- CourseHub.tsx
- ensure-dev-server.js
- Karpathy Guidelines
- FeatureSpotlightTour.tsx
- AiEvalScenario
- server/courses.ts
- ScenarioPicker.tsx
- AiScenariosTab.tsx
- firebase.ts
- ai-eval.ts
- eslint

## God Nodes (most connected - your core abstractions)
1. `getAdminDb()` - 51 edges
2. `getServerUser` - 45 edges
3. `AgentStats` - 38 edges
4. `TrainingPeriod` - 28 edges
5. `fsSet()` - 26 edges
6. `fsAdd()` - 25 edges
7. `fsUpdate()` - 25 edges
8. `getAgentSession()` - 25 edges
9. `fsGetAll()` - 24 edges
10. `scoreColor()` - 23 edges

## Surprising Connections (you probably didn't know these)
- `AiEvalLayout()` --calls--> `getServerUser`  [EXTRACTED]
  app/[locale]/ai-eval/layout.tsx → lib/session/server.ts
- `EvaluatorPageContent()` --calls--> `getServerUser`  [EXTRACTED]
  app/[locale]/evaluator/page.tsx → lib/session/server.ts
- `LearnLayout()` --calls--> `getServerUser`  [EXTRACTED]
  app/[locale]/learn/layout.tsx → lib/session/server.ts
- `QuizLayout()` --calls--> `getServerUser`  [EXTRACTED]
  app/[locale]/quiz/layout.tsx → lib/session/server.ts
- `GET()` --calls--> `requireAdminOrManager()`  [EXTRACTED]
  app/api/admin/export-staff/route.ts → lib/session/server.ts

## Import Cycles
- None detected.

## Communities (93 total, 18 thin omitted)

### Community 0 - "animations.ts"
Cohesion: 0.18
Nodes (7): JoinWavePage(), EntryAvatarProps, ModuleHeader, BackgroundEffects, EASE, FADE_IN, STAGGER_ITEM

### Community 1 - "RosterHub.tsx"
Cohesion: 0.10
Nodes (10): BulkImportModal(), BulkImportModalProps, RosterHubProps, RosterSubTab, AccessNotes(), AgentSection(), EditState, ROLE_COLORS (+2 more)

### Community 2 - "firebase-admin.ts"
Cohesion: 0.23
Nodes (12): GET(), createCustomTokenSafe(), POST(), setSession(), fsGetWhere(), cleanEmail(), cleanId(), cleanValue() (+4 more)

### Community 3 - "agent-training/index.tsx"
Cohesion: 0.20
Nodes (17): BackgroundEffects, AgentTrainingHub(), ModuleCard, ModuleCardProps, ProfileSidebarProps, SectionDivider, QuickNextTaskBannerProps, StepTimeline (+9 more)

### Community 4 - "Dashboard.tsx"
Cohesion: 0.13
Nodes (11): BrandingPanel(), MODULES, STATS_CONFIG, FloatingDecoration(), ModuleItem, MODULES, BrandedTitle(), BrandedTitleProps (+3 more)

### Community 5 - "agent.ts"
Cohesion: 0.06
Nodes (46): AiEvalLayout(), DashboardLayout(), DashboardPage(), dmMono, dmSans, LearnLayout(), QuizLayout(), normalizeName() (+38 more)

### Community 6 - "TrainingPeriod"
Cohesion: 0.05
Nodes (39): ActiveBatchHeader(), ActiveBatchHeaderProps, ArchiveSelectionGrid(), ArchiveSelectionGridProps, LivePulse(), DayRecordForm, DayRecordFormProps, DaysTab() (+31 more)

### Community 7 - "agents.ts"
Cohesion: 0.09
Nodes (29): GET, GET(), EMPTY, GET(), GET(), POST(), GET(), GET() (+21 more)

### Community 8 - "AgentEntry.tsx"
Cohesion: 0.14
Nodes (15): AgentLoginPage(), EntryAvatar(), MobileHeader(), MobileHeaderProps, MobileModuleChips(), ModuleChip, MODULES, getInitials() (+7 more)

### Community 9 - "EvaluatorDashboard.tsx"
Cohesion: 0.11
Nodes (34): EvaluatorPageContent(), GraduationRoster(), STATUS_ORDER, StatusPipeline(), AgentPerformancePanel(), AgentPerformancePanelProps, EvalForm(), EvalFormProps (+26 more)

### Community 10 - "fsSet"
Cohesion: 0.14
Nodes (27): DELETE, PATCH, POST, DELETE(), GET(), PATCH(), POST(), POST() (+19 more)

### Community 11 - "dependencies"
Cohesion: 0.08
Nodes (25): firebase, firebase-admin, framer-motion, @google-cloud/storage, @google/generative-ai, next, next-intl, nodemailer (+17 more)

### Community 12 - "db.ts"
Cohesion: 0.16
Nodes (14): defaults(), POST(), ProgressRecord, POST(), defaults(), POST(), ProgressRecord, DELETE() (+6 more)

### Community 13 - "AdminTabContent.tsx"
Cohesion: 0.06
Nodes (37): AdminHeader(), AdminHeaderProps, AdminSidebar(), AdminSidebarProps, AdminTabContent(), AdminTabContentProps, TAB_REGISTRY, AnalyticsHubProps (+29 more)

### Community 14 - "AdjustmentsTab.tsx"
Cohesion: 0.08
Nodes (32): AiEvalConfig, AiEvalEditor(), LearnConfig, LearnEditor(), LearnModule, PresentationInfo, OverridesManager(), QuizDefinition (+24 more)

### Community 15 - "ScenarioForm.tsx"
Cohesion: 0.22
Nodes (10): DIFF, DIFF_ORDER, EMPTY_FORM, inputCls, textareaCls, AI_SUGGESTIONS, ScenarioCard(), AiScenariosTab() (+2 more)

### Community 16 - "server.ts"
Cohesion: 0.11
Nodes (27): GET(), POST(), POST(), FeedItem, GET(), DELETE(), PATCH(), GET() (+19 more)

### Community 17 - "compilerOptions"
Cohesion: 0.07
Nodes (27): dom, dom.iterable, esnext, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules, **/*.ts (+19 more)

### Community 18 - "quiz-data.ts"
Cohesion: 0.06
Nodes (73): C, ICON_MAP, QuizIndexPage(), ProfileSidebar, QuickNextTaskBanner, ArcadeStageCard(), ArcadeStageCardProps, ConfettiBurst() (+65 more)

### Community 19 - "scripts"
Cohesion: 0.17
Nodes (12): scripts, agy:check, agy:commit, agy:start, build, check, dev, dev:auto (+4 more)

### Community 20 - "devDependencies"
Cohesion: 0.08
Nodes (25): autoprefixer, babel-plugin-react-compiler, eslint-config-next, @eslint/eslintrc, @eslint/js, eslint-plugin-jsx-a11y, eslint-plugin-react-hooks, devDependencies (+17 more)

### Community 21 - "export/route.ts"
Cohesion: 0.36
Nodes (7): AMBER, buildIndividualSheet(), buildOverviewSheet(), GET(), GREEN, RED, scoreFill()

### Community 22 - "index.ts"
Cohesion: 0.09
Nodes (21): GET(), GET(), GET(), MOCKUP_AGENTS, POST(), POST(), normalizeName(), POST() (+13 more)

### Community 23 - "package.json"
Cohesion: 0.50
Nodes (3): name, private, version

### Community 24 - "sync-session-memory.js"
Cohesion: 0.38
Nodes (6): { execSync }, fs, getRecentBranch(), getRecentGitCommits(), path, syncSessionMemory()

### Community 26 - "AgentStats"
Cohesion: 0.07
Nodes (50): BypassModal(), BypassModalProps, DetailedAiEvalHistory(), DetailedHumanEvaluations(), DetailedQuizHistory(), requestOverride(), ProfileHeader(), ProfileHeaderProps (+42 more)

### Community 27 - "ai-eval/index.tsx"
Cohesion: 0.13
Nodes (17): AuditFlow(), CallSimulatorHud(), CallSimulatorHudProps, ChatView, CoachingCard, SCORE_STYLE(), ScoreTrend, AiEvaluation() (+9 more)

### Community 28 - "getAdminDb"
Cohesion: 0.13
Nodes (26): DELETE(), GET(), POST(), POST(), POST(), POST(), POST(), GET() (+18 more)

### Community 29 - "seed.mjs"
Cohesion: 0.39
Nodes (7): __dirname, envPath, initAdmin(), main(), seedAdmin(), seedQuizzes(), seedScenarios()

### Community 33 - "seed-scenarios.mjs"
Cohesion: 0.40
Nodes (5): __dirname, envPath, FULL_CURRICULUM_SCENARIOS, initAdmin(), seed()

### Community 51 - "HRAnalyticsTab.tsx"
Cohesion: 0.24
Nodes (6): HRAnalyticsTab(), exportToCSV(), AiSkillGapReport(), CRITERIA_MAP, SkillGapItem, deriveSteps()

### Community 52 - "seed-mock-agents.mjs"
Cohesion: 0.40
Nodes (5): __dirname, envPath, initAdmin(), MOCKUP_AGENTS, seed()

### Community 55 - "PresentationViewer.tsx"
Cohesion: 0.17
Nodes (19): CourseCardProps, DrawingCanvas(), DrawingCanvasProps, PresentationControls(), PresentationControlsProps, PresentationHeader(), PresentationHeaderProps, PresentationViewerProps (+11 more)

### Community 56 - "🎯 Core Token Reduction Strategies"
Cohesion: 0.22
Nodes (8): 1. Flash-Tier Subagent Delegation for File Operations, 2. Knowledge Graph & Handoff Memory Lookups, 3. Tight Line-Range Slicing (`view_file`), 4. Subagent Handoff & State Synchronization Protocol, 5. Safe Context Compaction Protocol, 🎯 Core Token Reduction Strategies, ⚙️ Recommended Local Compaction Config (`.gemini/settings.json`), Token Optimization & Subagent Handoff Skill

### Community 71 - "lib/quiz/types.ts"
Cohesion: 0.22
Nodes (8): Language, PASS_THRESHOLD, QuestionData, QuestionType, QuizDefinition, QuizPhase, QuizUIOverrides, UI_STRINGS

### Community 72 - "🤝 BrainTrade Training Platform - System Handoff & Architecture Guide"
Cohesion: 0.14
Nodes (13): 1. Anti-Hardcoding Rules (Mandatory Compliance), 1. Executive Summary & Current Project State, 2. Audio & Haptic User Feedback, 2. Directory Architecture & Topology, 3. Core Architectural Conventions & Guidelines, 3. Session & Access Control, 4. Primary Knowledge Graph God Nodes (Graphify), 5. Outstanding Tasks & Roadmap for `hands-on-agent` (+5 more)

### Community 73 - "lib/constants.ts"
Cohesion: 0.07
Nodes (25): POST(), maxDuration, POST(), POST(), POST(), AgentSkillRow, CohortHeatmap(), CohortHeatmapProps (+17 more)

### Community 76 - "LoginForm.tsx"
Cohesion: 0.38
Nodes (5): DEV_MOCK_AGENTS, DevMockAgent, DevMockupSelector(), LoginForm(), LoginFormProps

### Community 77 - "CongratulationsCard.tsx"
Cohesion: 0.32
Nodes (5): Confetti, CongratulationsCard, CongratulationsCardProps, TrophyHero, CongratulationsCard

### Community 78 - "PresentationSystemTab.tsx"
Cohesion: 0.19
Nodes (11): DiagnosticResult, DiagnosticRunner(), HealthManager(), slideKey(), usePresentation(), viewedKey(), PresentationSystemTab(), PresentationSystemTabProps (+3 more)

### Community 82 - "CourseHub.tsx"
Cohesion: 0.15
Nodes (13): CourseCard, CourseHeader, CourseHeaderProps, CourseHub(), LanguagePicker, LanguagePickerProps, PlaceholderCard, PlaceholderCardProps (+5 more)

### Community 83 - "ensure-dev-server.js"
Cohesion: 0.32
Nodes (7): checkServerReady(), ensureDevServer(), fs, http, logStderr(), path, { spawn, execSync }

### Community 84 - "Karpathy Guidelines"
Cohesion: 0.33
Nodes (5): 1. Think Before Coding, 2. Simplicity First, 3. Surgical Changes, 4. Goal-Driven Execution, Karpathy Guidelines

### Community 85 - "FeatureSpotlightTour.tsx"
Cohesion: 0.33
Nodes (5): DEFAULT_STEPS, ElementRect, FeatureSpotlightTour(), FeatureSpotlightTourProps, SpotlightStep

### Community 86 - "AiEvalScenario"
Cohesion: 0.33
Nodes (4): POST(), AiEvalService, AiEvalScenario, AiEvalSession

### Community 87 - "server/courses.ts"
Cohesion: 0.24
Nodes (8): GET(), GET(), LearnPageContent(), LearnIndexPage(), PresentationViewer(), fetchCourseModulesFromDb(), getCourseModule(), getCourseModules

### Community 88 - "ScenarioPicker.tsx"
Cohesion: 0.21
Nodes (10): AuditFlowProps, IntroView, IntroViewProps, DIFFICULTY_MAP, ScenarioPicker, ScenarioPickerProps, StepProgress(), EvalScenario (+2 more)

### Community 89 - "AiScenariosTab.tsx"
Cohesion: 0.22
Nodes (9): ScenarioForm(), PRESET_TEMPLATES, AiScenarioImportModal(), AiScenarioImportModalProps, DIFF_STYLES, AI_SCENARIO_TEMPLATE, DEFAULT_CRITERIA, downloadScenarioTemplate() (+1 more)

### Community 90 - "firebase.ts"
Cohesion: 0.18
Nodes (6): LoginPage(), Tab, auth, db, firebaseConfig, rtdb

### Community 91 - "ai-eval.ts"
Cohesion: 0.22
Nodes (6): SandboxManagerModalProps, AiEvalScenarioSchema, AiEvalTurnResponseSchema, LocalizedString, ScenarioChoice, ScenarioSubmitResult

## Knowledge Gaps
- **301 isolated node(s):** `dmSans`, `dmMono`, `Tab`, `ICON_MAP`, `C` (+296 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **18 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getAdminDb()` connect `getAdminDb` to `firebase-admin.ts`, `agents.ts`, `lib/constants.ts`, `fsSet`, `db.ts`, `server.ts`, `index.ts`, `server/courses.ts`?**
  _High betweenness centrality (0.028) - this node is a cross-community bridge._
- **Why does `AgentStats` connect `AgentStats` to `animations.ts`, `agent-training/index.tsx`, `agent.ts`, `TrainingPeriod`, `agents.ts`, `EvaluatorDashboard.tsx`, `CourseHub.tsx`, `HRAnalyticsTab.tsx`, `export/route.ts`, `index.ts`, `getAdminDb`?**
  _High betweenness centrality (0.026) - this node is a cross-community bridge._
- **Why does `getAgentSession()` connect `agent.ts` to `Dashboard.tsx`, `PresentationSystemTab.tsx`, `quiz-data.ts`, `CourseHub.tsx`, `ai-eval/index.tsx`?**
  _High betweenness centrality (0.023) - this node is a cross-community bridge._
- **What connects `dmSans`, `dmMono`, `Tab` to the rest of the system?**
  _301 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `RosterHub.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.09523809523809523 - nodes in this community are weakly interconnected._
- **Should `Dashboard.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.13450292397660818 - nodes in this community are weakly interconnected._
- **Should `agent.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.0601404741000878 - nodes in this community are weakly interconnected._