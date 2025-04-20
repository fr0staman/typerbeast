use serde::Deserialize;

#[derive(Debug, Clone, Deserialize)]
pub struct AppEnvConfig {
    pub jwt_secret: String,
}

use config::Config;

pub fn load_config() -> AppEnvConfig {
    Config::builder()
        .add_source(config::Environment::default())
        .build()
        .expect("Failed to build config")
        .try_deserialize()
        .expect("Invalid configuration")
}
