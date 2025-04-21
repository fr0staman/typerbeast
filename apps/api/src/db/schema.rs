// @generated automatically by Diesel CLI.

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

diesel::joinable!(sessions -> users (user_id));

diesel::allow_tables_to_appear_in_same_query!(
    sessions,
    users,
);
