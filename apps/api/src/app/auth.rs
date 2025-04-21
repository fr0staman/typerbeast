use std::sync::LazyLock;

use axum::{
    RequestPartsExt,
    extract::{FromRef, FromRequestParts},
    http::request::Parts,
};
use axum_extra::{
    TypedHeader,
    headers::{Authorization, authorization::Bearer},
};
use jsonwebtoken::{DecodingKey, EncodingKey, Validation, decode};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::db::models::session::Session;

use super::{
    error::{AuthError, MyError},
    state::AppState,
};

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
    type Rejection = MyError;

    async fn from_request_parts(parts: &mut Parts, state: &S) -> Result<Self, Self::Rejection> {
        let bearer = parts
            .extract::<TypedHeader<Authorization<Bearer>>>()
            .await
            .map_err(|_| AuthError::InvalidToken)?;

        let token = bearer.token();

        let token_data = decode(token, &KEYS.decoding, &Validation::default())?;

        let claims: Claims = token_data.claims;

        let app_state = AppState::from_ref(state);
        let mut conn = app_state.db().await?;
        let maybe_session = Session::get_session(&mut conn, claims.sid).await?;

        if maybe_session.is_none() {
            return Err(MyError::Auth(AuthError::InvalidToken));
        }

        Ok(claims)
    }
}
