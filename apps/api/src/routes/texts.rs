use axum::{Json, extract::State};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::{
    AppState,
    app::{auth::Claims, error::MyError, types::MyResult},
    db::models::{dictionary::Dictionary, text::Text},
};

#[derive(Serialize, utoipa::ToSchema)]
pub struct GetTextsResponse {
    list: Vec<Text>,
}

#[utoipa::path(
    get,
    path = "/api/v1/texts",
    responses(
        (status = 200, description = "Success", body = GetTextsResponse),
        (status = 401, description = "Unauthorized"),
    )
)]
pub async fn get_texts(_: Claims, state: State<AppState>) -> MyResult<Json<GetTextsResponse>> {
    let mut conn = state.db().await?;
    let texts = Text::get_texts(&mut conn).await?;

    let res = GetTextsResponse { list: texts };

    Ok(Json(res))
}

#[derive(Deserialize, utoipa::ToSchema)]
pub struct AddTextRequest {
    dictionary_id: Uuid,
    title: String,
    content: String,
}

#[utoipa::path(
    post,
    path = "/api/v1/texts",
    request_body = AddTextRequest,
    responses(
        (status = 200, description = "Success", body = Text),
        (status = 401, description = "Unauthorized"),
    )
)]
pub async fn insert_text(
    claims: Claims,
    state: State<AppState>,
    Json(input): Json<AddTextRequest>,
) -> MyResult<Json<Text>> {
    let mut conn = state.db().await?;
    let created_at = chrono::Utc::now().naive_utc();

    let dictionary = Dictionary::get_dictionary_by_id(&mut conn, input.dictionary_id)
        .await?
        .ok_or(MyError::NotFound)?;

    if dictionary.user_id != claims.sub {
        return Err(MyError::Unauthorized);
    }

    let new_text = Text {
        id: Uuid::new_v4(),
        dictionary_id: input.dictionary_id,
        title: input.title.clone(),
        content: input.content.clone(),
        created_at,
    };

    let text = new_text.insert_text(&mut conn).await?;

    Ok(Json(text))
}
