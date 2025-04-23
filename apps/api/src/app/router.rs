use axum::{Json, Router, routing::*};

use crate::{app::state::AppState, routes};

pub fn build_router(state: AppState) -> Router<()> {
    let base_router = Router::new()
        .nest(
            "/user",
            Router::new()
                .route("/login", post(routes::user::login))
                .route("/signup", post(routes::user::signup))
                .route("/profile", get(routes::user::profile)),
        )
        .route(
            "/dictionaries",
            get(routes::dictionaries::get_dictionaries).post(routes::dictionaries::add_dictionary),
        )
        .route("/dictionaries/{dict_id}/texts", get(routes::dictionaries::get_texts_in_dictionary))
        .route("/texts", get(routes::texts::get_texts).post(routes::texts::insert_text));

    Router::new().nest("/api/v1", base_router).fallback(fallback_404).with_state(state)
}

async fn fallback_404() -> Json<serde_json::Value> {
    Json(serde_json::json!({"error": "NOT FOUND"}))
}
