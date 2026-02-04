import { SignUpUserRequestDto } from "@/features/auth/dto";

export class SignUpCommand {
	constructor(public dto: SignUpUserRequestDto) {}
}
