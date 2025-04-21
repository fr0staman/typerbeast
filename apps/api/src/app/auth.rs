use std::sync::LazyLock;

use axum::{
    Json, RequestPartsExt,
    extract::{FromRef, FromRequestParts},
    http::{StatusCode, request::Parts},
    response::{IntoResponse, Response},
};
use axum_extra::{
    TypedHeader,
    headers::{Authorization, authorization::Bearer},
};
use jsonwebtoken::{DecodingKey, EncodingKey, Validation, decode};
use serde::{Deserialize, Serialize};
use serde_json::json;
use uuid::Uuid;

use crate::db::models::session::Session;

use super::state::AppState;

pub const COMPANY_NAME: &str = env!("CARGO_PKG_NAME");

pub static KEYS: LazyLock<Keys> = LazyLock::new(|| {
    let secret = crate::app::config::load_config().jwt_secret;
    Keys::new(secret.as_bytes())
});

pub struct Keys {
    pub encoding: EncodingKey,
    pub decoding: DecodingKey,
}

impl Keys {
    fn new(secret: &[u8]) -> Self {
        Self {
            encoding: EncodingKey::from_secret(secret),
            decoding: DecodingKey::from_secret(secret),
        }
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub sub: Uuid,
    pub company: String,
    pub exp: usize,
    pub sid: Uuid,
}

impl<S> FromRequestParts<S> for Claims
where
    S: Send + Sync,
    AppState: FromRef<S>,
{
    type Rejection = AuthError;

    async fn from_request_parts(parts: &mut Parts, state: &S) -> Result<Self, Self::Rejection> {
        let bearer = parts
            .extract::<TypedHeader<Authorization<Bearer>>>()
            .await
            .map_err(|_| AuthError::InvalidToken)?;

        let token = bearer.token();

        let token_data = decode(token, &KEYS.decoding, &Validation::default())
            .map_err(|_| AuthError::InvalidToken)?;

        let claims: Claims = token_data.claims;

        let app_state = AppState::from_ref(state);
        let mut conn = app_state.db().await.unwrap();
        let maybe_session = Session::get_session(&mut conn, claims.sid).await?;

        if maybe_session.is_none() {
            return Err(AuthError::InvalidToken);
        }

        Ok(claims)
    }
}

impl IntoResponse for AuthError {
    fn into_response(self) -> Response {
        let (status, error_message) = match self {
            AuthError::WrongCredentials => (StatusCode::UNAUTHORIZED, "Wrong credentials"),
            AuthError::MissingCredentials => (StatusCode::BAD_REQUEST, "Missing credentials"),
            AuthError::TokenCreation => (StatusCode::INTERNAL_SERVER_ERROR, "Token creation error"),
            AuthError::InvalidToken => (StatusCode::BAD_REQUEST, "Invalid token"),
        };
        let body = Json(json!({
            "error": error_message,
        }));
        (status, body).into_response()
    }
}

#[derive(Debug)]
pub enum AuthError {
    WrongCredentials,
    MissingCredentials,
    TokenCreation,
    InvalidToken,
}
