# Graph Report - BrainTrade-Training  (2026-08-09)

## Corpus Check
- 285 files · ~149,624 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1158 nodes · 2848 edges · 77 communities (63 shown, 14 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 17 edges (avg confidence: 0.82)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `57276b7c`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- AdjustmentsTab.tsx
- fsSet
- [locale]/layout.tsx
- agent-training/index.tsx
- AgentStats
- agent.ts
- TrainingPeriod
- agents.ts
- AgentEntry.tsx
- server.ts
- staff/route.ts
- fsUpdate
- AdminDashboard.tsx
- LearnEditor.tsx
- db.ts
- [locale]/page.tsx
- compilerOptions
- quiz-data.ts
- firebase-admin.ts
- devDependencies
- Dashboard.tsx
- getAdminDb
- sync-session-memory.js
- index.ts
- ai-eval/index.tsx
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
- animations.ts
- getServerUser
- seed-mock-agents.mjs
- next-env.d.ts
- git-auto-commit.sh
- CourseHub.tsx
- tailwind.config.ts
- lib/quiz/types.ts
- dependencies
- agy-start.sh
- CongratulationsCard.tsx
- server/courses.ts
- ReportsTab.tsx
- usePresentation.ts
- ensure-dev-server.js
- LoginForm.tsx
- ShowcaseTab.tsx
- ReturningUserBanner.tsx

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

## Communities (77 total, 14 thin omitted)

### Community 0 - "AdjustmentsTab.tsx"
Cohesion: 0.19
Nodes (9): OverridesManager(), AdjustmentsTab(), ConfigType, TABS, SkeletonProps, SkeletonTable(), COURSE_MODULES, CoursePresentation (+1 more)

### Community 1 - "fsSet"
Cohesion: 0.05
Nodes (44): POST(), defaults(), POST(), ProgressRecord, maxDuration, POST(), MOCKUP_AGENTS, POST() (+36 more)

### Community 2 - "[locale]/layout.tsx"
Cohesion: 0.09
Nodes (22): POST(), dmMono, dmSans, AgentSkillRow, CohortHeatmap(), CohortHeatmapProps, DEFAULT_ROWS, CommandPalette() (+14 more)

### Community 3 - "agent-training/index.tsx"
Cohesion: 0.15
Nodes (19): HRAnalyticsTab(), AiSkillGapReport(), CRITERIA_MAP, SkillGapItem, BackgroundEffects, AgentTrainingHub(), CongratulationsCard, Props (+11 more)

### Community 4 - "AgentStats"
Cohesion: 0.06
Nodes (70): EvaluatorPageContent(), BypassModal(), BypassModalProps, DetailedAiEvalHistory(), DetailedHumanEvaluations(), DetailedQuizHistory(), requestOverride(), ProfileHeader() (+62 more)

### Community 5 - "agent.ts"
Cohesion: 0.05
Nodes (50): POST(), AiEvalLayout(), DashboardLayout(), DashboardPage(), LearnLayout(), QuizLayout(), QuizIndexPage(), COLOR_PRESETS (+42 more)

### Community 6 - "TrainingPeriod"
Cohesion: 0.09
Nodes (38): ActiveBatchHeader(), ActiveBatchHeaderProps, ArchiveSelectionGrid(), ArchiveSelectionGridProps, EvalTab, useEvaluationsData(), EvaluationsTab(), LivePulse() (+30 more)

### Community 7 - "agents.ts"
Cohesion: 0.09
Nodes (31): AMBER, buildIndividualSheet(), buildOverviewSheet(), GET(), GREEN, RED, scoreFill(), GET() (+23 more)

### Community 8 - "AgentEntry.tsx"
Cohesion: 0.16
Nodes (13): BrandingPanel(), EntryAvatar(), EntryAvatarProps, MobileHeader(), MobileHeaderProps, MobileModuleChips(), ModuleChip, MODULES (+5 more)

### Community 9 - "server.ts"
Cohesion: 0.14
Nodes (20): DELETE(), DELETE(), PATCH(), GET(), POST(), GET(), POST(), DELETE() (+12 more)

### Community 10 - "staff/route.ts"
Cohesion: 0.17
Nodes (12): DELETE, PATCH, GET, POST, GET, PATCH, POST, apiError() (+4 more)

### Community 11 - "fsUpdate"
Cohesion: 0.38
Nodes (8): GET(), POST(), fsUpdate(), executeApprovedAction(), resolveApprovalRequest(), updateGlobalAgentCounts(), requireAdmin(), ApprovalRequest

### Community 13 - "AdminDashboard.tsx"
Cohesion: 0.13
Nodes (21): AdminHeader(), AdminHeaderProps, AdminSidebar(), AdminSidebarProps, NavGroupProps, AdminTabContent(), AdminTabContentProps, TAB_REGISTRY (+13 more)

### Community 14 - "LearnEditor.tsx"
Cohesion: 0.13
Nodes (18): AiEvalConfig, AiEvalEditor(), LearnConfig, LearnEditor(), LearnModule, PresentationInfo, QuizDefinition, QuizQuestion (+10 more)

### Community 15 - "db.ts"
Cohesion: 0.13
Nodes (16): GET(), FeedItem, GET(), EMPTY, GET(), POST(), POST(), normalizeName() (+8 more)

### Community 16 - "[locale]/page.tsx"
Cohesion: 0.32
Nodes (3): Tab, BackgroundEffects, auth

### Community 17 - "compilerOptions"
Cohesion: 0.07
Nodes (27): dom, dom.iterable, esnext, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules, **/*.ts (+19 more)

### Community 18 - "quiz-data.ts"
Cohesion: 0.06
Nodes (54): C, ICON_MAP, IntroViewProps, QuizSystem(), QuizBriefing, reveal, PhaseBreakdown, PhaseBreakdownProps (+46 more)

### Community 19 - "firebase-admin.ts"
Cohesion: 0.27
Nodes (10): maxDuration, POST(), GET(), cleanEmail(), cleanId(), cleanValue(), getAdminApp(), getAdminAuth() (+2 more)

### Community 20 - "devDependencies"
Cohesion: 0.04
Nodes (46): autoprefixer, babel-plugin-react-compiler, eslint, eslint-config-next, @eslint/eslintrc, @eslint/js, eslint-plugin-jsx-a11y, eslint-plugin-react-hooks (+38 more)

### Community 22 - "Dashboard.tsx"
Cohesion: 0.15
Nodes (10): MODULES, STATS_CONFIG, FloatingDecoration(), ModuleItem, MODULES, BrandedTitle(), BrandedTitleProps, StatCounter() (+2 more)

### Community 23 - "getAdminDb"
Cohesion: 0.17
Nodes (23): DELETE(), GET(), POST(), POST(), POST(), POST(), GET(), PATCH() (+15 more)

### Community 24 - "sync-session-memory.js"
Cohesion: 0.38
Nodes (6): { execSync }, fs, getRecentBranch(), getRecentGitCommits(), path, syncSessionMemory()

### Community 26 - "index.ts"
Cohesion: 0.14
Nodes (16): POST(), createCustomTokenSafe(), POST(), setSession(), fsGetWhere(), makeSessionToken(), AgentProgress, ApprovalActionType (+8 more)

### Community 27 - "ai-eval/index.tsx"
Cohesion: 0.08
Nodes (26): DiagnosticResult, DiagnosticRunner(), HealthManager(), AuditFlow(), AuditFlowProps, CallSimulatorHud(), CallSimulatorHudProps, ChatView (+18 more)

### Community 29 - "seed.mjs"
Cohesion: 0.39
Nodes (7): __dirname, envPath, initAdmin(), main(), seedAdmin(), seedQuizzes(), seedScenarios()

### Community 33 - "seed-scenarios.mjs"
Cohesion: 0.40
Nodes (5): __dirname, envPath, FULL_CURRICULUM_SCENARIOS, initAdmin(), seed()

### Community 50 - "animations.ts"
Cohesion: 0.29
Nodes (8): ModuleHeader, ModuleHeaderProps, ProfileSidebarProps, SectionDivider, BADGE, BadgeType, EASE, FADE_IN

### Community 51 - "getServerUser"
Cohesion: 0.17
Nodes (16): DELETE(), GET(), PATCH(), POST(), POST(), GET(), PATCH(), GET() (+8 more)

### Community 52 - "seed-mock-agents.mjs"
Cohesion: 0.40
Nodes (5): __dirname, envPath, initAdmin(), MOCKUP_AGENTS, seed()

### Community 55 - "CourseHub.tsx"
Cohesion: 0.15
Nodes (18): CourseCard, CourseCardProps, CourseHeader, CourseHeaderProps, LanguagePicker, LanguagePickerProps, PlaceholderCard, PlaceholderCardProps (+10 more)

### Community 71 - "lib/quiz/types.ts"
Cohesion: 0.22
Nodes (8): Language, PASS_THRESHOLD, QuestionData, QuestionType, QuizDefinition, QuizPhase, QuizUIOverrides, UI_STRINGS

### Community 73 - "dependencies"
Cohesion: 0.05
Nodes (41): GET(), AiScenarioImportModal(), AiScenarioImportModalProps, BulkImportModal(), BulkImportModalProps, AccessNotes(), AgentSection(), EditState (+33 more)

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
Cohesion: 0.21
Nodes (12): DrawingCanvas(), DrawingCanvasProps, PresentationViewer(), slideKey(), usePresentation(), viewedKey(), DrawingPath, LiveSessionState (+4 more)

### Community 83 - "ensure-dev-server.js"
Cohesion: 0.32
Nodes (7): checkServerReady(), ensureDevServer(), fs, http, logStderr(), path, { spawn, execSync }

### Community 89 - "LoginForm.tsx"
Cohesion: 0.38
Nodes (5): DEV_MOCK_AGENTS, DevMockAgent, DevMockupSelector(), LoginForm(), LoginFormProps

### Community 92 - "ReturningUserBanner.tsx"
Cohesion: 0.60
Nodes (4): getInitials(), normalizeName(), ReturningUserBanner(), ReturningUserBannerProps

## Knowledge Gaps
- **271 isolated node(s):** `dmSans`, `dmMono`, `Tab`, `ICON_MAP`, `C` (+266 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **14 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `dependencies` to `usePresentation.ts`, `devDependencies`?**
  _High betweenness centrality (0.071) - this node is a cross-community bridge._
- **Why does `react` connect `usePresentation.ts` to `dependencies`, `agent-training/index.tsx`?**
  _High betweenness centrality (0.040) - this node is a cross-community bridge._
- **What connects `dmSans`, `dmMono`, `Tab` to the rest of the system?**
  _271 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `fsSet` be split into smaller, more focused modules?**
  _Cohesion score 0.05143638850889193 - nodes in this community are weakly interconnected._
- **Should `[locale]/layout.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.0873440285204991 - nodes in this community are weakly interconnected._
- **Should `AgentStats` be split into smaller, more focused modules?**
  _Cohesion score 0.055825242718446605 - nodes in this community are weakly interconnected._
- **Should `agent.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05194805194805195 - nodes in this community are weakly interconnected._