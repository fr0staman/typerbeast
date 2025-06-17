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
        custom_types::{ReviewTextStatus, UserRoles},
        models::{dictionary::Dictionary, pending_text::PendingText, text::Text, user::User},
    },
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
        (status = 200, description = "Success", body = PendingText),
        (status = 401, description = "Unauthorized"),
    )
)]
pub async fn insert_text(
    claims: Claims,
    state: State<AppState>,
    Json(input): Json<AddTextRequest>,
) -> MyResult<Json<PendingText>> {
    let mut conn = state.db().await?;

    let _ = Dictionary::get_dictionary_by_id(&mut conn, input.dictionary_id)
        .await?
        .ok_or(MyError::NotFound)?;

    let user = User::get_user(&mut conn, claims.sub).await?.ok_or(MyError::Unauthorized)?;

    let created_at = chrono::Utc::now().naive_utc();

    let mut pending_text = PendingText {
        id: Uuid::new_v4(),
        author_id: user.id,
        dictionary_id: input.dictionary_id,
        title: input.title,
        content: input.content,
        created_at,
        reviewed_by: None,
        reviewed_at: None,
        status: ReviewTextStatus::Pending,
        reason: None,
    };

    // Auto approve for moderators and creators
    if user.role == UserRoles::Moderator || user.role == UserRoles::Creator {
        pending_text.status = ReviewTextStatus::Approved;
        pending_text.reviewed_by = Some(user.id);
        pending_text.reviewed_at = Some(created_at);

        let new_text = Text {
            id: pending_text.id,
            dictionary_id: pending_text.dictionary_id,
            title: pending_text.title.clone(),
            content: pending_text.content.clone(),
            created_at,
            author_id: pending_text.author_id,
        };

        new_text.insert_text(&mut conn).await?;
    }

    let pending_text = pending_text.add_pending_text(&mut conn).await?;

    Ok(Json(pending_text))
}

#[derive(Deserialize, utoipa::ToSchema)]
pub struct TextReviewBody {
    reason: Option<String>,
    status: ReviewTextStatus,
}

//#[derive(Serialize, utoipa::ToSchema)]
//pub struct TextReviewResponse {}

#[utoipa::path(
    post,
    path = "/api/v1/texts/{text_id}/review",
    request_body = TextReviewBody,
    responses(
        (status = 200, description = "Success", body = PendingText),
        (status = 401, description = "Unauthorized"),
    )
)]
pub async fn review_pending_text(
    claims: Claims,
    state: State<AppState>,
    Path(text_id): Path<Uuid>,
    Json(input): Json<TextReviewBody>,
) -> MyResult<Json<PendingText>> {
    let mut conn = state.db().await?;

    let Some(user) = User::get_user(&mut conn, claims.sub).await? else {
        return Err(MyError::Unauthorized);
    };

    if user.role != UserRoles::Creator && user.role != UserRoles::Moderator {
        return Err(MyError::Unauthorized);
    };

    let mut pending_text =
        PendingText::get_pending_text_by_id(&mut conn, text_id).await?.ok_or(MyError::NotFound)?;

    pending_text.reviewed_at = Some(chrono::Utc::now().naive_utc());
    pending_text.reviewed_by = Some(claims.sub);
    pending_text.status = input.status;

    if pending_text.status == ReviewTextStatus::Approved {
        let new_text = Text {
            id: pending_text.id,
            content: pending_text.content.clone(),
            title: pending_text.title.clone(),
            dictionary_id: pending_text.dictionary_id,
            created_at: pending_text.created_at,
            author_id: pending_text.author_id,
        };

        new_text.insert_text(&mut conn).await?;
    } else {
        // Text rejected by the reason or reason to review later
        pending_text.reason = input.reason;
    }

    let text = pending_text.modify_pending_text(&mut conn).await?;

    Ok(Json(text))
}

#[derive(Serialize, utoipa::ToSchema)]
pub struct UserInfo {
    username: String,
    created_at: NaiveDateTime,
    role: UserRoles,
}

#[derive(Serialize, utoipa::ToSchema)]
pub struct PendingTextInfo {
    pub id: Uuid,
    pub dictionary: Dictionary,
    pub author: UserInfo,
    pub title: String,
    pub content: String,
    pub created_at: NaiveDateTime,
    pub reviewed_by: Option<Uuid>,
    pub reviewed_at: Option<NaiveDateTime>,
    pub status: ReviewTextStatus,
    pub reason: Option<String>,
}
#[derive(Serialize, utoipa::ToSchema)]
pub struct GetPendingTextsResponse {
    list: Vec<PendingTextInfo>,
}

#[utoipa::path(
    get,
    path = "/api/v1/texts/pending",
    responses(
        (status = 200, description = "Success", body = GetPendingTextsResponse),
        (status = 401, description = "Unauthorized"),
    )
)]
pub async fn get_pending_texts(
    _: Claims,
    state: State<AppState>,
) -> MyResult<Json<GetPendingTextsResponse>> {
    let mut conn = state.db().await?;
    let texts = PendingText::get_pending_not_reviewed_texts(&mut conn).await?;

    let texts = texts
        .into_iter()
        .map(|(author, dictionary, pending_text)| PendingTextInfo {
            id: pending_text.id,
            dictionary,
            author: UserInfo {
                username: author.username,
                created_at: author.created_at,
                role: author.role,
            },
            title: pending_text.title,
            content: pending_text.content,
            created_at: pending_text.created_at,
            reviewed_by: pending_text.reviewed_by,
            reviewed_at: pending_text.reviewed_at,
            status: pending_text.status,
            reason: pending_text.reason,
        })
        .collect(); // TODO: Convert to texts.
    let res = GetPendingTextsResponse { list: texts };

    Ok(Json(res))
}
