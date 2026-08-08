# Graph Report - BrainTrade-Training  (2026-08-08)

## Corpus Check
- 275 files · ~139,735 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1107 nodes · 2748 edges · 80 communities (63 shown, 17 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 14 edges (avg confidence: 0.89)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `ff1eb22b`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- index.ts
- fsSet
- CourseHub.tsx
- agent-training/index.tsx
- AgentStats
- getServerUser
- TrainingPeriod
- agents.ts
- AgentEntry.tsx
- [locale]/layout.tsx
- staff/route.ts
- db.ts
- animations.ts
- AdminDashboard.tsx
- AdjustmentsTab.tsx
- server.ts
- session/route.ts
- compilerOptions
- quiz/index.tsx
- firebase-admin.ts
- devDependencies
- export/route.ts
- dependencies
- agent.ts
- scripts
- quiz-data.ts
- quiz/page.tsx
- ai-eval/types.ts
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
- Dashboard.tsx
- approval-service.ts
- seed-mock-agents.mjs
- next-env.d.ts
- git-auto-commit.sh
- package.json
- QuizResult.tsx
- tailwind.config.ts
- BrandingPanel.tsx
- eslint-config-next
- LoginForm.tsx
- postcss
- agy-start.sh
- tailwindcss
- CongratulationsCard.tsx
- login/page.tsx
- eslint-plugin-jsx-a11y

## God Nodes (most connected - your core abstractions)
1. `getAdminDb()` - 50 edges
2. `getServerUser` - 45 edges
3. `AgentStats` - 38 edges
4. `TrainingPeriod` - 27 edges
5. `fsGetAll()` - 24 edges
6. `fsSet()` - 24 edges
7. `scoreColor()` - 23 edges
8. `fsUpdate()` - 23 edges
9. `updateAgentOverallScore()` - 23 edges
10. `getAgentSession()` - 23 edges

## Surprising Connections (you probably didn't know these)
- `QuizIndexPage()` --indirect_call--> `key()`  [INFERRED]
  app/[locale]/quiz/page.tsx → lib/localCache.ts
- `POST()` --calls--> `fsAdd()`  [EXTRACTED]
  app/api/admin/seed/route.ts → lib/server/db.ts
- `GET()` --calls--> `getAgentStats()`  [EXTRACTED]
  app/api/agent/progress/route.ts → lib/agents.ts
- `GET()` --calls--> `getAdminDb()`  [EXTRACTED]
  app/api/ai-eval/config/route.ts → lib/server/firebase-admin.ts
- `DashboardHeader()` --calls--> `getAgentSession()`  [EXTRACTED]
  components/features/Dashboard.tsx → lib/session/agent.ts

## Import Cycles
- None detected.

## Communities (80 total, 17 thin omitted)

### Community 0 - "index.ts"
Cohesion: 0.06
Nodes (54): BypassModal(), BypassModalProps, DetailedAiEvalHistory(), DetailedHumanEvaluations(), DetailedQuizHistory(), requestOverride(), ProfileHeader(), AgentDetailModal() (+46 more)

### Community 1 - "fsSet"
Cohesion: 0.06
Nodes (42): POST(), defaults(), POST(), ProgressRecord, maxDuration, POST(), MOCKUP_AGENTS, POST() (+34 more)

### Community 2 - "CourseHub.tsx"
Cohesion: 0.07
Nodes (43): GET(), GET(), LearnPageContent(), LearnIndexPage(), OverridesManager(), CourseCard, CourseCardProps, CourseHeader (+35 more)

### Community 3 - "agent-training/index.tsx"
Cohesion: 0.08
Nodes (42): DashboardPage(), HRAnalyticsTab(), AiSkillGapReport(), CRITERIA_MAP, SkillGapItem, BackgroundEffects, AgentTrainingHub(), CongratulationsCard (+34 more)

### Community 4 - "AgentStats"
Cohesion: 0.10
Nodes (38): ProfileHeaderProps, GraduationRosterProps, STATUS_ORDER, LeaderboardTableProps, StatusPipeline(), AgentPerformancePanel(), AgentPerformancePanelProps, EvalForm() (+30 more)

### Community 5 - "getServerUser"
Cohesion: 0.17
Nodes (13): POST(), GET(), AiEvalLayout(), EvaluatorPageContent(), LearnLayout(), QuizLayout(), AgentAuthGuard(), LangToggle() (+5 more)

### Community 6 - "TrainingPeriod"
Cohesion: 0.11
Nodes (31): LivePulse(), DayRecordForm, DayRecordFormProps, DaysTab(), DaysTabProps, DisciplineSubTabProps, DisciplineTab(), NewPeriodModal() (+23 more)

### Community 7 - "agents.ts"
Cohesion: 0.12
Nodes (24): GET(), POST(), GET(), GET(), GET(), QuizResult, buildAiEval(), computeBadge() (+16 more)

### Community 8 - "AgentEntry.tsx"
Cohesion: 0.19
Nodes (11): EntryAvatar(), EntryAvatarProps, getInitials(), normalizeName(), ReturningUserBanner(), ReturningUserBannerProps, AgentEntry(), AgentEntryProps (+3 more)

### Community 9 - "[locale]/layout.tsx"
Cohesion: 0.08
Nodes (24): POST(), dmMono, dmSans, AgentSkillRow, CohortHeatmap(), CohortHeatmapProps, DEFAULT_ROWS, CommandPalette() (+16 more)

### Community 10 - "staff/route.ts"
Cohesion: 0.21
Nodes (10): DELETE, PATCH, GET, POST, GET, PATCH, POST, apiError() (+2 more)

### Community 11 - "db.ts"
Cohesion: 0.19
Nodes (22): DELETE(), GET(), POST(), POST(), POST(), POST(), PATCH(), POST() (+14 more)

### Community 12 - "animations.ts"
Cohesion: 0.15
Nodes (14): AuditFlow(), AuditFlowProps, AiEvaluation(), DEFAULT_CRITERIA, IntroView, IntroViewProps, DIFFICULTY_MAP, ScenarioPicker (+6 more)

### Community 13 - "AdminDashboard.tsx"
Cohesion: 0.13
Nodes (20): AdminHeader(), AdminHeaderProps, AdminSidebar(), AdminSidebarProps, NavGroupProps, AdminTabContent(), AdminTabContentProps, TAB_REGISTRY (+12 more)

### Community 14 - "AdjustmentsTab.tsx"
Cohesion: 0.08
Nodes (30): AiEvalConfig, AiEvalEditor(), DiagnosticResult, DiagnosticRunner(), HealthManager(), LearnConfig, LearnEditor(), LearnModule (+22 more)

### Community 15 - "server.ts"
Cohesion: 0.13
Nodes (23): GET(), POST(), DELETE(), PATCH(), GET(), POST(), GET(), POST() (+15 more)

### Community 16 - "session/route.ts"
Cohesion: 0.26
Nodes (8): POST(), POST(), createCustomTokenSafe(), POST(), setSession(), fsGetWhere(), makeSessionToken(), StaffAccount

### Community 17 - "compilerOptions"
Cohesion: 0.07
Nodes (27): dom, dom.iterable, esnext, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules, **/*.ts (+19 more)

### Community 18 - "quiz/index.tsx"
Cohesion: 0.13
Nodes (16): QuizSystem(), QuizBriefing, reveal, QuizResult(), QuestionCard, QuestionMap, QuestionMapProps, QuizSession() (+8 more)

### Community 19 - "firebase-admin.ts"
Cohesion: 0.22
Nodes (11): maxDuration, POST(), GET(), GET(), cleanEmail(), cleanId(), cleanValue(), getAdminApp() (+3 more)

### Community 20 - "devDependencies"
Cohesion: 0.10
Nodes (21): autoprefixer, babel-plugin-react-compiler, eslint, @eslint/eslintrc, @eslint/js, eslint-plugin-react-hooks, devDependencies, autoprefixer (+13 more)

### Community 21 - "export/route.ts"
Cohesion: 0.08
Nodes (24): AMBER, buildIndividualSheet(), buildOverviewSheet(), GET(), GREEN, RED, scoreFill(), AiScenarioImportModal() (+16 more)

### Community 22 - "dependencies"
Cohesion: 0.10
Nodes (21): firebase, firebase-admin, framer-motion, @google-cloud/storage, lucide-react, next, next-intl, openai (+13 more)

### Community 23 - "agent.ts"
Cohesion: 0.17
Nodes (15): DashboardLayout(), normalizeName(), useAgentEntry(), SessionContext, SessionContextType, SessionProvider(), SummonMessage, useTrackPresence() (+7 more)

### Community 24 - "scripts"
Cohesion: 0.18
Nodes (11): scripts, agy:check, agy:commit, agy:start, build, check, dev, lint (+3 more)

### Community 25 - "quiz-data.ts"
Cohesion: 0.10
Nodes (19): CERT_PART1, CERT_PART2, CERT_PART3, CERT_PART4, CERT_PART5, FOUND_PART1, FOUND_PART2, FOUND_PART3 (+11 more)

### Community 26 - "quiz/page.tsx"
Cohesion: 0.25
Nodes (4): C, ICON_MAP, QuizIndexPage(), MODULE_QUIZ_MAP

### Community 27 - "ai-eval/types.ts"
Cohesion: 0.18
Nodes (11): CallSimulatorHud(), CallSimulatorHudProps, ChatView, CoachingCard, ScoreTrend, MessageBubble, ChatViewProps, CoachingData (+3 more)

### Community 28 - "fsGetAll"
Cohesion: 0.17
Nodes (11): GET(), FeedItem, GET(), EMPTY, GET(), normalizeName(), POST(), fsCount() (+3 more)

### Community 29 - "seed.mjs"
Cohesion: 0.39
Nodes (7): __dirname, envPath, initAdmin(), main(), seedAdmin(), seedQuizzes(), seedScenarios()

### Community 33 - "seed-scenarios.mjs"
Cohesion: 0.40
Nodes (5): __dirname, envPath, FULL_CURRICULUM_SCENARIOS, initAdmin(), seed()

### Community 50 - "Dashboard.tsx"
Cohesion: 0.13
Nodes (12): MobileHeader(), MobileHeaderProps, MobileModuleChips(), ModuleChip, MODULES, DashboardHeader(), ModuleItem, MODULES (+4 more)

### Community 51 - "approval-service.ts"
Cohesion: 0.16
Nodes (18): DELETE(), GET(), PATCH(), POST(), GET(), PATCH(), GET(), GET() (+10 more)

### Community 52 - "seed-mock-agents.mjs"
Cohesion: 0.40
Nodes (5): __dirname, envPath, initAdmin(), MOCKUP_AGENTS, seed()

### Community 55 - "package.json"
Cohesion: 0.50
Nodes (3): name, private, version

### Community 56 - "QuizResult.tsx"
Cohesion: 0.33
Nodes (13): PhaseBreakdown, PhaseBreakdownProps, ResultView, ResultViewProps, QuestionCardProps, QuizBriefingProps, QuizResultProps, QuizSessionProps (+5 more)

### Community 71 - "BrandingPanel.tsx"
Cohesion: 0.28
Nodes (6): BrandingPanel(), MODULES, STATS_CONFIG, FloatingDecoration(), StatCounter(), StatCounterProps

### Community 73 - "LoginForm.tsx"
Cohesion: 0.36
Nodes (6): DEV_MOCK_AGENTS, DevMockAgent, DevMockupSelector(), LoginForm(), LoginFormProps, useSession()

### Community 77 - "CongratulationsCard.tsx"
Cohesion: 0.38
Nodes (4): Confetti, CongratulationsCard, CongratulationsCardProps, TrophyHero

### Community 78 - "login/page.tsx"
Cohesion: 0.40
Nodes (3): Tab, BackgroundEffects, auth

## Knowledge Gaps
- **248 isolated node(s):** `dmSans`, `dmMono`, `Tab`, `ICON_MAP`, `C` (+243 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **17 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `dependencies` to `[locale]/layout.tsx`, `agent-training/index.tsx`, `export/route.ts`, `package.json`?**
  _High betweenness centrality (0.103) - this node is a cross-community bridge._
- **Why does `xlsx` connect `export/route.ts` to `approval-service.ts`, `AdjustmentsTab.tsx`, `dependencies`?**
  _High betweenness centrality (0.046) - this node is a cross-community bridge._
- **What connects `dmSans`, `dmMono`, `Tab` to the rest of the system?**
  _248 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06202950918398073 - nodes in this community are weakly interconnected._
- **Should `fsSet` be split into smaller, more focused modules?**
  _Cohesion score 0.05569620253164557 - nodes in this community are weakly interconnected._
- **Should `CourseHub.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.0655367231638418 - nodes in this community are weakly interconnected._
- **Should `agent-training/index.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.07644110275689223 - nodes in this community are weakly interconnected._