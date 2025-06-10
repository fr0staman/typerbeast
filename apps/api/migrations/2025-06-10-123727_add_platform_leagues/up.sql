-- Your SQL goes here

CREATE TYPE Leagues AS ENUM ('web', 'mobile');

ALTER TABLE "room_users" ADD COLUMN league Leagues;

UPDATE "room_users" SET league = 'web';

ALTER TABLE "room_users" ALTER COLUMN "league" SET NOT NULL;

