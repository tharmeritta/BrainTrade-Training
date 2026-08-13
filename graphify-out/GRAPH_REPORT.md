# Graph Report - BrainTrade-Training  (2026-08-12)

## Corpus Check
- 300 files · ~170,236 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1238 nodes · 3044 edges · 83 communities (69 shown, 14 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 18 edges (avg confidence: 0.82)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `c33d6181`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- AgentStats
- ScenarioForm.tsx
- firebase-admin.ts
- agent-training/index.tsx
- animations.ts
- agent.ts
- index.ts
- agents.ts
- AgentEntry
- EvaluatorDashboard.tsx
- staff/route.ts
- dependencies
- server.ts
- AdminDashboard.tsx
- AdjustmentsTab.tsx
- semantic-audit-service.ts
- getAdminDb
- compilerOptions
- quiz-data.ts
- Agent
- devDependencies
- getServerUser
- fsAdd
- AiEvalScenario
- sync-session-memory.js
- ai-eval.ts
- ScenarioPicker.tsx
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
- HRAnalyticsTab.tsx
- seed-mock-agents.mjs
- next-env.d.ts
- git-auto-commit.sh
- CourseHub.tsx
- 🎯 Core Token Reduction Strategies
- tailwind.config.ts
- lib/quiz/types.ts
- 🤝 BrainTrade Training Platform - System Handoff & Architecture Guide
- [locale]/layout.tsx
- agy-start.sh
- LoginForm.tsx
- CongratulationsCard.tsx
- ReturningUserBanner.tsx
- ensure-dev-server.js
- Karpathy Guidelines
- FeatureSpotlightTour.tsx
- ShowcaseTab.tsx
- fsDelete

## God Nodes (most connected - your core abstractions)
1. `getAdminDb()` - 51 edges
2. `getServerUser` - 45 edges
3. `AgentStats` - 38 edges
4. `TrainingPeriod` - 28 edges
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

## Communities (83 total, 14 thin omitted)

### Community 0 - "AgentStats"
Cohesion: 0.08
Nodes (43): BypassModal(), BypassModalProps, DetailedAiEvalHistory(), DetailedHumanEvaluations(), DetailedQuizHistory(), requestOverride(), ProfileHeader(), ProfileHeaderProps (+35 more)

### Community 1 - "ScenarioForm.tsx"
Cohesion: 0.17
Nodes (13): DIFF, DIFF_ORDER, EMPTY_FORM, inputCls, textareaCls, AI_SUGGESTIONS, ScenarioForm(), ScenarioCard() (+5 more)

### Community 2 - "firebase-admin.ts"
Cohesion: 0.21
Nodes (13): GET(), createCustomTokenSafe(), POST(), setSession(), fsGetWhere(), cleanEmail(), cleanId(), cleanValue() (+5 more)

### Community 3 - "agent-training/index.tsx"
Cohesion: 0.17
Nodes (19): BackgroundEffects, CongratulationsCard, ModuleCard, ModuleCardProps, ModuleHeader, ProfileSidebar, ProfileSidebarProps, SectionDivider (+11 more)

### Community 4 - "animations.ts"
Cohesion: 0.10
Nodes (23): BrandingPanel(), MODULES, STATS_CONFIG, EntryAvatar(), EntryAvatarProps, FloatingDecoration(), MobileHeader(), MobileHeaderProps (+15 more)

### Community 5 - "agent.ts"
Cohesion: 0.08
Nodes (38): AiEvalLayout(), DashboardLayout(), DashboardPage(), LearnLayout(), QuizLayout(), normalizeName(), useAgentEntry(), DashboardHeader() (+30 more)

### Community 6 - "index.ts"
Cohesion: 0.07
Nodes (46): GET(), POST(), ActiveBatchHeader(), ActiveBatchHeaderProps, ArchiveSelectionGrid(), ArchiveSelectionGridProps, LivePulse(), DayRecordForm (+38 more)

### Community 7 - "agents.ts"
Cohesion: 0.09
Nodes (32): AMBER, buildIndividualSheet(), buildOverviewSheet(), GET(), GREEN, RED, scoreFill(), GET() (+24 more)

### Community 8 - "AgentEntry"
Cohesion: 0.40
Nodes (3): AgentEntry(), getInitials(), normalizeName()

### Community 9 - "EvaluatorDashboard.tsx"
Cohesion: 0.11
Nodes (36): EvaluatorPageContent(), GraduationRoster(), GraduationRosterProps, STATUS_ORDER, StatusPipeline(), AgentPerformancePanel(), AgentPerformancePanelProps, EvalForm() (+28 more)

### Community 10 - "staff/route.ts"
Cohesion: 0.21
Nodes (10): DELETE, PATCH, GET, POST, GET, PATCH, POST, apiError() (+2 more)

### Community 11 - "dependencies"
Cohesion: 0.05
Nodes (40): AiScenarioImportModal(), AiScenarioImportModalProps, BulkImportModal(), BulkImportModalProps, AccessNotes(), AgentSection(), EditState, ROLE_COLORS (+32 more)

### Community 12 - "server.ts"
Cohesion: 0.14
Nodes (22): GET(), POST(), FeedItem, GET(), EMPTY, GET(), GET(), GET() (+14 more)

### Community 13 - "AdminDashboard.tsx"
Cohesion: 0.07
Nodes (29): POST(), AdminPageContent(), AdminHeader(), AdminHeaderProps, AdminSidebar(), AdminSidebarProps, NavGroupProps, AdminTabContent() (+21 more)

### Community 14 - "AdjustmentsTab.tsx"
Cohesion: 0.07
Nodes (32): AiEvalConfig, AiEvalEditor(), DiagnosticResult, DiagnosticRunner(), HealthManager(), LearnConfig, LearnEditor(), LearnModule (+24 more)

### Community 15 - "semantic-audit-service.ts"
Cohesion: 0.15
Nodes (9): POST(), maxDuration, POST(), POST(), getGeminiModel(), getOpenAI(), AiAuditService, SemanticAuditResult (+1 more)

### Community 16 - "getAdminDb"
Cohesion: 0.17
Nodes (14): GET(), GET(), GET(), PATCH(), GET(), GET(), POST(), DELETE() (+6 more)

### Community 17 - "compilerOptions"
Cohesion: 0.07
Nodes (27): dom, dom.iterable, esnext, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules, **/*.ts (+19 more)

### Community 18 - "quiz-data.ts"
Cohesion: 0.06
Nodes (70): C, ICON_MAP, QuizIndexPage(), ArcadeStageCard(), ArcadeStageCardProps, ConfettiBurst(), getNextRankProgress(), getRankForXp() (+62 more)

### Community 19 - "Agent"
Cohesion: 0.22
Nodes (5): MOCKUP_AGENTS, POST(), normalizeName(), POST(), Agent

### Community 20 - "devDependencies"
Cohesion: 0.04
Nodes (46): autoprefixer, babel-plugin-react-compiler, eslint, eslint-config-next, @eslint/eslintrc, @eslint/js, eslint-plugin-jsx-a11y, eslint-plugin-react-hooks (+38 more)

### Community 21 - "getServerUser"
Cohesion: 0.20
Nodes (15): DELETE(), PATCH(), POST(), defaults(), POST(), ProgressRecord, POST(), POST() (+7 more)

### Community 22 - "fsAdd"
Cohesion: 0.21
Nodes (11): POST(), defaults(), POST(), ProgressRecord, POST(), POST(), fsAdd(), getActiveTrainingPeriod() (+3 more)

### Community 23 - "AiEvalScenario"
Cohesion: 0.31
Nodes (4): POST(), AiEvalService, AiEvalScenario, AiEvalSession

### Community 24 - "sync-session-memory.js"
Cohesion: 0.38
Nodes (6): { execSync }, fs, getRecentBranch(), getRecentGitCommits(), path, syncSessionMemory()

### Community 25 - "ai-eval.ts"
Cohesion: 0.16
Nodes (12): SandboxManagerModal(), SandboxManagerModalProps, ChatViewProps, CustomerProfile, EvalStep, AiEvalScenarioSchema, AiEvalTurnResponse, AiEvalTurnResponseSchema (+4 more)

### Community 26 - "ScenarioPicker.tsx"
Cohesion: 0.24
Nodes (8): IntroView, IntroViewProps, DIFFICULTY_MAP, ScenarioPicker, ScenarioPickerProps, StepProgress(), ActiveAgentUI(), ActiveAgentUIProps

### Community 27 - "ai-eval/index.tsx"
Cohesion: 0.14
Nodes (13): AuditFlow(), AuditFlowProps, CallSimulatorHud(), CallSimulatorHudProps, ChatView, CoachingCard, ScoreTrend, AiEvaluation() (+5 more)

### Community 28 - "db.ts"
Cohesion: 0.18
Nodes (20): DELETE(), GET(), POST(), POST(), POST(), POST(), PATCH(), POST() (+12 more)

### Community 29 - "seed.mjs"
Cohesion: 0.39
Nodes (7): __dirname, envPath, initAdmin(), main(), seedAdmin(), seedQuizzes(), seedScenarios()

### Community 33 - "seed-scenarios.mjs"
Cohesion: 0.40
Nodes (5): __dirname, envPath, FULL_CURRICULUM_SCENARIOS, initAdmin(), seed()

### Community 51 - "HRAnalyticsTab.tsx"
Cohesion: 0.22
Nodes (9): HRAnalyticsTab(), AiSkillGapReport(), CRITERIA_MAP, SkillGapItem, AgentTrainingHub(), deriveSteps(), scoreColor(), react (+1 more)

### Community 52 - "seed-mock-agents.mjs"
Cohesion: 0.40
Nodes (5): __dirname, envPath, initAdmin(), MOCKUP_AGENTS, seed()

### Community 55 - "CourseHub.tsx"
Cohesion: 0.05
Nodes (54): GET(), GET(), LearnPageContent(), LearnIndexPage(), Tab, CourseCard, CourseCardProps, CourseHeader (+46 more)

### Community 56 - "🎯 Core Token Reduction Strategies"
Cohesion: 0.22
Nodes (8): 1. Flash-Tier Subagent Delegation for File Operations, 2. Knowledge Graph & Handoff Memory Lookups, 3. Tight Line-Range Slicing (`view_file`), 4. Subagent Handoff & State Synchronization Protocol, 5. Safe Context Compaction Protocol, 🎯 Core Token Reduction Strategies, ⚙️ Recommended Local Compaction Config (`.gemini/settings.json`), Token Optimization & Subagent Handoff Skill

### Community 71 - "lib/quiz/types.ts"
Cohesion: 0.22
Nodes (8): Language, PASS_THRESHOLD, QuestionData, QuestionType, QuizDefinition, QuizPhase, QuizUIOverrides, UI_STRINGS

### Community 72 - "🤝 BrainTrade Training Platform - System Handoff & Architecture Guide"
Cohesion: 0.14
Nodes (13): 1. Anti-Hardcoding Rules (Mandatory Compliance), 1. Executive Summary & Current Project State, 2. Audio & Haptic User Feedback, 2. Directory Architecture & Topology, 3. Core Architectural Conventions & Guidelines, 3. Session & Access Control, 4. Primary Knowledge Graph God Nodes (Graphify), 5. Outstanding Tasks & Roadmap for `hands-on-agent` (+5 more)

### Community 73 - "[locale]/layout.tsx"
Cohesion: 0.09
Nodes (22): POST(), dmMono, dmSans, AgentSkillRow, CohortHeatmap(), CohortHeatmapProps, DEFAULT_ROWS, CommandPalette() (+14 more)

### Community 76 - "LoginForm.tsx"
Cohesion: 0.38
Nodes (5): DEV_MOCK_AGENTS, DevMockAgent, DevMockupSelector(), LoginForm(), LoginFormProps

### Community 77 - "CongratulationsCard.tsx"
Cohesion: 0.38
Nodes (4): Confetti, CongratulationsCard, CongratulationsCardProps, TrophyHero

### Community 79 - "ReturningUserBanner.tsx"
Cohesion: 0.60
Nodes (4): getInitials(), normalizeName(), ReturningUserBanner(), ReturningUserBannerProps

### Community 83 - "ensure-dev-server.js"
Cohesion: 0.32
Nodes (7): checkServerReady(), ensureDevServer(), fs, http, logStderr(), path, { spawn, execSync }

### Community 84 - "Karpathy Guidelines"
Cohesion: 0.33
Nodes (5): 1. Think Before Coding, 2. Simplicity First, 3. Surgical Changes, 4. Goal-Driven Execution, Karpathy Guidelines

### Community 85 - "FeatureSpotlightTour.tsx"
Cohesion: 0.33
Nodes (5): DEFAULT_STEPS, ElementRect, FeatureSpotlightTour(), FeatureSpotlightTourProps, SpotlightStep

### Community 91 - "fsDelete"
Cohesion: 0.29
Nodes (8): DELETE(), DELETE(), PATCH(), POST(), DELETE(), PATCH(), fsDelete(), requireTrainer()

## Knowledge Gaps
- **298 isolated node(s):** `dmSans`, `dmMono`, `Tab`, `ICON_MAP`, `C` (+293 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **14 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `dependencies` to `HRAnalyticsTab.tsx`, `devDependencies`?**
  _High betweenness centrality (0.078) - this node is a cross-community bridge._
- **Why does `react` connect `HRAnalyticsTab.tsx` to `quiz-data.ts`, `dependencies`, `CourseHub.tsx`?**
  _High betweenness centrality (0.044) - this node is a cross-community bridge._
- **Why does `AgentStats` connect `AgentStats` to `agent-training/index.tsx`, `agent.ts`, `index.ts`, `agents.ts`, `EvaluatorDashboard.tsx`, `server.ts`, `HRAnalyticsTab.tsx`, `CourseHub.tsx`, `db.ts`?**
  _High betweenness centrality (0.030) - this node is a cross-community bridge._
- **What connects `dmSans`, `dmMono`, `Tab` to the rest of the system?**
  _298 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AgentStats` be split into smaller, more focused modules?**
  _Cohesion score 0.0781387181738367 - nodes in this community are weakly interconnected._
- **Should `animations.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.10121457489878542 - nodes in this community are weakly interconnected._
- **Should `agent.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.083710407239819 - nodes in this community are weakly interconnected._