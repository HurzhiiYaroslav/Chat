import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ChatLeft from '../../Components/ChatLeft/ChatLeft';
import ChatRight from '../../Components/ChatRight/ChatRight';
import Loading from '../../Components/Loading/Loading';
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
    const [currentChat, setCurrentChat] = useState(null);

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

        connec.on('UserDisconnected', (user) => {
            console.log(user);
            setOnlineUsers((prevUsers) => prevUsers.filter((u) => u !== user));
        });

        connec.on('UserData', (data) => {
            console.log(data);
            setChatData(JSON.parse(data));
        });

        connec.on('ReciveMessage', (data,chatId) => {
            const mes = JSON.parse(data);
            setChatData((prevChatData) => {
                const updatedChats = prevChatData.chats.map((chat) => {
                    if (chat.Id === chatId[0]) {
                        return {
                            ...chat,
                            Messages: [...chat.Messages, mes],
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
    }, [chatData]);

    return (
        <div className="chat-page">
            {chatData && chatData.user && chatData.user.Name ? (
                <>
                    <ChatLeft
                        connection={connection}
                        chatData={chatData}
                        onlineUsers={onlineUsers}
                        currentChat={currentChat}
                        setCurrentChat={setCurrentChat}
                    />
                    <ChatRight
                        connection={connection}
                        chatData={chatData}
                        onlineUsers={onlineUsers}
                        currentChat={currentChat}
                        setCurrentChat={setCurrentChat}
                    />
                </>
            ) : (
                    <Loading></Loading>
            )}
        </div>
    );
};

export default Chat;