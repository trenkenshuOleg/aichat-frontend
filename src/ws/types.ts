import { wsClient } from "./ws_client";

export enum wsEvent {
  restore = 'restoreSession',
  prompt = 'prompt',
  promptAnswer = 'promptAnswer',
  tech = 'technical',
}

export interface IMessage {
  event: wsEvent;
  payload: ISession | string;
  type?: 'text_stream' | 'stream_end'
}

export interface ISession {
  userId: string,
  sessionLog: string[],
}
