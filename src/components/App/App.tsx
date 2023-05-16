import React, { FormEvent, useEffect, useState, useRef} from 'react';
import logo from './logo.svg';
import './App.css';
import { wsClient } from '../../ws/ws_client';
import { ILogMessage, IMessage, messageEvent } from '../../ws/types';


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
  }, [cursor])

  return (
    <div className="app">
      <section className="chat-window">
        <div className="chat-window_container" ref={bottomRef}>
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
        <div className="bottom"></div>
      </section>
      <section className="prompt">
        <input className="prompt__text-field" type="text" value={userInput} onChange={ (event: FormEvent<HTMLInputElement>) => {
          setUserInput(event.currentTarget.value);
        }} />
        <button className="prompt__submit" type="button" onClick={ (event: FormEvent<HTMLButtonElement>) => {
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
          client.ws.send(JSON.stringify(message));
          setUserInput('');
        }}>Send message</button>
      </section>
    </div>
  );
}

export default App;
