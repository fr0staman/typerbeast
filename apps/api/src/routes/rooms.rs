use std::sync::Arc;

use axum::{
    Json,
    extract::{Path, State},
};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::{
    AppState,
    app::{auth::Claims, error::MyError, room::RoomStats, types::MyResult},
    db::models::text::Text,
};

#[derive(Serialize, utoipa::ToSchema)]
pub struct GetRoomsResponse {
    rooms: Vec<RoomStats>,
}

#[utoipa::path(
    get,
    path = "/api/v1/rooms",
    responses(
        (status = 200, description = "List of rooms", body=GetRoomsResponse)
    )
)]
pub async fn get_rooms(_: Claims, state: State<AppState>) -> MyResult<Json<GetRoomsResponse>> {
    let stats = state.rooms_manager.get_stats().await;

    let res = GetRoomsResponse { rooms: stats };
    Ok(Json(res))
}

#[derive(Serialize, utoipa::ToSchema)]
pub struct StartRoomResponse {
    message: String,
}

#[utoipa::path(
    post,
    path = "/api/v1/rooms/{room_id}/start",
    responses(
        (status = 200, description = "Countdown started", body = StartRoomResponse)
    )
)]
pub async fn start_room(
    _: Claims,
    Path(room_id): Path<Uuid>,
    State(state): State<AppState>,
) -> MyResult<Json<StartRoomResponse>> {
    let rooms = state.rooms_manager.rooms.read().await;
    let room = rooms.get(&room_id).cloned().ok_or(MyError::NotFound)?;

    if room.read().await.started {
        return Err(MyError::NotFound);
    }

    drop(rooms);
    drop(room);

    let state = Arc::new(state);
    tokio::spawn(async move {
        state.rooms_manager.start_countdown(room_id).await;
    });

    Ok(Json(StartRoomResponse { message: "Countdown started".to_string() }))
}

#[derive(Deserialize, Serialize, utoipa::ToSchema)]
pub struct CreateRoomRequest {
    text_id: Uuid,
}

#[derive(Serialize, utoipa::ToSchema)]
pub struct CreateRoomResponse {
    room_id: Uuid,
}

#[utoipa::path(
    post,
    request_body = CreateRoomRequest,
    path = "/api/v1/rooms",
    responses(
        (status = 200, description = "Room created", body = CreateRoomResponse)
    )
)]
pub async fn create_room(
    _: Claims,
    state: State<AppState>,
    Json(input): Json<CreateRoomRequest>,
) -> MyResult<Json<CreateRoomResponse>> {
    let mut conn = state.db().await?;
    let Some(text) = Text::get_text_by_id(&mut conn, input.text_id).await? else {
        return Err(MyError::NotFound);
    };

    let room_id = state.rooms_manager.create_room(text).await;

    let res = CreateRoomResponse { room_id };

    Ok(Json(res))
}
