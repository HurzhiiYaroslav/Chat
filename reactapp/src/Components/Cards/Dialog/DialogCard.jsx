import React from 'react';
import { useEffect } from 'react';
import { AvatarUrl } from "../../../Links";
import "./DialogCard.scss"

function DialogCard({ item, onlineUsers, func, children, }) {
    const user = item.Companion ? item.Companion : item;
    return (
        <div key={item.Id} className="DialogItem" onClick={() => func(item.Id) }>
            <div className="PhotoBox">
                <img
                    className="CompanionPhoto"
                    src={AvatarUrl + user.Photo}
                    alt="Avatar"
                />
                <div className={`marker ${onlineUsers.includes(user.Id) ? "online" : "offline"}`} ></div>
            </div>
            {user.Name}
            {children}
        </div>
    );
}

export default DialogCard;