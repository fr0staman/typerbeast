use std::{collections::HashMap, sync::Arc};

use axum::extract::ws::Message;
use chrono::{DateTime, Duration, Utc};
use serde::{Deserialize, Serialize};
use tokio::sync::{RwLock, mpsc::UnboundedSender, watch};
use uuid::Uuid;

use super::{error::MyError, types::MyResult};

#[derive(Serialize, Deserialize, Debug)]
#[serde(tag = "type")]
pub enum WsMessage {
    Start { text: String, start_time: DateTime<Utc> },
    Keystroke { key: String, timestamp: u64 },
    Update { progress: f32, mistakes: u32, speed_wpm: f32 },
    Finished { total_time_ms: u64, mistakes: u32, accuracy: f32, speed_wpm: f32 },
    UserLeft { user_id: Uuid },
    UserFinished { user_id: Uuid },
    Error { message: String },
}

#[derive(Debug, Clone, Serialize, utoipa::ToSchema)]
pub struct RoomStats {
    pub room_id: Uuid,
    pub players: usize,
    pub started: bool,
}

#[derive(Debug, Clone, Serialize, utoipa::ToSchema)]
pub struct Room {
    pub id: Uuid,
    pub text_to_type: String,
    pub players: HashMap<Uuid, Player>,
    pub started: bool,
    pub start_time: DateTime<Utc>,
    #[serde(skip)]
    pub start_notifier: watch::Sender<bool>,
}

#[derive(Clone, Serialize, Debug, utoipa::ToSchema)]
pub struct Player {
    pub id: Uuid,
    #[serde(skip_deserializing, skip_serializing)]
    pub sender: UnboundedSender<Message>, // axum::extract::ws::WebSocketSender,
    pub typed_text: String,
    pub mistakes: u32,
    pub last_is_mistake: bool,
    pub finished: bool,
}

#[derive(Clone)]
pub struct RoomsManager {
    pub rooms: Arc<RwLock<HashMap<Uuid, Arc<RwLock<Room>>>>>,
}

impl RoomsManager {
    pub fn new() -> Self {
        Self { rooms: Arc::new(RwLock::new(HashMap::new())) }
    }

    pub async fn create_room(&self, text: String) -> Uuid {
        let (start_notifier, _) = watch::channel(false);
        let id = Uuid::new_v4();

        let room = Room {
            id,
            text_to_type: text,
            players: HashMap::new(),
            started: false,
            start_time: chrono::Utc::now(),
            start_notifier,
        };
        self.rooms.write().await.insert(id, Arc::new(RwLock::new(room)));
        id
    }

    pub async fn get_stats(&self) -> Vec<RoomStats> {
        let rooms = self.rooms.read().await;

        let mut list = vec![];
        for i in rooms.values() {
            let room = i.read().await;
            let stats =
                RoomStats { room_id: room.id, players: room.players.len(), started: room.started };

            list.push(stats);
        }

        list
    }

    pub async fn join_room(
        &self,
        room_id: Uuid,
        player_id: Uuid,
        sender: UnboundedSender<Message>,
    ) -> MyResult<()> {
        let rooms = self.rooms.read().await;
        let room = rooms.get(&room_id).ok_or(MyError::InternalError)?;
        log::debug!("Joining room {}", room_id);
        let mut room = room.write().await;
        room.players.insert(
            player_id,
            Player {
                id: player_id,
                sender,
                finished: false,
                typed_text: String::new(),
                mistakes: 0,
                last_is_mistake: false,
            },
        );
        log::debug!("Inserted to room {}", room_id);

        Ok(())
    }

    pub async fn leave_room(&self, room_id: Uuid, player_id: Uuid) {
        let mut to_delete = false;
        if let Some(room) = self.rooms.read().await.get(&room_id) {
            let mut room = room.write().await;
            room.players.remove(&player_id);

            if room.players.is_empty() {
                // Try to avoid long locks
                to_delete = true;
            }
            // Notify others
            let message = WsMessage::UserLeft { user_id: player_id };
            room.broadcast_message(&message).await;
        }

        if to_delete {
            self.rooms.write().await.remove(&room_id);
        }
    }

    pub async fn wait_to_start_typing_session(&self, room_id: Uuid) {
        let rooms = self.rooms.read().await;
        let Some(room) = rooms.get(&room_id) else {
            return;
        };

        let room = room.read().await;

        let mut start_receiver = room.start_notifier.subscribe();
        drop(room);
        drop(rooms);

        loop {
            if *start_receiver.borrow() {
                break;
            }

            if start_receiver.changed().await.is_err() {
                break;
            }
        }
    }

