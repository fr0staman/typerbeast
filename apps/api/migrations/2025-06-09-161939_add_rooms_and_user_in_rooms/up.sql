-- Your SQL goes here

ALTER TABLE "results" DROP COLUMN "text_id";
ALTER TABLE "results" DROP COLUMN "user_id";
ALTER TABLE "results" ADD COLUMN "room_user_id" UUID NOT NULL;


CREATE TABLE "rooms"(
	"id" UUID NOT NULL PRIMARY KEY,
	"text_id" UUID NOT NULL,
	"created_at" TIMESTAMP NOT NULL,
	"started_at" TIMESTAMP NOT NULL,
	"ended_at" TIMESTAMP NOT NULL,
	FOREIGN KEY ("text_id") REFERENCES "texts"("id")
);

CREATE TABLE "room_users"(
	"id" UUID NOT NULL PRIMARY KEY,
	"room_id" UUID NOT NULL,
	"user_id" UUID NOT NULL,
	"joined_at" TIMESTAMP NOT NULL,
	"left_at" TIMESTAMP NOT NULL,
	FOREIGN KEY ("room_id") REFERENCES "rooms"("id"),
	FOREIGN KEY ("user_id") REFERENCES "users"("id")
);

ALTER TABLE results
ADD CONSTRAINT fk_results_room_user FOREIGN KEY (room_user_id)
REFERENCES room_users(id) ON DELETE CASCADE;


