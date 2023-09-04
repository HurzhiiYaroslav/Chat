import React from 'react';
import { AvatarUrl } from "../../../Links";
import "./DialogCard.scss"

function DialogCard({ item, onlineUsers, func, children }) {
    const user = item.Companion ? item.Companion : item;

    function isOnline(userId) {
        if (onlineUsers.includes(userId)) {
            return true;
        }
        else {
            return false;
        }
    }


    return (
        <div key={user.Id} className="DialogItem" onClick={() => func(item.Id) }>
            <div className="PhotoBox">
                <img
                    className="CompanionPhoto"
                    src={AvatarUrl + user.Photo}
                    alt="Avatar"
                />
                <div className={onlineUsers && `marker ${isOnline(user.Id) ? "online" : "offline"}`} ></div>
            </div>
            <label>{user.Name}</label>
            {children}
        </div>
    );
}

export default DialogCard;