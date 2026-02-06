import {
	CanActivate,
	ExecutionContext,
	ForbiddenException,
	Injectable,
	UnauthorizedException
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Roles } from "@prisma/generated/enums";
import { ROLES_KEY } from "@/shared/decorators/roles.decorator";
import { UserRepository } from "@/features/users/infrastructure/user.repository";
import type { Request } from "express";

@Injectable()
export class RolesGuard implements CanActivate {
	constructor(
		private readonly reflector: Reflector,
		private readonly userRepository: UserRepository
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const required = this.reflector.getAllAndOverride<Roles[]>(ROLES_KEY, [
			context.getHandler(),
			context.getClass()
		]);

		if (required.length === 0) return false;

		const request = context.switchToHttp().getRequest<Request>();

		const userId = request.user.id;

		if (!userId) throw new ForbiddenException("Forbidden");

		const isUserExist = await this.userRepository.findUserById(userId);

		if (!isUserExist) {
			throw new UnauthorizedException("Unauthorized");
		}

		if (!required.includes(isUserExist.role)) {
			throw new ForbiddenException("Forbidden");
		}

		return true;
	}
}
