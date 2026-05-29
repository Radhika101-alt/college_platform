-- CreateTable
CREATE TABLE "College" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "fees" INTEGER NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL,
    "overview" TEXT NOT NULL,
    "placements" TEXT NOT NULL,
    "image" TEXT NOT NULL,

    CONSTRAINT "College_pkey" PRIMARY KEY ("id")
);
