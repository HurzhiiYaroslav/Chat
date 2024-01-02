import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ChatLeft from '../../Containers/ChatLeft/ChatLeft';
import ChatMiddle from '../../Containers/ChatMiddle/ChatMiddle';
import Loading from '../../Components/General/Loading/Loading';
import { ChatHubUrl } from '../../Links';
import { HubConnectionBuilder } from "@microsoft/signalr"

const useChatConnection = () => {
    const [connection, setConnection] = useState(null);

    useEffect(() => {
        const connectToChatHub = async () => {
            const connec = new HubConnectionBuilder()
                .withUrl(ChatHubUrl + "?username=" + localStorage.getItem("currentUser"), {
                    accessTokenFactory: () => localStorage.getItem("accessToken")
                })
                .build();

            try {
                await connec.start();
                setConnection(connec);
            } catch (error) {
                console.error('Failed to connect to chat hub:', error);
            }
        };

        connectToChatHub();

        return () => {
            if (connection) {
                connection.stop();
            }
        };
    }, []);

    return connection;
};

const useChatEventHandlers = (connection, setChatData, setCurrentChatId, setOnlineUsers, navigate) => {
    useEffect(() => {
        if (!connection) return;

        const handleConnectedUsers = (connectedUserList) => {
            setOnlineUsers(connectedUserList);
        };

        const handleUserConnected = (user) => {
            setOnlineUsers((prevUsers) => [...prevUsers, user[0]]);
        };

        const handleUserData = (data) => {
            setChatData(JSON.parse(data));
            setOnlineUsers([localStorage.getItem("currentUser")]);
        };

        const handleUserDisconnected = (user) => {
            setOnlineUsers((prevUsers) =>
                prevUsers.filter((u) => u !== user)
            );
        };

        const handleNewMember = (data) => {
            const member = JSON.parse(data);
            setChatData((prevChatData) => {
                const updatedChats = prevChatData.chats.map((chat) => {
                    if (chat.Id === member.chatId) {
                        return {
                            ...chat,
                            Users: [...chat.Users, member.User],
                        };
                    }
                    return chat;
                });

                return {
                    ...prevChatData,
                    chats: updatedChats,
                };
            });
        };

        const handleMemberLeftTheChat = (data) => {
            const member = JSON.parse(data);
            if (member.UserId === localStorage.getItem("currentUser")) {
                
                setChatData((prevChatData) => {
                    const updatedChats = prevChatData.chats.filter((chat) => chat.Id !== member.chatId);

                    return {
                        ...prevChatData,
                        chats: updatedChats,
                    };
                });
            } else {
                setChatData((prevChatData) => {
                    const updatedChats = prevChatData.chats.map((chat) => {
                        if (chat.Id === member.chatId) {
                            const updatedUsers = chat.Users.filter((user) => user.Id !== member.UserId);

                            return {
                                ...chat,
                                Users: updatedUsers,
                            };
                        }
                        return chat;
                    });

                    return {
                        ...prevChatData,
                        chats: updatedChats,
                    };
                });
            }
        };

        const handleSetError = (error) => {
            console.log(error);
        };

        const handleNewChat = (chat) => {
            setChatData((prevChatData) => {
                return {
                    ...prevChatData,
                    chats: [...prevChatData.chats, JSON.parse(chat)],
                };
            });
            setCurrentChatId(JSON.parse(chat).Id);
        };

        const handleNotify = (data) => {
            const not = JSON.parse(data);
            setChatData((prevChatData) => {
                const updatedChats = prevChatData.chats.map((chat) => {
                    if (chat.Id === not.chatId) {
                        return {
                            ...chat,
                            Messages: [...chat.Messages, not],
                        };
                    }
                    return chat;
                });

                return {
                    ...prevChatData,
                    chats: updatedChats,
                };
            });
        };

        const handleReceiveMessage = (data, chatId) => {
            const mes = JSON.parse(data);
            setChatData((prevChatData) => {
                const updatedChats = prevChatData.chats.map((chat) => {
                    if (chat.Id === chatId) {
                        return {
                            ...chat,
                            Messages: [...chat.Messages, mes],
                        };
                    }
                    return chat;
                });

                const chatIndex = updatedChats.findIndex((chat) => chat.Id === chatId);

                if (chatIndex !== -1) {
                    updatedChats.unshift(updatedChats.splice(chatIndex, 1)[0]);
                }

                return {
                    ...prevChatData,
                    chats: updatedChats,
                };
            });
        };

        const handleRelogin = () => {
            localStorage.clear();
            navigate("/login", { replace: true });
        };

        const handlePublicity = (chatId) => {
            setChatData((prevChatData) => {
                const updatedChats = prevChatData.chats.map((chat) => {
                    if (chat.Id === chatId) {
                        return {
                            ...chat,
                            isPublic: !chat.isPublic,
                        };
                    }
                    return chat;
                });

                return {
                    ...prevChatData,
                    chats: updatedChats,
                };
            });
        };

        const handleUpdateEnrollment = (enrollment, channelId) => {
            console.log(enrollment);
            const data = JSON.parse(enrollment);
            console.log(data);
            setChatData((prevChatData) => {
                const updatedChats = prevChatData.chats.map((chat) => {
                    if (chat.Id === channelId) {
                        const updatedUsers = chat.Users.map((user) => {
                            if (user.Id === data.Id) {
                                return {
                                    ...user,
                                    Name : data.Name,
                                    Photo : data.Photo,
                                    Role : data.Role

                                };
                            }
                            return user;
                        });

                        return {
                            ...chat,
                            Users: updatedUsers,
                        };
                    }
                    return chat;
                });

                return {
                    ...prevChatData,
                    chats: updatedChats,
                };
            });
        };

        const handleSeenMessage = (data, chatId) => {
            const mes = JSON.parse(data);
            setChatData((prevChatData) => {
                const updatedChats = prevChatData.chats.map((chat) => {
                    if (chat.Id === chatId) {
                        return {
                            ...chat,
                            LastSeenMessage: mes,
                        };
                    }
                    return chat;
                });

                return {
                    ...prevChatData,
                    chats: updatedChats,
                };
            });
        };

        const handleDeletedMessage = (mesId, chatId) => {
            setChatData((prevChatData) => {
                const updatedChats = prevChatData.chats.map((chat) => {
                    if (chat.Id === chatId) {
                        const updatedMessages = chat.Messages.filter((mes) => mes.Id !== mesId);

                        return {
                            ...chat,
                            Messages: updatedMessages,
                        };
                    }
                    return chat;
                });

                return {
                    ...prevChatData,
                    chats: updatedChats,
                };
            });
        };

        const handlePinnedMessage = (mesId, chatId,state) => {
            setChatData((prevChatData) => {
                const updatedChats = prevChatData.chats.map((chat) => {
                    if (chat.Id === chatId) {
                        const updatedMessages = chat.Messages.map((mes) => {
                            if (mes.Id === mesId) {
                                return {
                                    ...mes,
                                    Pin: state

                                };
                            }
                            return mes;
                        });

                        return {
                            ...chat,
                            Messages: updatedMessages,
                        };
                    }
                    return chat;
                });

                return {
                    ...prevChatData,
                    chats: updatedChats,
                };
            });
        }

        const handleChatPinChange = (chatId, state) => {
            setChatData((prevChatData) => {
                const updatedChats = prevChatData.chats.map((chat) => {
                    if (chat.Id === chatId) {
                        return {
                            ...chat,
                            isPinned: state,
                        };
                    }
                    return chat;
                });

                return {
                    ...prevChatData,
                    chats: updatedChats,
                };
            });
        }

        connection.on('ConnectedUsers', handleConnectedUsers);
        connection.on('UserConnected', handleUserConnected);
        connection.on('UserData', handleUserData);
        connection.on('UserDisconnected', handleUserDisconnected);
        connection.on('newMember', handleNewMember);
        connection.on('memberLeftTheChat', handleMemberLeftTheChat);
        connection.on('setError', handleSetError);
        connection.on('newChat', handleNewChat);
        connection.on('notify', handleNotify);
        connection.on('ReceiveMessage', handleReceiveMessage);
        connection.on('Relogin', handleRelogin);
        connection.on('publicityChanged', handlePublicity);
        connection.on('updateEnrollment', handleUpdateEnrollment);
        connection.on("MessageHasSeen", handleSeenMessage);
        connection.on("MessageDeleted", handleDeletedMessage);
        connection.on("MessagePinChanged", handlePinnedMessage);
        connection.on("ChatPinChanged", handleChatPinChange);

        return () => {
            connection.off('ConnectedUsers', handleConnectedUsers);
            connection.off('UserConnected', handleUserConnected);
            connection.off('UserData', handleUserData);
            connection.off('UserDisconnected', handleUserDisconnected);
            connection.off('newMember', handleNewMember);
            connection.off('memberLeftTheChat', handleMemberLeftTheChat);
            connection.off('setError', handleSetError);
            connection.off('newChat', handleNewChat);
            connection.off('notify', handleNotify);
            connection.off('ReceiveMessage', handleReceiveMessage);
            connection.off('Relogin', handleRelogin);
            connection.off('publicityChanged', handlePublicity);
            connection.off('updateEnrollment', handleUpdateEnrollment);
            connection.off("MessageHasSeen", handleSeenMessage);
            connection.off("MessageDeleted", handleDeletedMessage);
            connection.off("MessagePinChanged", handlePinnedMessage);
            connection.off("ChatPinChanged", handleChatPinChange);
        };
    }, [connection, navigate, setChatData, setCurrentChatId, setOnlineUsers]);
};



const Chat = () => {
    const navigate = useNavigate();
    const connection = useChatConnection();
    const [chatData, setChatData] = useState({
        user: null,
        chats: []
    });
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [currentChatId, setCurrentChatId] = useState(null);

    useChatEventHandlers(connection, setChatData, setCurrentChatId,setOnlineUsers,navigate);

    useEffect(() => {
        if (chatData) {
            console.log(chatData);
        }
    }, [chatData]);


    return (
        <div className="chat-page">
            {chatData && chatData.user && chatData.user.Name ? (
                <>
                    <ChatLeft
                        connection={connection}
                        chatData={chatData}
                        setChatData={setChatData }
                        onlineUsers={onlineUsers}
                        currentChatId={currentChatId}
                        setCurrentChatId={setCurrentChatId}
                        navigate={navigate}
                    />
                    <ChatMiddle
                        connection={connection}
                        chatData={chatData}
                        onlineUsers={onlineUsers}
                        currentChatId={currentChatId}
                        setCurrentChatId={setCurrentChatId}
                    />
                </>
            ) : (
                <Loading />
            )}
        </div>
    );
};

export default Chat;