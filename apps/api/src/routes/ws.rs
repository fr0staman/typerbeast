use axum::{
    extract::{
        Path, State,
        connect_info::ConnectInfo,
        ws::{Message, WebSocket, WebSocketUpgrade},
    },
    response::IntoResponse,
};
use axum_extra::{TypedHeader, headers};
use futures::StreamExt;
use serde::{Deserialize, Serialize};
use std::net::SocketAddr;
use uuid::Uuid;

use crate::app::error::MyError;
use crate::app::state::AppState;
use crate::{app::auth::Claims, db::models::text::Text};

#[derive(Serialize, Deserialize, Debug)]
#[serde(tag = "type")]
enum WsMessage {
    Start { text: String, start_after: Option<u64> },
    Keystroke { key: String, timestamp: u64 },
    Update { progress: f32, mistakes: u32, speed_wpm: f32 },
    Finished { total_time_ms: u64, mistakes: u32, accuracy: f32, speed_wpm: f32 },
    Error { message: String },
}

#[utoipa::path(
    get,
    path = "/api/v1/ws/{text_id}",
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
    Path(text_id): Path<Uuid>,
) -> impl IntoResponse {
    let user_agent = user_agent.as_ref().map(|ua| ua.as_str()).unwrap_or("Unknown agent");

    log::debug!("`{user_agent}` at {addr} connected.");
    let mut conn = state.db().await?;
    let Some(text) = Text::get_text_by_id(&mut conn, text_id).await? else {
        return Err(MyError::NotFound);
    };
    drop(conn);
    Ok(ws.on_upgrade(move |socket| handle_socket(claims, socket, addr, state, text)))
}

async fn handle_socket(
    _: Claims,
    mut socket: WebSocket,
    _: SocketAddr,
    _: State<AppState>,
    text: Text,
) {
    let text_to_type = text.content;
    // In future this delay should be changed by room settings.
    let start_delay_ms = 3000;

    // Send "start" message
    let start_msg =
        WsMessage::Start { text: text_to_type.to_string(), start_after: Some(start_delay_ms) };
    if send_json(&mut socket, &start_msg).await.is_err() {
        return;
    }

    log::debug!("Sent start, waiting {} ms...", start_delay_ms);

    tokio::time::sleep(std::time::Duration::from_millis(start_delay_ms)).await;

    // Game state
    let mut typed_text = String::new();
    let start_time = tokio::time::Instant::now();
    let mut mistakes = 0;
    let mut last_is_mistake = false;

    // Read messages from client
    while let Some(Ok(msg)) = socket.next().await {
        let Message::Text(text) = msg else {
            continue;
        };
        match serde_json::from_str::<WsMessage>(&text) {
            Ok(WsMessage::Keystroke { key, timestamp }) => {
                log::debug!("Received key '{}' at {}", key, timestamp);

                // Compare key with expected character
                let expected_char = text_to_type.chars().nth(typed_text.chars().count());

                if let Some(expected) = expected_char {
                    if key == expected.to_string() {
                        typed_text.push_str(&key);
                        last_is_mistake = false;
                    } else {
                        log::debug!("Mistake: expected '{}' but got '{}'", &expected, &key);
                        if !last_is_mistake {
                            last_is_mistake = true;
                            mistakes += 1;
                        }
                    }
                } else {
                    // extra key presses after end
                    if !last_is_mistake {
                        last_is_mistake = true;
                        mistakes += 1;
                    }
                }

                let typed_count = typed_text.chars().count() as u32;
                let expected_count = text_to_type.chars().count() as u32;
                // Send Update message
                let progress = (typed_count as f32 / expected_count as f32) * 100.0;

                let elapsed_secs = start_time.elapsed().as_secs_f32();
                let words_typed = typed_text.split_whitespace().count() as f32;
                let speed_wpm =
                    if elapsed_secs > 0.0 { (words_typed / elapsed_secs) * 60.0 } else { 0.0 };

                let update_msg =
                    WsMessage::Update { progress: progress.min(100.0), mistakes, speed_wpm };
                if send_json(&mut socket, &update_msg).await.is_err() {
                    break;
                }

                // Finish!
                if typed_text == text_to_type {
                    let total_time_ms = start_time.elapsed().as_millis() as u64;
                    let multiplier = typed_count.saturating_sub(mistakes) as f32;

                    let accuracy = 100.0 * multiplier / (typed_count as f32);

                    let finished_msg = WsMessage::Finished {
                        total_time_ms,
                        mistakes,
                        accuracy: accuracy.max(0.0),
                        speed_wpm,
                    };
                    let _ = send_json(&mut socket, &finished_msg).await;
                    log::debug!("User finished typing!");
                    break;
                }
            },
            Ok(other) => {
                log::debug!("Unexpected message: {:?}", other);
                let message = WsMessage::Error { message: "Unexpected message type".to_string() };
                let _ = send_json(&mut socket, &message).await;
            },
            Err(err) => {
                log::debug!("Error parsing message: {:?}", err);
                let message = WsMessage::Error { message: "Invalid JSON format".to_string() };
                let _ = send_json(&mut socket, &message).await;
            },
        }
    }

    log::debug!("Closed.");
}

async fn send_json(socket: &mut WebSocket, message: &WsMessage) -> Result<(), axum::Error> {
    let text = serde_json::to_string(message).unwrap();
    socket.send(Message::Text(text.into())).await
}
