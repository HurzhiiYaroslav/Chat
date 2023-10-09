import React, { useRef, useState, useEffect, useMemo } from 'react';
import MessageItem from '../MessageItem/MessageItem';
import { MarkAsSeen } from "../../Utilities/signalrMethods" 
import { findLastMessage } from '../../Utilities/chatFunctions';
function MesageBox({currentChat,chatData,connection,setCurrentChatId }) {
    let scrollTimeout;
    const mesContainer = useRef(null);

    function groupMessagesByDate(messages) {
        const groupedMessages = {};
        for (const message of messages) {
            const date = new Date(message.time).toLocaleDateString();
            if (!groupedMessages[date]) {
                groupedMessages[date] = [];
            }
            groupedMessages[date].push(message);
        }
        return groupedMessages;
    }

    const messages = useMemo(() => {
        if (currentChat && currentChat.Messages && currentChat.Messages.length > 0) {
            const groupedMessages = groupMessagesByDate(currentChat.Messages);
            return Object.entries(groupedMessages).map(([date, messages]) => (
                <>
                    <div key={date} className="date-header">{date}</div>
                    {messages.map((item, index) => (
                        item.notification ? (
                            <div key={index} className="notification">{item.notification}</div>
                        ) : (
                            <MessageItem
                                key={item.Id}
                                item={item}
                                chatData={chatData}
                                currentChat={currentChat}
                                connection={connection}
                                setCurrentChatId={setCurrentChatId}
                            />
                        )
                    ))}
                </>
            )
            );
        } else {
            return null;
        }
    }, [currentChat]);

    const createScrollFunction = (mesContainer, condition) => () => {
        const timeoutId = setTimeout(() => {
            if (mesContainer?.current) {
                const scrollContainer = mesContainer.current;
                const lastMessage = condition(scrollContainer);
                if (lastMessage) {
                    lastMessage.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center',
                    });
                }
            }
        }, 1);

        return () => {
            clearTimeout(timeoutId);
        };
    };

    const ScrollDown = createScrollFunction(mesContainer, (scrollContainer) => {
        return scrollContainer.lastElementChild;
    });

    const ScrollToLastSeenMes = createScrollFunction(currentChat && mesContainer, (scrollContainer) => {
        return GetLastSeenMes();
    });

    const GetLastSeenMes = () => {
        let lastMessage = findLastMessage(currentChat);
        if (!lastMessage && currentChat?.Messages) {
            lastMessage = currentChat.Messages[currentChat.Messages.length - 1];
        }
        return document.getElementById(lastMessage?.Id);
    };

    const GetVisibleMessages = () => {
        const scrollContainer = mesContainer.current;
        if (!scrollContainer) return [];

        const containerRect = scrollContainer.getBoundingClientRect();
        const chatMessages = scrollContainer.querySelectorAll('.MessageItem');

        return Array.from(chatMessages).filter((message) => {
            const messageRect = message.getBoundingClientRect();
            return (
                messageRect.top >= containerRect.top &&
                messageRect.bottom <= containerRect.bottom
            );
        });
    }

    const handleScroll = () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            const visibleMessages = GetVisibleMessages();
            if (visibleMessages.length > 0) {
                const lastVisibleMessage = visibleMessages[visibleMessages.length - 1];
                const messageId = lastVisibleMessage.id;
                if (currentChat && messageId) {
                    MarkAsSeen(connection, currentChat?.Id, messageId)
                }
            }
        }, 500);
    };

    const handleReceiveMessage = (item,chat) => {
        if (currentChat?.Id !== chat) return;
        const scrollContainer = mesContainer.current;
        if (!scrollContainer) return;
        const scrollPosition = scrollContainer.scrollTop + scrollContainer.clientHeight;
        if (scrollContainer.scrollHeight - scrollPosition < 400 || (JSON.parse(item)?.sender === localStorage.getItem('currentUser'))) ScrollDown();
    }

    useEffect(() => {
        const chatContainer = mesContainer.current;
        if (chatContainer) {
            chatContainer.addEventListener('scroll', handleScroll);

            return () => {
                chatContainer.removeEventListener('scroll', handleScroll);
            };
        }
    }, [currentChat]);



    useEffect(() => {
        ScrollToLastSeenMes();
        if (currentChat?.Messages && connection) {
            handleScroll();
            connection.on('ReceiveMessage', handleReceiveMessage);
            return () => {
                connection.off('ReceiveMessage', handleReceiveMessage);
            };
        }
    }, [currentChat?.Id, connection]);
    
  return (
      <div className="messageBox" ref={mesContainer}>
          {messages}
      </div>
  );
}

export default MesageBox;