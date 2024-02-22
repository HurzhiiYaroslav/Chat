import React, { useEffect, useState, useMemo } from 'react';
import { Menu, Item, Separator, Submenu, useContextMenu } from 'react-contexify';
import { AvatarUrl, MediaUrl } from "../../Links"
import FileItem from "../FileItem/FileItem";
import MessageContext from '../Modals/MessageContext/MessageContext';
import MessageCM from '../ContextMenus/MessageCM';
import MessageTextAndLinkPreview from '../MessageTextAndLinkPreview/MessageTextAndLinkPreview';
import { getCurrentUserRole, getSender } from "../../Utilities/chatFunctions"
import "./MessageItem.scss"
import 'react-contexify/ReactContexify.css';


function MessageItem({ item, chatData, currentChat, connection, setCurrentChatId }) {
    const [sender, setSender] = useState(null);
    const currentUser = useMemo(() => localStorage.getItem("currentUser"), []);

    const [contextModal, setContextModal] = useState(false);
    
    function handleContextModal() {
        setContextModal(!contextModal);
    }

    const MENU_ID = "MessageCM"+item?.Id;

    const { show } = useContextMenu({
        id: MENU_ID
    });

    function handleCM(e) {
        show({
            event: e,
        });
    }

    function ConvertTime(time) {
        const dateTime = new Date(time);
        const hours = dateTime.getHours();
        const minutes = dateTime.getMinutes();
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }

    
    const renderAttachedImages = () => {
        if (item.Files && item.Files.length === 1 && item.Files[0].Type.includes("image")) {
            const image = MediaUrl + item.Files[0].Path;
            return (
                <div className="AttachedImage" onClick={(e) => { window.open(image, '_blank'); e.stopPropagation(); } }>
                    <img
                        className="Image"
                        src={image}
                        alt="AttachedImage"
                    />
                </div>
            );
        }
        return null;
    };

    const renderMessageMedia = () => {
        if (item.Files && item.Files.length > 0 && (item.Files.length > 1 || !item.Files[0].Type.includes("image"))) {
            return (
                <div className="MessageMediaWrapper">
                    {item.Files.map((file) => (
                        <FileItem key={file.Id} file={file} />
                    ))}
                </div>
            );
        }
        return null;
    };

    const isSeen = (item) => {
        if (!currentChat || !currentChat.LastSeenMessage || !item || !item.time) {
            return false;
        }
        const lastSeen = new Date(currentChat.LastSeenMessage.time);
        const itemTime = new Date(item.time);
        return itemTime <= lastSeen;
    };

    useEffect(() => {
        setSender(getSender(currentChat, item, chatData));
    }, [currentChat, chatData, item.sender, currentUser]);


    return (
        <>
            {currentChat && (
                <MessageContext
                    open={contextModal}
                    close={handleContextModal}
                    message={item}
                    sender={sender}
                    userRole={getCurrentUserRole(currentChat)}
                    connection={connection}
                    currentChat={currentChat}
                    chatData={chatData}
                    setCurrentChatId={setCurrentChatId}
                >
                </MessageContext>)}

            {currentChat && (<MessageCM
                MENU_ID={MENU_ID}
                message={item}
                sender={sender}
                userRole={getCurrentUserRole(currentChat)}
                connection={connection}
                currentChat={currentChat}
                chatData={chatData}
                setCurrentChatId={setCurrentChatId}
            ></MessageCM>
               )}

            <div id={item.Id} onClick={(e)=>handleCM(e)} className={`MessageItem ${item.sender === currentUser ? "User" : ""}`}>
                {(sender || currentChat.Companion) && (
                    <div className="PhotoBox" >
                        <img
                            className="SenderPhoto"
                            src={AvatarUrl + (sender ? sender.Photo : currentChat.Companion ? currentChat.Companion.Photo : "default.jpg")}
                            alt="Avatar"
                        />
                    </div>
                )}
                <div className="SenderName">{sender ? sender.Name : currentChat.Companion ? currentChat.Companion.Name : "undefined"}</div>
                {renderAttachedImages()}
                {renderMessageMedia()}
                
                {item.content && <MessageTextAndLinkPreview content={item.content }> </MessageTextAndLinkPreview>}
                <div className="footer">
                    <p className="SeenStatus">{isSeen(item) && (<span className="icon">&#10003;</span>)}</p>
                    <p className="MessageTime">{ConvertTime(item.time)}</p>
                </div>
            </div>
            
        </>
    );
}

export default MessageItem;