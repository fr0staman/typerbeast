use std::{collections::HashMap, sync::Arc};

use axum::extract::ws::Message;
use chrono::{DateTime, Duration, NaiveDateTime, Utc};
use serde::{Deserialize, Serialize};
use tokio::sync::{RwLock, mpsc::UnboundedSender, watch};
use uuid::Uuid;

use crate::{
    app::types::DbPool,
    db::{
        custom_types::{Leagues, UserRoles},
        models::{
            dictionary::Dictionary,
            result::{Keystroke, ResultStats, Results},
            room::Room as RoomModel,
            room_user::RoomUser,
            text::Text,
            user::User,
        },
    },
};

use super::{error::MyError, types::MyResult};

#[derive(Serialize, Deserialize, Debug)]
#[serde(tag = "type")]
pub enum WsMessage {
    Start { text: String, start_time: DateTime<Utc> },
    Keystroke { key: String, timestamp: u64 },
    Update { progress: f32, mistakes: i16, speed_wpm: f32 },
    Finished { total_time_ms: u64, mistakes: i16, accuracy: f32, speed_wpm: f32 },
    UserLeft { user_id: Uuid },
    UserFinished { user_id: Uuid },
    RoomUpdate { users: Vec<PlayerStats> },
    Error { message: String },
}

#[derive(Serialize, Deserialize, PartialEq, Clone, Debug, utoipa::ToSchema)]
pub enum PlayerStatus {
    Idle,
    Started,
    Dropped,
    Finished,
    Spectator,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct PlayerStats {
    pub username: String,
    pub mistakes: i16,
    pub progress: f32,
    pub status: PlayerStatus,
}

#[derive(Debug, Clone, Serialize, utoipa::ToSchema)]
pub struct RoomStats {
    pub room_id: Uuid,
    pub players: usize,
    pub started: bool,
    pub dictionary: Dictionary,
}

#[derive(Clone, Serialize)]
pub struct Room {
    pub id: Uuid,
    pub text: Text,
    pub dictionary: Dictionary,
    pub players: HashMap<Uuid, Player>,
    pub started: bool,
    pub start_time: DateTime<Utc>,
    #[serde(skip)]
    pub start_notifier: watch::Sender<bool>,
}

#[derive(Serialize, Deserialize, utoipa::ToSchema, Clone)]
pub struct UserInfo {
    username: String,
    created_at: NaiveDateTime,
    role: UserRoles,
}

#[derive(Clone, Serialize)]
pub struct Player {
    pub id: Uuid,
    pub user: UserInfo,
    pub room_user_id: Uuid,
    #[serde(skip_deserializing, skip_serializing)]
    pub sender: UnboundedSender<Message>, // axum::extract::ws::WebSocketSender,
    pub typed_text: String,
    pub mistakes: i16,
    pub last_is_mistake: bool,
    pub progress: f32,
    pub status: PlayerStatus,
    pub connected: bool,
    pub stats: ResultStats,
}

#[derive(Clone)]
pub struct RoomsManager {
    pub db: DbPool,
    pub rooms: Arc<RwLock<HashMap<Uuid, Arc<RwLock<Room>>>>>,
}

impl RoomsManager {
    pub fn new(db: DbPool) -> Self {
        Self { db, rooms: Arc::new(RwLock::new(HashMap::new())) }
    }

    pub async fn create_room(&self, text: Text, dictionary: Dictionary) -> Uuid {
        let (start_notifier, _) = watch::channel(false);
        let id = Uuid::new_v4();

        let room = Room {
            id,
            text,
            dictionary,
            players: HashMap::new(),
            started: false,
            start_time: chrono::Utc::now(),
            start_notifier,
        };

        let room_model = RoomModel {
            id,
            text_id: room.text.id,
            created_at: chrono::Utc::now().naive_utc(),
            // Update after some time
            started_at: chrono::Utc::now().naive_utc(),
            ended_at: chrono::Utc::now().naive_utc(),
        };

        let mut conn = self.db.get().await.unwrap();
        let _ = room_model.insert_room(&mut conn).await;

        let locked_room = Arc::new(RwLock::new(room));

        self.rooms.write().await.insert(id, locked_room);

        let rooms = self.rooms.clone();

        // Stats autoupdate task
        tokio::spawn(async move {
            loop {
                tokio::time::sleep(tokio::time::Duration::from_secs(3)).await;

                let Some(room) = rooms.read().await.get(&id).cloned() else {
                    log::debug!("Room {} destroyed, task also", id);
                    break;
                };

                let room = room.read().await;

                if !room.started {
                    continue;
                }

                let stats = room
                    .players
                    .values()
                    .map(|v| PlayerStats {
                        username: v.user.username.clone(),
                        mistakes: v.mistakes,
                        progress: v.progress,
                        status: v.status.clone(),
                    })
                    .collect();

                room.broadcast_message(WsMessage::RoomUpdate { users: stats }).await;
            }
        });

        id
    }

