import React, { useEffect,useState,useMemo }  from 'react';
import { AvatarUrl, MediaUrl } from "../../Links"
import FileItem from "../FileItem/FileItem";
import MessageContext from '../Modals/MessageContext/MessageContext';
import { getCurrentUserRole } from "../../Utilities/chatFunctions"
import "./MessageItem.scss"

function MessageItem({ item, chatData, currentChat, connection, setCurrentChatId }) {
    const [contextModal, setContextModal] = useState(false);
    const [sender, setSender] = useState(null);

    const currentUser = useMemo(() => localStorage.getItem("currentUser"), []);

    function handleContextModal() {
        setContextModal(!contextModal);
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
                        loading="lazy"
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
        const lastSeen = new Date(currentChat.LastSeenMessage.time);
        const itemTime = new Date(item.time);
        return itemTime <=lastSeen
    }

    useEffect(() => {
        const foundSender = currentChat?.Users?.find((element) => element.Id === item.sender);
        if (currentChat && currentChat.Companion && !foundSender) {
            if (item.sender === currentChat.Companion.Id) {
                setSender(currentChat.Companion);
            } else if (item.sender === currentUser) {
                setSender(chatData.user);
            }
        } else if (foundSender) {
            setSender(foundSender);
        }
    }, [currentChat, chatData, item.sender, currentUser]);


    return (
        <>
            {currentChat && currentChat.Type !== "Dialog" && (
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

            <div id={item.Id} onClick={handleContextModal} className={`MessageItem ${item.sender === currentUser ? "User" : ""}`}>
                {(sender || currentChat.Companion) && (
                    <div className="PhotoBox" >
                        <img
                            className="SenderPhoto"
                            src={AvatarUrl + (sender ? sender.Photo : currentChat.Companion ? currentChat.Companion.Photo : "default.jpg")}
                            alt="Avatar"
                            loading="lazy"
                        />
                    </div>
                )}
                <div className="SenderName">{sender ? sender.Name : currentChat.Companion ? currentChat.Companion.Name : "undefined"}</div>
                {renderAttachedImages()}
                {renderMessageMedia()}
                {item.content && <p className="MessageContent">{item.content}</p>}
                <div className="footer">
                    <p className="SeenStatus">{isSeen(item) && (<span className="icon">&#10003;</span>)}</p>
                    <p className="MessageTime">{ConvertTime(item.time)}</p>
                </div>
                
            </div>
        </>
    );
}

export default MessageItem;