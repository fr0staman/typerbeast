use chrono::NaiveDateTime;
use diesel::prelude::*;
use diesel_async::RunQueryDsl;
use serde::Serialize;
use uuid::Uuid;

use crate::{
    app::types::{DbConn, MyResult},
    db::{custom_types::ReviewTextStatus, schema::pending_texts},
};

// TODO: split to more usable structs
#[derive(
    Queryable, Selectable, Insertable, AsChangeset, Debug, Serialize, Clone, utoipa::ToSchema,
)]
#[diesel(table_name = pending_texts)]
pub struct PendingText {
    pub id: Uuid,
    pub dictionary_id: Uuid,
    pub author_id: Uuid,
    pub title: String,
    pub content: String,
    pub created_at: NaiveDateTime,
    pub reviewed_by: Option<Uuid>,
    pub reviewed_at: Option<NaiveDateTime>,
    pub status: ReviewTextStatus,
    pub reason: Option<String>,
}

impl PendingText {
    pub async fn get_pending_text_by_id(
        conn: &mut DbConn,
        id_text: Uuid,
    ) -> MyResult<Option<PendingText>> {
        use crate::db::schema::pending_texts::dsl::*;

        let result = pending_texts
            .filter(id.eq(id_text))
            .select(PendingText::as_select())
            .first(conn)
            .await
            .optional()?;

        Ok(result)
    }

    pub async fn get_pending_texts(conn: &mut DbConn) -> MyResult<Vec<PendingText>> {
        use crate::db::schema::pending_texts::dsl::*;

        let result = pending_texts.select(PendingText::as_select()).load(conn).await?;

        Ok(result)
    }

    pub async fn add_pending_text(self, conn: &mut DbConn) -> MyResult<PendingText> {
        use crate::db::schema::pending_texts::dsl::*;

        Ok(diesel::insert_into(pending_texts).values(self).get_result(conn).await?)
    }

    pub async fn modify_pending_text(self, conn: &mut DbConn) -> MyResult<PendingText> {
        use crate::db::schema::pending_texts::dsl::*;
        Ok(diesel::update(pending_texts.filter(id.eq(self.id))).set(self).get_result(conn).await?)
    }
}
