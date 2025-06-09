-- This file should undo anything in `up.sql`

ALTER TABLE "results" DROP COLUMN "room_user_id";
ALTER TABLE "results" ADD COLUMN "text_id" UUID NOT NULL;
ALTER TABLE "results" ADD COLUMN "user_id" UUID NOT NULL;




DROP TABLE IF EXISTS "rooms";
DROP TABLE IF EXISTS "room_users";
