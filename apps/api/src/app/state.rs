use super::room::RoomsManager;
use super::types::{DbPool, DeadpoolResult};

#[derive(Clone)]
pub struct AppState {
    pub pool: DbPool,
    pub rooms_manager: RoomsManager,
    pub config: crate::app::config::AppEnvConfig,
}

impl AppState {
    pub async fn db(&self) -> DeadpoolResult {
        self.pool.get().await
    }
}
