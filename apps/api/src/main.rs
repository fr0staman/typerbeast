mod app;
mod db;
mod routes;
mod utils;

use std::net::SocketAddr;

use app::state::AppState;

#[tokio::main]
async fn main() {
    dotenvy::dotenv().ok();
    pretty_env_logger::init_timed();

    let config = app::config::load_config();

    let pool = db::init::init_pool(config.database_url.clone());

    let rooms_manager = app::room::RoomsManager::new(pool.clone());
    let state = AppState { pool, rooms_manager };

    let ip = [0, 0, 0, 0];
    let port = 9999;
    let addr = SocketAddr::from((ip, port));

    let router = app::router::build_router(state.clone());
    let app = app::middleware::apply_axum_middleware(state, router);
    let service = app.into_make_service_with_connect_info::<SocketAddr>();

    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();

    log::info!("listening on {}", listener.local_addr().unwrap());
    axum::serve(listener, service).await.unwrap();
}
