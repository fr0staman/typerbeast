use axum::{
    Json,
    extract::{Path, State},
};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::{
    AppState,
    app::{auth::Claims, error::MyError, types::MyResult},
    db::models::{dictionary::Dictionary, text::Text},
};

#[derive(Serialize)]
pub struct GetDictionariesResponse {
    list: Vec<Dictionary>,
}

pub async fn get_dictionaries(
    _: Claims,
    state: State<AppState>,
) -> MyResult<Json<GetDictionariesResponse>> {
    let mut conn = state.db().await?;
    let dictionaries = Dictionary::get_dictionaries(&mut conn).await?;

    let res = GetDictionariesResponse { list: dictionaries };

    Ok(Json(res))
}

#[derive(Deserialize)]
pub struct AddDictionaryRequest {
    name: String,
}

pub async fn add_dictionary(
    claims: Claims,
    state: State<AppState>,
    Json(input): Json<AddDictionaryRequest>,
) -> MyResult<Json<Dictionary>> {
    let mut conn = state.db().await?;
    let created_at = chrono::Utc::now().naive_utc();

    let new_dictionary = Dictionary {
        id: Uuid::new_v4(),
        name: input.name.clone(),
        user_id: claims.sub,
        created_at,
    };

    let dictionary = new_dictionary.insert_dictionary(&mut conn).await?;

    Ok(Json(dictionary))
}

#[derive(Serialize)]
pub struct GetTextsInDictionaryResponse {
    list: Vec<Text>,
}

pub async fn get_texts_in_dictionary(
    _: Claims,
    state: State<AppState>,
    Path(dict_id): Path<Uuid>,
) -> MyResult<Json<GetTextsInDictionaryResponse>> {
    let mut conn = state.db().await?;
    let dictionary =
        Dictionary::get_dictionary_by_id(&mut conn, dict_id).await?.ok_or(MyError::NotFound)?;
    let texts = dictionary.get_texts_in_dictionary(&mut conn).await?;

    let res = GetTextsInDictionaryResponse { list: texts };
    Ok(Json(res))
}
