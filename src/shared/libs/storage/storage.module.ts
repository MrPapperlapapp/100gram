import { Module } from "@nestjs/common";
import { StorageService } from "@/shared/libs/storage/storage.service";

@Module({
	providers: [StorageService],
	exports: [StorageService]
})
export class StorageModule {}
