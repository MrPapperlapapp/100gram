export class CreatePostCommand {
	constructor(
		public title: string,
		public content: string,
		public userId: string,
		public uploadId?: string
	) {}
}
