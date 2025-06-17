use std::net::SocketAddr;

use axum::{
    Json,
    extract::{ConnectInfo, Path, State},
};
use axum_extra::{
    TypedHeader,
    extract::{
        CookieJar,
        cookie::{Cookie, SameSite},
    },
    headers::UserAgent,
};
use chrono::NaiveDateTime;
use jsonwebtoken::{Header, encode};
use serde::{Deserialize, Serialize};
use time::{Duration, OffsetDateTime};
use uuid::Uuid;

use crate::{
    AppState,
    app::{
        auth::{COMPANY_NAME, COOKIE_NAME, Claims, KEYS},
        error::{AuthError, MyError},
        types::MyResult,
    },
    db::{
        custom_types::UserRoles,
        models::{result::Results, session::Session, user::User},
    },
    utils,
};

#[derive(Debug, Deserialize, utoipa::ToSchema)]
pub struct LoginRequest {
    pub email: String,
    pub password: String,
}

#[derive(Debug, Serialize, utoipa::ToSchema)]
pub struct LoginResponse {
    pub access_token: String,
    pub token_type: String,
}

#[utoipa::path(
    post,
    path = "/api/v1/user/login",
    request_body = LoginRequest,
    responses(
        (status = 200, description = "Login successful", body = LoginResponse),
        (status = 401, description = "Unauthorized"),
    )
)]
pub async fn login(
    jar: CookieJar,
    state: State<AppState>,
    TypedHeader(user_agent): TypedHeader<UserAgent>,
    ConnectInfo(addr): ConnectInfo<SocketAddr>,
    Json(payload): Json<LoginRequest>,
) -> MyResult<(CookieJar, Json<LoginResponse>)> {
    if payload.email.is_empty() || payload.password.is_empty() {
        return Err(MyError::Auth(AuthError::WrongCredentials));
    }

    let mut conn = state.db().await?;

    let maybe_user = User::get_user_by_email(&mut conn, &payload.email).await?;

    let Some(user) = maybe_user else {
        return Err(MyError::Auth(AuthError::WrongCredentials));
    };

    let is_verified = utils::verify_password(payload.password, user.password_hash).is_ok();

    if !is_verified {
        return Err(MyError::Auth(AuthError::InvalidToken));
    }

    let created_at = chrono::Utc::now().naive_utc();
    let expires_at = created_at + chrono::Duration::days(7);
    let session_id = Uuid::new_v4();

    let claims = Claims {
        sub: user.id,
        company: COMPANY_NAME.to_string(),
        exp: expires_at.and_utc().timestamp() as usize,
        sid: session_id,
    };

    let access_token = encode(&Header::default(), &claims, &KEYS.encoding)?;

    let new_session = Session {
        id: session_id,
        user_id: user.id,
        token: access_token.clone(),
        expires_at,
        created_at,
        user_agent: user_agent.to_string(),
        ip: addr.ip().into(),
    };

    new_session.insert_session(&mut conn).await?;

    let cookie = Cookie::build((COOKIE_NAME, access_token.clone()))
        .path("/")
        .http_only(true)
        // TODO: use after live https server setup
        // .secure(true)
        .same_site(SameSite::Lax)
        .max_age(Duration::days(7))
        .expires(OffsetDateTime::from_unix_timestamp(expires_at.and_utc().timestamp()).unwrap());

    let res = LoginResponse { access_token, token_type: "Bearer".to_string() };

    Ok((jar.add(cookie), Json(res)))
}

#[derive(Serialize, Deserialize, utoipa::ToSchema)]
pub struct ProfileResponse {
    id: Uuid,
    username: String,
    email: String,
    created_at: NaiveDateTime,
    role: UserRoles,
}

