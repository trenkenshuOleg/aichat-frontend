import { wsClient } from "./ws_client";

export enum messageEvent {
  restore = 'restoreSession',
  prompt = 'prompt',
  promptAnswer = 'promptAnswer',
  tech = 'technical',
}

export interface IMessage {
  event: messageEvent;
  payload: ISession | string;
  type?: 'text_stream' | 'stream_end'
}

export interface ILogMessage {
  sender: 'Assistant' | 'Human',
  message: string;
}

export interface ISession {
  userId: string,
  sessionLog: ILogMessage[],
}
