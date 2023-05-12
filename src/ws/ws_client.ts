//import WebSocket from 'ws';
import { IMessage, ISession, wsEvent } from './types';
import { isSession } from '../helpers/helpers';
import { Dispatch, SetStateAction } from 'react';

// WebSocket client decorator

export class wsClient {
  ws: WebSocket;
  constructor(serverUrl: string, SetChatWindow: Dispatch<SetStateAction<string[]>>,) {
    this.ws = new WebSocket(String(process.env.REACT_APP_WS_SERVER));

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
      console.log('mes', message);
      switch (message.event) {
        case wsEvent.restore:
          if (isSession(message.payload))
            localStorage.setItem('userId', message.payload.userId);
          break;

        default:

      }
    }
  }

}

