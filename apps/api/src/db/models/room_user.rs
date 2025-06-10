use chrono::NaiveDateTime;
use diesel::prelude::*;
use diesel_async::RunQueryDsl;
use uuid::Uuid;

use crate::{
    app::types::{DbConn, MyResult},
    db::{custom_types::Leagues, schema::room_users},
};
#[derive(Queryable, Selectable, Insertable, Debug, AsChangeset)]
#[diesel(table_name = room_users)]
pub struct RoomUser {
    pub id: Uuid,
    pub room_id: Uuid,
    pub user_id: Uuid,
    pub joined_at: NaiveDateTime,
    pub left_at: NaiveDateTime,
    pub league: Leagues,
}

impl RoomUser {
    pub async fn get_room_user_by_id(
        conn: &mut DbConn,
        id_room_user: Uuid,
    ) -> MyResult<Option<RoomUser>> {
        use crate::db::schema::room_users::dsl::*;
        Ok(room_users.filter(id.eq(id_room_user)).first(conn).await.optional()?)
    }

    pub async fn insert_room_user(self, conn: &mut DbConn) -> MyResult<RoomUser> {
        use crate::db::schema::room_users::dsl::*;
        Ok(diesel::insert_into(room_users).values(self).get_result(conn).await?)
    }

    pub async fn modify_room_user(self, conn: &mut DbConn) -> MyResult<RoomUser> {
        use crate::db::schema::room_users::dsl::*;
        Ok(diesel::update(room_users.filter(id.eq(self.id))).set(self).get_result(conn).await?)
    }
}
