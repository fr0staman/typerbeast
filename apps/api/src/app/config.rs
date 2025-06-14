use config::Config;
use uuid::Uuid;

use serde::Deserialize;

#[derive(Debug, Clone, Deserialize)]
pub struct AppEnvConfig {
    pub jwt_secret: String,
    pub database_url: String,
    pub default_dictionary_id: Uuid,
}

pub fn load_config() -> AppEnvConfig {
    Config::builder()
        .add_source(config::Environment::default())
        .build()
        .expect("Failed to build config")
        .try_deserialize()
        .expect("Invalid configuration")
}
