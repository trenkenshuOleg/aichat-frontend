import React, { FormEvent, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import { wsClient } from '../../ws/ws_client';
import { IMessage, wsEvent } from '../../ws/types';


function App() {
  const [userInput, setUserInput] = useState('');
  const [chatWindow, setChatWindow] = useState(['']);

  const client = new wsClient(String(process.env.WS_SERVER), setChatWindow);

  return (
    <div className="App">
      <div className="chat-window">
        {chatWindow}
      </div>
        <input type="text" onChange={ (event: FormEvent<HTMLInputElement>) => {
          setUserInput(event.currentTarget.value);
        }} />
      <button type="button" onClick={ (event: FormEvent<HTMLButtonElement>) => {
        const message: IMessage = {
          event: wsEvent.prompt,
          payload: userInput,
        };
        client.ws.send(JSON.stringify(message));
        setChatWindow(prev => [...prev, String(userInput)])
        console.log(client.ws)
      }}>Send message</button>
    </div>
  );
}

export default App;
