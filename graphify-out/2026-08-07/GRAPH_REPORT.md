# Graph Report - .  (2026-08-07)

## Corpus Check
- 275 files · ~127,936 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1040 nodes · 2617 edges · 75 communities (56 shown, 19 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 6 edges (avg confidence: 0.75)
- Token cost: 0 input · 0 output

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
- App Api Admin
- Anthropic Ai Sdk
- autoprefixer
- App Api Admin
- Components Features Admin
- App Api Admin
- App Api Admin
- Components Features Admin
- Components Features Admin
- Components Features Admin
- App Api Agent
- App Api Admin
- package
- Scripts Seed Admin
- Components Features Admin
- Scripts Seed Full
- Concept:Pitch Prompt
- Scripts Deploy
- Scripts Seed Final
- Scripts Seed Quizzes
- Components Features Admin
- config:apphosting
- Next Config
- Scripts Debug Firebase
- config:cloudbuild
- config:env
- doc:GEMINI.md
- Eslint Eslintrc
- Eslint Plugin React
- Framer Motion
- Google Cloud Storage
- Next Env D
- openai
- Package Devdependencies Types
- Package Devdependencies Types
- Tailwind Config

## God Nodes (most connected - your core abstractions)
1. `getAdminDb()` - 50 edges
2. `getServerUser()` - 46 edges
3. `AgentStats` - 38 edges
4. `TrainingPeriod` - 27 edges
5. `fsGetAll()` - 23 edges
6. `fsUpdate()` - 23 edges
7. `updateAgentOverallScore()` - 23 edges
8. `getAgentSession()` - 23 edges
9. `scoreColor()` - 22 edges
10. `fsSet()` - 22 edges

## Surprising Connections (you probably didn't know these)
- `AdminPageContent()` --calls--> `requireAdminManagerOrTrainer()`  [EXTRACTED]
  app/[locale]/admin/page.tsx → lib/session/server.ts
- `AiEvalLayout()` --calls--> `getServerUser()`  [EXTRACTED]
  app/[locale]/ai-eval/layout.tsx → lib/session/server.ts
- `EvaluatorPageContent()` --calls--> `getServerUser()`  [EXTRACTED]
  app/[locale]/evaluator/page.tsx → lib/session/server.ts
- `LearnLayout()` --calls--> `getServerUser()`  [EXTRACTED]
  app/[locale]/learn/layout.tsx → lib/session/server.ts
- `QuizLayout()` --calls--> `getServerUser()`  [EXTRACTED]
  app/[locale]/quiz/layout.tsx → lib/session/server.ts

## Import Cycles
- None detected.

## Communities (75 total, 19 thin omitted)

### Community 0 - "App Locale Login"
Cohesion: 0.05
Nodes (57): HRAnalyticsTab(), BrandingPanel(), MODULES, STATS_CONFIG, EntryAvatar(), EntryAvatarProps, FloatingDecoration(), LoginForm() (+49 more)

### Community 1 - "App Locale Quiz"
Cohesion: 0.06
Nodes (51): C, ICON_MAP, QuizIndexPage(), QuizSystem(), QuizBriefing, reveal, PhaseBreakdown, PhaseBreakdownProps (+43 more)

### Community 2 - "App Locale Login"
Cohesion: 0.07
Nodes (40): Tab, ActiveBatchHeader(), ActiveBatchHeaderProps, ArchiveSelectionGrid(), ArchiveSelectionGridProps, LivePulse(), useSummon(), DayRecordForm (+32 more)

### Community 3 - "App Locale Ai"
Cohesion: 0.07
Nodes (41): AiEvalLayout(), DashboardLayout(), DashboardPage(), dmMono, dmSans, LearnLayout(), QuizLayout(), normalizeName() (+33 more)

### Community 4 - "App Api Courses"
Cohesion: 0.07
Nodes (41): GET(), GET(), LearnPageContent(), LearnIndexPage(), CourseCard, CourseCardProps, CourseHeader, CourseHeaderProps (+33 more)

### Community 5 - "App Api Ai"
Cohesion: 0.10
Nodes (20): POST(), DELETE(), POST(), DIFF, DIFF_ORDER, EMPTY_FORM, inputCls, textareaCls (+12 more)

### Community 6 - "Components Features Admin"
Cohesion: 0.09
Nodes (29): AiEvalConfig, AiEvalEditor(), DiagnosticResult, DiagnosticRunner(), HealthManager(), LearnConfig, LearnEditor(), LearnModule (+21 more)

### Community 7 - "App Api Admin"
Cohesion: 0.12
Nodes (29): GET(), GET(), POST(), GET(), GET(), GET(), POST(), DELETE() (+21 more)

### Community 8 - "App Locale Ai"
Cohesion: 0.10
Nodes (23): AuditFlow(), AuditFlowProps, ChatView, CoachingCard, ScoreTrend, AiEvaluation(), DEFAULT_CRITERIA, IntroView (+15 more)

### Community 9 - "App Locale Admin"
Cohesion: 0.10
Nodes (23): AdminPageContent(), AdminHeader(), AdminHeaderProps, AdminSidebar(), AdminSidebarProps, NavGroupProps, AdminTabContent(), AdminTabContentProps (+15 more)

### Community 10 - "App Api Admin"
Cohesion: 0.09
Nodes (22): AMBER, buildIndividualSheet(), buildOverviewSheet(), GET(), GREEN, RED, scoreFill(), AiScenarioImportModal() (+14 more)

### Community 11 - "App Locale Evaluator"
Cohesion: 0.17
Nodes (22): EvaluatorPageContent(), AgentPerformancePanel(), EvalForm(), EvalFormProps, EvalHistoryCard(), useEvaluatorDashboard(), EvaluatorDashboard(), EvaluatorDashboardProps (+14 more)

### Community 12 - "App Api Admin"
Cohesion: 0.19
Nodes (16): defaults(), POST(), ProgressRecord, POST(), PATCH(), POST(), PATCH(), fsGet() (+8 more)

### Community 13 - "App Api Admin"
Cohesion: 0.13
Nodes (22): EMPTY, GET(), POST(), GET(), GET(), GET(), QuizResult, buildAiEval() (+14 more)

### Community 14 - "Components Features Admin"
Cohesion: 0.16
Nodes (19): BADGE_CONFIG, MODULE_LABELS, scoreColor(), BypassModal(), BypassModalProps, DetailedAiEvalHistory(), DetailedHumanEvaluations(), DetailedQuizHistory() (+11 more)

### Community 15 - "Ref Dom"
Cohesion: 0.07
Nodes (27): dom, dom.iterable, esnext, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules, **/*.ts (+19 more)

### Community 16 - "App Api Admin"
Cohesion: 0.17
Nodes (16): DELETE(), POST(), POST(), GET(), PATCH(), GET(), POST(), GET() (+8 more)

### Community 17 - "App Api Admin"
Cohesion: 0.17
Nodes (11): POST(), maxDuration, POST(), EvalHistoryCardProps, OverviewPanelProps, getGeminiModel(), getOpenAI(), SemanticAuditResult (+3 more)

### Community 18 - "Anthropic Ai Sdk"
Cohesion: 0.10
Nodes (21): @anthropic-ai/sdk, firebase, firebase-admin, @google/generative-ai, lucide-react, next, next-intl, dependencies (+13 more)

### Community 19 - "autoprefixer"
Cohesion: 0.10
Nodes (21): autoprefixer, babel-plugin-react-compiler, eslint, eslint-config-next, @eslint/js, eslint-plugin-jsx-a11y, devDependencies, autoprefixer (+13 more)

### Community 20 - "App Api Admin"
Cohesion: 0.19
Nodes (14): maxDuration, POST(), GET(), POST(), setSession(), fsGetWhere(), cleanEmail(), cleanId() (+6 more)

### Community 21 - "Components Features Admin"
Cohesion: 0.19
Nodes (12): scoreBg(), HistoryTab(), CompletionGrid(), CompletionGridProps, KpiSection(), KpiSectionProps, LeaderboardTable(), TrainingWavesSection() (+4 more)

### Community 22 - "App Api Admin"
Cohesion: 0.23
Nodes (12): GET(), DELETE(), PATCH(), POST(), GET(), GET(), POST(), GET() (+4 more)

### Community 23 - "App Api Admin"
Cohesion: 0.19
Nodes (11): DELETE, PATCH, GET, POST, GET, PATCH, POST, apiError() (+3 more)

### Community 24 - "Components Features Admin"
Cohesion: 0.28
Nodes (10): timeAgo(), DetailedEvaluation(), DetailedEvaluationProps, EvalRow(), EvaluationsDashboard(), EvaluationsDashboardProps, AdminEval, EvalTab (+2 more)

### Community 25 - "Components Features Admin"
Cohesion: 0.15
Nodes (12): ApprovalsTab(), AgentProgress, ApprovalActionType, ApprovalRequest, EvaluationCriteria, EvaluationSessionType, Evaluator, LiveSessionRecord (+4 more)

### Community 26 - "Components Features Admin"
Cohesion: 0.35
Nodes (8): GraduationRoster(), STATUS_ORDER, StatusPipeline(), OverviewPanel(), CompletionConfig, CompletionInfo, CompletionStatus, getCompletionStatus()

### Community 27 - "App Api Agent"
Cohesion: 0.31
Nodes (8): defaults(), GET(), POST(), ProgressRecord, POST(), getActiveTrainingPeriod(), updateGlobalLearningStats(), updateGlobalQuizStats()

### Community 28 - "App Api Admin"
Cohesion: 0.28
Nodes (5): FeedItem, GET(), normalizeName(), POST(), fsQuery()

### Community 29 - "package"
Cohesion: 0.22
Nodes (8): name, private, scripts, build, dev, lint, start, version

### Community 30 - "Scripts Seed Admin"
Cohesion: 0.29
Nodes (5): auth, db, __dirname, envFile, envPath

### Community 31 - "Components Features Admin"
Cohesion: 0.53
Nodes (4): getCompletionStatus(), ReportsTab(), statusPill(), fetchWithCache()

### Community 32 - "Scripts Seed Full"
Cohesion: 0.47
Nodes (5): db, main(), privateKey, seedLearnCourses(), seedQuizzes()

### Community 36 - "Scripts Seed Quizzes"
Cohesion: 0.67
Nodes (3): initAdmin(), QUIZ_DEFAULTS, seed()

## Knowledge Gaps
- **225 isolated node(s):** `dmSans`, `dmMono`, `Tab`, `ICON_MAP`, `C` (+220 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **19 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `Anthropic Ai Sdk` to `App Api Admin`, `Framer Motion`, `Google Cloud Storage`, `openai`, `package`?**
  _High betweenness centrality (0.106) - this node is a cross-community bridge._
- **Why does `xlsx` connect `App Api Admin` to `Anthropic Ai Sdk`, `App Api Ai`, `Components Features Admin`, `App Api Admin`?**
  _High betweenness centrality (0.079) - this node is a cross-community bridge._
- **Why does `GET()` connect `App Api Admin` to `App Api Admin`, `App Api Admin`?**
  _High betweenness centrality (0.041) - this node is a cross-community bridge._
- **What connects `dmSans`, `dmMono`, `Tab` to the rest of the system?**
  _225 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App Locale Login` be split into smaller, more focused modules?**
  _Cohesion score 0.05093632958801498 - nodes in this community are weakly interconnected._
- **Should `App Locale Quiz` be split into smaller, more focused modules?**
  _Cohesion score 0.06060606060606061 - nodes in this community are weakly interconnected._
- **Should `App Locale Login` be split into smaller, more focused modules?**
  _Cohesion score 0.07288135593220339 - nodes in this community are weakly interconnected._