# Graph Report - BrainTrade-Training  (2026-08-12)

## Corpus Check
- 289 files · ~160,070 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1181 nodes · 2924 edges · 86 communities (66 shown, 20 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 18 edges (avg confidence: 0.82)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `e19c8963`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- AgentStats
- fsSet
- server.ts
- agent-training/index.tsx
- lib/courses.ts
- agent.ts
- TrainingPeriod
- agents.ts
- Dashboard.tsx
- EvaluatorDashboard.tsx
- db.ts
- dependencies
- PresentationViewer.tsx
- AdminDashboard.tsx
- AdjustmentsTab.tsx
- fsGetAll
- getServerUser
- compilerOptions
- quiz-data.ts
- getAdminDb
- devDependencies
- scripts
- index.ts
- Skeleton.tsx
- sync-session-memory.js
- StaffTab.tsx
- session/route.ts
- ai-eval/index.tsx
- stats-service.ts
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
- PresentationSystemTab.tsx
- seed-mock-agents.mjs
- next-env.d.ts
- git-auto-commit.sh
- CourseHub.tsx
- HRAnalyticsTab.tsx
- tailwind.config.ts
- lib/quiz/types.ts
- [locale]/layout.tsx
- package.json
- agy-start.sh
- @types/node
- animations.ts
- @eslint/js
- @types/react
- tailwindcss
- typescript
- ensure-dev-server.js
- Karpathy Guidelines
- BrandingPanel.tsx
- AgentEntry.tsx
- ShowcaseTab.tsx
- ReturningUserBanner.tsx

## God Nodes (most connected - your core abstractions)
1. `getAdminDb()` - 48 edges
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
- `AiEvalLayout()` --calls--> `getServerUser`  [EXTRACTED]
  app/[locale]/ai-eval/layout.tsx → lib/session/server.ts
- `EvaluatorPageContent()` --calls--> `getServerUser`  [EXTRACTED]
  app/[locale]/evaluator/page.tsx → lib/session/server.ts
- `LearnLayout()` --calls--> `getServerUser`  [EXTRACTED]
  app/[locale]/learn/layout.tsx → lib/session/server.ts
- `QuizLayout()` --calls--> `getServerUser`  [EXTRACTED]
  app/[locale]/quiz/layout.tsx → lib/session/server.ts
- `GET()` --calls--> `requireAdminOrIT()`  [EXTRACTED]
  app/api/admin/approvals/route.ts → lib/session/server.ts

## Import Cycles
- None detected.

## Communities (86 total, 20 thin omitted)

### Community 0 - "AgentStats"
Cohesion: 0.08
Nodes (45): BypassModal(), BypassModalProps, DetailedAiEvalHistory(), DetailedHumanEvaluations(), DetailedQuizHistory(), requestOverride(), ProfileHeader(), ProfileHeaderProps (+37 more)

### Community 1 - "fsSet"
Cohesion: 0.05
Nodes (50): defaults(), POST(), ProgressRecord, MOCKUP_AGENTS, POST(), defaults(), GET(), POST() (+42 more)

### Community 2 - "server.ts"
Cohesion: 0.17
Nodes (17): DELETE(), PATCH(), GET(), POST(), GET(), POST(), DELETE(), PATCH() (+9 more)

### Community 3 - "agent-training/index.tsx"
Cohesion: 0.18
Nodes (21): HRAnalyticsTab(), BackgroundEffects, AgentTrainingHub(), CongratulationsCard, Props, ModuleCard, ModuleCardProps, ModuleHeader (+13 more)

### Community 4 - "lib/courses.ts"
Cohesion: 0.21
Nodes (9): GET(), GET(), LearnPageContent(), LearnIndexPage(), OverridesManager(), COURSE_MODULES, CoursePresentation, getCourseModule() (+1 more)

### Community 5 - "agent.ts"
Cohesion: 0.07
Nodes (41): AiEvalLayout(), DashboardLayout(), DashboardPage(), LearnLayout(), QuizLayout(), C, ICON_MAP, QuizIndexPage() (+33 more)

### Community 6 - "TrainingPeriod"
Cohesion: 0.07
Nodes (41): Tab, ActiveBatchHeader(), ActiveBatchHeaderProps, ArchiveSelectionGrid(), ArchiveSelectionGridProps, LivePulse(), DayRecordForm, DayRecordFormProps (+33 more)

### Community 7 - "agents.ts"
Cohesion: 0.10
Nodes (28): AMBER, buildIndividualSheet(), buildOverviewSheet(), GET(), GREEN, RED, scoreFill(), POST() (+20 more)

### Community 8 - "Dashboard.tsx"
Cohesion: 0.15
Nodes (10): MobileHeader(), MobileHeaderProps, MobileModuleChips(), ModuleChip, MODULES, DashboardHeader(), ModuleItem, MODULES (+2 more)

### Community 9 - "EvaluatorDashboard.tsx"
Cohesion: 0.12
Nodes (34): EvaluatorPageContent(), GraduationRosterProps, STATUS_ORDER, StatusPipeline(), AgentPerformancePanel(), AgentPerformancePanelProps, EvalForm(), EvalFormProps (+26 more)

### Community 10 - "db.ts"
Cohesion: 0.14
Nodes (16): DELETE, PATCH, GET, POST, POST(), GET, PATCH, POST (+8 more)

### Community 11 - "dependencies"
Cohesion: 0.09
Nodes (23): firebase, firebase-admin, framer-motion, @google-cloud/storage, lucide-react, next, next-intl, nodemailer (+15 more)

### Community 12 - "PresentationViewer.tsx"
Cohesion: 0.18
Nodes (18): DrawingCanvas(), DrawingCanvasProps, PresentationControls(), PresentationControlsProps, PresentationViewer(), PresentationViewerProps, PresenterViewModalProps, slideKey() (+10 more)

### Community 13 - "AdminDashboard.tsx"
Cohesion: 0.08
Nodes (27): AdminHeader(), AdminHeaderProps, AdminSidebar(), AdminSidebarProps, NavGroupProps, AdminTabContent(), AdminTabContentProps, TAB_REGISTRY (+19 more)

### Community 14 - "AdjustmentsTab.tsx"
Cohesion: 0.12
Nodes (23): AiEvalConfig, AiEvalEditor(), LearnConfig, LearnEditor(), LearnModule, PresentationInfo, QuizDefinition, QuizQuestion (+15 more)

### Community 15 - "fsGetAll"
Cohesion: 0.15
Nodes (13): GET(), FeedItem, GET(), EMPTY, GET(), normalizeName(), POST(), fsCount() (+5 more)

### Community 16 - "getServerUser"
Cohesion: 0.22
Nodes (12): DELETE(), PATCH(), POST(), POST(), DELETE(), PATCH(), DELETE(), GET() (+4 more)

### Community 17 - "compilerOptions"
Cohesion: 0.07
Nodes (27): dom, dom.iterable, esnext, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules, **/*.ts (+19 more)

### Community 18 - "quiz-data.ts"
Cohesion: 0.07
Nodes (55): ConfettiBurst(), getNextRankProgress(), getRankForXp(), playGamifiedSound(), RankInfo, RANKS, SoundWaveIndicator(), triggerHaptic() (+47 more)

### Community 19 - "getAdminDb"
Cohesion: 0.17
Nodes (16): GET(), GET(), GET(), PATCH(), GET(), GET(), GET(), cleanEmail() (+8 more)

### Community 20 - "devDependencies"
Cohesion: 0.10
Nodes (21): autoprefixer, babel-plugin-react-compiler, eslint, eslint-config-next, @eslint/eslintrc, eslint-plugin-jsx-a11y, eslint-plugin-react-hooks, devDependencies (+13 more)

### Community 21 - "scripts"
Cohesion: 0.17
Nodes (12): scripts, agy:check, agy:commit, agy:start, build, check, dev, dev:auto (+4 more)

### Community 22 - "index.ts"
Cohesion: 0.16
Nodes (16): GET(), POST(), executeApprovedAction(), resolveApprovalRequest(), updateGlobalAgentCounts(), requireAdmin(), AgentProgress, ApprovalActionType (+8 more)

### Community 24 - "sync-session-memory.js"
Cohesion: 0.38
Nodes (6): { execSync }, fs, getRecentBranch(), getRecentGitCommits(), path, syncSessionMemory()

### Community 25 - "StaffTab.tsx"
Cohesion: 0.21
Nodes (7): BulkImportModal(), BulkImportModalProps, AccessNotes(), AgentSection(), EditState, ROLE_COLORS, StaffSection()

### Community 26 - "session/route.ts"
Cohesion: 0.26
Nodes (8): POST(), GET(), createCustomTokenSafe(), POST(), setSession(), fsGetWhere(), makeSessionToken(), StaffAccount

### Community 27 - "ai-eval/index.tsx"
Cohesion: 0.10
Nodes (25): AuditFlow(), AuditFlowProps, CallSimulatorHud(), CallSimulatorHudProps, ChatView, CoachingCard, ScoreTrend, AiEvaluation() (+17 more)

### Community 28 - "stats-service.ts"
Cohesion: 0.20
Nodes (18): DELETE(), POST(), POST(), GET(), POST(), POST(), PATCH(), POST() (+10 more)

### Community 29 - "seed.mjs"
Cohesion: 0.39
Nodes (7): __dirname, envPath, initAdmin(), main(), seedAdmin(), seedQuizzes(), seedScenarios()

### Community 33 - "seed-scenarios.mjs"
Cohesion: 0.40
Nodes (5): __dirname, envPath, FULL_CURRICULUM_SCENARIOS, initAdmin(), seed()

### Community 50 - "PresentationSystemTab.tsx"
Cohesion: 0.16
Nodes (10): DiagnosticResult, DiagnosticRunner(), HealthManager(), PresenterViewModal(), PresentationSystemTab(), PresentationSystemTabProps, TrainerPanelProps, TrainingSubDomain (+2 more)

### Community 52 - "seed-mock-agents.mjs"
Cohesion: 0.40
Nodes (5): __dirname, envPath, initAdmin(), MOCKUP_AGENTS, seed()

### Community 55 - "CourseHub.tsx"
Cohesion: 0.12
Nodes (19): CourseCard, CourseCardProps, CourseHeader, CourseHeaderProps, CourseHub(), LanguagePicker, LanguagePickerProps, PlaceholderCard (+11 more)

### Community 56 - "HRAnalyticsTab.tsx"
Cohesion: 0.33
Nodes (3): AiSkillGapReport(), CRITERIA_MAP, SkillGapItem

### Community 71 - "lib/quiz/types.ts"
Cohesion: 0.22
Nodes (8): Language, PASS_THRESHOLD, QuestionData, QuestionType, QuizDefinition, QuizPhase, QuizUIOverrides, UI_STRINGS

### Community 73 - "[locale]/layout.tsx"
Cohesion: 0.06
Nodes (31): POST(), POST(), maxDuration, POST(), POST(), dmMono, dmSans, AgentSkillRow (+23 more)

### Community 74 - "package.json"
Cohesion: 0.50
Nodes (3): name, private, version

### Community 77 - "animations.ts"
Cohesion: 0.21
Nodes (8): Confetti, CongratulationsCard, CongratulationsCardProps, TrophyHero, BackgroundEffects, EASE, FADE_IN, STAGGER_CONTAINER

### Community 83 - "ensure-dev-server.js"
Cohesion: 0.32
Nodes (7): checkServerReady(), ensureDevServer(), fs, http, logStderr(), path, { spawn, execSync }

### Community 84 - "Karpathy Guidelines"
Cohesion: 0.33
Nodes (5): 1. Think Before Coding, 2. Simplicity First, 3. Surgical Changes, 4. Goal-Driven Execution, Karpathy Guidelines

### Community 87 - "BrandingPanel.tsx"
Cohesion: 0.28
Nodes (6): BrandingPanel(), MODULES, STATS_CONFIG, FloatingDecoration(), StatCounter(), StatCounterProps

### Community 89 - "AgentEntry.tsx"
Cohesion: 0.17
Nodes (12): DEV_MOCK_AGENTS, DevMockAgent, DevMockupSelector(), EntryAvatar(), EntryAvatarProps, LoginForm(), LoginFormProps, AgentEntry() (+4 more)

### Community 92 - "ReturningUserBanner.tsx"
Cohesion: 0.60
Nodes (4): getInitials(), normalizeName(), ReturningUserBanner(), ReturningUserBannerProps

## Knowledge Gaps
- **275 isolated node(s):** `dmSans`, `dmMono`, `Tab`, `ICON_MAP`, `C` (+270 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **20 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `dependencies` to `[locale]/layout.tsx`, `package.json`, `PresentationViewer.tsx`, `fsSet`?**
  _High betweenness centrality (0.076) - this node is a cross-community bridge._
- **Why does `react` connect `PresentationViewer.tsx` to `HRAnalyticsTab.tsx`, `dependencies`, `agent-training/index.tsx`?**
  _High betweenness centrality (0.041) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `devDependencies` to `package.json`, `@types/node`, `@eslint/js`, `@types/react`, `tailwindcss`, `typescript`?**
  _High betweenness centrality (0.040) - this node is a cross-community bridge._
- **What connects `dmSans`, `dmMono`, `Tab` to the rest of the system?**
  _275 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AgentStats` be split into smaller, more focused modules?**
  _Cohesion score 0.07743271221532091 - nodes in this community are weakly interconnected._
- **Should `fsSet` be split into smaller, more focused modules?**
  _Cohesion score 0.05070028011204482 - nodes in this community are weakly interconnected._
- **Should `agent.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07305669199298656 - nodes in this community are weakly interconnected._