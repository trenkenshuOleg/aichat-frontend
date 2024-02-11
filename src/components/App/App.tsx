import React, { FormEvent, useEffect, useState, useRef} from 'react';
import './App.css';
import { wsClient } from '../../ws/ws_client';
import { ILogMessage, IMessage, messageEvent, techEvents } from '../../ws/types';
import Loader from '../Loader/Loader';
import { ILoader } from '../Loader/types';
import States from '../../ws/fe_states';

function App() {
  const [userInput, setUserInput] = useState('');
  const [chatWindow, setChatWindow] = useState<ILogMessage[]>([]);
  const [cursor, setCursor] = useState<boolean>(false);
  const [interfaceBlocked, setInterfaceBlocked] = useState<boolean>(false);
  const [loader, setLoader] = useState<ILoader>({
    que: -1,
    text: ''
  });
  const states = new States(setChatWindow, setCursor, setLoader, setUserInput, setInterfaceBlocked)
  let client = wsClient.singleInstance(String(process.env.REACT_APP_WS_SERVER), states);
  const bottomRef = useRef<null | HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.setAttribute('style', 'overflow-y: scroll; -webkit-overflow-scrolling: touch');
  }, []);

  useEffect(() => {
    bottomRef.current?.scroll({
      top: bottomRef.current?.scrollHeight,
      behavior: 'smooth',
    });
  }, [chatWindow]);

  useEffect(() => {
    setChatWindow(prev => [...prev])
    if(cursor === true) {
      setLoader({
        que: -1,
        text: ''
      });
    }
  }, [cursor]);

  const checkAndSend = async (wsClient: wsClient, message: IMessage) => {
    return new Promise((resolve) => {
      if(wsClient.ws.readyState !== WebSocket.OPEN) {
        const NewWsClient = wsClient.renew();
        NewWsClient.readyState.once( messageEvent.ready, () => {
          NewWsClient.ws.send(JSON.stringify(message));
          resolve(true);
        })
      } else {
        wsClient.ws.send(JSON.stringify(message));
        resolve(true);
      }
    });
  }

  const sendMesage = async () => {
    if (userInput.length > 0 && !cursor) {
      setInterfaceBlocked(true);
      const newPhrase: ILogMessage = {
        sender: 'Human',
        message: userInput
      }
      const waitingForAi: ILogMessage = {
        sender: 'Assistant',
        message: '',
      }
      const message: IMessage = {
        event: messageEvent.prompt,
        payload: newPhrase.message,
      };
      setUserInput('');
      const success = checkAndSend(client, message);
      (await success) && setChatWindow(prev => [...prev, newPhrase, waitingForAi])
    }
  }

  const clearSession = () => {
    setInterfaceBlocked(true);
    if (!cursor) {
      const userId = localStorage.getItem('userId');
      if(userId) {
        const erase: IMessage = {
          event: messageEvent.tech,
          payload: userId,
          type: techEvents.erase
        }
        checkAndSend(client, erase);
      }
    }
  }

  const regenerate = async () => {
    if (!cursor && chatWindow.length) {
      setInterfaceBlocked(true);
      const regen: IMessage = {
        event: messageEvent.tech,
        payload: '',
        type: techEvents.regenerate
      }
      const waitingForAi: ILogMessage = chatWindow[chatWindow.length - 1];
      waitingForAi.message = '';
      const success =  checkAndSend(client, regen);
        (await success) && setChatWindow(prev => [...prev.slice(0, -1), waitingForAi]);
    }
  }

  const goOn = () => {
    if (!cursor && chatWindow.length) {
      setInterfaceBlocked(true);
      const go: IMessage = {
        event: messageEvent.tech,
        payload: '',
        type: techEvents.goOn
      }
      checkAndSend(client, go);
    }
  }

  return (
    <div className="app">
      <Loader que={loader.que} text={loader.text} />
      <section className="app__block chat-window ">
        <div className="chat-window__container" ref={bottomRef}
          style={{
            overflowY: 'scroll',
            WebkitOverflowScrolling: "touch",
          }}>
          <div className="chat-window__chat" >
              {chatWindow.map( (el, index) =>
              (
                <div className={el.sender.toLowerCase() + ' chat__message'} key={index}>
                  {
                  el.message.split('\n').map( (elem, index) =>
                  (
                    <div className={cursor ? 'fragment' : 'fragment fragment__blink'} key={index}>
                      { elem }
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        </div>
      </section>
      <section className="app__block prompt">
        <form
          className="prompt__form"
          id="request_form"
          onSubmit={ (event: FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            sendMesage();
          }}>
          <input className="prompt__text-field"
            type="text"
            value={userInput}
            onChange={ (event: FormEvent<HTMLInputElement>) => {
              setUserInput(event.currentTarget.value);
            }}
          />
          <button
            className={'prompt__submit button ' + (interfaceBlocked ? 'button__inactive' : '')}
            type="button"
            onClick={ sendMesage }
          >
            Send message</button>
        </form>
      </section>
      <section className="app__block tech">
        <button
          className={'tech__clear-session button ' + (interfaceBlocked ? 'button__inactive' : '')}
          type="button"
          onClick={ clearSession }
        >
          Clear session</button>
        <button
          className={'tech__regenerate button ' + (interfaceBlocked ? 'button__inactive' : '')}
          type="button"
          onClick={ regenerate }
        >
          Regenerate</button>
        <button
          className={'tech__go-on button ' + (interfaceBlocked ? 'button__inactive' : '')}
          type="button"
          onClick={ goOn }
        >
          Continue</button>
      </section>
    </div>
  );
}

export default App;
