# Graph Report - BrainTrade-Training  (2026-08-14)

## Corpus Check
- 300 files · ~170,230 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1239 nodes · 3045 edges · 85 communities (67 shown, 18 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 19 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `1ed74522`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- index.ts
- StaffTab.tsx
- firebase-admin.ts
- agent-training/index.tsx
- animations.ts
- agent.ts
- TrainingPeriod
- agents.ts
- AgentEntry
- EvaluatorDashboard.tsx
- staff/route.ts
- dependencies
- fsDelete
- AdminDashboard.tsx
- AdjustmentsTab.tsx
- ai-eval.ts
- server.ts
- compilerOptions
- quiz-data.ts
- scripts
- devDependencies
- fsGetAll
- db.ts
- package.json
- sync-session-memory.js
- @types/node
- @types/nodemailer
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
- @types/react
- agy-start.sh
- LoginForm.tsx
- CongratulationsCard.tsx
- postcss
- ReturningUserBanner.tsx
- ensure-dev-server.js
- Karpathy Guidelines
- FeatureSpotlightTour.tsx
- ShowcaseTab.tsx
- fsSet

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
- `AiEvalLayout()` --calls--> `getServerUser`  [EXTRACTED]
  app/[locale]/ai-eval/layout.tsx → lib/session/server.ts
- `EvaluatorPageContent()` --calls--> `getServerUser`  [EXTRACTED]
  app/[locale]/evaluator/page.tsx → lib/session/server.ts
- `LearnLayout()` --calls--> `getServerUser`  [EXTRACTED]
  app/[locale]/learn/layout.tsx → lib/session/server.ts
- `QuizIndexPage()` --indirect_call--> `key()`  [INFERRED]
  app/[locale]/quiz/page.tsx → lib/localCache.ts
- `GET()` --calls--> `requireAdminOrIT()`  [EXTRACTED]
  app/api/admin/approvals/route.ts → lib/session/server.ts

## Import Cycles
- None detected.

## Communities (85 total, 18 thin omitted)

### Community 0 - "index.ts"
Cohesion: 0.06
Nodes (59): BypassModal(), BypassModalProps, DetailedAiEvalHistory(), DetailedHumanEvaluations(), DetailedQuizHistory(), requestOverride(), ProfileHeader(), ProfileHeaderProps (+51 more)

### Community 1 - "StaffTab.tsx"
Cohesion: 0.21
Nodes (7): BulkImportModal(), BulkImportModalProps, AccessNotes(), AgentSection(), EditState, ROLE_COLORS, StaffSection()

### Community 2 - "firebase-admin.ts"
Cohesion: 0.16
Nodes (15): POST(), GET(), GET(), createCustomTokenSafe(), POST(), setSession(), fsGetWhere(), cleanEmail() (+7 more)

### Community 3 - "agent-training/index.tsx"
Cohesion: 0.14
Nodes (25): HRAnalyticsTab(), BackgroundEffects, AgentTrainingHub(), CongratulationsCard, Props, ModuleCard, ModuleCardProps, ModuleHeader (+17 more)

### Community 4 - "animations.ts"
Cohesion: 0.10
Nodes (23): BrandingPanel(), MODULES, STATS_CONFIG, EntryAvatar(), EntryAvatarProps, FloatingDecoration(), MobileHeader(), MobileHeaderProps (+15 more)

### Community 5 - "agent.ts"
Cohesion: 0.06
Nodes (45): AiEvalLayout(), DashboardLayout(), DashboardPage(), LearnLayout(), COLOR_PRESETS, normalizeName(), useAgentEntry(), CertificateModal() (+37 more)

### Community 6 - "TrainingPeriod"
Cohesion: 0.09
Nodes (36): Tab, LivePulse(), DayRecordForm, DayRecordFormProps, DaysTab(), DaysTabProps, DisciplineSubTabProps, DisciplineTab() (+28 more)

### Community 7 - "agents.ts"
Cohesion: 0.09
Nodes (31): AMBER, buildIndividualSheet(), buildOverviewSheet(), GET(), GREEN, RED, scoreFill(), GET() (+23 more)

### Community 8 - "AgentEntry"
Cohesion: 0.40
Nodes (3): AgentEntry(), getInitials(), normalizeName()

### Community 9 - "EvaluatorDashboard.tsx"
Cohesion: 0.12
Nodes (33): EvaluatorPageContent(), StatusPipeline(), AgentPerformancePanel(), AgentPerformancePanelProps, EvalForm(), EvalFormProps, EvalHistoryCard(), EvalHistoryCardProps (+25 more)

### Community 10 - "staff/route.ts"
Cohesion: 0.17
Nodes (12): DELETE, PATCH, GET, POST, GET, PATCH, POST, apiError() (+4 more)

### Community 11 - "dependencies"
Cohesion: 0.08
Nodes (25): firebase, firebase-admin, framer-motion, @google-cloud/storage, @google/generative-ai, lucide-react, next, next-intl (+17 more)

### Community 12 - "fsDelete"
Cohesion: 0.22
Nodes (10): DELETE(), DELETE(), DELETE(), PATCH(), GET(), POST(), DELETE(), PATCH() (+2 more)

### Community 13 - "AdminDashboard.tsx"
Cohesion: 0.14
Nodes (20): AdminHeader(), AdminHeaderProps, AdminSidebar(), AdminSidebarProps, NavGroupProps, AdminTabContent(), AdminTabContentProps, TAB_REGISTRY (+12 more)

### Community 14 - "AdjustmentsTab.tsx"
Cohesion: 0.08
Nodes (31): AiEvalConfig, AiEvalEditor(), DiagnosticResult, DiagnosticRunner(), HealthManager(), LearnConfig, LearnEditor(), LearnModule (+23 more)

### Community 15 - "ai-eval.ts"
Cohesion: 0.05
Nodes (42): POST(), maxDuration, POST(), POST(), POST(), DIFF, DIFF_ORDER, EMPTY_FORM (+34 more)

### Community 16 - "server.ts"
Cohesion: 0.12
Nodes (20): POST(), FeedItem, GET(), EMPTY, GET(), GET(), POST(), GET() (+12 more)

### Community 17 - "compilerOptions"
Cohesion: 0.07
Nodes (27): dom, dom.iterable, esnext, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules, **/*.ts (+19 more)

### Community 18 - "quiz-data.ts"
Cohesion: 0.05
Nodes (74): C, ICON_MAP, QuizIndexPage(), IntroViewProps, ArcadeStageCard(), ArcadeStageCardProps, ConfettiBurst(), getNextRankProgress() (+66 more)

### Community 19 - "scripts"
Cohesion: 0.17
Nodes (12): scripts, agy:check, agy:commit, agy:start, build, check, dev, dev:auto (+4 more)

### Community 20 - "devDependencies"
Cohesion: 0.09
Nodes (23): autoprefixer, babel-plugin-react-compiler, eslint, eslint-config-next, @eslint/eslintrc, @eslint/js, eslint-plugin-jsx-a11y, eslint-plugin-react-hooks (+15 more)

### Community 21 - "fsGetAll"
Cohesion: 0.20
Nodes (7): GET(), GET(), MOCKUP_AGENTS, POST(), normalizeName(), POST(), fsGetAll()

### Community 22 - "db.ts"
Cohesion: 0.17
Nodes (13): GET(), POST(), POST(), defaults(), GET(), POST(), ProgressRecord, POST() (+5 more)

### Community 23 - "package.json"
Cohesion: 0.50
Nodes (3): name, private, version

### Community 24 - "sync-session-memory.js"
Cohesion: 0.38
Nodes (6): { execSync }, fs, getRecentBranch(), getRecentGitCommits(), path, syncSessionMemory()

### Community 27 - "ai-eval/index.tsx"
Cohesion: 0.11
Nodes (21): AuditFlow(), AuditFlowProps, CallSimulatorHud(), CallSimulatorHudProps, ChatView, CoachingCard, ScoreTrend, AiEvaluation() (+13 more)

### Community 28 - "getAdminDb"
Cohesion: 0.15
Nodes (26): DELETE(), GET(), POST(), POST(), POST(), POST(), POST(), PATCH() (+18 more)

### Community 29 - "seed.mjs"
Cohesion: 0.39
Nodes (7): __dirname, envPath, initAdmin(), main(), seedAdmin(), seedQuizzes(), seedScenarios()

### Community 33 - "seed-scenarios.mjs"
Cohesion: 0.40
Nodes (5): __dirname, envPath, FULL_CURRICULUM_SCENARIOS, initAdmin(), seed()

### Community 51 - "HRAnalyticsTab.tsx"
Cohesion: 0.33
Nodes (3): AiSkillGapReport(), CRITERIA_MAP, SkillGapItem

### Community 52 - "seed-mock-agents.mjs"
Cohesion: 0.40
Nodes (5): __dirname, envPath, initAdmin(), MOCKUP_AGENTS, seed()

### Community 55 - "CourseHub.tsx"
Cohesion: 0.06
Nodes (51): GET(), GET(), LearnPageContent(), LearnIndexPage(), OverridesManager(), CourseCard, CourseCardProps, CourseHeader (+43 more)

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

### Community 91 - "fsSet"
Cohesion: 0.16
Nodes (20): GET(), PATCH(), POST(), GET(), POST(), defaults(), POST(), ProgressRecord (+12 more)

## Knowledge Gaps
- **298 isolated node(s):** `dmSans`, `dmMono`, `Tab`, `ICON_MAP`, `C` (+293 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **18 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `dependencies` to `ai-eval.ts`, `CourseHub.tsx`, `package.json`?**
  _High betweenness centrality (0.078) - this node is a cross-community bridge._
- **Why does `react` connect `CourseHub.tsx` to `agent-training/index.tsx`, `dependencies`, `quiz-data.ts`, `HRAnalyticsTab.tsx`?**
  _High betweenness centrality (0.045) - this node is a cross-community bridge._
- **Why does `AgentStats` connect `index.ts` to `agent-training/index.tsx`, `agent.ts`, `TrainingPeriod`, `agents.ts`, `EvaluatorDashboard.tsx`, `server.ts`, `HRAnalyticsTab.tsx`, `CourseHub.tsx`, `getAdminDb`?**
  _High betweenness centrality (0.030) - this node is a cross-community bridge._
- **What connects `dmSans`, `dmMono`, `Tab` to the rest of the system?**
  _298 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.0603448275862069 - nodes in this community are weakly interconnected._
- **Should `agent-training/index.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.14453781512605043 - nodes in this community are weakly interconnected._
- **Should `animations.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.10121457489878542 - nodes in this community are weakly interconnected._