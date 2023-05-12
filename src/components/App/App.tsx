import React, { FormEvent, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import { wsClient } from '../../ws/ws_client';
import { IMessage, wsEvent } from '../../ws/types';

let ind = 0;

function App() {
  const [userInput, setUserInput] = useState('');
  const [chatWindow, setChatWindow] = useState<string[]>([]);
  const client = wsClient.singleInstance(String(process.env.REACT_APP_WS_SERVER), setChatWindow);

  return (
    <div className="App">
      <div className="chat-window">
        {chatWindow.map( (el, index) => {
          let phrase = '';
          let name = '';
          if(el.includes('### Assistant:')) {
            phrase = el.replace('### Assistant:', '');
            name = 'assist'
          } else {
            phrase = el.replace('### Human:', '');
            name = 'human'
          }

          return (
            <div className={name} key={index}>
              {phrase}
            </div>
          )
        })}
      </div>
      <div className='prompt-input'>
        <input type="text" value={userInput} onChange={ (event: FormEvent<HTMLInputElement>) => {
          setUserInput(event.currentTarget.value);
        }} />
        <button type="button" onClick={ (event: FormEvent<HTMLButtonElement>) => {
          const newPhrase = '\n### Human:\n' + userInput
          setChatWindow(prev => [...prev, newPhrase])
          const message: IMessage = {
            event: wsEvent.prompt,
            payload: 'Continue the dialogue properly.' + chatWindow.join('') + newPhrase + '/n ### Assistant:\n',
          };
          client.ws.send(JSON.stringify(message));
          setUserInput('');
        }}>Send message</button>
      </div>
    </div>
  );
}

export default App;
