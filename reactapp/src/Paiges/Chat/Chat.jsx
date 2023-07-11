import React, { useState, useEffect } from 'react';
import ChatLeft from '../../Components/ChatLeft/ChatLeft';
import ChatRight from '../../Components/ChatRight/ChatRight';
import Loading from '../../Components/Loading/Loading';
import { ChatHubUrl } from '../../Links';
import { HubConnectionBuilder } from "@microsoft/signalr"

const Chat = () => {
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

        connec.on('Tset', (data) => {
            setChatData(JSON.parse(data));
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
        if (chatData.user !== null && chatData.user.name !== null) {
            console.log(chatData.user.name);
        }
    }, [chatData]);

    return (
        <div className="chat-page">
            {chatData && chatData.user && chatData.user.name ? (
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