    pub async fn get_stats(&self) -> Vec<RoomStats> {
        let rooms = self.rooms.read().await;

        let mut list = vec![];
        for i in rooms.values() {
            let room = i.read().await;
            let stats = RoomStats {
                room_id: room.id,
                players: room.players.len(),
                started: room.started,
                dictionary: room.dictionary.clone(),
            };

            list.push(stats);
        }

        list
    }

    pub async fn join_room(
        &self,
        room_id: Uuid,
        user: User,
        sender: UnboundedSender<Message>,
    ) -> MyResult<()> {
        let Some(room) = self._get_room(room_id).await else {
            log::error!("Try to join room that doesn't exist");
            return Err(MyError::InternalError);
        };

        log::debug!("Joining room {}", room_id);

        let room_user_id = Uuid::new_v4();

        let live_player = Player {
            id: user.id,
            user: UserInfo {
                username: user.username,
                created_at: user.created_at,
                role: user.role,
            },
            room_user_id,
            sender,
            status: PlayerStatus::Idle,
            typed_text: String::new(),
            mistakes: 0,
            last_is_mistake: false,
            progress: 0.0,
            connected: true,
            stats: ResultStats { keystrokes: vec![] },
        };

        let player_model = RoomUser {
            id: room_user_id,
            room_id,
            user_id: live_player.id,
            joined_at: chrono::Utc::now().naive_utc(),
            left_at: chrono::Utc::now().naive_utc(),
            league: Leagues::Web,
        };

        let mut conn = self.db.get().await.unwrap();

        let _ = player_model.insert_room_user(&mut conn).await;
        let mut room = room.write().await;
        room.players.insert(live_player.id, live_player);

        let room = room.downgrade();
        let users = room
            .players
            .values()
            .map(|player| PlayerStats {
                username: player.user.username.clone(),
                mistakes: player.mistakes,
                progress: player.progress,
                status: player.status.clone(),
            })
            .collect();

        room.broadcast_message(WsMessage::RoomUpdate { users }).await;

        log::debug!("Inserted to room {}", room_id);

        Ok(())
    }

    pub async fn leave_room(&self, room_id: Uuid, player_id: Uuid) {
        let mut to_delete = false;

        let Some(room) = self._get_room(room_id).await else {
            log::error!("Room {} to leave room that doesn't exist", room_id);
            return;
        };

        {
            let mut room = room.write().await;
            let Some(player) = room.players.get_mut(&player_id) else {
                log::error!("Player {} not found in room {}", player_id, room_id);
                return;
            };

            player.connected = false;

            let room = room.downgrade();

            // Check if room is empty
            if room.players.iter().all(|(_, p)| !p.connected) {
                // Try to avoid long locks
                to_delete = true;
            }

            // Notify others
            let message = WsMessage::UserLeft { user_id: player_id };
            room.broadcast_message(message).await;
        }

        if to_delete {
            self.rooms.write().await.remove(&room_id);
        }
    }

    pub async fn wait_to_start_typing_session(&self, room_id: Uuid) {
        let Some(room) = self._get_room(room_id).await else {
            log::error!("Room {} not found", room_id);
            return;
        };

        let mut start_receiver = room.read().await.start_notifier.subscribe();

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
        let Some(room) = self._get_room(room_id).await else {
            log::error!("Room {} not found", room_id);
            return;
        };

        let mut room = room.write().await;
        let start_time = Utc::now() + Duration::seconds(10);
        let start_msg = WsMessage::Start { text: room.text.content.clone(), start_time };

        room.start_time = start_time;

        let room = room.downgrade();
        room.broadcast_message(start_msg).await;

        drop(room);

        // Wait until real start moment
        let now = Utc::now();
        let delay = (start_time - now).to_std().unwrap_or_default();
        tokio::time::sleep(delay).await;

        let mut conn = self.db.get().await.unwrap();

        let Ok(Some(mut room_model)) = RoomModel::get_room_by_id(&mut conn, room_id).await else {
            log::error!("Room not found after countdown");
            return;
        };

        room_model.started_at = chrono::Utc::now().naive_utc();
        let _ = room_model.modify_room(&mut conn).await;

        let Some(room) = self._get_room(room_id).await else {
            log::error!("Room {} not found", room_id);
            return;
        };

        let mut room = room.write().await;
        room.started = true;
        let room = room.downgrade();
        let _ = room.start_notifier.send(true);
    }

