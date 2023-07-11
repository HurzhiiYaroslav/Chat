import React, { useEffect, useState } from 'react';
import { ImagesUrl } from '../../Links';
import ChatList from '../ChatList/ChatList'
import "./ChatLeft.scss"

function ChatLeft({ connection, chatData, onlineUsers, currentChat, setCurrentChat }) {

    return (
        <div className="leftSide">
            <div className="User">
                <div className="UserName">
                    {chatData && chatData.user && chatData.user.name ? chatData.user.name : "name"}
                </div>
                {chatData && chatData.user && chatData.user.photo ? (
                    <img
                        className="UserPhoto"
                        src={ImagesUrl + chatData.user.photo}
                        alt="YourAvatar"
                    />
                ) : (
                    "photo"
                )}
            </div>
            <ChatList connection={connection}
                chatData={chatData}
                onlineUsers={onlineUsers}
                currentChat={currentChat}
                setCurrentChat={setCurrentChat} />
        </div>
    );
}

export default ChatLeft;