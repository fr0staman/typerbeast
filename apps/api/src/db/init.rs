use deadpool_runtime::Runtime;
use diesel_async::pooled_connection::{AsyncDieselConnectionManager, deadpool::Pool};

use crate::app::types::DbPool;

pub fn init_pool(database_url: String) -> DbPool {
    let manager = AsyncDieselConnectionManager::new(database_url);
    Pool::builder(manager).runtime(Runtime::Tokio1).build().expect("DB not connected!")
}
