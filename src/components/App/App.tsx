import React, { FormEvent, useEffect, useState, useRef} from 'react';
import './App.css';
import { wsClient } from '../../ws/ws_client';
import { ILogMessage, IMessage, messageEvent, techEvents } from '../../ws/types';
import { Session } from 'inspector';


function App() {
  const [userInput, setUserInput] = useState('');
  const [chatWindow, setChatWindow] = useState<ILogMessage[]>([]);
  const [cursor, setCursor] = useState<boolean>(false)
  const client = wsClient.singleInstance(String(process.env.REACT_APP_WS_SERVER), setChatWindow, setCursor);
  const bottomRef = useRef<null | HTMLDivElement>(null);

  window.HTMLElement.prototype.scrollIntoView = () => {};

  useEffect(() => {
    bottomRef.current?.scroll({
          top: bottomRef.current?.scrollHeight,
          behavior: 'smooth',
      });

  }, [chatWindow]);

  useEffect(() => {
    setChatWindow(prev => [...prev])
  }, [cursor]);

  const sendMesage = () => {
    if (userInput.length > 0 && !cursor) {
      const newPhrase: ILogMessage = {
        sender: 'Human',
        message: userInput
      }
      const waitingForAi: ILogMessage = {
        sender: 'Assistant',
        message: '',
      }
      setChatWindow(prev => [...prev, newPhrase, waitingForAi])
      const message: IMessage = {
        event: messageEvent.prompt,
        payload: newPhrase.message,
      };
      setUserInput('');
      client.ws.send(JSON.stringify(message));
    }
  }

  const clearSession = () => {
    if (!cursor) {
      const userId = localStorage.getItem('userId');
      if(userId) {
        const erase: IMessage = {
          event: messageEvent.tech,
          payload: userId,
          type: techEvents.erase
        }
        client.ws.send(JSON.stringify(erase));
      }
    }
  }

  const regenerate = () => {
    if (!cursor) {
      const regen: IMessage = {
        event: messageEvent.tech,
        payload: '',
        type: techEvents.regenerate
      }
      const waitingForAi: ILogMessage = chatWindow[chatWindow.length - 1];
      waitingForAi.message = '';
      setChatWindow(prev => [...prev.slice(0, -1), waitingForAi]);
      client.ws.send(JSON.stringify(regen));
    }
  }

  const goOn = () => {
    if (!cursor) {
      const go: IMessage = {
        event: messageEvent.tech,
        payload: '',
        type: techEvents.goOn
      }
      client.ws.send(JSON.stringify(go));
    }
  }

  return (
    <div className="app">
      <section className="app__block chat-window ">
        <div className="chat-window__container" ref={bottomRef}>
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
        <form className="prompt__form" onSubmit={ (event: FormEvent<HTMLFormElement>) => {event.preventDefault(); sendMesage()} }>
          <input className="prompt__text-field" type="text" value={userInput} onChange={ (event: FormEvent<HTMLInputElement>) => {
            setUserInput(event.currentTarget.value);
          }}/>
          <button className="prompt__submit button" type="button" onClick={ sendMesage }>Send message</button>
        </form>
      </section>
      <section className="app__block tech">
        <button className="tech__clear-session button" type="button" onClick={ clearSession }>Clear session</button>
        <button className="tech__regenerate button" type="button" onClick={ regenerate }>Regenerate</button>
        <button className="tech__go-on button" type="button" onClick={ goOn }>Continue</button>
      </section>
    </div>
  );
}

export default App;
