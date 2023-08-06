import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import MessageItem from "../MessageItem/MessageItem";
import AttachMediaModal from "../AttachMediaModal/AttachMediaModal";
import AttachedMedia from "../AttachedMedia/AttachedMedia";
import AboutBox  from "../AboutBox/AboutBox";
//import SearchDialogCard from "../Cards/Dialog/SearchDialogCard"
import { SendMessageUrl } from "../../Links";
import "./ChatRight.scss"

function ChatRight({ connection, chatData, onlineUsers, currentChatId, setCurrentChatId } ) {
    const scrollRef = useRef();
    const [currentChat, setCurrentChat] = useState(null);
    const [mesText, setMesText] = useState("");
    const [mesFiles, setMesFiles] = useState([]);

    useEffect(() => {
                 
        setCurrentChat(chatData.chats.find((element) => element.Id === currentChatId));
        //scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }, [currentChatId, chatData])

    const [modal, setModal] = useState(false)
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

    function SendMessage() {
        if (mesText.length > 0 || mesFiles.length > 0) {
            const headers = {
                Authorization: `Bearer ` + localStorage.getItem('accessToken'),
                'Content-Type': 'multipart/form-data',
            };
            const formData = new FormData();
            formData.append('Sender', localStorage.getItem("currentUser"));
            formData.append('Chat', currentChatId);
            formData.append('Message', mesText);
            for (let i = 0; i < mesFiles.length; i++) {
                formData.append('file', mesFiles[i]);
                formData.append('type', mesFiles[i].type);
            }
            axios.post(SendMessageUrl, formData, { headers });
            setMesFiles([]);
            setMesText("");
        }
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
            <div className="rightSide">
                <div className="MessagesWrapper">
                    <div className="messageBox" ref={scrollRef}>
                        {chatData && chatData.chats && currentChat?.Messages.length > 0 ? (
                            currentChat.Messages.map((item,index) => {
                                if (item.notification) {
                                    return (<div key={index} className="notification">{item.notification}</div>)
                                }
                                else {
                                    return (<MessageItem key={item.Id} item={item} chatData={chatData} currentChat={currentChat} onlineUsers={onlineUsers} />)
                                }
                            })
                        ) : (
                            <div>empty</div>
                        )}
                    </div>
                    {currentChatId && <>
                    <AttachedMedia mesFiles={mesFiles} setMesFiles={setMesFiles} />
                    <div className="inputBox">
                            <input className="inputField" value={mesText} onChange={(e) => setMesText(e.target.value)} />
                            <div className="inputButtons">
                                <button className="attachButton" onClick={() => setModal(true)}>Attach</button>
                                <button className="sendButton" onClick={() => SendMessage()}>Send</button>
                            </div>
                        </div>
                    
                    </>}
                </div>
                <AboutBox currentChat={currentChat} onlineUsers={onlineUsers} connection={connection} chatData={chatData} setCurrentChatId={setCurrentChatId}></AboutBox>
            </div>
        </>
    );
}

export default ChatRight;