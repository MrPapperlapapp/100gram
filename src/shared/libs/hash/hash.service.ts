import { Injectable } from "@nestjs/common";
import { hash, compare } from "bcrypt";

@Injectable()
export class HashService {
	async hashPassword(password: string): Promise<string> {
		return await hash(password, 10);
	}

	async comparePass(
		password: string,
		hashPassword: string
	): Promise<boolean> {
		return await compare(password, hashPassword);
	}
}
