import React from 'react';
import {MediaUrl } from "../../../Links";
import "./GroupCard.scss"

function GroupCard({ item, onlineUsers, setCurrentChatId }) {
    const renderLogo = () => {
        if (item.Logo.startsWith('#')) {
            return (
                <div
                    className="Logo"
                    style={{
                        backgroundColor: item.Logo
                    }}
                />
            );
        } else {
            return <img className="Logo" src={ MediaUrl +  item.Logo} alt="Group Logo" />;
        }
    };

    const countOnline = () => {
        return item.Users.filter(i => onlineUsers.includes(i.Id)).length;
    }

    return (
        <div className="GroupItem" onClick={() => {setCurrentChatId(item.Id) } }>
            {renderLogo()}
            <div className="GroupInfo">
                <h2 className="GroupTitle">{item.Title}</h2>
                <div className="GroupMembers">{countOnline() + "/" + item.Users.length + " on-line"}</div>
            </div>
        </div>
    );
};

export default GroupCard;