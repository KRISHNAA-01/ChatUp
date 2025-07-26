import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import './ChatApp.css';

const socket = io('http://localhost:5000');

function ChatApp() {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [username, setUsername] = useState('');
  const [file, setFile] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:5000/messages').then(res => {
      setMessages(res.data);
    });

    socket.on('receive_message', (message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socket.off('receive_message');
    };
  }, []);

const sendMessage = async () => {
  if (file && username) {
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    if (text) formData.append('text', text);
    formData.append('username', username);

    try {
      await axios.post('http://localhost:5000/upload', formData);
      
      setFile(null);
      document.getElementById('fileInput').value = ''; // Reset file input field
    } catch (error) {
      console.error('Upload error:', error);
    }

    setText('');
  } else if (text && username) {
    socket.emit('send_message', { username, text });
    setText('');
  }
};


  const renderMessageContent = (msgText) => {
    if (msgText.startsWith('http://localhost:5000/uploads/')) {
      return (<>
        <a href={msgText} target="_blank" rel="noopener noreferrer">
          📎 File
        </a>
        <p></p>
      </>
      );
    } else {
      return msgText;
    }
  };

  return (
    <div className="chat-container">
      <h2>Chat Up!!</h2>
      <label htmlFor="username">Name: </label>
      <input
        type="text"
        id="username"
        className="input username-input"
        value={username}
        placeholder="Your name"
        onChange={(e) => setUsername(e.target.value)}
      ></input>
      <div className="message-box">
        {messages.map((msg, i) => (
          <div key={i} className="message">
            <strong>{msg.user?.username || msg.username}</strong>: {renderMessageContent(msg.text)}
          </div>
        ))}
      </div>
      <div className="input-row">
        <input 
        id='fileInput'
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
        />
        <input
          className="input message-input"
          value={text}
          placeholder="Type a message"
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button className="send-button" onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

export default ChatApp;
