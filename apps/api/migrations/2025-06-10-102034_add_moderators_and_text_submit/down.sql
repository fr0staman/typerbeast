-- This file should undo anything in `up.sql`





DROP TABLE "pending_texts";

ALTER TABLE "users" DROP COLUMN "role";

DROP TYPE review_text_status;
DROP TYPE user_roles;
