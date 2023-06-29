import React, {useEffect,useState } from 'react';
function ChatLeft(connection, ChatData, onlineUsers) {


    useEffect(() => {
        if (connection !== null) {

            connection.on("", connectedUserList => {

            });

        }
    }, [connection]);


    return (
        <div className="leftSide">
            <div className="">
            </div>
            <div className="">
            </div>
        </div>
    );
}

export default ChatLeft;