#[utoipa::path(
    get,
    path = "/api/v1/user/me/profile",
    responses(
        (status = 200, description = "Success", body = ProfileResponse),
        (status = 401, description = "Unauthorized"),
    )
)]
pub async fn profile(claims: Claims, state: State<AppState>) -> MyResult<Json<ProfileResponse>> {
    let mut conn = state.db().await?;

    let maybe_user = User::get_user(&mut conn, claims.sub).await?;
    let Some(user) = maybe_user else { return Err(MyError::InternalError) };

    let res = ProfileResponse {
        username: user.username,
        email: user.email,
        created_at: user.created_at,
        id: user.id,
        role: user.role,
    };

    Ok(Json(res))
}

#[derive(Deserialize, utoipa::ToSchema)]
pub struct SignupRequest {
    pub email: String,
    pub password: String,
    pub username: String,
}

#[utoipa::path(
    post,
    path = "/api/v1/user/signup",
    request_body = SignupRequest,
    responses(
        (status = 200, description = "Signup successful", body = LoginResponse),
    )
)]
pub async fn signup(
    jar: CookieJar,
    state: State<AppState>,
    TypedHeader(user_agent): TypedHeader<UserAgent>,
    ConnectInfo(addr): ConnectInfo<SocketAddr>,
    Json(input): Json<SignupRequest>,
) -> MyResult<(CookieJar, Json<LoginResponse>)> {
    let mut conn = state.db().await?;

    let maybe_user = User::get_user_by_email(&mut conn, &input.email).await?;

    if maybe_user.is_some() {
        return Err(MyError::Unauthorized);
    }

    let Ok(password_hash) = utils::hash_password(&input.password) else {
        return Err(MyError::InternalError);
    };

    let new_user = User {
        id: Uuid::new_v4(),
        username: input.username.clone(),
        email: input.email.clone(),
        password_hash,
        created_at: chrono::Utc::now().naive_utc(),
        role: UserRoles::User,
    };

    let user = new_user.insert_user(&mut conn).await?;

    let created_at = chrono::Utc::now().naive_utc();
    let expires_at = created_at + chrono::Duration::days(7);
    let session_id = Uuid::new_v4();

    let claims = Claims {
        sub: user.id,
        company: COMPANY_NAME.to_string(),
        exp: expires_at.and_utc().timestamp() as usize,
        sid: session_id,
    };

    let access_token = encode(&Header::default(), &claims, &KEYS.encoding)?;

    let new_session = Session {
        id: session_id,
        user_id: user.id,
        token: access_token.clone(),
        expires_at,
        created_at,
        user_agent: user_agent.to_string(),
        ip: addr.ip().into(),
    };

    new_session.insert_session(&mut conn).await?;

    let cookie = Cookie::build((COOKIE_NAME, access_token.clone()))
        .path("/")
        .http_only(true)
        // TODO: use after live https server setup
        // .secure(true)
        .same_site(SameSite::Lax)
        .max_age(Duration::days(7))
        .expires(OffsetDateTime::from_unix_timestamp(expires_at.and_utc().timestamp()).unwrap());

    let res = LoginResponse { access_token, token_type: "Bearer".to_string() };

    Ok((jar.add(cookie), Json(res)))
}

#[derive(Serialize, Deserialize, utoipa::ToSchema)]
pub struct UserMeStats {
    results_count: i64,
    last_result: Option<Results>,
    average_wpm: f64,
    average_cpm: f64,
    average_mistakes: f64,
}

#[utoipa::path(
    get,
    path = "/api/v1/user/me/stats",
    responses(
        (status = 200, description = "Success", body = UserMeStats),
        (status = 401, description = "Unauthorized"),
    )
)]
pub async fn me_stats(claims: Claims, state: State<AppState>) -> MyResult<Json<UserMeStats>> {
    let mut conn = state.db().await?;

    let maybe_user = User::get_user(&mut conn, claims.sub).await?;
    let Some(user) = maybe_user else { return Err(MyError::InternalError) };

    let results_count = Results::get_results_count_by_user_id(&mut conn, user.id).await?;
    let last_result = Results::get_last_result_by_user_id(&mut conn, user.id).await?;

    let (average_wpm, average_cpm, average_mistakes) =
        Results::get_average_wpm_cpm_mistakes_in_dictionary_by_user_id(
            &mut conn,
            state.config.default_dictionary_id,
            user.id,
        )
        .await?
        .unwrap_or((0.0, 0.0, 0.0));

    let res = UserMeStats {
        results_count,
        last_result: last_result.map(|r| r.0),
        average_wpm,
        average_cpm,
        average_mistakes,
    };

    Ok(Json(res))
}

