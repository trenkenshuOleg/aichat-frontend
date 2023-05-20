//import WebSocket from 'ws';
import { ILogMessage, IMessage, messageEvent, streamEvents, techEvents } from './types';
import { isSession } from '../helpers/helpers';
import { Dispatch, SetStateAction } from 'react';
import EventEmitter from 'events';

// WebSocket client decorator

export class wsClient {
  private static single: wsClient | null;
  private sChatWindow: Dispatch<SetStateAction<ILogMessage[]>>;
  private sCursor: Dispatch<SetStateAction<boolean>>;
  private sUrl: string;
  public readyState: EventEmitter;
  public ws: WebSocket;
  private constructor(serverUrl: string, setChatWindow: Dispatch<SetStateAction<ILogMessage[]>>, setCursor: Dispatch<SetStateAction<boolean>>) {
    this.sChatWindow = setChatWindow;
    this.sCursor = setCursor;
    this.sUrl = serverUrl;
    this.readyState = new EventEmitter;
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
      setInterval(() => {
        if (this.ws.readyState == WebSocket.OPEN) {
          const ping: IMessage = {
            event: messageEvent.tech,
            payload: 'userId: ' + userId,
            type: techEvents.ping,
          }
          this.ws.send(JSON.stringify(ping));
        }
      }, 10000);
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
            if (message.type === streamEvents.stream) {
              setCursor(true);
              const last = prev[prev.length - 1];
              const answer = last.sender === 'Human'
                ? [...prev, { sender: 'Assistant', message: message.payload } as ILogMessage]
                : [...prev.slice(0, -1), { sender: 'Assistant', message: last.message + message.payload } as ILogMessage]
              return answer;
            }

            return prev;
          });
          if (message.type === streamEvents.end) {
            setCursor(false);
          }
          break;
        case messageEvent.queue:
          console.log('your number in queue is ' + message.payload);
          break;
        case messageEvent.ready:
          console.log('server connection is ready');
          this.readyState.emit(messageEvent.ready);
      }
    }
    this.ws.onclose = () => {
    }
  }
  public static singleInstance(serverUrl: string,
    setChatWindow: Dispatch<SetStateAction<ILogMessage[]>>,
    setCursor: Dispatch<SetStateAction<boolean>>): wsClient {
    if (typeof wsClient.single === 'undefined' || wsClient.single === null) {
      wsClient.single = new wsClient(serverUrl, setChatWindow, setCursor)
    }

    return wsClient.single
  }
  public renew = () => {
    wsClient.single = null;
    wsClient.single = wsClient.singleInstance(this.sUrl, this.sChatWindow, this.sCursor);

    return wsClient.single;
  }
  public ready() {
    return this.readyState
  }
}


