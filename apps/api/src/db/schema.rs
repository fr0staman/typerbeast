// @generated automatically by Diesel CLI.

pub mod sql_types {
    #[derive(diesel::query_builder::QueryId, Clone, diesel::sql_types::SqlType)]
    #[diesel(postgres_type(name = "leagues"))]
    pub struct Leagues;

    #[derive(diesel::query_builder::QueryId, Clone, diesel::sql_types::SqlType)]
    #[diesel(postgres_type(name = "reviewtextstatus"))]
    pub struct Reviewtextstatus;

    #[derive(diesel::query_builder::QueryId, Clone, diesel::sql_types::SqlType)]
    #[diesel(postgres_type(name = "userroles"))]
    pub struct Userroles;
}

diesel::table! {
    dictionaries (id) {
        id -> Uuid,
        name -> Varchar,
        user_id -> Uuid,
        created_at -> Timestamp,
    }
}

diesel::table! {
    use diesel::sql_types::*;
    use super::sql_types::Reviewtextstatus;

    pending_texts (id) {
        id -> Uuid,
        dictionary_id -> Uuid,
        author_id -> Uuid,
        title -> Text,
        content -> Text,
        created_at -> Timestamp,
        reviewed_by -> Nullable<Uuid>,
        reviewed_at -> Nullable<Timestamp>,
        status -> Reviewtextstatus,
        reason -> Nullable<Text>,
    }
}

diesel::table! {
    results (id) {
        id -> Uuid,
        start_time -> Timestamp,
        end_time -> Timestamp,
        mistakes -> Int2,
        wpm -> Float4,
        cpm -> Float4,
        stats -> Jsonb,
        room_user_id -> Uuid,
    }
}

diesel::table! {
    use diesel::sql_types::*;
    use super::sql_types::Leagues;

    room_users (id) {
        id -> Uuid,
        room_id -> Uuid,
        user_id -> Uuid,
        joined_at -> Timestamp,
        left_at -> Timestamp,
        league -> Leagues,
    }
}

diesel::table! {
    rooms (id) {
        id -> Uuid,
        text_id -> Uuid,
        created_at -> Timestamp,
        started_at -> Timestamp,
        ended_at -> Timestamp,
    }
}

diesel::table! {
    sessions (id) {
        id -> Uuid,
        user_id -> Uuid,
        token -> Varchar,
        expires_at -> Timestamp,
        created_at -> Timestamp,
        user_agent -> Text,
        ip -> Inet,
    }
}

diesel::table! {
    texts (id) {
        id -> Uuid,
        dictionary_id -> Uuid,
        title -> Varchar,
        content -> Text,
        created_at -> Timestamp,
    }
}

diesel::table! {
    use diesel::sql_types::*;
    use super::sql_types::Userroles;

    users (id) {
        id -> Uuid,
        #[max_length = 64]
        username -> Varchar,
        #[max_length = 320]
        email -> Varchar,
        password_hash -> Varchar,
        created_at -> Timestamp,
        role -> Userroles,
    }
}

diesel::joinable!(dictionaries -> users (user_id));
diesel::joinable!(pending_texts -> dictionaries (dictionary_id));
diesel::joinable!(results -> room_users (room_user_id));
diesel::joinable!(room_users -> rooms (room_id));
diesel::joinable!(room_users -> users (user_id));
diesel::joinable!(rooms -> texts (text_id));
diesel::joinable!(sessions -> users (user_id));
diesel::joinable!(texts -> dictionaries (dictionary_id));

diesel::allow_tables_to_appear_in_same_query!(
    dictionaries,
    pending_texts,
    results,
    room_users,
    rooms,
    sessions,
    texts,
    users,
);
