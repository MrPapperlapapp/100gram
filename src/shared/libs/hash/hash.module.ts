import { Module } from "@nestjs/common";
import { HashService } from "@/shared/libs/hash/hash.service";

@Module({
	providers: [HashService],
	exports: [HashService]
})
export class HashModule {}
