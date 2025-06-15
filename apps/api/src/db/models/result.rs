use chrono::{Duration, NaiveDateTime, Utc};
use diesel::prelude::*;
use diesel_async::RunQueryDsl;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::{
    app::types::{DbConn, MyResult},
    db::{custom_types::Leagues, models::room_user::RoomUser, schema::results},
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

#[derive(Deserialize, utoipa::ToSchema, utoipa::IntoParams)]
pub struct TopQuery {
    // If not provided, defaults to default dictionary
    pub dictionary_id: Option<Uuid>,
    // If not provided - not filtered
    pub league: Option<Leagues>,
    #[serde(default)]
    pub period: Period,
}

#[derive(Default, Deserialize, utoipa::ToSchema)]
#[serde(rename_all = "lowercase")]
pub enum Period {
    Day,
    Week,
    Month,
    #[default]
    AllTime,
}

#[derive(Queryable, Serialize, utoipa::ToSchema)]
pub struct TopUser {
    pub user_id: Uuid,
    pub username: String,
    pub room_id: Uuid,
    pub id: Uuid,
    pub wpm: f32,
    pub cpm: f32,
    pub mistakes: i16,
    pub achieved_at: chrono::NaiveDateTime,
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

    pub async fn get_leaderboard(conn: &mut DbConn, params: TopQuery) -> MyResult<Vec<TopUser>> {
        use crate::db::schema::results;
        use crate::db::schema::room_users;
        use crate::db::schema::rooms;
        use crate::db::schema::texts;
        use crate::db::schema::users;

        let mut query = results::table
            .inner_join(room_users::table.on(room_users::id.eq(results::room_user_id)))
            .inner_join(rooms::table.on(rooms::id.eq(room_users::room_id)))
            .inner_join(texts::table.on(texts::id.eq(rooms::text_id)))
            .inner_join(users::table.on(users::id.eq(room_users::user_id)))
            .distinct_on(users::id)
            .select((
                users::id,
                users::username,
                room_users::room_id,
                results::id,
                results::wpm,
                results::cpm,
                results::mistakes,
                results::end_time,
            ))
            .into_boxed();

        if let Some(dict_id) = params.dictionary_id {
            query = query.filter(texts::dictionary_id.eq(dict_id));
        }

        if let Some(league) = params.league {
            use crate::db::schema::room_users::dsl::league as room_league;
            query = query.filter(room_league.eq(league));
        }

        if let Some(start_time) = match params.period {
            Period::Day => Some(Utc::now() - Duration::hours(24)),
            Period::Week => Some(Utc::now() - Duration::days(7)),
            Period::Month => Some(Utc::now() - Duration::days(30)),
            Period::AllTime => None,
        } {
            query = query.filter(results::end_time.gt(start_time.naive_utc()));
        }

        Ok(query.order_by((users::id, results::wpm.desc())).limit(10).load(conn).await?)
    }
}
