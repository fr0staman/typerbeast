use std::error::Error;

use axum::{
    Json,
    http::StatusCode,
    response::{IntoResponse, Response},
};
use diesel_async::pooled_connection::deadpool;
use serde_json::json;
use thiserror::Error;

#[derive(Debug, Error)]
pub enum MyError {
    // Auth
    #[error("{0}")]
    Auth(#[from] AuthError),

    #[error("Unauthorized access")]
    Unauthorized,

    // Validation
    #[error("Validation error: {0}")]
    Validation(String),

    // Database
    #[error("Database error")]
    DatabaseError(#[from] diesel::result::Error),

    #[error("Pool error")]
    PoolError(#[from] deadpool::PoolError),

    // Password hashing
    //#[error("Password hashing failed")]
    //PasswordHashingFailed(#[from] argon2::password_hash::Error),

    // Token
    #[error("JWT decoding failed")]
    JwtDecodeError(#[from] jsonwebtoken::errors::Error),

    // Internal
    #[error("Internal server error")]
    InternalError,
}

impl MyError {
    fn get_status_code(&self) -> StatusCode {
        match *self {
            MyError::Auth(AuthError::WrongCredentials) => StatusCode::UNAUTHORIZED,
            MyError::Auth(AuthError::InvalidToken) => StatusCode::UNAUTHORIZED,
            MyError::Unauthorized => StatusCode::UNAUTHORIZED,

            MyError::Auth(AuthError::TokenCreation) => StatusCode::INTERNAL_SERVER_ERROR,
            MyError::PoolError(_) => StatusCode::INTERNAL_SERVER_ERROR,
            MyError::InternalError => StatusCode::INTERNAL_SERVER_ERROR,
            MyError::JwtDecodeError(_) => StatusCode::INTERNAL_SERVER_ERROR,
            MyError::DatabaseError(_) => StatusCode::INTERNAL_SERVER_ERROR,
            MyError::Validation(_) => StatusCode::INTERNAL_SERVER_ERROR,
        }
    }
}

impl IntoResponse for MyError {
    fn into_response(self) -> Response {
        let status_code = self.get_status_code();
        let message = self.to_string();
        // TODO: add cause showable in env debug mode
        let cause = self.source().map_or("Unknown".to_string(), |e| e.to_string());

        let body = Json(json!({ "debug": cause, "error": message }));

        (status_code, body).into_response()
    }
}

#[derive(thiserror::Error, Debug)]
#[error("...")]
pub enum AuthError {
    #[error("Wrong authentication credentials")]
    WrongCredentials,
    #[error("Failed to create authentication token")]
    TokenCreation,
    #[error("Invalid authentication credentials")]
    InvalidToken,
}
