//import WebSocket from 'ws';
import { ILogMessage, IMessage, messageEvent } from './types';
import { isSession } from '../helpers/helpers';
import { Dispatch, SetStateAction } from 'react';

// WebSocket client decorator

export class wsClient {
  private static single: wsClient;
  public ws: WebSocket;
  private constructor(serverUrl: string, setChatWindow: Dispatch<SetStateAction<ILogMessage[]>>, setCursor: Dispatch<SetStateAction<boolean>>) {

    this.ws = new WebSocket(serverUrl);

    this.ws.onopen = (e: Event) => {
      let userId = localStorage.getItem('userId');
      if (!userId)
        userId = 'no ID';
      const auth: IMessage = {
        event: messageEvent.restore,
        payload: userId,
      }
      this.ws.send(JSON.stringify(auth));
    };
    this.ws.onmessage = (event: MessageEvent<string>) => {
      const message: IMessage = JSON.parse(event.data);
      switch (message.event) {
        case messageEvent.restore:
          setChatWindow(prev => {
            if (isSession(message.payload)) {
              return message.payload.sessionLog
            }

            return prev
          });
          if (isSession(message.payload))
            localStorage.setItem('userId', message.payload.userId);

          break;
        case messageEvent.promptAnswer:
          setChatWindow(prev => {
            if (message.type === 'text_stream') {
              setCursor(true);
              const last = prev[prev.length - 1];
              const answer = last.sender === 'Human'
                ? [...prev, { sender: 'Assistant', message: message.payload } as ILogMessage]
                : [...prev.slice(0, -1), { sender: 'Assistant', message: last.message + message.payload } as ILogMessage]
              return answer;
            }

            return prev;
          });
          if (message.type !== 'text_stream') {
            setCursor(false);
          }
      }
    }
  }
  public static singleInstance(serverUrl: string,
    setChatWindow: Dispatch<SetStateAction<ILogMessage[]>>,
    setCursor: Dispatch<SetStateAction<boolean>>): wsClient {
    if (typeof wsClient.single === 'undefined') {
      wsClient.single = new wsClient(serverUrl, setChatWindow, setCursor)
    }

    return wsClient.single
  }
}


