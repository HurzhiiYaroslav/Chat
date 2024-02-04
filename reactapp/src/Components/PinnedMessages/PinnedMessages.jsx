import React, {useState,useMemo, useEffect } from 'react';
import { getSender } from '../../Utilities/chatFunctions';
import "./PinnedMessages.scss"

function PinnedMessages({ currentChat, chatData, connection }) {
    const [curPin, setCurPin] = useState(0);
    const [pinnedMessagesList, setPinnedMessagesList] = useState([]);

    const ScrollTo = (Id) => {
        const pinMes = document.getElementById(Id);
        if (pinMes) {
            pinMes.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            });
        }
    }

    const setPinnedMessages = () => {
        const pinMes = currentChat.Messages.filter((m) => m.Pin);
        if (!pinMes || pinMes.length === 0) return;
        setPinnedMessagesList(pinMes);
    }

    const pinnedMessages = useMemo(() => {
        setPinnedMessages();
        if (!pinnedMessagesList || pinnedMessagesList.length === 0 || !pinnedMessagesList[curPin]) return null;
        const sender = getSender(currentChat, pinnedMessagesList[curPin], chatData);
        return (
            <div className="pinned-message" onClick={() => ScrollTo(pinnedMessagesList[curPin].Id)}>
                <div className="message-content">
                    <span className="sender-name">{sender?.Name}:</span>
                    {pinnedMessagesList[curPin]?.content}
                </div>
                {pinnedMessagesList[curPin]?.Files && pinnedMessagesList[curPin]?.Files?.length > 0 && (
                    <div className="file-info">{pinnedMessagesList[curPin].Files.length} files</div>
                )}
            </div>
        );
    }, [currentChat, curPin]);

    useEffect(() => {
        setPinnedMessagesList([]);
        setPinnedMessages();
        setCurPin(pinnedMessagesList.length - 1);
    }, [currentChat]);

   
    return (
        <>
            {currentChat && currentChat.Messages && currentChat.Messages.length > 0 && currentChat.Messages.some((m) => m.Pin) && (
            <div className="pinned-messages-wrapper">
                {pinnedMessages}
                <div className="pin-buttons">
                        <button className="nav-button" onClick={() => setCurPin(prev => (prev - 1 + pinnedMessagesList.length) % pinnedMessagesList.length)}>
                        &larr;
                    </button>
                        <button className="nav-button" onClick={() => setCurPin(prev => (prev + 1) % pinnedMessagesList.length)}>
                        &rarr;
                    </button>
                </div>
            </div>
            )}
        </>
  );
}

export default PinnedMessages;