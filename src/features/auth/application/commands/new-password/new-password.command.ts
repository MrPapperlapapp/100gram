export class NewPasswordCommand {
	constructor(
		public readonly token: string,
		public readonly password: string
	) {}
}
