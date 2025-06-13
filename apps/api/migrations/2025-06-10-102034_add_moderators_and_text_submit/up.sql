-- Your SQL goes here

CREATE TYPE review_text_status AS ENUM ('pending', 'approved', 'rejected');

CREATE TYPE user_roles AS ENUM ('creator', 'moderator', 'user');

CREATE TABLE "pending_texts" (
  "id" UUID NOT NULL PRIMARY KEY,
  "dictionary_id" UUID NOT NULL,
  "author_id" UUID NOT NULL,
  "title" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "created_at" TIMESTAMP NOT NULL,
  "reviewed_by" UUID,
  "reviewed_at" TIMESTAMP,
  "status" review_text_status NOT NULL,
  "reason" TEXT,
  FOREIGN KEY ("dictionary_id") REFERENCES "dictionaries"("id"),
  FOREIGN KEY ("author_id") REFERENCES "users"("id"),
  FOREIGN KEY ("reviewed_by") REFERENCES "users"("id")
);


ALTER TABLE users ADD COLUMN "role" user_roles;

UPDATE users SET role = 'user';

ALTER TABLE users ALTER COLUMN "role" SET NOT NULL;
