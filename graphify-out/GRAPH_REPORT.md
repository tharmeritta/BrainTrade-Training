# Graph Report - BrainTrade Training  (2026-05-07)

## Corpus Check
- 243 files · ~123,056 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 604 nodes · 1500 edges · 44 communities (39 shown, 5 thin omitted)
- Extraction: 87% EXTRACTED · 13% INFERRED · 0% AMBIGUOUS · INFERRED: 194 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `bba27195`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 33|Community 33]]

## God Nodes (most connected - your core abstractions)
1. `getAdminDb()` - 48 edges
2. `getServerUser()` - 43 edges
3. `requireAdminOrManager()` - 24 edges
4. `fsAdd()` - 23 edges
5. `fsGetAll()` - 22 edges
6. `requireAdminManagerOrTrainer()` - 20 edges
7. `fsSet()` - 19 edges
8. `updateAgentOverallScore()` - 19 edges
9. `getAllAgentStats()` - 18 edges
10. `fsGet()` - 18 edges

## Surprising Connections (you probably didn't know these)
- `GET()` --calls--> `getAgentStats()`  [INFERRED]
  app/api/agent/progress/route.ts → lib/agents.ts
- `GET()` --calls--> `getAllAgentStats()`  [INFERRED]
  app/api/agents/route.ts → lib/agents.ts
- `GET()` --calls--> `getServerUser()`  [INFERRED]
  app/api/admin/agents/override/route.ts → lib/session.ts
- `POST()` --calls--> `getServerUser()`  [INFERRED]
  app/api/admin/agents/override/route.ts → lib/session.ts
- `DELETE()` --calls--> `getServerUser()`  [INFERRED]
  app/api/admin/agents/override/route.ts → lib/session.ts

## Communities (44 total, 5 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.07
Nodes (57): DELETE(), GET(), AdminPageContent(), GET(), POST(), AiEvalLayout(), DELETE(), GET() (+49 more)

### Community 1 - "Community 1"
Cohesion: 0.08
Nodes (18): KpiCard(), scoreBg(), scoreColor(), timeAgo(), handleOverride(), requestOverride(), useEvaluationsData(), useEvaluatorDashboard() (+10 more)

### Community 2 - "Community 2"
Cohesion: 0.06
Nodes (12): MobileHeader(), MobileModuleChips(), getInitials(), normalizeName(), ReturningUserBanner(), useAgentEntry(), getInitials(), normalizeName() (+4 more)

### Community 3 - "Community 3"
Cohesion: 0.07
Nodes (12): handleSync(), handleStorageChange(), clearAgentSession(), getAgentSession(), setAgentSession(), stagger(), hasStaffSession(), isAnswerCorrect() (+4 more)

### Community 4 - "Community 4"
Cohesion: 0.12
Nodes (27): GET(), POST(), POST(), cleanEmail(), cleanId(), cleanValue(), getAdminApp(), getAdminDb() (+19 more)

### Community 5 - "Community 5"
Cohesion: 0.08
Nodes (11): summon(), useAgentPresence(), useTrackPresence(), DisciplineTab(), NewPeriodModal(), getModuleLabel(), handleBulkMarkLearned(), handleSummon() (+3 more)

### Community 6 - "Community 6"
Cohesion: 0.13
Nodes (10): GET(), PresentationViewer(), GET(), LearnIndexPage(), getCourseModule(), getCourseModules(), useLivePresentation(), LearnPageContent() (+2 more)

### Community 7 - "Community 7"
Cohesion: 0.14
Nodes (7): ensureFirebaseSession(), handleFileUpload(), EditorHeader(), EmptyState(), FormField(), updateDeep(), useConfigEditor()

### Community 9 - "Community 9"
Cohesion: 0.18
Nodes (6): POST(), getGeminiModel(), getOpenAI(), POST(), AiAuditService, SemanticAuditService

### Community 10 - "Community 10"
Cohesion: 0.16
Nodes (4): getDefaultTab(), getVisibleTabs(), useAdminDashboard(), AdminDashboard()

### Community 12 - "Community 12"
Cohesion: 0.22
Nodes (12): GET(), GET(), buildIndividualSheet(), buildOverviewSheet(), GET(), scoreFill(), GET(), buildAiEval() (+4 more)

### Community 14 - "Community 14"
Cohesion: 0.23
Nodes (11): resolve(), handleJoinSummon(), clearEvalSession(), getEvalSession(), getProgress(), key(), load(), remove() (+3 more)

### Community 15 - "Community 15"
Cohesion: 0.27
Nodes (7): normalizeName(), POST(), GET(), getAdminAuth(), fsGetWhere(), POST(), setSession()

### Community 18 - "Community 18"
Cohesion: 0.83
Nodes (3): main(), seedLearnCourses(), seedQuizzes()

## Knowledge Gaps
- **1 isolated node(s):** `graphify`
  These have ≤1 connection - possible missing edges or undocumented components.
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getAdminDb()` connect `Community 4` to `Community 0`, `Community 6`, `Community 9`, `Community 13`, `Community 15`?**
  _High betweenness centrality (0.051) - this node is a cross-community bridge._
- **Why does `getServerUser()` connect `Community 0` to `Community 4`, `Community 6`, `Community 9`, `Community 12`, `Community 15`?**
  _High betweenness centrality (0.038) - this node is a cross-community bridge._
- **Why does `getAgentSession()` connect `Community 3` to `Community 6`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **Are the 31 inferred relationships involving `getAdminDb()` (e.g. with `GET()` and `POST()`) actually correct?**
  _`getAdminDb()` has 31 INFERRED edges - model-reasoned connections that need verification._
- **Are the 23 inferred relationships involving `getServerUser()` (e.g. with `GET()` and `POST()`) actually correct?**
  _`getServerUser()` has 23 INFERRED edges - model-reasoned connections that need verification._
- **Are the 13 inferred relationships involving `requireAdminOrManager()` (e.g. with `POST()` and `GET()`) actually correct?**
  _`requireAdminOrManager()` has 13 INFERRED edges - model-reasoned connections that need verification._
- **Are the 11 inferred relationships involving `fsAdd()` (e.g. with `POST()` and `POST()`) actually correct?**
  _`fsAdd()` has 11 INFERRED edges - model-reasoned connections that need verification._