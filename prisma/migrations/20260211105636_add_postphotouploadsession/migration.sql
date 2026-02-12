-- CreateEnum
CREATE TYPE "UploadSessionStatus" AS ENUM ('INIT', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "UploadFileStatus" AS ENUM ('PRESIGNED', 'VERIFIED');

-- CreateTable
CREATE TABLE "post_photo_upload_sessions" (
    "id" TEXT NOT NULL,
    "status" "UploadSessionStatus" NOT NULL DEFAULT 'INIT',
    "contentType" TEXT NOT NULL,
    "count" INTEGER NOT NULL,
    "maxSizeBytes" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "userId" TEXT NOT NULL,

    CONSTRAINT "post_photo_upload_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post_photo_upload_files" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "status" "UploadFileStatus" NOT NULL DEFAULT 'PRESIGNED',
    "contentType" TEXT,
    "sizeBytes" INTEGER,
    "etag" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sessionId" TEXT NOT NULL,

    CONSTRAINT "post_photo_upload_files_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "post_photo_upload_files_key_key" ON "post_photo_upload_files"("key");

-- AddForeignKey
ALTER TABLE "post_photo_upload_sessions" ADD CONSTRAINT "post_photo_upload_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_photo_upload_files" ADD CONSTRAINT "post_photo_upload_files_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "post_photo_upload_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
