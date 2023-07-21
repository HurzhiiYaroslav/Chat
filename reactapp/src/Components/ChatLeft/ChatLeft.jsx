import React, { useEffect, useState } from 'react';
import { AvatarUrl } from '../../Links';
import ChatList from '../ChatList/ChatList'
import "./ChatLeft.scss"

function ChatLeft({ connection, chatData, onlineUsers, currentChat, setCurrentChat }) {

    return (
        <div className="leftSide">
            <div className="UserInfo">
                <div className="UserName">
                    {chatData && chatData.user && chatData.user.Name ? chatData.user.Name : "name"}
                </div>
                {chatData && chatData.user && chatData.user.Photo ? (
                    <img
                        className="UserPhoto"
                        src={AvatarUrl + chatData.user.Photo}
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