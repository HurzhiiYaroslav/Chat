import React from 'react';
import "./GroupCard.scss"

function GroupCard({ item, connection, setCurrentChat }) {
    return( <div key={item.Id} className="GroupItem" onClick={() => setCurrentChat(item.Id)}>
        {item.Title}
        {item.Users.length}
    </div>
    );
}

export default GroupCard;