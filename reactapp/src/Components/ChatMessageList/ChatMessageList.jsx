import React, { useState, useEffect } from 'react';

const ChatMessageList = ({ messages }) => {
    return (
        <ul className="chat-message-list">
            {messages.map((message) => (
                <li key={message.id} className="chat-message-item">
                    <span className="chat-message-sender">{message.sender}</span>
                    <span className="chat-message-content">{message.content}</span>
                </li>
            ))}
        </ul>
    );
};

export default ChatMessageList;