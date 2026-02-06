import { applyDecorators, UseGuards } from "@nestjs/common";
import { Roles as Role } from "@prisma/generated/enums";
import { RolesGuard } from "@/shared/guards/roles.guard";
import { Roles } from "@/shared/decorators/roles.decorator";
import { JwtAuthGuard } from "@/shared/guards";

export const Protected = (...roles: Role[]) => {
	if (roles.length === 0) return applyDecorators(UseGuards(JwtAuthGuard));

	return applyDecorators(
		Roles(...roles),
		UseGuards(JwtAuthGuard, RolesGuard)
	);
};
