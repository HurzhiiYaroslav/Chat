import React, { useEffect, useState,useRef } from 'react';
import MessageBox from "../../Components/MessageBox/MesageBox"
import ChatRight from "../ChatRight/ChatRight";
import ChatInput from '../../Components/ChatInput/ChatInput';
import PinnedMessages from '../../Components/PinnedMessages/PinnedMessages';
import "./ChatMiddle.scss";


function ChatMiddle({ connection, chatData, onlineUsers, currentChatId, setCurrentChatId } ) {
    const [currentChat, setCurrentChat] = useState(null);
    

    useEffect(() => {
        if (chatData) {
            setCurrentChat(chatData.chats.find((element) => element.Id === currentChatId));
        }
    }, [currentChatId, chatData])

    function isPublisher() {
        const userId = localStorage.getItem("currentUser");
        return currentChat.Users ? currentChat.Users.some(p => p.Id === userId && p.Role!=="Reader") : true;
    }

    return (
        <>
             
            <div className="chatMiddle">
                <div className="MessagesWrapper">
                    {currentChat?.Messages && <PinnedMessages currentChat={currentChat} chatData={chatData} />}
                    <MessageBox currentChat={currentChat} chatData={chatData} connection={connection} setCurrentChatId={setCurrentChatId} />
                    {currentChat && (currentChat.Type !== "Channel" || isPublisher()) &&
                        <ChatInput currentChat={currentChat} connection={connection } />
                    }
                </div>
                <ChatRight currentChat={currentChat} onlineUsers={onlineUsers}  connection={connection} chatData={chatData} setCurrentChatId={setCurrentChatId}></ChatRight>
            </div>
        </>
    );
}

export default ChatMiddle;