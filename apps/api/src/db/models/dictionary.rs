use chrono::NaiveDateTime;
use diesel::prelude::*;
use diesel_async::RunQueryDsl;
use serde::Serialize;
use uuid::Uuid;

use crate::{
    app::types::{DbConn, MyResult},
    db::{models::user::User, schema::dictionaries},
};

use super::text::Text;

#[derive(Queryable, Selectable, Insertable, Debug, Serialize, utoipa::ToSchema, Clone)]
#[diesel(table_name = dictionaries)]
pub struct Dictionary {
    pub id: Uuid,
    pub name: String,
    pub user_id: Uuid,
    pub created_at: NaiveDateTime,
}

impl Dictionary {
    pub async fn insert_dictionary(self, conn: &mut DbConn) -> MyResult<Dictionary> {
        use crate::db::schema::dictionaries::dsl::*;

        Ok(diesel::insert_into(dictionaries).values(self).get_result(conn).await?)
    }

    pub async fn get_dictionaries(conn: &mut DbConn) -> MyResult<Vec<(Dictionary, User)>> {
        use crate::db::schema::dictionaries::dsl::*;
        use crate::db::schema::users;

        let result = dictionaries
            .inner_join(users::table)
            .select((Dictionary::as_select(), User::as_select()))
            .load(conn)
            .await?;

        Ok(result)
    }

    pub async fn get_dictionary_by_id(
        conn: &mut DbConn,
        id_dict: Uuid,
    ) -> MyResult<Option<Dictionary>> {
        use crate::db::schema::dictionaries::dsl::*;

        let result = dictionaries
            .filter(id.eq(id_dict))
            .select(Dictionary::as_select())
            .first(conn)
            .await
            .optional()?;

        Ok(result)
    }

    pub async fn get_dictionaries_by_user_id(
        conn: &mut DbConn,
        id_user: Uuid,
    ) -> MyResult<Vec<Dictionary>> {
        use crate::db::schema::dictionaries::dsl::*;

        let result = dictionaries
            .filter(user_id.eq(id_user))
            .select(Dictionary::as_select())
            .load(conn)
            .await?;

        Ok(result)
    }

    pub async fn get_texts_in_dictionary(&self, conn: &mut DbConn) -> MyResult<Vec<Text>> {
        use crate::db::schema::texts::dsl::*;

        let result =
            texts.filter(dictionary_id.eq(self.id)).select(Text::as_select()).load(conn).await?;

        Ok(result)
    }

    pub async fn get_random_text_in_dictionary(&self, conn: &mut DbConn) -> MyResult<Option<Text>> {
        use crate::db::schema::texts::dsl::*;

        let result = texts
            .filter(dictionary_id.eq(self.id))
            .order(diesel::dsl::sql::<diesel::sql_types::Double>("RANDOM()"))
            .limit(1)
            .select(Text::as_select())
            .first(conn)
            .await
            .optional()?;

        Ok(result)
    }

    pub async fn get_dictionary_text_count(conn: &mut DbConn) -> MyResult<Vec<(Uuid, i64)>> {
        use crate::db::schema::texts;
        use diesel::dsl::count_star;

        let result = dictionaries::table
            .left_join(texts::table)
            .group_by(dictionaries::id)
            .select((dictionaries::id, count_star()))
            .load(conn)
            .await?;

        Ok(result)
    }
}
