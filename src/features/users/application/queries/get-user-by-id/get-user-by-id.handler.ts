import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetUserByIdQuery } from "./get-user-by-id.query";

@QueryHandler(GetUserByIdQuery)
export class GetUserByIdQueryHandler implements IQueryHandler<
	GetUserByIdQuery,
	void
> {
	constructor() {}

	async execute() {}
}
