-- CreateTable
CREATE TABLE "SmokeTest" (
    "id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SmokeTest_pkey" PRIMARY KEY ("id")
);
