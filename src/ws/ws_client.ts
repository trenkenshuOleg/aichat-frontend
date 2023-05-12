//import WebSocket from 'ws';
import { IMessage, ISession, wsEvent } from './types';
import { isSession } from '../helpers/helpers';
import { Dispatch, SetStateAction } from 'react';

// WebSocket client decorator

export class wsClient {
  private static single: wsClient;
  public ws: WebSocket;
  private constructor(serverUrl: string, setChatWindow: Dispatch<SetStateAction<string[]>>) {

    this.ws = new WebSocket(serverUrl);

    this.ws.onopen = (e: Event) => {
      let userId = localStorage.getItem('userId');
      if (!userId)
        userId = 'no ID';
      const auth: IMessage = {
        event: wsEvent.restore,
        payload: userId,
      }
      this.ws.send(JSON.stringify(auth));
    };

    this.ws.onmessage = (event: MessageEvent<string>) => {
      const message: IMessage = JSON.parse(event.data);
      switch (message.event) {
        case wsEvent.restore:
          console.log('ws_client restore', message);
          if (isSession(message.payload))
            localStorage.setItem('userId', message.payload.userId);
          break;
        case wsEvent.promptAnswer:
          console.log('ws_client promptAnswer', message.payload);
          setChatWindow(prev => {
            if (!isSession(message.payload)) {
              if (message.type === 'text_stream') {
                const last = prev[prev.length - 1];
                const answer = last.includes('\n### Human:\n')
                  ? [...prev, '\n### Assistant:\n' + message.payload]
                  : [...prev.slice(0, -1), last + message.payload]
                return answer;;
              }
            }
            return prev;

          });
      }
    }
  }
  public static singleInstance(serverUrl: string, setChatWindow: Dispatch<SetStateAction<string[]>>): wsClient {
    if (typeof wsClient.single === 'undefined') {
      wsClient.single = new wsClient(serverUrl, setChatWindow)
    }
    return wsClient.single
  }
}


