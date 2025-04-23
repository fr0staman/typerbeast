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
diesel::joinable!(sessions -> users (user_id));
diesel::joinable!(texts -> dictionaries (dictionary_id));

diesel::allow_tables_to_appear_in_same_query!(
    dictionaries,
    sessions,
    texts,
    users,
);
