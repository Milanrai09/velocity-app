-- Add new profile fields as nullable first so existing rows can be backfilled safely.
ALTER TABLE "User"
ADD COLUMN "email" TEXT,
ADD COLUMN "displayName" TEXT,
ADD COLUMN "avatarUrl" TEXT,
ADD COLUMN "bio" TEXT,
ADD COLUMN "website" TEXT;

-- Backfill email for existing users with deterministic placeholders.
-- Replace these with real Auth0 emails when each user signs in.
UPDATE "User"
SET "email" = COALESCE("email", md5("id") || '@placeholder.local');

-- Preserve old name values in the new displayName field.
UPDATE "User"
SET "displayName" = COALESCE("displayName", "name");

-- Enforce required/unique email only after backfill.
ALTER TABLE "User"
ALTER COLUMN "email" SET NOT NULL;

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- Remove legacy columns no longer present in schema.
ALTER TABLE "User"
DROP COLUMN "name",
DROP COLUMN "age";
