use std::time::Duration;

use axum::Router;
use tower_http::timeout::{RequestBodyTimeoutLayer, TimeoutLayer};

use crate::app::state::AppState;

pub fn apply_axum_middleware(_state: AppState, router: Router<()>) -> Router {
    router
        .layer(TimeoutLayer::new(Duration::from_secs(30)))
        .layer(RequestBodyTimeoutLayer::new(Duration::from_secs(30)))
}
