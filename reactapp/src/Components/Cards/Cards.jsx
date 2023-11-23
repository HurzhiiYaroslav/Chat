import React from 'react';
import { Menu, Item, Separator, Submenu, useContextMenu } from 'react-contexify';
import { AvatarUrl } from "../../Links";
import ChatCM from '../ContextMenus/ChatCM';
import MemberCM from '../ContextMenus/MemberCM';
import { ContextMenuIcon }  from "../../assets/icons"
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

function DialogCard({ item, onlineUsers, func, extraClasses, contextMenu = null, chat = null, connection, children }) {
    const { show } = useContextMenu({
        id: contextMenu + "Menu" + item.Id
    });
    function handleCM(e) {
        show({
            event: e,
        });
    }
    const user = item.Companion ? item.Companion : item;
    const cardClasses = `DialogItem ${extraClasses}`;
    function isOnline(userId) {
        return onlineUsers.includes(userId);
    }

    return (
        <>
            {contextMenu ==="Chat" && <ChatCM MENU_ID={"ChatMenu" + item.Id} chat={item} connection={connection} />}
            {contextMenu === "Member"  && <MemberCM MENU_ID={"MemberMenu" + item.Id} member={item} chat={chat} connection={connection} />}
            <div key={user.Id} className={cardClasses} onClick={() => func(item.Id)}>
                <div className="PhotoBox">
                    <Logo logo={user.Photo} />
                    <div className={onlineUsers && `marker ${isOnline(user.Id) ? "online" : "offline"}`}></div>
                </div>
                <label className="CompanionName">{user.Name}</label>
                {children}
                {contextMenu && item?.Role !== "Owner" && (<div className="chatOptions" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleCM(e) }}><ContextMenuIcon /></div>)}
            </div>
        </>
    );
}

function GroupCard({ item, onlineUsers, setCurrentChatId, extraClasses, contextMenu = null, connection = { connection } , children }) {
    const { show } = useContextMenu({
        id: contextMenu + "Menu" + item.Id
    });
    function handleCM(e) {
        show({
            event: e,
        });
    }
    const countOnline = () => item.Users.filter(i => onlineUsers.includes(i.Id)).length;
    const cardClasses = `GroupItem ${extraClasses}`;
    return (
        <>
            <ChatCM MENU_ID={"ChatMenu" + item.Id} chat={item} connection={connection} />
        <div className={cardClasses} onClick={() => setCurrentChatId(item.Id)}>
            <Logo logo={item.Logo} />
            <div className="GroupInfo">
                <h2 className="GroupTitle">{item.Title}</h2>
                <div className="GroupMembers">{countOnline() + "/" + item.Users.length + " on-line"}</div>
            </div>
            {children}
                {contextMenu && (<div className="chatOptions" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleCM(e) }}><ContextMenuIcon /></div>)}

            </div>
        </>
    );
}

function ChannelCard({ item, func, extraClasses, contextMenu = null, connection = { connection }, children }) {
    const { show } = useContextMenu({
        id: contextMenu + "Menu" + item.Id
    });
    function handleCM(e) {
        show({
            event: e,
        });
    }
    const cardClasses = `ChannelItem ${extraClasses}`;
    return (
        <>
            <ChatCM MENU_ID={"ChatMenu" + item.Id} chat={item} connection={connection} />
            <div className={cardClasses} onClick={() => func(item.Id)}>
                <Logo logo={item.Logo} />
                <div className="GroupInfo">
                    <h2 className="GroupTitle">{item.Title}</h2>
                    <div className="GroupMembers">{item.Users.length + " members"}</div>
                </div>
                {children}
                {contextMenu && (
                    <div className="chatOptions" onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleCM(e);
                    }}>
                        <ContextMenuIcon/>
                    </div>
                )}

        </div>
        </>
    );
}

export { DialogCard, GroupCard, ChannelCard };