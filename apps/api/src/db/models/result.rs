use chrono::NaiveDateTime;
use diesel::prelude::*;
use diesel_async::RunQueryDsl;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::{
    app::types::{DbConn, MyResult},
    db::{models::room_user::RoomUser, schema::results},
};

#[derive(Serialize, Deserialize, Debug, Clone, utoipa::ToSchema)]
pub struct Keystroke {
    // attention key can be more than 1 symbol on mistake, to store user input and analytics
    pub key: String,
    pub mistake: bool,
    pub expected: Option<String>,
    pub timestamp: NaiveDateTime,
}

#[derive(
    Serialize, Deserialize, Debug, Clone, diesel::AsExpression, diesel::FromSqlRow, utoipa::ToSchema,
)]
#[diesel[sql_type = diesel::pg::sql_types::Jsonb]]
pub struct ResultStats {
    pub keystrokes: Vec<Keystroke>,
}

use diesel::deserialize::FromSql;
use diesel::pg::{Pg, PgValue};
use diesel::serialize::{Output, ToSql};
use diesel::sql_types::Jsonb;

impl FromSql<Jsonb, Pg> for ResultStats {
    fn from_sql(bytes: PgValue<'_>) -> diesel::deserialize::Result<Self> {
        let value = <serde_json::Value as FromSql<Jsonb, Pg>>::from_sql(bytes)?;
        Ok(serde_json::from_value(value)?)
    }
}

impl ToSql<Jsonb, Pg> for ResultStats {
    fn to_sql<'b>(&'b self, out: &mut Output<'b, '_, Pg>) -> diesel::serialize::Result {
        let value = serde_json::to_value(self)?;
        <serde_json::Value as ToSql<Jsonb, Pg>>::to_sql(&value, &mut out.reborrow())
    }
}

#[derive(Queryable, Selectable, Insertable, Debug, Serialize, Deserialize, utoipa::ToSchema)]
#[diesel(table_name = results)]
pub struct Results {
    pub id: Uuid,
    pub start_time: NaiveDateTime,
    pub end_time: NaiveDateTime,
    pub mistakes: i16,
    pub wpm: f32,
    pub cpm: f32,
    pub stats: ResultStats,
    pub room_user_id: Uuid,
}

impl Results {
    pub async fn get_result_by_id(conn: &mut DbConn, id_result: Uuid) -> MyResult<Option<Results>> {
        use crate::db::schema::results::dsl::*;
        Ok(results.filter(id.eq(id_result)).first(conn).await.optional()?)
    }

    pub async fn get_results_by_room_user_id(
        conn: &mut DbConn,
        id_room_user: Uuid,
    ) -> MyResult<Vec<Results>> {
        use crate::db::schema::results::dsl::*;
        Ok(results.filter(room_user_id.eq(id_room_user)).load(conn).await?)
    }

    pub async fn insert_result(self, conn: &mut DbConn) -> MyResult<Results> {
        use crate::db::schema::results::dsl::*;
        Ok(diesel::insert_into(results).values(self).get_result(conn).await?)
    }

    pub async fn get_last_result_by_user_id(
        conn: &mut DbConn,
        id_room_user: Uuid,
    ) -> MyResult<Option<(Results, RoomUser)>> {
        use crate::db::schema::results::dsl::*;
        use crate::db::schema::room_users;

        let result = results
            .filter(room_users::user_id.eq(id_room_user))
            .inner_join(room_users::table)
            .order(end_time.desc())
            .first(conn)
            .await
            .optional()?;

        Ok(result)
    }

    pub async fn get_results_count_by_user_id(
        conn: &mut DbConn,
        id_room_user: Uuid,
    ) -> MyResult<i64> {
        use crate::db::schema::results::dsl::*;
        use crate::db::schema::room_users;

        Ok(results
            .filter(room_users::user_id.eq(id_room_user))
            .inner_join(room_users::table)
            .count()
            .first(conn)
            .await?)
    }

    pub async fn get_average_wpm_cpm_mistakes_in_dictionary_by_user_id(
        conn: &mut DbConn,
        id_dictionary: Uuid,
        id_user: Uuid,
    ) -> MyResult<Option<(f64, f64, f64)>> {
        use crate::db::schema::results::dsl::*;
        use crate::db::schema::room_users;
        use crate::db::schema::rooms;
        use crate::db::schema::texts;
        use diesel::dsl::avg;

        let result = results
            .inner_join(room_users::table.on(room_users::id.eq(room_user_id)))
            .inner_join(rooms::table.on(rooms::id.eq(room_users::room_id)))
            .inner_join(texts::table.on(texts::id.eq(rooms::text_id)))
            .filter(room_users::user_id.eq(id_user))
            .filter(texts::dictionary_id.eq(id_dictionary))
            .select((
                avg(wpm),
                avg(cpm),
                // avg(mistakes) -> Numeric, but i cant cast it to double without bigdecimal crate.
                avg(diesel::dsl::sql::<diesel::sql_types::Double>("mistakes::real")),
            ))
            .first(conn)
            .await
            .optional()?;

        let result = match result {
            Some((Some(_wpm), Some(_cpm), Some(_mistakes))) => Some((_wpm, _cpm, _mistakes)),
            _ => None,
        };

        Ok(result)
    }
}
