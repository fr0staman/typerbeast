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

#[derive(Serialize, utoipa::ToSchema)]
pub struct GetDictionariesResponse {
    list: Vec<Dictionary>,
}

#[utoipa::path(
    get,
    path = "/api/v1/dictionaries",
    responses(
        (status = 200, description = "Success", body = GetDictionariesResponse),
        (status = 401, description = "Unauthorized"),
    )
)]
pub async fn get_dictionaries(
    _: Claims,
    state: State<AppState>,
) -> MyResult<Json<GetDictionariesResponse>> {
    let mut conn = state.db().await?;
    let dictionaries = Dictionary::get_dictionaries(&mut conn).await?;

    let res = GetDictionariesResponse { list: dictionaries };

    Ok(Json(res))
}

#[derive(Deserialize, utoipa::ToSchema)]
pub struct AddDictionaryRequest {
    name: String,
}

#[utoipa::path(
    post,
    path = "/api/v1/dictionaries",
    request_body = AddDictionaryRequest,
    responses(
        (status = 200, description = "Success", body = Dictionary),
        (status = 401, description = "Unauthorized"),
    )
)]
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

#[derive(Serialize, utoipa::ToSchema)]
pub struct GetTextsInDictionaryResponse {
    list: Vec<Text>,
}

#[utoipa::path(
    get,
    path = "/api/v1/dictionaries/{dict_id}/texts",
    responses(
        (status = 200, description = "Success", body = GetTextsInDictionaryResponse),
        (status = 401, description = "Unauthorized"),
    )
)]
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

#[derive(Serialize, utoipa::ToSchema)]
pub struct CreateRoomResponse {
    room_id: Uuid,
}

#[utoipa::path(
    post,
    path = "/api/v1/dictionaries/{dict_id}/create-random-room",
    responses(
        (status = 200, description = "Success", body = CreateRoomResponse),
        (status = 401, description = "Unauthorized"),
    )
)]
pub async fn create_room_with_dictionary(
    _: Claims,
    state: State<AppState>,
    Path(dict_id): Path<Uuid>,
) -> MyResult<Json<CreateRoomResponse>> {
    let mut conn = state.db().await?;
    let dictionary =
        Dictionary::get_dictionary_by_id(&mut conn, dict_id).await?.ok_or(MyError::NotFound)?;
    let text =
        dictionary.get_random_text_in_dictionary(&mut conn).await?.ok_or(MyError::NotFound)?;

    let room_id = state.rooms_manager.create_room(text).await;

    let res = CreateRoomResponse { room_id };

    Ok(Json(res))
}
