-- CreateTable
CREATE TABLE "DiscussionThread" (
    "id" SERIAL NOT NULL,
    "collegeId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DiscussionThread_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiscussionReply" (
    "id" SERIAL NOT NULL,
    "threadId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DiscussionReply_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdmissionCutoff" (
    "id" SERIAL NOT NULL,
    "courseId" INTEGER NOT NULL,
    "exam" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "minScore" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdmissionCutoff_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DiscussionThread_collegeId_idx" ON "DiscussionThread"("collegeId");

-- CreateIndex
CREATE INDEX "DiscussionThread_userId_idx" ON "DiscussionThread"("userId");

-- CreateIndex
CREATE INDEX "DiscussionReply_threadId_idx" ON "DiscussionReply"("threadId");

-- CreateIndex
CREATE INDEX "DiscussionReply_userId_idx" ON "DiscussionReply"("userId");

-- CreateIndex
CREATE INDEX "AdmissionCutoff_exam_category_year_idx" ON "AdmissionCutoff"("exam", "category", "year");

-- CreateIndex
CREATE UNIQUE INDEX "AdmissionCutoff_courseId_exam_category_year_key" ON "AdmissionCutoff"("courseId", "exam", "category", "year");

-- AddForeignKey
ALTER TABLE "DiscussionThread" ADD CONSTRAINT "DiscussionThread_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "College"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscussionThread" ADD CONSTRAINT "DiscussionThread_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscussionReply" ADD CONSTRAINT "DiscussionReply_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "DiscussionThread"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscussionReply" ADD CONSTRAINT "DiscussionReply_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdmissionCutoff" ADD CONSTRAINT "AdmissionCutoff_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
