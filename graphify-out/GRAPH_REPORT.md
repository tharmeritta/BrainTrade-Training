# Graph Report - BrainTrade-Training  (2026-08-11)

## Corpus Check
- 286 files · ~155,474 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1168 nodes · 2890 edges · 79 communities (62 shown, 17 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 18 edges (avg confidence: 0.82)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `d21707ba`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- AgentStats
- fsSet
- fsAdd
- agent-training/index.tsx
- xlsx
- agent.ts
- TrainingPeriod
- agents.ts
- AgentEntry.tsx
- index.ts
- staff/route.ts
- dependencies
- AiScenarioImportModal.tsx
- AdminDashboard.tsx
- AdjustmentsTab.tsx
- AgentSection.tsx
- animations.ts
- compilerOptions
- quiz-data.ts
- firebase-admin.ts
- devDependencies
- firebase-admin
- @google-cloud/storage
- getAdminDb
- sync-session-memory.js
- StaffTab.tsx
- server.ts
- ai-eval/index.tsx
- next-intl
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
- BrandingPanel.tsx
- LoginForm.tsx
- seed-mock-agents.mjs
- next-env.d.ts
- git-auto-commit.sh
- CourseHub.tsx
- HRAnalyticsTab.tsx
- tailwind.config.ts
- lib/quiz/types.ts
- getServerUser
- lib/constants.ts
- agy-start.sh
- CongratulationsCard.tsx
- ensure-dev-server.js
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

## Communities (79 total, 17 thin omitted)

### Community 0 - "AgentStats"
Cohesion: 0.05
Nodes (76): EvaluatorPageContent(), BypassModal(), BypassModalProps, DetailedAiEvalHistory(), DetailedHumanEvaluations(), DetailedQuizHistory(), requestOverride(), ProfileHeader() (+68 more)

### Community 1 - "fsSet"
Cohesion: 0.06
Nodes (38): POST(), defaults(), POST(), ProgressRecord, POST(), maxDuration, POST(), POST() (+30 more)

### Community 2 - "fsAdd"
Cohesion: 0.22
Nodes (11): GET(), POST(), POST(), POST(), fsAdd(), executeApprovedAction(), resolveApprovalRequest(), updateGlobalAgentCounts() (+3 more)

### Community 3 - "agent-training/index.tsx"
Cohesion: 0.20
Nodes (17): BackgroundEffects, CongratulationsCard, Props, ModuleCard, ModuleCardProps, ModuleHeader, ModuleHeaderProps, ProfileSidebar (+9 more)

### Community 4 - "xlsx"
Cohesion: 0.33
Nodes (5): GET(), SandboxManagerModal(), SandboxManagerModalProps, xlsx, xlsx

### Community 5 - "agent.ts"
Cohesion: 0.06
Nodes (48): AiEvalLayout(), DashboardLayout(), DashboardPage(), dmMono, dmSans, LearnLayout(), QuizLayout(), C (+40 more)

### Community 6 - "TrainingPeriod"
Cohesion: 0.07
Nodes (41): Tab, ActiveBatchHeader(), ActiveBatchHeaderProps, ArchiveSelectionGrid(), ArchiveSelectionGridProps, LivePulse(), DayRecordForm, DayRecordFormProps (+33 more)

### Community 7 - "agents.ts"
Cohesion: 0.08
Nodes (36): AMBER, buildIndividualSheet(), buildOverviewSheet(), GET(), GREEN, RED, scoreFill(), GET() (+28 more)

### Community 8 - "AgentEntry.tsx"
Cohesion: 0.18
Nodes (12): EntryAvatar(), EntryAvatarProps, MobileHeader(), MobileHeaderProps, MobileModuleChips(), ModuleChip, MODULES, AgentEntry() (+4 more)

### Community 9 - "index.ts"
Cohesion: 0.09
Nodes (24): GET(), GET(), FeedItem, GET(), EMPTY, GET(), MOCKUP_AGENTS, normalizeName() (+16 more)

### Community 10 - "staff/route.ts"
Cohesion: 0.17
Nodes (12): DELETE, PATCH, GET, POST, GET, PATCH, POST, apiError() (+4 more)

### Community 11 - "dependencies"
Cohesion: 0.11
Nodes (19): firebase, framer-motion, @google/generative-ai, lucide-react, next, nodemailer, openai, dependencies (+11 more)

### Community 12 - "AiScenarioImportModal.tsx"
Cohesion: 0.36
Nodes (6): AiScenarioImportModal(), AiScenarioImportModalProps, AI_SCENARIO_TEMPLATE, DEFAULT_CRITERIA, downloadScenarioTemplate(), parseScenarioFile()

### Community 13 - "AdminDashboard.tsx"
Cohesion: 0.08
Nodes (28): POST(), AdminHeader(), AdminHeaderProps, AdminSidebar(), AdminSidebarProps, NavGroupProps, AdminTabContent(), AdminTabContentProps (+20 more)

### Community 14 - "AdjustmentsTab.tsx"
Cohesion: 0.08
Nodes (30): AiEvalConfig, AiEvalEditor(), DiagnosticResult, DiagnosticRunner(), HealthManager(), LearnConfig, LearnEditor(), LearnModule (+22 more)

### Community 15 - "AgentSection.tsx"
Cohesion: 0.50
Nodes (3): BulkImportModal(), BulkImportModalProps, AgentSection()

### Community 16 - "animations.ts"
Cohesion: 0.20
Nodes (8): ModuleItem, MODULES, BackgroundEffects, BrandedTitle(), BrandedTitleProps, EASE, FADE_IN, STAGGER_CONTAINER

### Community 17 - "compilerOptions"
Cohesion: 0.07
Nodes (27): dom, dom.iterable, esnext, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules, **/*.ts (+19 more)

### Community 18 - "quiz-data.ts"
Cohesion: 0.07
Nodes (56): ConfettiBurst(), getNextRankProgress(), getRankForXp(), playGamifiedSound(), RankInfo, RANKS, SoundWaveIndicator(), triggerHaptic() (+48 more)

### Community 19 - "firebase-admin.ts"
Cohesion: 0.15
Nodes (15): POST(), GET(), GET(), createCustomTokenSafe(), POST(), setSession(), fsGetWhere(), cleanEmail() (+7 more)

### Community 20 - "devDependencies"
Cohesion: 0.04
Nodes (46): autoprefixer, babel-plugin-react-compiler, eslint, eslint-config-next, @eslint/eslintrc, @eslint/js, eslint-plugin-jsx-a11y, eslint-plugin-react-hooks (+38 more)

### Community 23 - "getAdminDb"
Cohesion: 0.18
Nodes (24): DELETE(), GET(), POST(), POST(), POST(), POST(), PATCH(), GET() (+16 more)

### Community 24 - "sync-session-memory.js"
Cohesion: 0.38
Nodes (6): { execSync }, fs, getRecentBranch(), getRecentGitCommits(), path, syncSessionMemory()

### Community 25 - "StaffTab.tsx"
Cohesion: 0.32
Nodes (4): AccessNotes(), EditState, ROLE_COLORS, StaffSection()

### Community 26 - "server.ts"
Cohesion: 0.18
Nodes (17): DELETE(), PATCH(), GET(), POST(), GET(), POST(), DELETE(), PATCH() (+9 more)

### Community 27 - "ai-eval/index.tsx"
Cohesion: 0.09
Nodes (24): AuditFlow(), AuditFlowProps, CallSimulatorHud(), CallSimulatorHudProps, ChatView, CoachingCard, ScoreTrend, AiEvaluation() (+16 more)

### Community 29 - "seed.mjs"
Cohesion: 0.39
Nodes (7): __dirname, envPath, initAdmin(), main(), seedAdmin(), seedQuizzes(), seedScenarios()

### Community 33 - "seed-scenarios.mjs"
Cohesion: 0.40
Nodes (5): __dirname, envPath, FULL_CURRICULUM_SCENARIOS, initAdmin(), seed()

### Community 50 - "BrandingPanel.tsx"
Cohesion: 0.28
Nodes (6): BrandingPanel(), MODULES, STATS_CONFIG, FloatingDecoration(), StatCounter(), StatCounterProps

### Community 51 - "LoginForm.tsx"
Cohesion: 0.38
Nodes (5): DEV_MOCK_AGENTS, DevMockAgent, DevMockupSelector(), LoginForm(), LoginFormProps

### Community 52 - "seed-mock-agents.mjs"
Cohesion: 0.40
Nodes (5): __dirname, envPath, initAdmin(), MOCKUP_AGENTS, seed()

### Community 55 - "CourseHub.tsx"
Cohesion: 0.06
Nodes (46): maxDuration, POST(), GET(), GET(), LearnPageContent(), LearnIndexPage(), CourseCard, CourseCardProps (+38 more)

### Community 56 - "HRAnalyticsTab.tsx"
Cohesion: 0.25
Nodes (7): HRAnalyticsTab(), AiSkillGapReport(), CRITERIA_MAP, SkillGapItem, AgentTrainingHub(), deriveSteps(), scoreColor()

### Community 71 - "lib/quiz/types.ts"
Cohesion: 0.22
Nodes (8): Language, PASS_THRESHOLD, QuestionData, QuestionType, QuizDefinition, QuizPhase, QuizUIOverrides, UI_STRINGS

### Community 72 - "getServerUser"
Cohesion: 0.20
Nodes (15): DELETE(), GET(), PATCH(), POST(), GET(), PATCH(), DELETE(), PATCH() (+7 more)

### Community 73 - "lib/constants.ts"
Cohesion: 0.13
Nodes (17): POST(), AgentSkillRow, CohortHeatmap(), CohortHeatmapProps, DEFAULT_ROWS, generateText(), getGeminiModel(), getOpenAI() (+9 more)

### Community 77 - "CongratulationsCard.tsx"
Cohesion: 0.38
Nodes (4): Confetti, CongratulationsCard, CongratulationsCardProps, TrophyHero

### Community 83 - "ensure-dev-server.js"
Cohesion: 0.32
Nodes (7): checkServerReady(), ensureDevServer(), fs, http, logStderr(), path, { spawn, execSync }

### Community 92 - "ReturningUserBanner.tsx"
Cohesion: 0.60
Nodes (4): getInitials(), normalizeName(), ReturningUserBanner(), ReturningUserBannerProps

## Knowledge Gaps
- **270 isolated node(s):** `dmSans`, `dmMono`, `Tab`, `ICON_MAP`, `C` (+265 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **17 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `dependencies` to `xlsx`, `devDependencies`, `firebase-admin`, `@google-cloud/storage`, `CourseHub.tsx`, `next-intl`?**
  _High betweenness centrality (0.070) - this node is a cross-community bridge._
- **Why does `AgentStats` connect `AgentStats` to `agent-training/index.tsx`, `agent.ts`, `TrainingPeriod`, `agents.ts`, `index.ts`, `getAdminDb`, `CourseHub.tsx`, `HRAnalyticsTab.tsx`?**
  _High betweenness centrality (0.039) - this node is a cross-community bridge._
- **What connects `dmSans`, `dmMono`, `Tab` to the rest of the system?**
  _270 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AgentStats` be split into smaller, more focused modules?**
  _Cohesion score 0.05030274802049371 - nodes in this community are weakly interconnected._
- **Should `fsSet` be split into smaller, more focused modules?**
  _Cohesion score 0.059298245614035086 - nodes in this community are weakly interconnected._
- **Should `agent.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.056338028169014086 - nodes in this community are weakly interconnected._
- **Should `TrainingPeriod` be split into smaller, more focused modules?**
  _Cohesion score 0.07288135593220339 - nodes in this community are weakly interconnected._