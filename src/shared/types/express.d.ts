import { User as PrismaUser } from "@prisma/client";
import { Roles } from "@prisma/generated/enums";

export {};
declare global {
	namespace Express {
		interface User extends PrismaUser {
			id: string;
			name: string;
			email: string;
			isConfirmed: boolean;
			roles: Roles;
		}
	}
}
