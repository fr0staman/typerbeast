use chrono::NaiveDateTime;
use diesel::prelude::*;
use diesel_async::RunQueryDsl;
use ipnetwork::IpNetwork;
use uuid::Uuid;

use crate::{
    app::types::{DbConn, MyResult},
    db::schema::sessions,
};
#[derive(Queryable, Selectable, Insertable, Debug)]
#[diesel(table_name = sessions)]
pub struct Session {
    pub id: Uuid,
    pub user_id: Uuid,
    pub token: String,
    pub expires_at: NaiveDateTime,
    pub created_at: NaiveDateTime,
    pub user_agent: String,
    pub ip: IpNetwork,
}

impl Session {
    pub async fn get_session(conn: &mut DbConn, sid: Uuid) -> MyResult<Option<Session>> {
        use crate::db::schema::sessions::dsl::*;

        let result = sessions
            .filter(id.eq(sid))
            .select(Session::as_select())
            .first(conn)
            .await
            .optional()?;

        Ok(result)
    }

    pub async fn insert_session(self, conn: &mut DbConn) -> MyResult<Session> {
        use crate::db::schema::sessions::dsl::*;

        Ok(diesel::insert_into(sessions).values(self).get_result::<Session>(conn).await?)
    }
}
