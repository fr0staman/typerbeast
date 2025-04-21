use std::net::SocketAddr;

use axum::{
    Json,
    extract::{ConnectInfo, State},
};
use axum_extra::{TypedHeader, headers::UserAgent};
use jsonwebtoken::{Header, encode};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::{
    AppState,
    app::auth::{AuthError, COMPANY_NAME, Claims, KEYS},
    db::models::{session::Session, user::User},
    utils,
};

#[derive(Debug, Deserialize)]
pub struct LoginRequest {
    pub email: String,
    pub password: String,
}

#[derive(Debug, Serialize)]
pub struct LoginResponse {
    pub access_token: String,
    pub token_type: String,
}

pub async fn login(
    state: State<AppState>,
    TypedHeader(user_agent): TypedHeader<UserAgent>,
    ConnectInfo(addr): ConnectInfo<SocketAddr>,
    Json(payload): Json<LoginRequest>,
) -> Result<Json<LoginResponse>, AuthError> {
    if payload.email.is_empty() || payload.password.is_empty() {
        return Err(AuthError::MissingCredentials);
    }

    let mut conn = state.db().await.unwrap();

    let maybe_user = User::get_user_by_email(&mut conn, &payload.email).await?;

    let Some(user) = maybe_user else {
        return Err(AuthError::WrongCredentials);
    };

    let is_verified = utils::verify_password(payload.password, user.password_hash).is_ok();

    if !is_verified {
        return Err(AuthError::WrongCredentials);
    }

    let now = chrono::Utc::now().naive_utc();
    let expire = now + chrono::Duration::days(1);
    let session_id = Uuid::new_v4();

    let claims = Claims {
        sub: user.id,
        company: COMPANY_NAME.to_string(),
        exp: expire.and_utc().timestamp() as usize,
        sid: session_id,
    };

    let access_token = encode(&Header::default(), &claims, &KEYS.encoding)
        .map_err(|_| AuthError::TokenCreation)?;

    let new_session = Session {
        id: session_id,
        user_id: user.id,
        token: access_token.clone(),
        expires_at: expire,
        created_at: now,
        user_agent: user_agent.to_string(),
        ip: addr.ip().into(),
    };

    new_session.insert_session(&mut conn).await?;

    let res = LoginResponse { access_token, token_type: "Bearer".to_string() };

    Ok(Json(res))
}

#[derive(Serialize, Deserialize)]
pub struct ProfileResponse {
    email: String,
}

pub async fn profile(claims: Claims, state: State<AppState>) -> Json<ProfileResponse> {
    // In claims.sub I don't want to store the email, this is just for fast prototyping
    let res = ProfileResponse { email: claims.sub.to_string() };

    Json(res)
}

#[derive(Deserialize)]
pub struct SignupRequest {
    pub email: String,
    pub password: String,
    pub username: String,
}

pub async fn signup(
    state: State<AppState>,
    TypedHeader(user_agent): TypedHeader<UserAgent>,
    ConnectInfo(addr): ConnectInfo<SocketAddr>,
    Json(input): Json<SignupRequest>,
) -> Json<LoginResponse> {
    todo!()
}
