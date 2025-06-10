-- This file should undo anything in `up.sql`


ALTER TABLE "room_users" DROP COLUMN "league";

DROP TYPE Leagues;



