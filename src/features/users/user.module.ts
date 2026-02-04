import { Module } from "@nestjs/common";
import { UserController } from "./user.controller";
import { UserQueryRepository } from "./infrastructure/user.query.repository";
import { UserRepository } from "./infrastructure/user.repository";
import { CreateUserCommandHandler } from "./application/commands";
import { GetUserByIdQueryHandler } from "./application/queries/get-user-by-id/get-user-by-id.handler";

const commands = [CreateUserCommandHandler];
const queries = [GetUserByIdQueryHandler];

@Module({
	controllers: [UserController],
	providers: [UserQueryRepository, UserRepository, ...commands, ...queries],
	exports: [UserRepository]
})
export class UserModule {}
