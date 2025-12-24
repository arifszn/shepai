export interface LogEvent {
  timestamp: string;
  source: "file" | "docker";
  stream: "stdout" | "stderr" | "";
  message: string;
}

export interface WebSocketMessage {
  type: "snapshot" | "event";
  events?: LogEvent[];
  event?: LogEvent;
}

