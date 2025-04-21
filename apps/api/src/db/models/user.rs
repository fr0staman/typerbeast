use chrono::NaiveDateTime;
use diesel::prelude::*;
use diesel_async::RunQueryDsl;
use uuid::Uuid;

use crate::{
    app::types::{DbConn, MyResult},
    db::schema::users,
};

#[derive(Queryable, Selectable, Insertable, Debug)]
#[diesel(table_name = users)]
pub struct User {
    pub id: Uuid,
    pub username: String,
    pub email: String,
    pub password_hash: String,
    pub created_at: NaiveDateTime,
}

impl User {
    pub async fn get_user(conn: &mut DbConn, id_user: Uuid) -> MyResult<Option<User>> {
        use crate::db::schema::users::dsl::*;

        let result =
            users.filter(id.eq(id_user)).select(User::as_select()).first(conn).await.optional()?;

        Ok(result)
    }

    pub async fn get_user_by_email(conn: &mut DbConn, user_email: &str) -> MyResult<Option<User>> {
        use crate::db::schema::users::dsl::*;

        let result = users
            .filter(email.eq(user_email))
            .select(User::as_select())
            .first(conn)
            .await
            .optional()?;

        Ok(result)
    }

    pub async fn insert_user(self, conn: &mut DbConn) -> MyResult<User> {
        use crate::db::schema::users::dsl::*;

        Ok(diesel::insert_into(users).values(self).get_result(conn).await?)
    }
}
