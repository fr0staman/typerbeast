-- Your SQL goes here
CREATE TABLE "users"(
	"id" UUID NOT NULL PRIMARY KEY,
	"username" VARCHAR(64) NOT NULL,
	"email" VARCHAR(320) NOT NULL,
	"password_hash" VARCHAR NOT NULL,
	"created_at" TIMESTAMP NOT NULL
);

CREATE TABLE "sessions"(
	"id" UUID NOT NULL PRIMARY KEY,
	"user_id" UUID NOT NULL,
	"token" VARCHAR NOT NULL,
	"expires_at" TIMESTAMP NOT NULL,
	"created_at" TIMESTAMP NOT NULL,
	"user_agent" TEXT NOT NULL,
	"ip" INET NOT NULL,
	FOREIGN KEY ("user_id") REFERENCES "users"("id")
);

