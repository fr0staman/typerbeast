-- Your SQL goes here


CREATE TABLE "dictionaries"(
	"id" UUID NOT NULL PRIMARY KEY,
	"name" VARCHAR NOT NULL,
	"user_id" UUID NOT NULL,
	"created_at" TIMESTAMP NOT NULL,
	FOREIGN KEY ("user_id") REFERENCES "users"("id")
);

CREATE TABLE "texts"(
	"id" UUID NOT NULL PRIMARY KEY,
	"dictionary_id" UUID NOT NULL,
	"title" VARCHAR NOT NULL,
	"content" TEXT NOT NULL,
	"created_at" TIMESTAMP NOT NULL,
	FOREIGN KEY ("dictionary_id") REFERENCES "dictionaries"("id")
);

