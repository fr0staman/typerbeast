import { useState, useEffect, useCallback } from "react";
import { WEBSOCKET_API_URL } from "@/app/store/config";
import { useRoomStart } from "./useRoomStart";

// It's a mess. I know. For prototyping.
// After some time I'll clean it up.
// Currently, I need to do this ASAP.

type WsMessage =
  | { type: "Start"; text: string; start_time: string }
  | { type: "Keystroke"; key: string; timestamp: number }
  | { type: "Update"; progress: number; mistakes: number; speed_wpm: number }
  | {
      type: "Finished";
      total_time_ms: number;
      mistakes: number;
      accuracy: number;
      speed_wpm: number;
    }
  | { type: "UserLeft"; user_id: string }
  | { type: "UserFinished"; user_id: string }
  | { type: "Error"; message: string }
  | { type: "RoomUpdate"; users: PlayerStats[] };

enum PlayerStatus {
  // eslint-disable-next-line no-unused-vars
  Idle,
  // eslint-disable-next-line no-unused-vars
  Started,
  // eslint-disable-next-line no-unused-vars
  Dropped,
  // eslint-disable-next-line no-unused-vars
  Finished,
  // eslint-disable-next-line no-unused-vars
  Spectator,
}

type PlayerStats = {
  username: string;
  mistakes: number;
  progress: number;
  status: PlayerStatus;
};

export const useWebSocketGame = (room_id: string) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [textToType, setTextToType] = useState("");
  const [progress, setProgress] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [finished, setFinished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [players, setPlayers] = useState<PlayerStats[]>([]);

  const { mutateAsync: makeForceStart } = useRoomStart();

  const startCountdown = useCallback(() => {
    if (!startTime) return;
    const interval = setInterval(() => {
      const now = new Date();
      const diffMs = startTime.getTime() - now.getTime();
      const secondsLeft = Math.max(Math.ceil(diffMs / 1000), 0);

      setCountdown(secondsLeft);

      if (secondsLeft <= 0) {
        clearInterval(interval);
        setCountdown(null);
        return null;
      }
    }, 100);
  }, [startTime]);

  useEffect(() => {
    if (!room_id) return;
    const url = `${WEBSOCKET_API_URL}/ws/room/${room_id}`;
    const ws = new WebSocket(url);

    ws.onopen = () => console.log("[WebSocket] Connected");
    ws.onerror = err => console.error("[WebSocket] Error", err);
    ws.onclose = () => console.log("[WebSocket] Disconnected");

    ws.onmessage = event => {
      try {
        const message: WsMessage = JSON.parse(event.data);
        console.log("[WebSocket] Received:", message);

        switch (message.type) {
          case "Start":
            setTextToType(message.text);
            setLoading(false);
            setStartTime(new Date(message.start_time));
            break;
          case "Update":
            setProgress(message.progress);
            setMistakes(message.mistakes);
            setSpeed(message.speed_wpm);
            break;
          case "Finished":
            setFinished(true);
            ws.close();
            break;
          case "RoomUpdate":
            setPlayers(message.users);
            break;
          case "Error":
            alert("Error: " + message.message);
            break;
          default:
            console.error("New event! Please, update");
        }
      } catch (error) {
        console.error("[WebSocket] Failed to parse message", error);
      }
    };

    setSocket(ws);

    return () => {
      ws.close();
    };
  }, [room_id]);

  useEffect(() => {
    if (!startTime) return;

    startCountdown();
  }, [startTime, startCountdown]);

  const sendKeystroke = useCallback(
    (key: string) => {
      if (socket) {
        const message: WsMessage = {
          type: "Keystroke",
          key,
          timestamp: Date.now(),
        };
        socket.send(JSON.stringify(message));
      }
    },
    [socket],
  );

  return {
    socket,
    textToType,
    progress,
    mistakes,
    speed,
    finished,
    loading,
    countdown,
    players,
    startTime,
    makeForceStart,
    sendKeystroke,
  };
};
