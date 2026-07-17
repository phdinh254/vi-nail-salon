-- Final safety net against double-booking a staff member. The application already performs
-- a pre-check + Serializable transaction (see AppointmentsService.assertNoStaffConflict), but
-- that alone is not airtight against every possible race — this constraint is enforced by
-- Postgres itself and cannot be bypassed by any code path, present or future.
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Columns are `timestamp without time zone` (Prisma DateTime maps to `timestamp`, not
-- `timestamptz`, here), so the range type must be tsrange, not tstzrange — tstzrange() over a
-- plain timestamp is a timezone-dependent (STABLE, not IMMUTABLE) cast and Postgres rejects
-- non-immutable expressions in an index/exclusion constraint.
ALTER TABLE "appointments"
ADD CONSTRAINT appointments_no_staff_overlap
EXCLUDE USING gist (
  "staffId" WITH =,
  tsrange("startAt", "endAt", '[)') WITH &&
)
WHERE (
  "staffId" IS NOT NULL
  AND status NOT IN ('CANCELLED', 'NO_SHOW')
);