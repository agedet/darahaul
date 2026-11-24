/**
 * Canonical user roles for the DaraHaul platform.
 *
 * The backend stores roles in canonical form (Admin_L1, Admin_L2,
 * Super_Admin, Mechanic, Driver). `normalizeRole` also accepts legacy
 * UPPERCASE spellings. Always compare roles through `normalizeRole`.
 */

export const USER_ROLES = [
  'Admin_L1',
  'Admin_L2',
  'Super_Admin',
  'Driver',
  'Mechanic',
] as const;

export type UserRole = (typeof USER_ROLES)[number];

const ROLE_ALIASES: Record<string, UserRole> = {
  DRIVER: 'Driver',
  MECHANIC: 'Mechanic',
  ADMIN_L1: 'Admin_L1',
  ADMIN_L2: 'Admin_L2',
  SUPER_ADMIN: 'Super_Admin',
};

/** Normalize any backend/frontend role spelling to the canonical UserRole. */
export const normalizeRole = (role?: string | null): UserRole | null => {
  if (!role) return null;
  const key = role.trim().toUpperCase().replace(/[\s-]+/g, '_');
  return ROLE_ALIASES[key] ?? null;
};

/**
 * Normalize a list of allowed-role strings to canonical UserRoles.
 * Unknown/legacy role names are dropped.
 */
export const normalizeAllowedRoles = (roles?: string[]): UserRole[] => {
  const result = new Set<UserRole>();
  for (const r of roles ?? []) {
    const normalized = normalizeRole(r);
    if (normalized) result.add(normalized);
  }
  return [...result];
};

export const isAdminRole = (role: UserRole | null): boolean =>
  role === 'Admin_L1' || role === 'Admin_L2';

export const isSuperAdminRole = (role: UserRole | null): boolean =>
  role === 'Super_Admin';

/** Roles that must complete the onboarding/profile requirements flow. */
export const ONBOARDING_ROLES: readonly UserRole[] = ['Driver', 'Mechanic'];

export const requiresOnboarding = (role: UserRole | null): boolean =>
  !!role && ONBOARDING_ROLES.includes(role);

/** Options for role selection dropdowns (value = canonical role). */
export const ROLE_SELECT_OPTIONS = [
  { value: 'Admin_L1', label: 'Admin L1' },
  { value: 'Admin_L2', label: 'Admin L2' },
  { value: 'Super_Admin', label: 'Super Admin' },
  { value: 'Mechanic', label: 'Mechanic' },
  { value: 'Driver', label: 'Driver' },
] as const;

/** Display names shown for roles in the UI. */
export const ROLE_DISPLAY_NAMES: Record<UserRole, string> = {
  Driver: 'Driver',
  Mechanic: 'Mechanic',
  Admin_L2: 'Manager',
  Admin_L1: 'Admin',
  Super_Admin: 'Control',
};
