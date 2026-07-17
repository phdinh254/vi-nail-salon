-- CreateTable
CREATE TABLE "working_hours" (
    "id" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startMinute" INTEGER NOT NULL,
    "endMinute" INTEGER NOT NULL,

    CONSTRAINT "working_hours_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "working_hours_staffId_dayOfWeek_idx" ON "working_hours"("staffId", "dayOfWeek");

-- AddForeignKey
ALTER TABLE "working_hours" ADD CONSTRAINT "working_hours_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "staff_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
