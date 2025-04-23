use axum::{Json, extract::State};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::{
    AppState,
    app::{auth::Claims, error::MyError, types::MyResult},
    db::models::{dictionary::Dictionary, text::Text},
};

#[derive(Serialize)]
pub struct GetTextsResponse {
    list: Vec<Text>,
}

pub async fn get_texts(_: Claims, state: State<AppState>) -> MyResult<Json<GetTextsResponse>> {
    let mut conn = state.db().await?;
    let texts = Text::get_texts(&mut conn).await?;

    let res = GetTextsResponse { list: texts };

    Ok(Json(res))
}

#[derive(Deserialize)]
pub struct AddTextRequest {
    dictionary_id: Uuid,
    title: String,
    content: String,
}

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
