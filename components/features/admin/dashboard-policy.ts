import { 
  LayoutDashboard, Users, FileSpreadsheet,
  ShieldCheck, ClipboardCheck, GraduationCap, Zap, Edit3, Clock, History
} from 'lucide-react';

export type Tab = 'overview' | 'hranalytics' | 'reports' | 'staff' | 'evaluations' | 'training' | 'adjustments' | 'approvals' | 'aiscenarios' | 'history';

export type TabGroup = 'operations' | 'analytics' | 'management';

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

export const ALL_TABS: TabItem[] = [
  // Operations
  { id: 'overview',    labelKey: 'overview',       icon: LayoutDashboard,  group: 'operations' },
  { id: 'training',    labelKey: 'training',       icon: GraduationCap,    group: 'operations' },
  { id: 'evaluations', labelKey: 'evaluations',    icon: ClipboardCheck,   hideForTrainer: true, group: 'operations' },
  { id: 'approvals',   labelKey: 'approvals',      icon: Clock,            adminOnly: true, group: 'operations' },

  // Analytics
  { id: 'hranalytics', labelKey: 'hranalytics',    icon: Users,            group: 'analytics' },
  { id: 'reports',     labelKey: 'reports',        icon: FileSpreadsheet,  hideForTrainer: true, group: 'analytics' },
  { id: 'history',     labelKey: 'history',        icon: History,          group: 'analytics' },

  // Management
  { id: 'staff',       labelKey: 'accounts',       icon: ShieldCheck,      adminOnly: true, group: 'management' },
  { id: 'aiscenarios', labelKey: 'aiscenarios',    icon: Zap,              adminOnly: true, hideForIT: true, group: 'management' },
  { id: 'adjustments', labelKey: 'adjustments',    icon: Edit3,            adminOnly: true, hideForIT: true, group: 'management' },
];

export function getVisibleTabs(role: UserRole, isReadOnlyRole: boolean): TabItem[] {
  // Admin always sees all tabs across all staff groups
  if (role === 'admin') return ALL_TABS;

  return ALL_TABS.filter(t => {
    if (t.hideForIT && role === 'it') return false;
    if (role === 'hr' && t.id !== 'hranalytics' && t.id !== 'overview' && t.id !== 'reports') return false;
    if (isReadOnlyRole) return true;
    if (t.adminOnly) return false;
    if (t.hideForTrainer && role === 'trainer') return false;
    return true;
  }).map(t => {
    // Dynamic label for approvals if read-only
    if (t.id === 'approvals' && isReadOnlyRole) {
      return { ...t, labelKey: 'requestStatus' };
    }
    return t;
  });
}

export function getDefaultTab(role: UserRole): Tab {
  switch (role) {
    case 'trainer': return 'training';
    case 'hr':      return 'hranalytics';
    case 'it':      return 'staff';
    default:        return 'overview';
  }
}
