import React, { useState, useRef, useEffect } from 'react';
import io from 'socket.io-client';
import immer from 'immer'

import './App.css';
import Chat from './components/Chat';
import Form from './components/Form';

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

  useEffect(() => {
    setMessage("")
  }, [messages])

  function handleMessageChange(e) {
    setMessage(e.target.value);
  }

  function sendMessage() {
    const payload = {
      content: message,
      to: currentChat.isChannel ? currentChat.chatName : currentChat.receiverId,
      sender: username,
      chatName: currentChat.chatName,
      isChannel: currentChat.isChannel
    };
    const newMessages = immer(messages, draft => {
      draft[currentChat.chatName].push({
        sender: username,
        content: message
      });
    });

    setMessages(newMessages)
    socketRef.current.emit("send message", payload);
  }

  function roomJoin(inMessages, room) {
    const newMessages = immer(messages, draft => {
      draft[room] = inMessages;
    });

    setMessages(newMessages);
  }

  function joinRoom(room) {
    const newConnectedRooms = immer(connectedRooms, draft => {
      draft.push(room);
    });

    socketRef.current.emit("join room", room, (messages) => roomJoin(messages, room));
    setConnectedRooms(newConnectedRooms);
  }

  function toggleChat(currentChat) {
    if (!messages[currentChat.chatName]) {
      const newMessages = immer(messages, draft => {
        draft[currentChat.chatName] = [];
      });
      setMessages(newMessages);
    }
    setCurrentChat(currentChat);
  }

  function handleUsernameChange(e) {
    setUsername(e.target.value);
  }

  function connect() {
    setConnected(true);
    socketRef.current = io.connect("http://localhost:1337");
    socketRef.current.emit("join server", username);
    socketRef.current.emit("join room", "general", (messages) => roomJoin(messages, "general"));
    socketRef.current.on("new user", allUsers => {
      setAllUsers(allUsers);
    });
    socketRef.current.on("new message", ({ content, sender, chatName }) => {
      setMessages(messages => {
        const newMessages = immer(messages, draft => {
          if (draft[chatName]) {
            draft[chatName].push({ content, sender });
          } else {
            draft[chatName] = [({ content, sender })];
          }
        })
        return newMessages;
      })
    })
  }

  let body;
  if (connected) {
    body = (
      <Chat
        message={message}
        handleMessageChange={handleMessageChange}
        sendMessage={sendMessage}
        userId={socketRef.current ? socketRef.current.id : ""}
        allUsers={allUsers}
        joinRoom={joinRoom}
        connectedRooms={connectedRooms}
        currentChat={currentChat}
        toggleChat={toggleChat}
        messages={messages[currentChat.chatName]}
      />
    )
  } else {
    body = (
      <Form
        username={username}
        onChange={handleUsernameChange}
        connect={connect}
      />
    );
  }

  return (
    <div className="App">
      {body}
    </div>
  );
}

export default App;
