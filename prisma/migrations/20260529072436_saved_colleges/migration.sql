-- CreateTable
CREATE TABLE "SavedCollege" (
    "id" SERIAL NOT NULL,
    "deviceId" TEXT NOT NULL,
    "collegeId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedCollege_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SavedCollege_deviceId_idx" ON "SavedCollege"("deviceId");

-- CreateIndex
CREATE UNIQUE INDEX "SavedCollege_deviceId_collegeId_key" ON "SavedCollege"("deviceId", "collegeId");

-- AddForeignKey
ALTER TABLE "SavedCollege" ADD CONSTRAINT "SavedCollege_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "College"("id") ON DELETE CASCADE ON UPDATE CASCADE;
