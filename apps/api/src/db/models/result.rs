use chrono::NaiveDateTime;
use diesel::prelude::*;
use diesel_async::RunQueryDsl;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::{
    app::types::{DbConn, MyResult},
    db::schema::results,
};

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Keystroke {
    // attention key can be more than 1 symbol on mistake, to store user input and analytics
    pub key: String,
    pub mistake: bool,
    pub expected: Option<String>,
    pub timestamp: NaiveDateTime,
}

#[derive(Serialize, Deserialize, Debug, Clone, diesel::AsExpression, diesel::FromSqlRow)]
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

#[derive(Queryable, Selectable, Insertable, Debug)]
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
}
