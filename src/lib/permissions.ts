import type { Role } from "@prisma/client";

export type ModuleKey =
  | "dashboard"
  | "production"
  | "inventory"
  | "quality"
  | "hr"
  | "sales"
  | "safety"
  | "admin";

export type AccessLevel = "none" | "read" | "write";

const FULL_ACCESS: Record<ModuleKey, AccessLevel> = {
  dashboard: "write",
  production: "write",
  inventory: "write",
  quality: "write",
  hr: "write",
  sales: "write",
  safety: "write",
  admin: "write",
};

/** Role -> module -> access level. Missing entries default to "none". */
export const PERMISSION_MATRIX: Record<Role, Partial<Record<ModuleKey, AccessLevel>>> = {
  SUPER_ADMIN: FULL_ACCESS,
  CEO: {
    dashboard: "read",
    production: "read",
    inventory: "read",
    quality: "read",
    hr: "read",
    sales: "read",
    safety: "read",
    admin: "read",
  },
  PRODUCTION_MANAGER: {
    dashboard: "read",
    production: "write",
    inventory: "read",
    quality: "read",
  },
  STORE_MANAGER: {
    dashboard: "read",
    inventory: "write",
    production: "read",
  },
  QC_OFFICER: {
    dashboard: "read",
    quality: "write",
    production: "read",
  },
  HR_OFFICER: {
    dashboard: "read",
    hr: "write",
  },
  SALES_OFFICER: {
    dashboard: "read",
    sales: "write",
    inventory: "read",
  },
  SAFETY_OFFICER: {
    dashboard: "read",
    safety: "write",
  },
};

export function getAccess(role: Role, module: ModuleKey): AccessLevel {
  return PERMISSION_MATRIX[role]?.[module] ?? "none";
}

export function canRead(role: Role, module: ModuleKey): boolean {
  return getAccess(role, module) !== "none";
}

export function canWrite(role: Role, module: ModuleKey): boolean {
  return getAccess(role, module) === "write";
}

export function visibleModules(role: Role): ModuleKey[] {
  return (Object.keys(PERMISSION_MATRIX[role] ?? {}) as ModuleKey[]).filter(
    (m) => getAccess(role, m) !== "none"
  );
}

export class PermissionError extends Error {
  constructor(module: ModuleKey) {
    super(`You do not have write access to the ${module} module.`);
    this.name = "PermissionError";
  }
}

/** Throws if the role cannot write to the given module. Call at the top of every mutating service function. */
export function assertWrite(role: Role, module: ModuleKey): void {
  if (!canWrite(role, module)) throw new PermissionError(module);
}
