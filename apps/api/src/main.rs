mod app;
mod routes;
mod utils;

use std::net::SocketAddr;

use app::state::AppState;

#[tokio::main]
async fn main() {
    dotenvy::dotenv().ok();
    pretty_env_logger::init_timed();

    let ip = [0, 0, 0, 0];
    let port = 9999;

    let addr = SocketAddr::from((ip, port));

    let state = AppState {};

    let router = app::router::build_router(state.clone());
    let service = router.into_make_service_with_connect_info::<SocketAddr>();

    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();

    log::info!("listening on {}", listener.local_addr().unwrap());
    axum::serve(listener, service).await.unwrap();
}
