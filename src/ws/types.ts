import { wsClient } from "./ws_client";

export enum messageEvent {
  restore = 'restoreSession',
  prompt = 'prompt',
  promptAnswer = 'promptAnswer',
  tech = 'technical',
}

export enum techEvents {
  erase = 'eraseSession',
  regenerate = 'regenerate',
  goOn = 'goOn',
}

export enum streamEvents {
  stream = 'text_stream',
  end = 'stream_end'
}

export interface IMessage {
  event: messageEvent;
  payload: ISession | string;
  type?: streamEvents | techEvents
}

export interface ILogMessage {
  sender: 'Assistant' | 'Human',
  message: string;
}

export interface ISession {
  userId: string,
  sessionLog: ILogMessage[],
}
