import React, { useState, useRef, useEffect } from 'react';
import io from 'socket.io-client';
import immer from 'immer'

import './App.css';

const initMessages = {
  general: [],
  random: [],
  jokes: [],
  javascript: [],
}

function App() {
  const [username, setUsername] = useState("")
  const [connected, setConnected] = useState(false)
  const [allUsers, setAllUsers] = useState([])
  const [messages, setMessages] = useState(initMessages)
  const [message, setMessage] = useState("")
  const [connectedRooms, setConnectedRooms] = useState(["general"])
  const [currentChat, setCurrentChat] = useState({
    isChannel: true,
    chatName: "general",
    receiverId: ""
  })

  const socketRef = useRef();

  let body;
  if (connected) {
    body = <div>Halo</div>
  } else {
    body = <div>login</div>
  }

  return (
    <div className="App">
      {body}
    </div>
  );
}

export default App;
