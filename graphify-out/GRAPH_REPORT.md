# Graph Report - BrainTrade-Training  (2026-08-07)

## Corpus Check
- 258 files · ~127,835 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1040 nodes · 2617 edges · 75 communities (55 shown, 20 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 14 edges (avg confidence: 0.89)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `1b719444`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- App Locale Login
- App Locale Quiz
- App Locale Login
- App Locale Ai
- App Api Courses
- App Api Ai
- Components Features Admin
- App Api Admin
- App Locale Ai
- App Locale Admin
- App Api Admin
- App Locale Evaluator
- App Api Admin
- App Api Admin
- Components Features Admin
- Ref Dom
- App Api Admin
- Anthropic Ai Sdk
- autoprefixer
- App Api Admin
- Components Features Admin
- App Api Admin
- App Api Admin
- Components Features Admin
- App Api Admin
- Scripts Seed Admin
- Components Features Admin
- Concept:Pitch Prompt
- Scripts Deploy
- Scripts Seed Final
- Scripts Seed Quizzes
- Components Features Admin
- config:apphosting
- Next Config
- Scripts Debug Firebase
- App Api Ai
- App Api Slide
- App Layout
- App Locale Ai
- App Locale Error
- Framer Motion
- Google Cloud Storage
- Next Env D
- openai
- Package Devdependencies Types
- Package Devdependencies Types
- Scripts List Models
- Tailwind Config
- App Api Admin
- Doc:Dev Err.Txt
- Doc:Dev Log.Txt
- Doc:Dev Stderr.Txt
- doc:favicon.svg

## God Nodes (most connected - your core abstractions)
1. `getAdminDb()` - 50 edges
2. `getServerUser()` - 46 edges
3. `AgentStats` - 38 edges
4. `TrainingPeriod` - 27 edges
5. `scoreColor()` - 23 edges
6. `fsGetAll()` - 23 edges
7. `fsUpdate()` - 23 edges
8. `updateAgentOverallScore()` - 23 edges
9. `getAgentSession()` - 23 edges
10. `fsSet()` - 22 edges

## Surprising Connections (you probably didn't know these)
- `AiEvalLayout()` --calls--> `getServerUser()`  [EXTRACTED]
  app/[locale]/ai-eval/layout.tsx → lib/session/server.ts
- `EvaluatorPageContent()` --calls--> `getServerUser()`  [EXTRACTED]
  app/[locale]/evaluator/page.tsx → lib/session/server.ts
- `LearnLayout()` --calls--> `getServerUser()`  [EXTRACTED]
  app/[locale]/learn/layout.tsx → lib/session/server.ts
- `QuizLayout()` --calls--> `getServerUser()`  [EXTRACTED]
  app/[locale]/quiz/layout.tsx → lib/session/server.ts
- `QuizIndexPage()` --indirect_call--> `key()`  [INFERRED]
  app/[locale]/quiz/page.tsx → lib/localCache.ts

## Import Cycles
- None detected.

## Communities (75 total, 20 thin omitted)

### Community 0 - "App Locale Login"
Cohesion: 0.06
Nodes (51): C, ICON_MAP, QuizIndexPage(), QuizSystem(), QuizBriefing, reveal, PhaseBreakdown, PhaseBreakdownProps (+43 more)

### Community 1 - "App Locale Quiz"
Cohesion: 0.07
Nodes (26): maxDuration, POST(), POST(), DELETE(), POST(), DIFF, DIFF_ORDER, EMPTY_FORM (+18 more)

### Community 2 - "App Locale Login"
Cohesion: 0.07
Nodes (41): GET(), GET(), LearnPageContent(), LearnIndexPage(), CourseCard, CourseCardProps, CourseHeader, CourseHeaderProps (+33 more)

### Community 3 - "App Locale Ai"
Cohesion: 0.11
Nodes (27): AiEvalLayout(), DashboardLayout(), DashboardPage(), LearnLayout(), QuizLayout(), normalizeName(), useAgentEntry(), AgentAuthGuard() (+19 more)

### Community 4 - "App Api Courses"
Cohesion: 0.06
Nodes (46): dmMono, dmSans, LivePulse(), DayRecordForm, DayRecordFormProps, DaysTab(), DaysTabProps, DisciplineSubTabProps (+38 more)

### Community 5 - "App Api Ai"
Cohesion: 0.07
Nodes (40): AMBER, buildIndividualSheet(), buildOverviewSheet(), GET(), GREEN, RED, scoreFill(), AiEvalConfig (+32 more)

### Community 6 - "Components Features Admin"
Cohesion: 0.14
Nodes (26): GET(), POST(), DELETE(), PATCH(), GET(), POST(), GET(), POST() (+18 more)

### Community 7 - "App Api Admin"
Cohesion: 0.08
Nodes (28): DiagnosticResult, DiagnosticRunner(), HealthManager(), AuditFlow(), AuditFlowProps, ChatView, CoachingCard, ScoreTrend (+20 more)

### Community 8 - "App Locale Ai"
Cohesion: 0.18
Nodes (20): DELETE(), GET(), POST(), POST(), POST(), GET(), PATCH(), GET() (+12 more)

### Community 9 - "App Locale Admin"
Cohesion: 0.12
Nodes (33): EvaluatorPageContent(), StatusPipeline(), AgentPerformancePanel(), AgentPerformancePanelProps, EvalForm(), EvalFormProps, EvalHistoryCard(), EvalHistoryCardProps (+25 more)

### Community 10 - "App Api Admin"
Cohesion: 0.12
Nodes (22): AdminHeader(), AdminHeaderProps, AdminSidebar(), AdminSidebarProps, NavGroupProps, AdminTabContent(), AdminTabContentProps, TAB_REGISTRY (+14 more)

### Community 11 - "App Locale Evaluator"
Cohesion: 0.16
Nodes (21): HRAnalyticsTab(), BackgroundEffects, AgentTrainingHub(), CongratulationsCard, Props, ModuleCard, ModuleCardProps, ModuleHeader (+13 more)

### Community 12 - "App Api Admin"
Cohesion: 0.14
Nodes (14): GET(), GET(), FeedItem, GET(), EMPTY, GET(), POST(), normalizeName() (+6 more)

### Community 13 - "App Api Admin"
Cohesion: 0.07
Nodes (27): dom, dom.iterable, esnext, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules, **/*.ts (+19 more)

### Community 14 - "Components Features Admin"
Cohesion: 0.06
Nodes (61): BypassModal(), BypassModalProps, DetailedAiEvalHistory(), DetailedHumanEvaluations(), DetailedQuizHistory(), requestOverride(), ProfileHeader(), ProfileHeaderProps (+53 more)

### Community 15 - "Ref Dom"
Cohesion: 0.16
Nodes (19): DELETE(), GET(), PATCH(), POST(), defaults(), POST(), ProgressRecord, POST() (+11 more)

### Community 16 - "App Api Admin"
Cohesion: 0.19
Nodes (14): maxDuration, POST(), GET(), POST(), setSession(), fsGetWhere(), cleanEmail(), cleanId() (+6 more)

### Community 18 - "Anthropic Ai Sdk"
Cohesion: 0.10
Nodes (21): @anthropic-ai/sdk, firebase, firebase-admin, framer-motion, @google-cloud/storage, lucide-react, next, dependencies (+13 more)

### Community 19 - "autoprefixer"
Cohesion: 0.10
Nodes (21): autoprefixer, babel-plugin-react-compiler, eslint, eslint-config-next, @eslint/eslintrc, eslint-plugin-jsx-a11y, eslint-plugin-react-hooks, devDependencies (+13 more)

### Community 20 - "App Api Admin"
Cohesion: 0.12
Nodes (24): GET(), POST(), GET(), POST(), GET(), GET(), GET(), GET() (+16 more)

### Community 21 - "Components Features Admin"
Cohesion: 0.23
Nodes (10): EntryAvatar(), EntryAvatarProps, LoginForm(), LoginFormProps, AgentEntry(), AgentEntryProps, getInitials(), normalizeName() (+2 more)

### Community 22 - "App Api Admin"
Cohesion: 0.15
Nodes (10): MobileHeader(), MobileHeaderProps, MobileModuleChips(), ModuleChip, MODULES, DashboardHeader(), ModuleItem, MODULES (+2 more)

### Community 23 - "App Api Admin"
Cohesion: 0.19
Nodes (11): DELETE, PATCH, GET, POST, GET, PATCH, POST, apiError() (+3 more)

### Community 26 - "Components Features Admin"
Cohesion: 0.21
Nodes (7): BulkImportModal(), BulkImportModalProps, AccessNotes(), AgentSection(), EditState, ROLE_COLORS, StaffSection()

### Community 28 - "App Api Admin"
Cohesion: 0.32
Nodes (8): defaults(), POST(), ProgressRecord, POST(), fsAdd(), getActiveTrainingPeriod(), updateGlobalLearningStats(), MOCKUP_AGENT_ID

### Community 30 - "Scripts Seed Admin"
Cohesion: 0.20
Nodes (9): name, private, scripts, build, check, dev, lint, start (+1 more)

### Community 31 - "Components Features Admin"
Cohesion: 0.28
Nodes (6): BrandingPanel(), MODULES, STATS_CONFIG, FloatingDecoration(), StatCounter(), StatCounterProps

### Community 33 - "Concept:Pitch Prompt"
Cohesion: 0.28
Nodes (4): Tab, BackgroundEffects, EASE, auth

### Community 34 - "Scripts Deploy"
Cohesion: 0.32
Nodes (5): Confetti, CongratulationsCard, CongratulationsCardProps, TrophyHero, FADE_IN

### Community 35 - "Scripts Seed Final"
Cohesion: 0.29
Nodes (5): auth, db, __dirname, envFile, envPath

### Community 36 - "Scripts Seed Quizzes"
Cohesion: 0.47
Nodes (5): db, main(), privateKey, seedLearnCourses(), seedQuizzes()

### Community 37 - "Components Features Admin"
Cohesion: 0.60
Nodes (4): getInitials(), normalizeName(), ReturningUserBanner(), ReturningUserBannerProps

### Community 41 - "App Api Ai"
Cohesion: 0.67
Nodes (3): initAdmin(), QUIZ_DEFAULTS, seed()

## Knowledge Gaps
- **226 isolated node(s):** `dmSans`, `dmMono`, `Tab`, `ICON_MAP`, `C` (+221 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **20 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `Anthropic Ai Sdk` to `App Api Ai`, `Scripts Seed Admin`, `Package Devdependencies Types`, `Tailwind Config`, `App Api Admin`?**
  _High betweenness centrality (0.114) - this node is a cross-community bridge._
- **Why does `xlsx` connect `App Api Ai` to `App Locale Quiz`, `Components Features Admin`, `Anthropic Ai Sdk`, `App Api Admin`?**
  _High betweenness centrality (0.089) - this node is a cross-community bridge._
- **Why does `GET()` connect `App Api Ai` to `App Api Admin`, `Ref Dom`?**
  _High betweenness centrality (0.042) - this node is a cross-community bridge._
- **What connects `dmSans`, `dmMono`, `Tab` to the rest of the system?**
  _226 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App Locale Login` be split into smaller, more focused modules?**
  _Cohesion score 0.062004662004662 - nodes in this community are weakly interconnected._
- **Should `App Locale Quiz` be split into smaller, more focused modules?**
  _Cohesion score 0.0715846994535519 - nodes in this community are weakly interconnected._
- **Should `App Locale Login` be split into smaller, more focused modules?**
  _Cohesion score 0.06954887218045112 - nodes in this community are weakly interconnected._