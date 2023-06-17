import React, { useState, useEffect } from 'react';

const ChatMessageForm = ({ onSendMessage }) => {
    const [message, setMessage] = useState('');

    const handleSubmit = (event) => {
        event.preventDefault();
        onSendMessage({ sender: 'Me', content: message });
        setMessage('');
    };

    return (
        <form onSubmit={handleSubmit} className=" chat-message-form">
            < input
                type="text"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                className="chat-message-input"
                placeholder="Enter message"
            />
            <button type="submit" className="chat-message-send-btn">
                Send
            </button>
        </form >
    );
};

export default ChatMessageForm;