import React, { useEffect, useState } from 'react';
import { ImagesUrl } from '../../Links';
import "./ChatRight.scss"

function ChatRight({ connection, ChatData, onlineUsers, currentChat, setCurrentChat } ) {
    


    return (
        <div className="rightSide">
            <div className="messageBox">
                
            </div>
            <div className="AboutBox">
                
            </div>
            <div className="InputBox">
                <input className="inputField"></input>
                <button className="sendButton"></button>
            </div>
        </div>
    );
}

export default ChatRight;