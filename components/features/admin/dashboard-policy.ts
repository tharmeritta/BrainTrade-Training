import { 
  Activity, Sparkles, Users, BarChart3,
  LayoutDashboard, FileSpreadsheet, ShieldCheck, ClipboardCheck, 
  GraduationCap, Zap, Edit3, Clock, History, Award, Presentation, HeartPulse
} from 'lucide-react';

export type Workspace = 'operations' | 'studio' | 'roster' | 'analytics';

export type LegacyTab = 'overview' | 'hranalytics' | 'reports' | 'staff' | 'evaluations' | 'training' | 'adjustments' | 'approvals' | 'aiscenarios' | 'history' | 'certification' | 'showcase';

export type Tab = Workspace | LegacyTab;

export type TabGroup = 'monitoring' | 'academy' | 'analytics' | 'governance';

export interface SubTabItem {
  id: string;
  labelKey: string;
  icon: React.ElementType;
  adminOnly?: boolean;
  hideForTrainer?: boolean;
  hideForIT?: boolean;
}

export interface WorkspaceItem {
  id: Workspace;
  labelKey: string;
  descKey: string;
  icon: React.ElementType;
  adminOnly?: boolean;
  hideForTrainer?: boolean;
  hideForIT?: boolean;
  defaultSubTab: string;
  subTabs: SubTabItem[];
}

export interface TabItem {
  id: Tab;
  labelKey: string;
  icon: React.ElementType;
  adminOnly?: boolean;
  hideForTrainer?: boolean;
  hideForIT?: boolean;
  group: TabGroup;
}

export type UserRole = 'admin' | 'manager' | 'it' | 'trainer' | 'hr';

export const WORKSPACES: WorkspaceItem[] = [
  {
    id: 'operations',
    labelKey: 'operations',
    descKey: 'operationsDesc',
    icon: Activity,
    defaultSubTab: 'overview',
    subTabs: [
      { id: 'overview',   labelKey: 'overview',   icon: LayoutDashboard },
      { id: 'approvals',  labelKey: 'approvals',  icon: Clock, adminOnly: true },
      { id: 'history',    labelKey: 'history',    icon: History },
    ]
  },
  {
    id: 'studio',
    labelKey: 'studio',
    descKey: 'studioDesc',
    icon: Sparkles,
    defaultSubTab: 'courses',
    subTabs: [
      { id: 'courses',      labelKey: 'courses',      icon: GraduationCap },
      { id: 'quizzes',      labelKey: 'quizzes',      icon: Edit3 },
      { id: 'scenarios',    labelKey: 'scenarios',    icon: Zap, hideForIT: true },
      { id: 'presentation', labelKey: 'presentation', icon: Presentation },
      { id: 'showcase',     labelKey: 'showcase',     icon: Presentation, adminOnly: true },
      { id: 'overrides',    labelKey: 'overrides',    icon: ShieldCheck, adminOnly: true, hideForIT: true },
    ]
  },
  {
    id: 'roster',
    labelKey: 'roster',
    descKey: 'rosterDesc',
    icon: Users,
    defaultSubTab: 'agents',
    subTabs: [
      { id: 'agents',      labelKey: 'agents',      icon: Users },
      { id: 'staff',       labelKey: 'staff',       icon: ShieldCheck, adminOnly: true },
      { id: 'evaluations', labelKey: 'evaluations', icon: ClipboardCheck, hideForTrainer: true },
    ]
  },
  {
    id: 'analytics',
    labelKey: 'analytics',
    descKey: 'analyticsDesc',
    icon: BarChart3,
    defaultSubTab: 'heatmap',
    subTabs: [
      { id: 'heatmap',       labelKey: 'heatmap',       icon: BarChart3 },
      { id: 'reports',       labelKey: 'reports',       icon: FileSpreadsheet, hideForTrainer: true },
      { id: 'certification', labelKey: 'certification', icon: Award, adminOnly: true, hideForIT: true },
      { id: 'health',        labelKey: 'health',        icon: HeartPulse, adminOnly: true },
    ]
  }
];

