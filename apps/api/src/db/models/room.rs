use chrono::NaiveDateTime;
use diesel::prelude::*;
use diesel_async::RunQueryDsl;
use uuid::Uuid;

use crate::{
    app::types::{DbConn, MyResult},
    db::schema::rooms,
};
#[derive(Queryable, Selectable, Insertable, AsChangeset, Debug)]
#[diesel(table_name = rooms)]
pub struct Room {
    pub id: Uuid,
    pub text_id: Uuid,
    pub created_at: NaiveDateTime,
    pub started_at: NaiveDateTime,
    pub ended_at: NaiveDateTime,
}

impl Room {
    pub async fn get_room_by_id(conn: &mut DbConn, id_room: Uuid) -> MyResult<Option<Room>> {
        use crate::db::schema::rooms::dsl::*;
        Ok(rooms.filter(id.eq(id_room)).first(conn).await.optional()?)
    }

    pub async fn insert_room(self, conn: &mut DbConn) -> MyResult<Room> {
        use crate::db::schema::rooms::dsl::*;
        Ok(diesel::insert_into(rooms).values(self).get_result(conn).await?)
    }

    pub async fn modify_room(self, conn: &mut DbConn) -> MyResult<Room> {
        use crate::db::schema::rooms::dsl::*;
        Ok(diesel::update(rooms.filter(id.eq(self.id))).set(self).get_result(conn).await?)
    }
}
