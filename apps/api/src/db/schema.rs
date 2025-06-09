// @generated automatically by Diesel CLI.

diesel::table! {
    dictionaries (id) {
        id -> Uuid,
        name -> Varchar,
        user_id -> Uuid,
        created_at -> Timestamp,
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
    room_users (id) {
        id -> Uuid,
        room_id -> Uuid,
        user_id -> Uuid,
        joined_at -> Timestamp,
        left_at -> Timestamp,
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
    users (id) {
        id -> Uuid,
        #[max_length = 64]
        username -> Varchar,
        #[max_length = 320]
        email -> Varchar,
        password_hash -> Varchar,
        created_at -> Timestamp,
    }
}

diesel::joinable!(dictionaries -> users (user_id));
diesel::joinable!(results -> room_users (room_user_id));
diesel::joinable!(room_users -> rooms (room_id));
diesel::joinable!(room_users -> users (user_id));
diesel::joinable!(rooms -> texts (text_id));
diesel::joinable!(sessions -> users (user_id));
diesel::joinable!(texts -> dictionaries (dictionary_id));

diesel::allow_tables_to_appear_in_same_query!(
    dictionaries,
    results,
    room_users,
    rooms,
    sessions,
    texts,
    users,
);
