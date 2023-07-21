import React, { useEffect,useState }  from 'react';
import { AvatarUrl, MediaUrl } from "../../Links"
import "./MessageItem.scss"

function MessageItem({ item, chatData, currentChat, onlineUsers }) {
    const chat = chatData.chats.find((element) => element.Id === currentChat);
    const [sender, setSender] = useState(null);

    useEffect(() => {
        const foundSender = chat?.Users?.find((element) => element.Id === item.sender);
        if (!foundSender) {
            if (item.sender === chat.Companion.Id) {
                setSender(chat.Companion);
            } else if (item.sender === localStorage.getItem("currentUser")) {
                console.log(chatData.user);
                setSender(chatData.user);
            }
        } else {
            setSender(foundSender);
        }
    }, [chat, chatData, item.sender]);
    
    function ConvertTme(a) {
        const dateTime = new Date(a);
        const hours = dateTime.getHours();
        const minutes = dateTime.getMinutes();
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }

    return (
        <div key={item.Id} className={`MessageItem ${item.sender === localStorage.getItem("currentUser") ? "User" : ""}`}>
            {(sender || chat.Companion) && (
                <div className="PhotoBox">
                    <img
                        className="SenderPhoto"
                        src={AvatarUrl + (sender ? sender.Photo : chat.Companion ? chat.Companion.Photo : "default.jpg")}
                        alt="Avatar"
                    />
                </div>
            )}
            <div className="SenderName">{sender ? sender.Name : chat.Companion ? chat.Companion.Name :"undefined"}</div>
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
                        <div key={file.Id} className="MessageMediaItem">
                            {file.Name}
                        </div>
                    ))}
                </div>
            )}
            <p className="MessageContent">{item.content}</p>
            <p className="MessageTime">{ConvertTme(item.time)}</p>
        </div>
    );
}

export default MessageItem;