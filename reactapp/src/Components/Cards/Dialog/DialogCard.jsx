import React from 'react';
import { AvatarUrl } from "../../../Links";
import "./DialogCard.scss"

function DialogCard({ item, onlineUsers, connection, setCurrentChat }) {
    return (
        <div key={item.Id} className="DialogItem" onClick={() => setCurrentChat(item.Id)}>
            <div className="PhotoBox">
                <img
                    className="CompanionPhoto"
                    src={AvatarUrl + item.Companion.Photo}
                    alt="Avatar"
                />
                <div className={`marker ${onlineUsers.includes(item.Companion.Id) ? "online" : "offline"}`} ></div>
            </div>
            {item.Companion.Name}
        </div>
    );
}

export default DialogCard;