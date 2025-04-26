use chrono::NaiveDateTime;
use diesel::prelude::*;
use diesel_async::RunQueryDsl;
use serde::Serialize;
use uuid::Uuid;

use crate::{
    app::types::{DbConn, MyResult},
    db::schema::texts,
};

// TODO: split to more usable structs
#[derive(Queryable, Selectable, Insertable, Debug, Serialize, utoipa::ToSchema)]
#[diesel(table_name = texts)]
pub struct Text {
    pub id: Uuid,
    pub dictionary_id: Uuid,
    pub title: String,
    pub content: String,
    pub created_at: NaiveDateTime,
}

impl Text {
    pub async fn get_texts(conn: &mut DbConn) -> MyResult<Vec<Text>> {
        use crate::db::schema::texts::dsl::*;

        let result = texts.select(Text::as_select()).load(conn).await?;

        Ok(result)
    }

    pub async fn get_text_by_id(conn: &mut DbConn, id_text: Uuid) -> MyResult<Option<Text>> {
        use crate::db::schema::texts::dsl::*;

        let result =
            texts.filter(id.eq(id_text)).select(Text::as_select()).first(conn).await.optional()?;

        Ok(result)
    }

    pub async fn insert_text(self, conn: &mut DbConn) -> MyResult<Text> {
        use crate::db::schema::texts::dsl::*;

        Ok(diesel::insert_into(texts).values(self).get_result(conn).await?)
    }
}
