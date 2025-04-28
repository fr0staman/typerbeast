import { useState, useEffect, useCallback } from "react";
import { WEBSOCKET_API_URL } from "@/app/store/config";

type WsMessage =
  | { type: "Start"; text: string; start_after?: number }
  | { type: "Keystroke"; key: string; timestamp: number }
  | { type: "Update"; progress: number; mistakes: number; speed_wpm: number }
  | {
      type: "Finished";
      total_time_ms: number;
      mistakes: number;
      accuracy: number;
      speed_wpm: number;
    }
  | { type: "Error"; message: string };

export const useWebSocketGame = (text_id: string) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [textToType, setTextToType] = useState("");
  const [progress, setProgress] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [finished, setFinished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState<number | null>(null);

  const startCountdown = useCallback((ms: number) => {
    const seconds = Math.floor(ms / 1000);
    setCountdown(seconds);

    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev === null) return null;
        if (prev <= 1) {
          clearInterval(interval);
          setCountdown(null);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => {
    if (!text_id) return;
    const url = `${WEBSOCKET_API_URL}/ws/${text_id}`;
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
            if (message.start_after) {
              startCountdown(message.start_after);
            }
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
          case "Error":
            alert("Error: " + message.message);
            break;
        }
      } catch (error) {
        console.error("[WebSocket] Failed to parse message", error);
      }
    };

    setSocket(ws);

    return () => {
      ws.close();
    };
  }, [text_id, startCountdown]);

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
    sendKeystroke,
  };
};
