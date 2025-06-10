use axum::{Json, Router, routing::*};
use utoipa_axum::routes;

use crate::{app::state::AppState, routes};

use super::openapi::OpenApiDoc;

pub fn build_router(state: AppState) -> Router<()> {
    let (router, openapi) = OpenApiDoc::router()
        .routes(routes!(routes::user::login))
        .routes(routes!(routes::user::signup))
        .routes(routes!(routes::user::profile))
        .routes(routes!(
            routes::dictionaries::get_dictionaries,
            routes::dictionaries::add_dictionary
        ))
        .routes(routes!(routes::dictionaries::get_texts_in_dictionary))
        .routes(routes!(routes::texts::get_texts, routes::texts::insert_text))
        .routes(routes!(routes::ws::ws_handler))
        .routes(routes!(routes::rooms::get_rooms, routes::rooms::create_room,))
        .routes(routes!(routes::rooms::start_room))
        .routes(routes!(routes::dictionaries::create_room_with_dictionary))
        .routes(routes!(routes::texts::review_pending_text))
        .split_for_parts();

    router
        .route("/api/v1/openapi.json", get(async || Json(openapi)))
        .fallback(fallback_404)
        .with_state(state)
}

async fn fallback_404() -> Json<serde_json::Value> {
    Json(serde_json::json!({"error": "NOT FOUND"}))
}
