import React from 'react';
import { AvatarUrl } from "../../../Links";
import "./DialogCard.scss"

function SearchDialogCard({ item, onlineUsers, connection, setCurrentChat }) {



    return (<div key={item.Id} className="DialogItem" onClick={() => setCurrentChat(item.Id)}>
        <div className="PhotoBox">
            <img
                className="CompanionPhoto"
                src={AvatarUrl + item.Photo}
                alt="Avatar"
            />
            <div className={`marker ${onlineUsers.includes(item.Id) ? "online" : "offline"}`} ></div>
        </div>
        {item.Name}
    </div>
    );
}

export default SearchDialogCard;