    pub async fn start_countdown(&self, room_id: Uuid) {
        let rooms = self.rooms.read().await;
        let room = rooms.get(&room_id).unwrap().read().await;
        let start_time = Utc::now() + Duration::seconds(10);
        let start_msg = WsMessage::Start { text: room.text_to_type.clone(), start_time };

        drop(room);
        let rooms = self.rooms.read().await;
        let mut room = rooms.get(&room_id).unwrap().write().await;
        room.start_time = start_time;

        log::debug!("before broadcast");
        room.broadcast_message(&start_msg).await;
        log::debug!("after broadcast");
        drop(room);

        // Wait until real start moment
        let now = Utc::now();
        let delay = (start_time - now).to_std().unwrap_or_default();
        tokio::time::sleep(delay).await;
        let mut room = rooms.get(&room_id).unwrap().write().await;

        room.started = true;
        let _ = room.start_notifier.send(true);
    }

    pub async fn handle_message(&self, room_id: Uuid, user_id: Uuid, msg: WsMessage) {
        match msg {
            WsMessage::Keystroke { key, timestamp } => {
                log::debug!("Received key '{}' at {}", key, timestamp);

                let mut rooms = self.rooms.write().await;
                let Some(room) = rooms.get_mut(&room_id) else {
                    log::debug!("room not exist, how?");
                    return;
                };

                let mut room = room.write().await;
                let start_time = room.start_time;
                let text_to_type = room.text_to_type.clone();
                let Some(p) = room.players.get_mut(&user_id) else {
                    log::debug!("player not exist, how?");
                    return;
                };

                // Compare key with expected character
                let expected_char = text_to_type.chars().nth(p.typed_text.chars().count());

                if let Some(expected) = expected_char {
                    if key == expected.to_string() {
                        p.typed_text.push_str(&key);
                        p.last_is_mistake = false;
                    } else {
                        log::debug!("Mistake: expected '{}' but got '{}'", &expected, &key);
                        if !p.last_is_mistake {
                            p.last_is_mistake = true;
                            p.mistakes += 1;
                        }
                    }
                } else {
                    // extra key presses after end
                    if !p.last_is_mistake {
                        p.last_is_mistake = true;
                        p.mistakes += 1;
                    }
                }

                let p = p.clone();
                // We don't need any writes - we can downgrade.
                let room = room.downgrade();
                let typed_count = p.typed_text.chars().count() as u32;
                let expected_count = text_to_type.chars().count() as u32;
                // Send Update message
                let progress = (typed_count as f32 / expected_count as f32) * 100.0;

                let now = chrono::Utc::now();
                let elapsed_secs = (now - start_time).num_seconds() as f32;
                let words_typed = p.typed_text.split_whitespace().count() as f32;
                let speed_wpm =
                    if elapsed_secs > 0.0 { (words_typed / elapsed_secs) * 60.0 } else { 0.0 };

                let update_msg = WsMessage::Update {
                    progress: progress.min(100.0),
                    mistakes: p.mistakes,
                    speed_wpm,
                };
                // TODO: check if success
                room.send_message_to_player(user_id, &update_msg).await;

                // Finish!
                if p.typed_text == text_to_type {
                    let now = chrono::Utc::now();
                    let total_time_ms = (now - start_time).num_milliseconds() as u64;
                    let multiplier = typed_count.saturating_sub(p.mistakes) as f32;

                    let accuracy = 100.0 * multiplier / (typed_count as f32);

                    let finished_msg = WsMessage::Finished {
                        total_time_ms,
                        mistakes: p.mistakes,
                        accuracy: accuracy.max(0.0),
                        speed_wpm,
                    };
                    let _ = room.send_message_to_player(user_id, &finished_msg).await;
                    log::debug!("User finished typing!");
                }
            },
            other => {
                log::debug!("Unexpected message: {:?}", other);
                let message = WsMessage::Error { message: "Unexpected message type".to_string() };
                let _ = self
                    .rooms
                    .read()
                    .await
                    .get(&room_id)
                    .unwrap()
                    .write()
                    .await
                    .send_message_to_player(user_id, &message)
                    .await;
            },
        }
    }

    pub async fn handle_error(&self, room_id: Uuid, user_id: Uuid, err: serde_json::Error) {
        log::debug!("Error parsing message: {:?}", err);
        let message = WsMessage::Error { message: "Invalid JSON format".to_string() };
        self.rooms
            .read()
            .await
            .get(&room_id)
            .unwrap()
            .write()
            .await
            .send_message_to_player(user_id, &message)
            .await;
    }
}

impl Room {
    pub async fn broadcast_message(&self, message: &WsMessage) {
        for player in self.players.values() {
            let text = serde_json::to_string(message).unwrap();
            log::debug!("Socket broadcast: {}", &text);
            let _ = player.sender.send(Message::Text(text.into()));
        }
    }

    pub async fn send_message_to_player(&self, player_id: Uuid, message: &WsMessage) {
        if let Some(player) = self.players.get(&player_id) {
            let text = serde_json::to_string(message).unwrap();
            let _ = player.sender.send(Message::Text(text.into()));
        }
    }
}
