export type AuthRole = 'student' | 'lecturer' | 'admin';

/** Admin-only configuration (risk thresholds, recommendation rules, curriculum assignment page). */
export const ADMIN_ROLES: readonly AuthRole[] = ['admin'];

/** Lecturer-only routes (reserved for quiz authoring when wired). */
export const LECTURER_ROLES: readonly AuthRole[] = ['lecturer'];

/** Student-only student-experience routes. */
export const STUDENT_ROLES: readonly AuthRole[] = ['student'];

/** Shared temporary Academic Performance Dashboard after login (admin + lecturer). */
export const STAFF_DASHBOARD_ROLES: readonly AuthRole[] = ['admin', 'lecturer'];

/** Readiness / weak topics / recommendations / reassessment (lecturer + student). */
export const LECTURER_OR_STUDENT_ROLES: readonly AuthRole[] = ['lecturer', 'student'];

/**
 * @deprecated Use ADMIN_ROLES / STAFF_DASHBOARD_ROLES / LECTURER_OR_STUDENT_ROLES for guards.
 * Still exported for any legacy imports.
 */
export const MANAGEMENT_ROLES: readonly AuthRole[] = ['admin', 'lecturer'];
