import { ILogMessage, IMessage, messageEvent, streamEvents, techEvents } from './types';
import { isSession } from '../helpers/helpers';
import { Dispatch, SetStateAction } from 'react';
import EventEmitter from 'events';
import { ILoader } from '../components/Loader/types';
import States from './fe_states';

// WebSocket client decorator

export class wsClient {
  private static single: wsClient | null = null;
  private states: States;
  private sUrl: string;
  public readyState: EventEmitter;
  public ws: WebSocket;
  private constructor(serverUrl: string, states: States) {
    this.states = states;
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
          this.states.sChatWindow(prev => {
            if (isSession(message.payload)) {
              return message.payload.sessionLog
            }

            return prev
          });
          this.states.sInterfaceBlocked(false)
          if (isSession(message.payload)) {
            if (!message.payload.sessionLog.length && !localStorage.getItem('userId')) {
              this.states.sLoader({
                que: 1,
                text: 'Send the first message to start'
              });
              this.states.sUserInput('Hi! Tell about yourself please.')
            }
            localStorage.setItem('userId', message.payload.userId);
          }
          break;
        case messageEvent.promptAnswer:
          this.states.sChatWindow(prev => {
            if (message.type === streamEvents.stream) {
              this.states.sCursor(true);
              const last = prev[prev.length - 1];
              const answer = last.sender === 'Human'
                ? [...prev, { sender: 'Assistant', message: message.payload } as ILogMessage]
                : [...prev.slice(0, -1), { sender: 'Assistant', message: last.message + message.payload } as ILogMessage]
              return answer;
            }

            return prev;
          });
          if (message.type === streamEvents.end) {
            this.states.sCursor(false);
            this.states.sInterfaceBlocked(false);
          }
          break;
        case messageEvent.queue:
          this.states.sLoader({
            que: Number(message.payload)
          });
          break;
        case messageEvent.ready:
          console.log('server connection is ready');
          this.readyState.emit(messageEvent.ready);
      }
    }
  }
  public static singleInstance(serverUrl: string, states: States): wsClient {
    if (!wsClient.single) {
      wsClient.single = new wsClient(serverUrl, states)
    }

    return wsClient.single
  }
  public renew = () => {
    wsClient.single = null;
    wsClient.single = wsClient.singleInstance(this.sUrl, this.states);

    return wsClient.single;
  }
  public ready() {
    return this.readyState
  }
}


