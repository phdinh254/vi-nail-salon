-- AlterTable
ALTER TABLE "appointments" ADD COLUMN     "createdByUserId" TEXT;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
