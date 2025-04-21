use axum::{Json, Router, routing::*};

use crate::{app::state::AppState, routes};

pub fn build_router(state: AppState) -> Router<()> {
    Router::new()
        .nest(
            "/api/v1",
            Router::new().nest(
                "/user",
                Router::new()
                    .route("/login", post(routes::user::login))
                    .route("/signup", post(routes::user::signup))
                    .route("/profile", get(routes::user::profile)),
            ),
        )
        .fallback(fallback_404)
        .with_state(state)
}

async fn fallback_404() -> Json<serde_json::Value> {
    Json(serde_json::json!({"error": "NOT FOUND"}))
}
