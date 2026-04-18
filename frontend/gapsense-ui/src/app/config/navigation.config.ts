import type { AuthRole } from '../models/auth/auth-role.model';

export interface SidebarNavItem {
  readonly label: string;
  readonly routerLink: string;
  readonly icon: string;
  readonly roles: readonly AuthRole[];
}

/** Tharindu-style staff hub order (after dashboard) for admin + lecturer sidebars. */
const STAFF_HUB_ORDER: readonly string[] = [
  '/readiness/overview',
  '/risk-analysis/heatmap',
  '/monitoring/plans',
  '/monitoring/intervention-plan',
  '/monitoring/follow-ups',
  '/risk-analysis/reports',
  '/notifications',
  '/settings',
];

function staffNavRank(routerLink: string): number {
  if (routerLink === '/dashboard') {
    return 0;
  }
  const hubIdx = STAFF_HUB_ORDER.indexOf(routerLink);
  if (hubIdx >= 0) {
    return 10 + hubIdx;
  }
  return 1000 + STAFF_HUB_ORDER.length;
}

/** Single source of truth for sidebar labels + paths + visibility by role. */
export const SIDEBAR_NAV_ITEMS: readonly SidebarNavItem[] = [
  // —— Admin ——
  { label: 'Dashboard', routerLink: '/dashboard', icon: 'dashboard', roles: ['admin'] },
  {
    label: 'Batch overview',
    routerLink: '/readiness/overview',
    icon: 'groups',
    roles: ['admin', 'lecturer'],
  },
  {
    label: 'High-risk monitoring',
    routerLink: '/risk-analysis/heatmap',
    icon: 'crisis_alert',
    roles: ['admin', 'lecturer'],
  },
  {
    label: 'Intervention planning',
    routerLink: '/monitoring/plans',
    icon: 'health_and_safety',
    roles: ['admin', 'lecturer'],
  },
  {
    label: 'New intervention',
    routerLink: '/monitoring/intervention-plan',
    icon: 'add_circle',
    roles: ['admin', 'lecturer'],
  },
  {
    label: 'Follow-ups',
    routerLink: '/monitoring/follow-ups',
    icon: 'campaign',
    roles: ['admin', 'lecturer'],
  },
  { label: 'Reports and export', routerLink: '/risk-analysis/reports', icon: 'description', roles: ['admin'] },
  { label: 'Module Management', routerLink: '/curriculum/module-management', icon: 'view_module', roles: ['admin'] },
  { label: 'Add edit module', routerLink: '/curriculum/modules/new', icon: 'add_box', roles: ['admin'] },
  {
    label: 'Topic Management',
    routerLink: '/curriculum/module-management',
    icon: 'topic',
    roles: ['admin'],
  },
  { label: 'Add Edit Topic', routerLink: '/curriculum/topics/new', icon: 'post_add', roles: ['admin'] },
  {
    label: 'Prerequisite mapping',
    routerLink: '/curriculum/prerequisite-mapping',
    icon: 'account_tree',
    roles: ['admin'],
  },
  {
    label: 'Add Edit Prerequisite Mapping',
    routerLink: '/curriculum/prerequisite-management',
    icon: 'rule_folder',
    roles: ['admin'],
  },
  {
    label: 'Dependency Visualization',
    routerLink: '/curriculum/dependency-visualization',
    icon: 'hub',
    roles: ['admin'],
  },
  {
    label: 'Topic Weight Configuration',
    routerLink: '/curriculum/module-management',
    icon: 'balance',
    roles: ['admin'],
  },
  {
    label: 'Semester Module Offerings',
    routerLink: '/curriculum/semester-offerings',
    icon: 'calendar_month',
    roles: ['admin'],
  },
  {
    label: 'Validation Alerts',
    routerLink: '/curriculum/validation-alerts',
    icon: 'warning',
    roles: ['admin'],
  },
  { label: 'Risk Threshold Management', routerLink: '/risk-thresholds', icon: 'tune', roles: ['admin'] },
  {
    label: 'Recommendation Rule Management',
    routerLink: '/recommendation-rules',
    icon: 'rule',
    roles: ['admin'],
  },
  {
    label: 'Lecturer Module Assignment',
    routerLink: '/curriculum/lecturer-assignment',
    icon: 'assignment_ind',
    roles: ['admin'],
  },
  {
    label: 'Create New Assignment',
    routerLink: '/curriculum/lecturer-assignment/create',
    icon: 'person_add',
    roles: ['admin'],
  },

  // —— Lecturer ——
  { label: 'Dashboard', routerLink: '/dashboard', icon: 'dashboard', roles: ['lecturer'] },
  { label: 'Question Bank', routerLink: '/readiness/question-bank', icon: 'quiz', roles: ['lecturer'] },
  {
    label: 'Add edit questions page',
    routerLink: '/readiness/questions/new',
    icon: 'edit_note',
    roles: ['lecturer'],
  },
  { label: 'Quiz Builder', routerLink: '/readiness/quiz-builder', icon: 'construction', roles: ['lecturer'] },
  { label: 'Quiz scheduling', routerLink: '/readiness/quiz-scheduling', icon: 'schedule', roles: ['lecturer'] },
  {
    label: 'Student Assessment',
    routerLink: '/readiness/submission-tracking',
    icon: 'assignment_turned_in',
    roles: ['lecturer'],
  },
  {
    label: 'submission Tracking',
    routerLink: '/readiness/submission-tracking',
    icon: 'track_changes',
    roles: ['lecturer'],
  },
  {
    label: 'Attempt History',
    routerLink: '/readiness/attempt-history',
    icon: 'history',
    roles: ['lecturer'],
  },
  { label: 'Readiness Result', routerLink: '/readiness-results', icon: 'fact_check', roles: ['lecturer'] },
  {
    label: 'Weak Topic analytics',
    routerLink: '/weak-topic-analysis',
    icon: 'analytics',
    roles: ['lecturer'],
  },
  { label: 'Recommendations', routerLink: '/recommendations', icon: 'lightbulb', roles: ['lecturer'] },
  {
    label: 'Student Readiness Profile',
    routerLink: '/student-profile',
    icon: 'person',
    roles: ['lecturer'],
  },

  // —— Student ——
  { label: 'Dashboard', routerLink: '/dashboard', icon: 'dashboard', roles: ['student'] },
  {
    label: 'Readiness quizzes',
    routerLink: '/readiness/available-quizzes',
    icon: 'quiz',
    roles: ['student'],
  },
  {
    label: 'My quiz attempts',
    routerLink: '/readiness/attempt-history',
    icon: 'history',
    roles: ['student'],
  },
  { label: 'Readiness Result', routerLink: '/readiness-results', icon: 'fact_check', roles: ['student'] },
  {
    label: 'Student Readiness Profile',
    routerLink: '/student-profile',
    icon: 'person',
    roles: ['student'],
  },
  {
    label: 'Personalized Learning Path',
    routerLink: '/learning-path',
    icon: 'auto_stories',
    roles: ['student'],
  },
  {
    label: 'Personalized Recommendations',
    routerLink: '/recommendations',
    icon: 'lightbulb',
    roles: ['student'],
  },
  {
    label: 'Reassessment comparison',
    routerLink: '/reassessment-comparison',
    icon: 'compare_arrows',
    roles: ['student'],
  },
  {
    label: 'Weak Topic Analysis',
    routerLink: '/weak-topic-analysis',
    icon: 'analytics',
    roles: ['student'],
  },
  {
    label: 'Risk Trends & Summary',
    routerLink: '/risk-trends',
    icon: 'trending_up',
    roles: ['student'],
  },
  {
    label: 'Notifications',
    routerLink: '/notifications',
    icon: 'notifications',
    roles: ['admin', 'lecturer', 'student'],
  },
  {
    label: 'Settings',
    routerLink: '/settings',
    icon: 'settings',
    roles: ['admin', 'lecturer', 'student'],
  },
];

export function sidebarItemsForRole(role: AuthRole | null): SidebarNavItem[] {
  if (!role) {
    return [];
  }
  const items = SIDEBAR_NAV_ITEMS.filter((item) => item.roles.includes(role));
  if (role === 'admin' || role === 'lecturer') {
    return [...items].sort((a, b) => {
      const ra = staffNavRank(a.routerLink);
      const rb = staffNavRank(b.routerLink);
      if (ra !== rb) {
        return ra - rb;
      }
      return SIDEBAR_NAV_ITEMS.indexOf(a) - SIDEBAR_NAV_ITEMS.indexOf(b);
    });
  }
  return items;
}
