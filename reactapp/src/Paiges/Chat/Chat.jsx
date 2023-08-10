import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ChatLeft from '../../Components/ChatParts/ChatLeft/ChatLeft';
import ChatRight from '../../Components/ChatParts/ChatRight/ChatRight';
import Loading from '../../Components/General/Loading/Loading';
import { ChatHubUrl } from '../../Links';
import { HubConnectionBuilder } from "@microsoft/signalr"

const Chat = () => {
    const navigate = useNavigate();
    const [connection, setConnection] = useState(null);
    const [chatData, setChatData] = useState({
        user:null,
        chats :[]
    });
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [currentChatId, setCurrentChatId] = useState(null);

    useEffect(() => {
        const connec = new HubConnectionBuilder()
            .withUrl(ChatHubUrl+ "?username=" + localStorage.getItem("currentUser"), {
                accessTokenFactory: () => {
                    const token = localStorage.getItem("accessToken");
                    return token;
                }
            })
            .build();
        setConnection(connec);

        connec.on("ConnectedUsers", connectedUserList => {
            setOnlineUsers(connectedUserList);
        });

        connec.on('UserConnected', (user) => {
            setOnlineUsers((prevUsers) => [...prevUsers, user[0]]);
        });

        

        connec.on('UserData', (data) => {
            setChatData(JSON.parse(data));
            setOnlineUsers(localStorage.getItem("currentUser"));
        });

        connec.on('UserDisconnected', (user) => {
                setOnlineUsers((prevUsers) =>
                    prevUsers.filter((u) => u !== user)
                );
        });

        connec.on('newMember', (data) => {
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
        });

        connec.on('memberLeftTheChat', (data) => {
            const member = JSON.parse(data);
            if (member.User.Id === localStorage.getItem("currentUser")) {
                setChatData((prevChatData) => {
                    const updatedChats = prevChatData.chats.filter((chat) => chat.Id !== member.chatId);

                    return {
                        ...prevChatData,
                        chats: updatedChats,
                    };
                });
            }
            else {
                setChatData((prevChatData) => {
                    const updatedChats = prevChatData.chats.map((chat) => {
                        if (chat.Id === member.chatId) {
                            const updatedUsers = chat.Users.filter((user) => user.Id !== member.User.Id);

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
        });

        connec.on('setError', (error) => {
            console.log(error);
        });

        connec.on('newChat', (chat) => {
            console.log(JSON.parse(chat));
            setChatData((prevChatData) => {
                return {
                    ...prevChatData,
                    chats: [...prevChatData.chats, JSON.parse(chat)],
                };
            });
            setCurrentChatId(JSON.parse(chat).Id);
        });

        connec.on('notify', (data) => {
            const not = JSON.parse(data);
            console.log(not);
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
        });

        connec.on('ReceiveMessage', (data, chatId) => {
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
        });

        connec.on('Relogin', () => {
            localStorage.clear();
            navigate("/login", { replace: true });
        });

        connec.start()
            .then(() => {
                //connec.invoke("");
            })
            .catch((error) => {
                console.error('fail ', error);
            });
        return () => {
            connec.stop();
        };
        
    }, []);

    useEffect(() => {
        console.log(chatData);
    }, [chatData])

    return (
        <div className="chat-page">
            {chatData && chatData.user && chatData.user.Name ? (
                <>
                    <ChatLeft
                        connection={connection}
                        chatData={chatData}
                        onlineUsers={onlineUsers}
                        currentChatId={currentChatId}
                        setCurrentChatId={setCurrentChatId}
                        navigate={navigate }
                    />
                    <ChatRight
                        connection={connection}
                        chatData={chatData}
                        onlineUsers={onlineUsers}
                        currentChatId={currentChatId}
                        setCurrentChatId={setCurrentChatId}
                    />
                </>
            ) : (
                    <Loading></Loading>
            )}
        </div>
    );
};

export default Chat;