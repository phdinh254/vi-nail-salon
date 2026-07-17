-- Converts every absolute-instant DateTime column from `timestamp without time zone` to
-- `timestamptz`. Every existing value was written by Prisma, which always serializes JS Date
-- objects as UTC before sending them over the wire — so the naive timestamps already stored
-- here ARE UTC wall-clock numbers; this migration only makes that explicit at the column level.
--
-- Deliberately NOT using Postgres's implicit timestamp->timestamptz cast (a bare
-- `ALTER COLUMN ... SET DATA TYPE TIMESTAMPTZ`) because that cast interprets the naive value
-- using the database SESSION's timezone setting, which is environment-dependent and not
-- guaranteed to be UTC. Every column below is explicitly reinterpreted `AT TIME ZONE 'UTC'`
-- instead, so the result is correct regardless of session/host timezone.
--
-- The `appointments_no_staff_overlap` EXCLUDE constraint depends on startAt/endAt via
-- tsrange(...) — it must be dropped before altering those columns' type and rebuilt afterwards
-- using tstzrange(...) to match the new column type.

-- DropConstraint (rebuilt at the end of this migration using tstzrange)
ALTER TABLE "appointments" DROP CONSTRAINT IF EXISTS "appointments_no_staff_overlap";

-- AlterTable
ALTER TABLE "appointment_timeline_entries"
  ALTER COLUMN "at" TYPE TIMESTAMPTZ(3) USING "at" AT TIME ZONE 'UTC';

-- AlterTable
ALTER TABLE "appointments"
  ALTER COLUMN "startAt" TYPE TIMESTAMPTZ(3) USING "startAt" AT TIME ZONE 'UTC',
  ALTER COLUMN "endAt" TYPE TIMESTAMPTZ(3) USING "endAt" AT TIME ZONE 'UTC',
  ALTER COLUMN "createdAt" TYPE TIMESTAMPTZ(3) USING "createdAt" AT TIME ZONE 'UTC',
  ALTER COLUMN "updatedAt" TYPE TIMESTAMPTZ(3) USING "updatedAt" AT TIME ZONE 'UTC';

-- AlterTable
ALTER TABLE "audit_logs"
  ALTER COLUMN "createdAt" TYPE TIMESTAMPTZ(3) USING "createdAt" AT TIME ZONE 'UTC';

-- AlterTable
ALTER TABLE "favorite_nail_designs"
  ALTER COLUMN "createdAt" TYPE TIMESTAMPTZ(3) USING "createdAt" AT TIME ZONE 'UTC';

-- AlterTable
ALTER TABLE "guest_access_tokens"
  ALTER COLUMN "expiresAt" TYPE TIMESTAMPTZ(3) USING "expiresAt" AT TIME ZONE 'UTC',
  ALTER COLUMN "usedAt" TYPE TIMESTAMPTZ(3) USING "usedAt" AT TIME ZONE 'UTC',
  ALTER COLUMN "createdAt" TYPE TIMESTAMPTZ(3) USING "createdAt" AT TIME ZONE 'UTC';

-- AlterTable
ALTER TABLE "nail_designs"
  ALTER COLUMN "createdAt" TYPE TIMESTAMPTZ(3) USING "createdAt" AT TIME ZONE 'UTC';

-- AlterTable
ALTER TABLE "notifications"
  ALTER COLUMN "createdAt" TYPE TIMESTAMPTZ(3) USING "createdAt" AT TIME ZONE 'UTC';

-- AlterTable
ALTER TABLE "otp_challenges"
  ALTER COLUMN "expiresAt" TYPE TIMESTAMPTZ(3) USING "expiresAt" AT TIME ZONE 'UTC',
  ALTER COLUMN "consumedAt" TYPE TIMESTAMPTZ(3) USING "consumedAt" AT TIME ZONE 'UTC',
  ALTER COLUMN "createdAt" TYPE TIMESTAMPTZ(3) USING "createdAt" AT TIME ZONE 'UTC';

-- AlterTable
ALTER TABLE "payments"
  ALTER COLUMN "paidAt" TYPE TIMESTAMPTZ(3) USING "paidAt" AT TIME ZONE 'UTC';

-- AlterTable
ALTER TABLE "promotions"
  ALTER COLUMN "validFrom" TYPE TIMESTAMPTZ(3) USING "validFrom" AT TIME ZONE 'UTC',
  ALTER COLUMN "validTo" TYPE TIMESTAMPTZ(3) USING "validTo" AT TIME ZONE 'UTC',
  ALTER COLUMN "createdAt" TYPE TIMESTAMPTZ(3) USING "createdAt" AT TIME ZONE 'UTC',
  ALTER COLUMN "updatedAt" TYPE TIMESTAMPTZ(3) USING "updatedAt" AT TIME ZONE 'UTC';

-- AlterTable
ALTER TABLE "refresh_tokens"
  ALTER COLUMN "expiresAt" TYPE TIMESTAMPTZ(3) USING "expiresAt" AT TIME ZONE 'UTC',
  ALTER COLUMN "revokedAt" TYPE TIMESTAMPTZ(3) USING "revokedAt" AT TIME ZONE 'UTC',
  ALTER COLUMN "createdAt" TYPE TIMESTAMPTZ(3) USING "createdAt" AT TIME ZONE 'UTC';

-- AlterTable
ALTER TABLE "reviews"
  ALTER COLUMN "createdAt" TYPE TIMESTAMPTZ(3) USING "createdAt" AT TIME ZONE 'UTC';

-- AlterTable
ALTER TABLE "services"
  ALTER COLUMN "createdAt" TYPE TIMESTAMPTZ(3) USING "createdAt" AT TIME ZONE 'UTC',
  ALTER COLUMN "updatedAt" TYPE TIMESTAMPTZ(3) USING "updatedAt" AT TIME ZONE 'UTC';

-- AlterTable
ALTER TABLE "staff_profiles"
  ALTER COLUMN "createdAt" TYPE TIMESTAMPTZ(3) USING "createdAt" AT TIME ZONE 'UTC',
  ALTER COLUMN "updatedAt" TYPE TIMESTAMPTZ(3) USING "updatedAt" AT TIME ZONE 'UTC';

-- AlterTable
ALTER TABLE "time_off_requests"
  ALTER COLUMN "startDate" TYPE TIMESTAMPTZ(3) USING "startDate" AT TIME ZONE 'UTC',
  ALTER COLUMN "endDate" TYPE TIMESTAMPTZ(3) USING "endDate" AT TIME ZONE 'UTC',
  ALTER COLUMN "createdAt" TYPE TIMESTAMPTZ(3) USING "createdAt" AT TIME ZONE 'UTC';

-- AlterTable
ALTER TABLE "users"
  ALTER COLUMN "createdAt" TYPE TIMESTAMPTZ(3) USING "createdAt" AT TIME ZONE 'UTC',
  ALTER COLUMN "updatedAt" TYPE TIMESTAMPTZ(3) USING "updatedAt" AT TIME ZONE 'UTC';

-- Rebuild the exclusion constraint on the now-timestamptz columns. Same predicate as before
-- (see migration 20260716182339) — only the range constructor function changes.
CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE "appointments"
ADD CONSTRAINT appointments_no_staff_overlap
EXCLUDE USING gist (
  "staffId" WITH =,
  tstzrange("startAt", "endAt", '[)') WITH &&
)
WHERE (
  "staffId" IS NOT NULL
  AND status NOT IN ('CANCELLED', 'NO_SHOW')
);
