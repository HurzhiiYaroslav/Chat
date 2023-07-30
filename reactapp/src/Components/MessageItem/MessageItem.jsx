import React, { useEffect,useState }  from 'react';
import { AvatarUrl, MediaUrl } from "../../Links"
import FileItem from "../FileItem/FileItem";
import "./MessageItem.scss"

function MessageItem({ item, chatData, currentChat, onlineUsers }) {
    const [sender, setSender] = useState(null);

    useEffect(() => {
        const foundSender = currentChat?.Users?.find((element) => element.Id === item.sender);
        if (currentChat && currentChat.Companion && !foundSender) {
            if (item.sender === currentChat.Companion.Id) {
                setSender(currentChat.Companion);
            } else if (item.sender === localStorage.getItem("currentUser")) {
                setSender(chatData.user);
            }
        } else if (foundSender) {
            setSender(foundSender);
        }
    }, [currentChat, chatData, item.sender]);
    
    function ConvertTme(a) {
        const dateTime = new Date(a);
        const hours = dateTime.getHours();
        const minutes = dateTime.getMinutes();
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }

    return (
        <div key={item.Id} className={`MessageItem ${item.sender === localStorage.getItem("currentUser") ? "User" : ""}`}>
            {(sender || currentChat.Companion) && (
                <div className="PhotoBox">
                    <img
                        className="SenderPhoto"
                        src={AvatarUrl + (sender ? sender.Photo : currentChat.Companion ? currentChat.Companion.Photo : "default.jpg")}
                        alt="Avatar"
                    />
                </div>
            )}
            <div className="SenderName">{sender ? sender.Name : currentChat.Companion ? currentChat.Companion.Name :"undefined"}</div>
            {item.Files.length === 1 && item.Files[0].Type.includes("image") && (
                <div className="AttachedImage">
                    <img
                        className="Image"
                        src={MediaUrl + item.Files[0].Path}
                        alt="AttachedImage"
                    />
                </div>
            )}

            {item.Files && item.Files.length>0 &&(item.Files.length > 1 || !item.Files[0].Type.includes("image")) && (
                <div className="MessageMediaWrapper">
                    {item.Files.map((file) => (
                        <FileItem key={file.Id } file={file} />
                    ))}
                </div>
            )}
            <p className="MessageContent">{item.content}</p>
            <p className="MessageTime">{ConvertTme(item.time)}</p>
        </div>
    );
}

export default MessageItem;