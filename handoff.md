# 🤝 BrainTrade Training Platform - System Handoff & Architecture Guide

> **Document Status**: ACTIVE  
> **Last Updated**: 2026-08-12  
> **Target Audience**: AI Agents (`handoff-agent`, `hands-on-agent`), Core Developers & System Architects  
> **Primary Repository**: `tharmeritta/BrainTrade-Training`

---

## 1. Executive Summary & Current Project State

The **BrainTrade Training Platform** is an enterprise-grade Next.js (App Router) sales enablement, gamified training, and interactive assessment application designed to onboard, train, evaluate, and certify sales trainees.

### 🌟 Recent Major Milestones Achieved:
1. **Instant Client-Side Tab Switching & Route Animations**:
   - **Shallow History PushState ([`NavBar.tsx`](file:///Users/prinmacpro/Documents/Antigravity%20Projects/BrainTrade-Training/components/ui/NavBar.tsx))**: Refactored tab selection to use `window.history.pushState` with instant `setActiveSection` updates and `popstate` browser back/forward history synchronization.
   - **Framer Motion Route Template ([`app/[locale]/template.tsx`](file:///Users/prinmacpro/Documents/Antigravity%20Projects/BrainTrade-Training/app/%5Blocale%5D/template.tsx))**: Created an `<AnimatePresence mode="wait">` route template with smooth 220ms opacity fade and slide transitions (`opacity: 0, y: 6` → `y: 0` → `y: -6`) eliminating page switch stuttering.
   - **Sub-Tab Transition System ([`AdminTabContent.tsx`](file:///Users/prinmacpro/Documents/Antigravity%20Projects/BrainTrade-Training/components/features/admin/AdminTabContent.tsx), [`AdjustmentsTab.tsx`](file:///Users/prinmacpro/Documents/Antigravity%20Projects/BrainTrade-Training/components/features/admin/AdjustmentsTab.tsx))**: Added spring `layoutId` pill indicators and Framer Motion view transitions across all admin sub-tab sections.

2. **Localization & Next-Intl Key Resolution**:
   - Resolved `MISSING_MESSAGE: Could not resolve trainingHub.learn` console error by adding `"learn"`, `"quiz"`, and `"aiEval"` entries to [`messages/en.json`](file:///Users/prinmacpro/Documents/Antigravity%20Projects/BrainTrade-Training/messages/en.json) and [`messages/th.json`](file:///Users/prinmacpro/Documents/Antigravity%20Projects/BrainTrade-Training/messages/th.json).

3. **Gamified Quiz Selection Hub ([`app/[locale]/quiz/page.tsx`](file:///Users/prinmacpro/Documents/Antigravity%20Projects/BrainTrade-Training/app/%5Blocale%5D/quiz/page.tsx))**:
   - **Dual-View Navigation**: Seamless toggle between **Quest Map** (winding S-curve SVG level map) and **Arcade Grid** (neon arcade stage cards).
   - **Floating Player HUD ([`QuizPlayerHUD.tsx`](file:///Users/prinmacpro/Documents/Antigravity%20Projects/BrainTrade-Training/components/features/quiz/QuizPlayerHUD.tsx))**: Live display of Trainee Level, Rank Titles (Trainee → Master), XP progress bar, 🔥 3-Day streak, ❤️ Lives indicator, and ⭐ Stars collected.
   - **Interactive Quest Map ([`QuestMapCanvas.tsx`](file:///Users/prinmacpro/Documents/Antigravity%20Projects/BrainTrade-Training/components/features/quiz/QuestMapCanvas.tsx))**: Visual path connecting stage nodes with animated active rings, prerequisite locking, and sound/haptic feedback.
   - **Arcade Stage Cards ([`ArcadeStageCard.tsx`](file:///Users/prinmacpro/Documents/Antigravity%20Projects/BrainTrade-Training/components/features/quiz/ArcadeStageCard.tsx))**: Glassmorphic cards with side color accents, ⭐⭐⭐ 3-star mastery ratings, pass thresholds, and prerequisite lock banners.
   - **Gamification Engine ([`gamification.tsx`](file:///Users/prinmacpro/Documents/Antigravity%20Projects/BrainTrade-Training/components/features/quiz/gamification.tsx))**: Web Audio API synthesizer (`playGamifiedSound`), Haptic Vibration API (`triggerHaptic`), and rank calculation logic.

4. **Trainee Onboarding & Guided Spotlight Tour**:
   - **Welcome Modal ([`WelcomeOnboardingModal.tsx`](file:///Users/prinmacpro/Documents/Antigravity%20Projects/BrainTrade-Training/components/ui/WelcomeOnboardingModal.tsx))**: 4-step welcome dialog introducing the 3 core pillars (Learn, Quiz, AI Call Simulator) with keyboard navigation support.
   - **Guided Spotlight Tour ([`FeatureSpotlightTour.tsx`](file:///Users/prinmacpro/Documents/Antigravity%20Projects/BrainTrade-Training/components/ui/FeatureSpotlightTour.tsx))**: Dynamic SVG mask backdrop with pulsing gold border highlight around targeted UI elements (`data-tour="..."`) and position-clamped popover tooltips.

5. **Training Wave Self-Onboarding & Registration**:
   - **Wave Invite Code Generator**: Auto-generates unique `WAVE-XXXX` codes in [`NewPeriodModal.tsx`](file:///Users/prinmacpro/Documents/Antigravity%20Projects/BrainTrade-Training/components/features/trainer/NewPeriodModal.tsx) and [`app/api/trainer/training-periods/route.ts`](file:///Users/prinmacpro/Documents/Antigravity%20Projects/BrainTrade-Training/app/api/trainer/training-periods/route.ts).
   - **Public Join Portal ([`app/[locale]/join/page.tsx`](file:///Users/prinmacpro/Documents/Antigravity%20Projects/BrainTrade-Training/app/%5Blocale%5D/join/page.tsx))**: Trainees enter invite code and full name for self-registration. Realtime API validation at [`app/api/join/route.ts`](file:///Users/prinmacpro/Documents/Antigravity%20Projects/BrainTrade-Training/app/api/join/route.ts).

6. **Firebase App Hosting & Learn Performance Optimization**:
   - **Cold Start Prevention ([`apphosting.yaml`](file:///Users/prinmacpro/Documents/Antigravity%20Projects/BrainTrade-Training/apphosting.yaml))**: Adjusted `minInstances: 1` to eliminate Cloud Run 0-instance cold starts.
   - **Server-Side Data Caching ([`lib/server/courses.ts`](file:///Users/prinmacpro/Documents/Antigravity%20Projects/BrainTrade-Training/lib/server/courses.ts))**: Wrapped course module queries with Next.js `unstable_cache` (1-hour revalidation tag `course-modules`) and React `cache()`.
   - **Render Gate & Admin Preview Fast-Path ([`AgentAuthGuard.tsx`](file:///Users/prinmacpro/Documents/Antigravity%20Projects/BrainTrade-Training/components/providers/AgentAuthGuard.tsx), [`lib/agents.ts`](file:///Users/prinmacpro/Documents/Antigravity%20Projects/BrainTrade-Training/lib/agents.ts))**: Removed blocking `ready` state gate to prevent blank screens on refresh, and short-circuited virtual `'admin-preview-agent'` stats calculations to 0ms latency.

7. **Agent Suite Thai Localization Default**:
   - Verified system global default locale is `th` (`DEFAULT_LOCALE = 'th'`).
   - Localized course catalogue badges, loading spinners, presentation slide initializers (`initialLang: lang === 'en' ? 'en' : 'th'`), and locked quiz modals in [`messages/th.json`](file:///Users/prinmacpro/Documents/Antigravity%20Projects/BrainTrade-Training/messages/th.json).

---

## 2. Directory Architecture & Topology

```
BrainTrade-Training/
├── app/
│   ├── [locale]/
│   │   ├── admin/           # Trainer & Admin Management Dashboard
│   │   ├── ai-eval/         # AI Call Simulator HUD & Coaching Feedback
│   │   ├── dashboard/       # Trainee Agent Hub (Main Entry)
│   │   ├── join/            # Trainee Wave Self-Onboarding Landing Page
│   │   ├── learn/           # Slide Deck Viewer & Audio Voiceover Player
│   │   ├── login/           # Agent & Trainer Sign-in
│   │   └── quiz/            # Arcade Quiz Selection Hub & 3-Heart Engine
│   └── api/                 # Next.js App Router API Route Handlers
│       ├── agent/           # Progress sync, acknowledge, stats APIs
│       ├── join/            # Wave invite verification & self-registration
│       ├── quiz/            # Quiz config, completion status, score updates
│       └── trainer/         # Wave creation, training period management
├── components/
│   ├── features/            # Feature-Specific Modular Components
│   │   ├── admin/           # Admin Dashboard, Roster, Score Adjustments
│   │   ├── agent-training/  # Training Hub, ProfileSidebar, QuickNextTaskBanner
│   │   ├── ai-eval/         # Call Simulator, Diagnostic Runner, Audio HUD
│   │   ├── learn/           # Course Deck Viewer & Drawing Canvas
│   │   ├── quiz/            # QuizSession, QuestMapCanvas, QuizPlayerHUD, ArcadeStageCard
│   │   └── trainer/         # Wave Management, NewPeriodModal, PeriodDetail
│   ├── providers/           # Session & Auth Context Providers
│   └── ui/                  # Shared UI components (NavBar, Onboarding Modals, GlassCard)
├── constants/               # Training constants, steps, badge tiers
├── lib/                     # Core Business Logic & Helpers
│   ├── quiz-data.ts         # Canonical quiz definitions & section mappings
│   ├── registry.ts          # Module prerequisites & canonical key resolvers
│   ├── session/             # Client & server session helpers (agent, staff, admin)
│   ├── server/              # Firebase Admin SDK & server-side db helpers
│   └── services/            # Semantic audit, coaching, & AI services
├── messages/                # next-intl Localized Dictionaries (en.json, th.json)
├── handoff.md               # 👈 Master System Handoff & Architecture Guide
└── GEMINI.md                # System Architecture & Subagent Automation Rules
```

---

## 3. Core Architectural Conventions & Guidelines

### 1. Anti-Hardcoding Rules (Mandatory Compliance)
- **API Keys & Credentials**: Never hardcode keys or endpoints. Always use `process.env` and reference [`lib/constants.ts`](file:///Users/prinmacpro/Documents/Antigravity%20Projects/BrainTrade-Training/lib/constants.ts).
- **UI Colors & Theme**: Never hardcode hex values like `#ffffff` or static CSS. Always use Tailwind CSS semantic variables (`bg-background`, `text-foreground`, `border-border`, `bg-card`) or theme-responsive CSS variables.
- **i18n Localization**: User-facing text inside components MUST use `next-intl` dictionaries in [`messages/en.json`](file:///Users/prinmacpro/Documents/Antigravity%20Projects/BrainTrade-Training/messages/en.json) and [`messages/th.json`](file:///Users/prinmacpro/Documents/Antigravity%20Projects/BrainTrade-Training/messages/th.json).

### 2. Audio & Haptic User Feedback
- All interactive buttons and stage cards in the Quiz Hub and Training Hub call `playGamifiedSound()` and `triggerHaptic()` from [`components/features/quiz/gamification.tsx`](file:///Users/prinmacpro/Documents/Antigravity%20Projects/BrainTrade-Training/components/features/quiz/gamification.tsx).
- Synthesized sound events: `'correct'`, `'wrong'`, `'combo'`, `'star-gain'`, `'shield-gain'`, `'finish'`.

### 3. Session & Access Control
- Trainees utilize local session identity managed by [`lib/session/agent.ts`](file:///Users/prinmacpro/Documents/Antigravity%20Projects/BrainTrade-Training/lib/session/agent.ts).
- Trainer/Staff sessions are managed via client session cookies ([`lib/session/client.ts`](file:///Users/prinmacpro/Documents/Antigravity%20Projects/BrainTrade-Training/lib/session/client.ts)) and Firebase Auth tokens on server routes.
- Admin Preview Mode (`agentId = 'admin-preview-agent'`) bypasses prerequisite locks to enable instant QA testing.

---

## 4. Primary Knowledge Graph God Nodes (Graphify)

Key cross-module hubs identified in `graphify-out/GRAPH_REPORT.md`:
1. `getAdminDb()` (`lib/server/firebase-admin.ts`): Server-side Firebase Firestore Admin database provider (51 dependencies).
2. `getServerUser` (`lib/session/server.ts`): Server-side session verification helper (45 dependencies).
3. `AgentStats` (`types/index.ts`): Core trainee performance metric schema (38 dependencies).
4. `TrainingPeriod` (`types/index.ts`): Training wave metadata schema (28 dependencies).
5. `fsSet()`, `fsGetAll()`, `fsAdd()`, `fsUpdate()` (`lib/server/db.ts`): Centralized Firestore data access helpers.
6. `getAgentSession()` (`lib/session/agent.ts`): Trainee client-side identity provider.
7. `scoreColor()` (`lib/training.ts`): Dynamic score ring color mapping.

---

## 5. Outstanding Tasks & Roadmap for `hands-on-agent`

### 📋 Priority Action Items:
- [ ] **Task 1: Quest Map Mobile Touch Polishing**:
  - Test and further optimize [`QuestMapCanvas.tsx`](file:///Users/prinmacpro/Documents/Antigravity%20Projects/BrainTrade-Training/components/features/quiz/QuestMapCanvas.tsx) SVG path rendering on ultra-small mobile screens (`<360px`) to ensure seamless scaling.
- [ ] **Task 2: AI Call Simulator Feedback Integration**:
  - Verify Gemini API fallback behavior and real-time audio playback in [`components/features/ai-eval/`](file:///Users/prinmacpro/Documents/Antigravity%20Projects/BrainTrade-Training/components/features/ai-eval/).
- [ ] **Task 3: Certificate & Graduation PDF Export Audit**:
  - Audit canvas rendering in [`CertificateModal.tsx`](file:///Users/prinmacpro/Documents/Antigravity%20Projects/BrainTrade-Training/components/features/agent-training/CertificateModal.tsx) to ensure consistent PDF downloads across iOS Safari and Chrome.
- [ ] **Task 4: Automated E2E Flow Verification**:
  - Run full registration → quiz completion → certificate issuance flow testing.

---

## 6. Execution Directives for `hands-on-agent`

When executing tasks or applying bug fixes in this repository, `hands-on-agent` MUST follow these instructions:

1. **Pre-Execution Planning**:
   - Inspect target components and verify signatures using `view_file` or `grep_search`.
   - Ensure all user-facing text additions are declared in both `messages/en.json` and `messages/th.json`.

2. **Quality Verification Protocol**:
   - After modifying any TypeScript/TSX code, execute QA verification:
     ```bash
     npm run check
     ```
   - Verify that there are `0 errors` before declaring completion.

3. **Knowledge Graph Synchronization**:
   - After file edits, run Graphify to update AST relationships:
     ```bash
     npx graphify update .
     ```

4. **Git Commit Conventions**:
   - Write clear, descriptive commit messages adhering to standard conventional commit prefixes (`feat:`, `fix:`, `refactor:`, `style:`, `docs:`).

---

## 7. Quick Commands Reference

- **Development Server**: `npm run dev`
- **TypeScript & Lint Check**: `npm run check` (`tsc --noEmit && eslint .`)
- **Production Build**: `npm run build`
- **Knowledge Graph Update**: `npx graphify update .`