export const ALL_TABS: TabItem[] = [
  // Dashboard & Monitoring
  { id: 'overview',      labelKey: 'overview',       icon: LayoutDashboard,  group: 'monitoring' },
  { id: 'history',       labelKey: 'history',        icon: History,          group: 'monitoring' },

  // Learning & Academy
  { id: 'training',      labelKey: 'training',       icon: GraduationCap,    group: 'academy' },
  { id: 'showcase',      labelKey: 'showcase',       icon: Presentation,     adminOnly: true, group: 'academy' },
  { id: 'evaluations',   labelKey: 'evaluations',    icon: ClipboardCheck,   hideForTrainer: true, group: 'academy' },
  { id: 'aiscenarios',   labelKey: 'aiscenarios',    icon: Zap,              adminOnly: true, hideForIT: true, group: 'academy' },

  // HR & Roster Analytics
  { id: 'hranalytics',   labelKey: 'hranalytics',    icon: Users,            group: 'analytics' },
  { id: 'reports',       labelKey: 'reports',        icon: FileSpreadsheet,  hideForTrainer: true, group: 'analytics' },
  { id: 'certification', labelKey: 'certification',  icon: Award,            adminOnly: true, hideForIT: true, group: 'analytics' },

  // Governance & Control
  { id: 'staff',         labelKey: 'accounts',       icon: ShieldCheck,      adminOnly: true, group: 'governance' },
  { id: 'adjustments',   labelKey: 'adjustments',    icon: Edit3,            adminOnly: true, hideForIT: true, group: 'governance' },
  { id: 'approvals',     labelKey: 'approvals',      icon: Clock,            adminOnly: true, group: 'governance' },
];

export function getVisibleWorkspaces(role: UserRole, isReadOnlyRole: boolean): WorkspaceItem[] {
  return WORKSPACES.filter(ws => {
    if (ws.hideForIT && role === 'it') return false;
    if (role === 'hr' && ws.id !== 'analytics' && ws.id !== 'operations') return false;
    if (isReadOnlyRole) return true;
    if (ws.adminOnly && role !== 'admin') return false;
    if (ws.hideForTrainer && role === 'trainer') return false;
    return true;
  }).map(ws => {
    const visibleSubTabs = ws.subTabs.filter(st => {
      if (st.hideForIT && role === 'it') return false;
      if (isReadOnlyRole) return true;
      if (st.adminOnly && role !== 'admin') return false;
      if (st.hideForTrainer && role === 'trainer') return false;
      return true;
    });
    return {
      ...ws,
      subTabs: visibleSubTabs
    };
  });
}

export function resolveWorkspaceAndSubTab(rawTab: string, rawSubTab?: string | null): { workspace: Workspace; subTab: string } {
  // Direct match to workspace
  if (rawTab === 'operations' || rawTab === 'studio' || rawTab === 'roster' || rawTab === 'analytics') {
    const ws = WORKSPACES.find(w => w.id === rawTab)!;
    const sub = rawSubTab && ws.subTabs.some(s => s.id === rawSubTab) ? rawSubTab : ws.defaultSubTab;
    return { workspace: rawTab, subTab: sub };
  }

  // Legacy Tab aliases
  switch (rawTab) {
    case 'overview':
      return { workspace: 'operations', subTab: 'overview' };
    case 'approvals':
      return { workspace: 'operations', subTab: 'approvals' };
    case 'history':
      return { workspace: 'operations', subTab: 'history' };

    case 'training':
    case 'learn':
    case 'adjustments':
      return { workspace: 'studio', subTab: rawSubTab || 'courses' };
    case 'presentation':
    case 'presenter':
      return { workspace: 'studio', subTab: 'presentation' };
    case 'aiscenarios':
      return { workspace: 'studio', subTab: 'scenarios' };
    case 'showcase':
      return { workspace: 'studio', subTab: 'showcase' };

    case 'staff':
      return { workspace: 'roster', subTab: rawSubTab || 'agents' };
    case 'evaluations':
      return { workspace: 'roster', subTab: 'evaluations' };

    case 'hranalytics':
      return { workspace: 'analytics', subTab: 'heatmap' };
    case 'reports':
      return { workspace: 'analytics', subTab: 'reports' };
    case 'certification':
      return { workspace: 'analytics', subTab: 'certification' };

    default:
      return { workspace: 'operations', subTab: 'overview' };
  }
}

export function getVisibleTabs(role: UserRole, isReadOnlyRole: boolean): TabItem[] {
  if (role === 'admin') return ALL_TABS;

  return ALL_TABS.filter(t => {
    if (t.hideForIT && role === 'it') return false;
    if (role === 'hr' && t.id !== 'hranalytics' && t.id !== 'overview' && t.id !== 'reports') return false;
    if (isReadOnlyRole) return true;
    if (t.adminOnly) return false;
    if (t.hideForTrainer && role === 'trainer') return false;
    return true;
  }).map(t => {
    if (t.id === 'approvals' && isReadOnlyRole) {
      return { ...t, labelKey: 'requestStatus' };
    }
    return t;
  });
}

export function getDefaultTab(role: UserRole): Tab {
  switch (role) {
    case 'trainer': return 'studio';
    case 'hr':      return 'analytics';
    case 'it':      return 'roster';
    default:        return 'operations';
  }
}
