import { SetMetadata } from "@nestjs/common";
import type { Role } from "@prisma/client";

export const CLE_ROLES = "roles";

// S'utilise avec RolesGuard : @Roles("ADMIN") sur un contrôleur ou une route.
export const Roles = (...roles: Role[]) => SetMetadata(CLE_ROLES, roles);
