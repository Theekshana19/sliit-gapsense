export type AuthRole = 'student' | 'lecturer' | 'admin';

/** Roles that may access admin-style configuration (thresholds, recommendation rules). */
export const MANAGEMENT_ROLES: readonly AuthRole[] = ['admin', 'lecturer'];