    pub async fn handle_message(&self, room_id: Uuid, user_id: Uuid, msg: WsMessage) {
        match msg {
            WsMessage::Keystroke { key, timestamp } => {
                log::debug!("Received key '{}' at {}", key, timestamp);

                let Some(room) = self._get_room(room_id).await else {
                    log::debug!("room not exist, how?");
                    return;
                };

                let mut room = room.write().await;
                let start_time = room.start_time;
                let text_to_type = room.text.content.clone();
                let Some(p) = room.players.get_mut(&user_id) else {
                    log::debug!("player not exist, how?");
                    return;
                };

                // Compare key with expected character
                {
                    let expected_char = text_to_type.chars().nth(p.typed_text.chars().count());

                    if let Some(expected) = expected_char {
                        if key == expected.to_string() {
                            p.typed_text.push_str(&key);
                            p.last_is_mistake = false;
                            p.stats.keystrokes.push(Keystroke {
                                key,
                                mistake: false,
                                expected: None,
                                timestamp: chrono::Utc::now().naive_utc(),
                            })
                        } else {
                            log::debug!("Mistake: expected '{}' but got '{}'", &expected, &key);
                            if !p.last_is_mistake {
                                p.last_is_mistake = true;
                                p.mistakes += 1;
                                p.stats.keystrokes.push(Keystroke {
                                    key,
                                    mistake: true,
                                    expected: Some(expected.to_string()),
                                    timestamp: chrono::Utc::now().naive_utc(),
                                });
                            } else if let Some(keystroke) = p.stats.keystrokes.last_mut() {
                                keystroke.key += &key
                            };
                        }
                    } else {
                        // extra key presses after end
                        if !p.last_is_mistake {
                            p.last_is_mistake = true;
                            p.mistakes += 1;
                            p.stats.keystrokes.push(Keystroke {
                                key,
                                mistake: true,
                                expected: None,
                                timestamp: chrono::Utc::now().naive_utc(),
                            });
                        }
                    }
                };

                let typed_count = p.typed_text.chars().count() as u32;
                let expected_count = text_to_type.chars().count() as u32;
                // Send Update message
                let progress = 100.0 / (expected_count as f32 / typed_count as f32);
                p.progress = progress;

                // TODO: make locks more non-blocking
                if p.typed_text == text_to_type {
                    p.status = PlayerStatus::Finished;
                }

                // We don't need any writes - we can downgrade.

                let p = p.clone();
                let room = room.downgrade().clone();

                let now = chrono::Utc::now();
                let elapsed_secs = (now - start_time).as_seconds_f32();
                let words_typed = p.typed_text.split_whitespace().count() as f32;
                let speed_wpm =
                    if elapsed_secs > 0.0 { (words_typed / elapsed_secs) * 60.0 } else { 0.0 };
                let speed_cpm = if elapsed_secs > 0.0 {
                    (typed_count as f32 / elapsed_secs) * 60.0
                } else {
                    0.0
                };

                let update_msg = WsMessage::Update { progress, mistakes: p.mistakes, speed_wpm };
                // TODO: check if success
                room.send_message_to_player(user_id, update_msg).await;

                // Finish!
                let is_finish = p.typed_text == text_to_type;
                if is_finish {
                    // TODO: make this function more... maintainable...
                    self._user_finished_typing(p, room, speed_cpm, speed_wpm, typed_count).await;
                }
            },
            other => {
                log::debug!("Unexpected message: {:?}", other);
                let message = WsMessage::Error { message: "Unexpected message type".to_string() };
                self._send_message_to_user_in_room(room_id, user_id, message).await;
            },
        }
    }

