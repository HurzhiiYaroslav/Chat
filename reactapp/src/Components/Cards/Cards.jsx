import React from 'react';
import { AvatarUrl } from "../../Links";
import "./Cards.scss"

function Logo({ logo }) {
    if (logo.startsWith('#')) {
        return (
            <div
                className="Logo"
                style={{
                    backgroundColor: logo
                }}
            />
        );
    } else {
        return <img className="Logo" src={AvatarUrl + logo} alt="Logo" />;
    }
}

function DialogCard({ item, onlineUsers, func, extraClasses,children }) {
    const user = item.Companion ? item.Companion : item;
    const cardClasses = `DialogItem ${extraClasses}`;
    function isOnline(userId) {
        return onlineUsers.includes(userId);
    }

    return (
        <div key={user.Id} className={cardClasses} onClick={() => func(item.Id)}>
            <div className="PhotoBox">
                <Logo logo={user.Photo} />
                <div className={onlineUsers && `marker ${isOnline(user.Id) ? "online" : "offline"}`}></div>
            </div>
            <label className="CompanionName">{user.Name}</label>
            {children}
        </div>
    );
}

function GroupCard({ item, onlineUsers, setCurrentChatId, extraClasses, children }) {
    const countOnline = () => item.Users.filter(i => onlineUsers.includes(i.Id)).length;
    const cardClasses = `GroupItem ${extraClasses}`;
    return (
        <div className={cardClasses} onClick={() => setCurrentChatId(item.Id)}>
            <Logo logo={item.Logo} />
            <div className="GroupInfo">
                <h2 className="GroupTitle">{item.Title}</h2>
                <div className="GroupMembers">{countOnline() + "/" + item.Users.length + " on-line"}</div>
            </div>
            {children}
        </div>
    );
}

function ChannelCard({ item, func, extraClasses, children }) {
    const cardClasses = `ChannelItem ${extraClasses}`;
    return (
        <div className={cardClasses} onClick={() => func(item.Id)}>
            <Logo logo={item.Logo} />
            <div className="GroupInfo">
                <h2 className="GroupTitle">{item.Title}</h2>
                <div className="GroupMembers">{item.Users.length + " members"}</div>
            </div>
            {children}
        </div>
    );
}

export { DialogCard, GroupCard, ChannelCard };