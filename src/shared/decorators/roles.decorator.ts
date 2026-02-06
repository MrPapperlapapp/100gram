import { SetMetadata } from "@nestjs/common";
import { Roles as Role } from "@prisma/generated/enums";

export const ROLES_KEY = "requeried_roles";
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
