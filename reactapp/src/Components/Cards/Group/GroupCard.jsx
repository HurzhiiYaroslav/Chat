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

    return (
        <div className="GroupItem" onClick={() => {setCurrentChatId(item.Id) } }>
            {renderLogo()}
            <div className="GroupInfo">
                <h2 className="GroupTitle">{item.Title}</h2>
                <div className="GroupMembers">{item.Users.length} members</div>
            </div>
        </div>
    );
};

export default GroupCard;