use axum::{
    extract::{
        Path, State,
        connect_info::ConnectInfo,
        ws::{Message, WebSocket, WebSocketUpgrade},
    },
    response::IntoResponse,
};
use axum_extra::{TypedHeader, headers};
use futures::{SinkExt, StreamExt};
use std::net::SocketAddr;
use tokio::sync::mpsc;
use uuid::Uuid;

use crate::app::auth::Claims;
use crate::app::state::AppState;
use crate::app::{error::MyError, room::WsMessage};

#[utoipa::path(
    get,
    path = "/api/v1/ws/room/{room_id}",
    responses(
        (status = 101, description = "WebSocket protocol switched"),
        (status = 401, description = "Unauthorized"),
    )
)]
pub async fn ws_handler(
    claims: Claims,
    ws: WebSocketUpgrade,
    user_agent: Option<TypedHeader<headers::UserAgent>>,
    ConnectInfo(addr): ConnectInfo<SocketAddr>,
    state: State<AppState>,
    Path(room_id): Path<Uuid>,
) -> impl IntoResponse {
    let user_agent = user_agent.as_ref().map(|ua| ua.as_str()).unwrap_or("Unknown agent");

    if state.rooms_manager.rooms.read().await.get(&room_id).is_none() {
        return Err(MyError::NotFound);
    };

    log::debug!("`{user_agent}` at {addr} try to connect.");

    Ok(ws.on_upgrade(move |ws| handle_socket(claims, ws, addr, state, room_id)))
}

async fn handle_socket(
    claims: Claims,
    ws: WebSocket,
    _: SocketAddr,
    state: State<AppState>,
    room_id: Uuid,
) {
    let (tx, mut rx) = mpsc::unbounded_channel();

    let _ = state.rooms_manager.join_room(room_id, claims.sub, tx).await;

    let (mut ws_sender, mut ws_receiver) = ws.split();

    let send_task = tokio::spawn(async move {
        while let Some(msg) = rx.recv().await {
            if ws_sender.send(msg).await.is_err() {
                log::error!("Failed to send message to client");
                break;
            }
        }
    });

    // Wait to start!
    state.rooms_manager.wait_to_start_typing_session(room_id).await;
    // Wait to start!

    let recv_task = tokio::spawn(async move {
        while let Some(Ok(msg)) = ws_receiver.next().await {
            if let Message::Text(text) = msg {
                match serde_json::from_str::<WsMessage>(&text) {
                    Ok(msg) => state.rooms_manager.handle_message(room_id, claims.sub, msg).await,
                    Err(e) => state.rooms_manager.handle_error(room_id, claims.sub, e).await,
                }
            } else if let Message::Close(_) = msg {
                state.rooms_manager.leave_room(room_id, claims.sub).await;
            }
        }
    });

    tokio::select! {
        _ = send_task => {},
        _ = recv_task => {}
    }

    log::debug!("Closed.");
}
