export enum wsEvent {
  restore = 'restoreSession',
  prompt = 'prompt',
  tech = 'technical',
}

export interface IMessage {
  event: wsEvent;
  payload: ISession | string;
}

export interface ISession {
  userId: string,
  sessionLog: string[],
}