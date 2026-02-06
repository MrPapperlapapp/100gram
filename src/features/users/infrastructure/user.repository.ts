import { Injectable } from "@nestjs/common";
import { User } from "@prisma/generated/client";
import { SignUpUserRequestDto } from "@/features/auth/dto/requests/sign-up-user.request.dto";
import { PrismaService } from "@/shared/libs/prisma";

@Injectable()
export class UserRepository {
	constructor(private readonly prisma: PrismaService) {}

	async create(data: SignUpUserRequestDto): Promise<string | null> {
		const { userName, email, password } = data;
		const user = await this.prisma.user.create({
			data: {
				name: userName,
				email,
				password
			}
		});
		return user.id;
	}

	async userConfirmationById(id: string) {
		return this.prisma.user.update({
			data: { isConfirmed: true },
			where: { id }
		});
	}

	async findUserById(id: string): Promise<User | null> {
		return this.prisma.user.findUnique({ where: { id } });
	}

	async findUserByEmail(email: string): Promise<User | null> {
		return this.prisma.user.findUnique({ where: { email } });
	}

	async findUserByName(name: string): Promise<User | null> {
		return this.prisma.user.findUnique({ where: { name } });
	}
}
