-- Your SQL goes here




CREATE TABLE "results"(
	"id" UUID NOT NULL PRIMARY KEY,
	"text_id" UUID NOT NULL,
	"user_id" UUID NOT NULL,
	"start_time" TIMESTAMP NOT NULL,
	"end_time" TIMESTAMP NOT NULL,
	"mistakes" INT2 NOT NULL,
	"wpm" FLOAT4 NOT NULL,
	"cpm" FLOAT4 NOT NULL,
	"stats" JSONB NOT NULL,
	FOREIGN KEY ("text_id") REFERENCES "texts"("id"),
	FOREIGN KEY ("user_id") REFERENCES "users"("id")
);

