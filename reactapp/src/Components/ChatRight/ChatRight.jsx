import React, {useEffect,useState } from 'react';

function ChatRight(connection, ChatData, onlineUsers) {
    useEffect(() => {
        if (connection !== null) {

            connection.on("", connectedUserList => {

            });

        }
    }, [connection]);


    return (
        <div className="rightSide">
            <div>
            </div>
            <div>
            </div>
        </div>
    );
}

export default ChatRight;