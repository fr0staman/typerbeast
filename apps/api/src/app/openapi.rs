use utoipa::{openapi::security::{ApiKey, ApiKeyValue, SecurityScheme}, Modify, OpenApi};
use utoipa_axum::router::OpenApiRouter;

use super::auth::COOKIE_NAME;

const DESCRIPTION: &str = r#"
Typerbeast API.

In active development.
"#;

#[derive(OpenApi)]
#[openapi(
    info(
        title = "Typerbeast API",
        description = DESCRIPTION,
        contact(
            name = "fr0staman",
            url = "https://github.com/fr0staman/typerbeast"
        ),
        license(name = "MIT", url = "https://github.com/fr0staman/typerbeast/blob/main/LICENSE"),
        version = env!("CARGO_PKG_VERSION"),
    ),
    modifiers(&SecurityAddon),
    
)]
pub struct OpenApiDoc;

impl OpenApiDoc {
    pub fn router<S>() -> OpenApiRouter<S>
    where
        S: Send + Sync + Clone + 'static,
    {
        OpenApiRouter::with_openapi(Self::openapi())
    }
}

struct SecurityAddon;

impl Modify for SecurityAddon {
    fn modify(&self, openapi: &mut utoipa::openapi::OpenApi) {
        let components = openapi.components.get_or_insert_default();

        let description = "The session cookie is used by the web UI to authenticate users.";
        let cookie = ApiKey::Cookie(ApiKeyValue::with_description(COOKIE_NAME, description));
        components.add_security_scheme("cookie", SecurityScheme::ApiKey(cookie));

        let name = "Authorization";
        let description: &str =
            "The API token is used to authenticate requests from cargo and other clients.";
        let api_token = ApiKey::Header(ApiKeyValue::with_description(name, description));
        components.add_security_scheme("api_token", SecurityScheme::ApiKey(api_token));
    }
}