#[derive(Serialize, Deserialize, utoipa::ToSchema)]
pub struct UserStats {
    results_count: i64,
    last_result: Option<Results>,
    average_wpm: f64,
    average_cpm: f64,
    average_mistakes: f64,
}

// NOTE: this route should have other flow than /user/me/stats, it's okay to be copypasted currently.
#[utoipa::path(
    get,
    path = "/api/v1/user/{username}/stats",
    responses(
        (status = 200, description = "Success", body = UserStats),
        (status = 401, description = "Unauthorized"),
    )
)]
pub async fn user_stats(
    _: Claims,
    Path(username): Path<String>,
    state: State<AppState>,
) -> MyResult<Json<UserStats>> {
    let mut conn = state.db().await?;

    let maybe_user = User::get_user_by_username(&mut conn, &username).await?;
    let Some(user) = maybe_user else { return Err(MyError::NotFound) };

    let results_count = Results::get_results_count_by_user_id(&mut conn, user.id).await?;
    let last_result = Results::get_last_result_by_user_id(&mut conn, user.id).await?;
    let (average_wpm, average_cpm, average_mistakes) =
        Results::get_average_wpm_cpm_mistakes_in_dictionary_by_user_id(
            &mut conn,
            state.config.default_dictionary_id,
            user.id,
        )
        .await?
        .unwrap_or((0.0, 0.0, 0.0));

    let res = UserStats {
        results_count,
        last_result: last_result.map(|r| r.0),
        average_wpm,
        average_cpm,
        average_mistakes,
    };

    Ok(Json(res))
}

#[derive(Serialize, Deserialize, utoipa::ToSchema)]
pub struct UserProfileResponse {
    username: String,
    created_at: NaiveDateTime,
    role: UserRoles,
}

#[utoipa::path(
    get,
    path = "/api/v1/user/{username}/profile",
    responses(
        (status = 200, description = "Success", body = UserProfileResponse),
        (status = 401, description = "Unauthorized"),
    )
)]
pub async fn user_profile(
    _: Claims,
    Path(username): Path<String>,
    state: State<AppState>,
) -> MyResult<Json<UserProfileResponse>> {
    let mut conn = state.db().await?;

    let maybe_user = User::get_user_by_username(&mut conn, &username).await?;
    let Some(user) = maybe_user else { return Err(MyError::NotFound) };

    let res = UserProfileResponse {
        username: user.username,
        created_at: user.created_at,
        role: user.role,
    };

    Ok(Json(res))
}

#[derive(Deserialize, utoipa::ToSchema)]
pub struct PatchUser {
    role: UserRoles,
}

#[utoipa::path(
    patch,
    path = "/api/v1/user/{username}",
    request_body = PatchUser,
    responses(
        (status = 200, description = "Success", body = UserProfileResponse),
        (status = 401, description = "Unauthorized"),
    )
)]
pub async fn patch_user(
    _: Claims,
    Path(username): Path<String>,
    state: State<AppState>,
    Json(input): Json<PatchUser>,
) -> MyResult<Json<UserProfileResponse>> {
    let mut conn = state.db().await?;

    let maybe_user = User::get_user_by_username(&mut conn, &username).await?;
    let Some(mut user) = maybe_user else { return Err(MyError::NotFound) };

    user.role = input.role;
    let user = user.update_user(&mut conn).await?;

    let res = UserProfileResponse {
        username: user.username,
        created_at: user.created_at,
        role: user.role,
    };

    Ok(Json(res))
}
