import React, { useEffect, useState, useRef, useMemo } from 'react';
import axios from 'axios';
import MessageItem from "../../Components/MessageItem/MessageItem";
import AttachMediaModal from "../../Components/Modals/AttachMediaModal/AttachMediaModal";
import AttachedMedia from "../../Components/AttachedMedia/AttachedMedia";
import MessageBox from "../../Components/MessageBox/MesageBox"
import ChatRight from "../ChatRight/ChatRight";
import { SendMessageUrl } from "../../Links";
import { MarkAsSeen } from "../../Utilities/signalrMethods"
import "./ChatMiddle.scss";

function ChatMiddle({ connection, chatData, onlineUsers, currentChatId, setCurrentChatId } ) {
    const [currentChat, setCurrentChat] = useState(null);
    const [mesText, setMesText] = useState("");
    const [mesFiles, setMesFiles] = useState([]);
    const [modal, setModal] = useState(false);
    

    useEffect(() => {
        if (chatData) {
            setCurrentChat(chatData.chats.find((element) => element.Id === currentChatId));
        }
    }, [currentChatId, chatData])

    const handleDrop = (event) => {
        const files = event.dataTransfer.files;
        
        Array.from(files).forEach((file) => {
            setMesFiles(mesFiles=>[...mesFiles,file]);
        });
        setModal(false);
    };
    const handleBrowseFile = (e) => {
        const files = e.target.files;
        if (files) {
            Array.from(files).forEach((file) => {
                setMesFiles(mesFiles => [...mesFiles, file]);
            });
        }
        setModal(false);
    };

    async function SendMessage() {
        if (mesText.length > 0 || mesFiles.length > 0) {
            const headers = {
                Authorization: `Bearer ` + localStorage.getItem('accessToken'),
                ContentType: 'application/x-www-form-urlencoded'
            };
            const formData = new FormData();
            formData.append('AccessToken', localStorage.getItem("accessToken"));
            formData.append('ChatId', currentChatId);
            formData.append('Message', mesText);
            for (let i = 0; i < mesFiles.length; i++) {
                formData.append('Attachments', mesFiles[i]);
            }
            try {
                if(currentChat?.Messages?.length>0) MarkAsSeen(connection, currentChat.Id, currentChat.Messages[currentChat.Messages.length - 1].Id);
                await axios.post(SendMessageUrl, formData, { headers });
                setMesFiles([]);
                setMesText("");
            } catch (error) {
                console.error('Error sending message:', error);
            }
        }
    }

    function isPublisher() {
        const userId = localStorage.getItem("currentUser");
        return currentChat.Users ? currentChat.Users.some(p => p.Id === userId && p.Role!=="Reader") : true;
    }

    return (
        <>
            <AttachMediaModal
                inputFileOnChange={handleBrowseFile}
                inputOnDropEvent={handleDrop}
                closeModal={() => {
                    setModal(false);
                }}
                open={modal}
                inputText="Drop file here"
                multiple={true}
            /> 
            <div className="chatMiddle">
                <div className="MessagesWrapper">
                    <MessageBox currentChat={currentChat} chatData={chatData} connection={connection} setCurrentChatId={setCurrentChatId} />
                    {currentChat && (currentChat.Type !== "Channel" ||  isPublisher()) && <>
                    <AttachedMedia mesFiles={mesFiles} setMesFiles={setMesFiles} />
                    <div className="inputBox">
                            <input className="inputField" value={mesText} onChange={(e) => setMesText(e.target.value)} />
                            <div className="inputButtons">
                                <button className="attachButton" onClick={() => setModal(true)}>Attach</button>
                                <button className="sendButton" onClick={() =>  SendMessage()}>Send</button>
                            </div>
                        </div>
                    
                    </>}
                </div>
                <ChatRight currentChat={currentChat} onlineUsers={onlineUsers}  connection={connection} chatData={chatData} setCurrentChatId={setCurrentChatId}></ChatRight>
            </div>
        </>
    );
}

export default ChatMiddle;