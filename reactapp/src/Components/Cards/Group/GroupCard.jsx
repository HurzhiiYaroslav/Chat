import React from 'react';
import "./GroupCard.scss"

function GroupCard({ item, connection, setCurrentChatId }) {
    const handleClick = () => {
        setCurrentChatId(item.Id);
    };

    return ( 
        <div className="GroupItem" onClick={handleClick}>
            <div className="GroupTitle">{item.Title}</div>
            <div className="GroupMembers">{item.Users.length} members</div>
        </div>
    );
}

export default GroupCard;