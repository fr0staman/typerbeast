-- Your SQL goes here

ALTER TABLE "texts" ADD COLUMN "author_id" UUID;

UPDATE "texts"
SET "author_id" = dictionaries.user_id
FROM dictionaries
WHERE texts.dictionary_id = dictionaries.id;

ALTER TABLE "texts" ALTER COLUMN "author_id" SET NOT NULL;

ALTER TABLE "texts"
ADD CONSTRAINT fk_texts_author FOREIGN KEY (author_id) REFERENCES users(id);
