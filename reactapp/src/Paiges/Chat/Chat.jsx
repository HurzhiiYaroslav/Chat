import React, { useState, useEffect } from 'react';
import ChatMessageForm from '../../Components/ChatMessageForm/ChatMessageForm';
import ChatMessageList from '../../Components/ChatMessageList/ChatMessageList';



const Chat = () => {
    const [messages, setMessages] = useState([]);

    const sendMessage = (message) => {
        // ���������� ��������� �� ������
        // ...

        // ��������� ����� ��������� � ������ ���������
        setMessages(messages=>[...messages, message]);
    };
    return (
        <div className="chat-page">
            <ChatMessageList messages={messages} />
            <ChatMessageForm onSendMessage={sendMessage} />
        </div>
    );
};

export default Chat;