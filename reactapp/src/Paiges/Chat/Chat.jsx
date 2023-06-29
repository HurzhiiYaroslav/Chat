import React, { useState, useEffect } from 'react';
import ChatLeft from '../../Components/ChatLeft/ChatLeft';
import ChatRight from '../../Components/ChatRight/ChatRight';
import { HubConnectionBuilder } from "@microsoft/signalr"

const Chat = () => {
    const [connection, setConnection] = useState(null);
    const [ChatData, setChatData] = useState([]);
    const [onlineUsers, setOnlineUsers] = useState([]);
    useEffect(() => {
        const connec = new HubConnectionBuilder()
            .withUrl("https://localhost:7222/chat?username=" + localStorage.getItem("currentUser"), {
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

        connec.start()
            .then(() => {
                console.log('success');
            })
            .catch((error) => {
                console.error('fail ', error);
            });
        return () => {
            connec.stop();
        };
    }, []);


    return (
        <div className="chat-page">
            <ChatLeft connection={connection} ChatData={ChatData} onlineUsers={onlineUsers }></ChatLeft>
            <ChatRight connection={connection} ChatData={ChatData} onlineUsers={onlineUsers}></ChatRight>
        </div>
    );
};

export default Chat;