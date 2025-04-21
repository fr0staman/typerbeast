use super::types::{DbPool, DeadpoolResult};

#[derive(Clone)]
pub struct AppState {
    pub pool: DbPool,
}

impl AppState {
    pub async fn db(&self) -> DeadpoolResult {
        self.pool.get().await
    }
}