    pub async fn handle_error(&self, room_id: Uuid, user_id: Uuid, err: serde_json::Error) {
        log::debug!("Error parsing message: {:?}", err);
        let message = WsMessage::Error { message: "Invalid JSON format".to_string() };

        self._send_message_to_user_in_room(room_id, user_id, message).await;
    }

    pub async fn _send_message_to_user_in_room(
        &self,
        room_id: Uuid,
        user_id: Uuid,
        message: WsMessage,
    ) {
        let Some(room) = self._get_room(room_id).await else {
            log::error!("Try to send message to room that doesn't exist");
            return;
        };

        room.read().await.send_message_to_player(user_id, message).await;
    }

    pub async fn _user_finished_typing(
        &self,
        p: Player,
        room: Room,
        speed_cpm: f32,
        speed_wpm: f32,
        typed_count: u32,
    ) {
        let now = chrono::Utc::now();
        let total_time_ms = (now - room.start_time).num_milliseconds() as u64;
        let multiplier = typed_count.saturating_sub(p.mistakes as u32) as f32;

        let accuracy = 100.0 * multiplier / (typed_count as f32);

        let finished_msg = WsMessage::Finished {
            total_time_ms,
            mistakes: p.mistakes,
            accuracy: accuracy.max(0.0),
            speed_wpm,
        };
        let _ = room.send_message_to_player(p.id, finished_msg).await;

        let users = room
            .players
            .values()
            .map(|player| PlayerStats {
                username: player.user.username.clone(),
                mistakes: player.mistakes,
                status: player.status.clone(),
                progress: player.progress,
            })
            .collect();

        room.broadcast_message(WsMessage::RoomUpdate { users }).await;

        let result = Results {
            id: Uuid::new_v4(),
            room_user_id: p.room_user_id,
            start_time: room.start_time.naive_utc(),
            end_time: now.naive_utc(),
            mistakes: p.mistakes,
            wpm: speed_wpm,
            cpm: speed_cpm,
            stats: p.stats,
        };

        let mut conn = self.db.get().await.unwrap();

        let Ok(Some(mut room_user)) =
            RoomUser::get_room_user_by_id(&mut conn, p.room_user_id).await
        else {
            log::error!("Failed to get room user");
            return;
        };

        room_user.left_at = now.naive_utc();

        let _ = room_user.modify_room_user(&mut conn).await;

        let _ = result.insert_result(&mut conn).await;

        let should_close = room.players.iter().all(|(_, p)| p.status == PlayerStatus::Finished);
        let room_id = room.id;

        if should_close {
            self._close_room(room_id).await;
            log::debug!("Room finished!");
        } else {
            log::error!("Its not finished yet!");
        }
        log::debug!("User finished typing!");
    }

    pub async fn _close_room(&self, room_id: Uuid) {
        let ended_at = chrono::Utc::now().naive_utc();

        let Some(room) = self._get_room(room_id).await else {
            log::error!("Try to close room that doesn't exist");
            return;
        };

        let mut room = room.write().await;

        for (_, player) in room.players.iter_mut() {
            player.connected = false;
        }
        let room = room.downgrade();

        room.close_connections().await;
        drop(room);

        let mut conn = self.db.get().await.unwrap();
        let Ok(Some(mut room_model)) = RoomModel::get_room_by_id(&mut conn, room_id).await else {
            log::error!("Room not found after closing");
            return;
        };

        room_model.ended_at = ended_at;
        let _ = room_model.modify_room(&mut conn).await;
    }

    pub async fn _get_room(&self, room_id: Uuid) -> Option<Arc<RwLock<Room>>> {
        self.rooms.read().await.get(&room_id).cloned()
    }
}

impl Room {
    pub async fn broadcast_message(&self, message: WsMessage) {
        for player in self.players.values() {
            let text = serde_json::to_string(&message).unwrap();
            log::debug!("Socket broadcast: {}", &text);
            let _ = player.sender.send(Message::Text(text.into()));
        }
    }

    pub async fn send_message_to_player(&self, player_id: Uuid, message: WsMessage) {
        if let Some(player) = self.players.get(&player_id) {
            let text = serde_json::to_string(&message).unwrap();
            let _ = player.sender.send(Message::Text(text.into()));
        }
    }

    pub async fn close_connections(&self) {
        for player in self.players.values() {
            let _ = player.sender.send(Message::Close(None));
        }
    }
}
