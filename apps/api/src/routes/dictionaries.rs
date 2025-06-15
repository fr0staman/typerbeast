use axum::{
    Json,
    extract::{Path, State},
};
use chrono::NaiveDateTime;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::{
    AppState,
    app::{auth::Claims, error::MyError, types::MyResult},
    db::{
        custom_types::UserRoles,
        models::{dictionary::Dictionary, text::Text},
    },
};

#[derive(Serialize, utoipa::ToSchema)]
struct UserInfo {
    username: String,
    created_at: NaiveDateTime,
    role: UserRoles,
}
#[derive(Serialize, utoipa::ToSchema)]
struct DictionaryInfo {
    id: Uuid,
    name: String,
    user: UserInfo,
    created_at: NaiveDateTime,
    text_count: i64,
}
#[derive(Serialize, utoipa::ToSchema)]
pub struct GetDictionariesResponse {
    list: Vec<DictionaryInfo>,
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
    let text_counts = Dictionary::get_dictionary_text_count(&mut conn).await?;

    let info = dictionaries
        .into_iter()
        .enumerate()
        .map(|(i, (dict, user))| DictionaryInfo {
            id: dict.id,
            name: dict.name,
            user: UserInfo {
                username: user.username,
                role: user.role,
                created_at: user.created_at,
            },
            created_at: dict.created_at,
            text_count: text_counts.get(i).map_or(0, |v| v.1),
        })
        .collect();

    let res = GetDictionariesResponse { list: info };

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
    dictionary: Dictionary,
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

    let res = GetTextsInDictionaryResponse { dictionary, list: texts };

    Ok(Json(res))
}
