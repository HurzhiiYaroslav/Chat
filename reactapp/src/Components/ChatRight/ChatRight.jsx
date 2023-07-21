import React, { useEffect, useState, useRef } from 'react';
import MessageItem from "../MessageItem/MessageItem";
import AttachMediaModal from "../AttachMediaModal/AttachMediaModal";
import AttachedMedia from "../AttachedMedia/AttachedMedia";
import axios from 'axios';
import { SendMessageUrl } from "../../Links";
import "./ChatRight.scss"

function ChatRight({ connection, chatData, onlineUsers, currentChat, setCurrentChat } ) {
    const scrollRef = useRef()
    useEffect(() => { scrollRef.current.scrollTop = scrollRef.current.scrollHeight }, [])

    const [mesText, setMesText] = useState("");
    const [mesFiles, setMesFiles] = useState([]);

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
        const formData = new FormData();
        formData.append('Sender', localStorage.getItem("currentUser"));
        formData.append('Chat', currentChat);
        formData.append('Message', mesText);
        for (let i = 0; i < mesFiles.length; i++) {
            formData.append('file', mesFiles[i]);
            formData.append('type', mesFiles[i].type);
        }
        axios.post(SendMessageUrl, formData);
        setMesFiles(null);
        setMesText(null);
    }

    useEffect(() => {
        if (Array.isArray(mesFiles)) {
            console.log(mesFiles.length)
            mesFiles.map((item) => console.log(item));
        } else {
            console.log("mesFiles is not an array or is not defined");
        }
    }, [mesFiles]);

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
                        {chatData && chatData.chats && chatData.chats.find((element) => element.Id === currentChat)?.Messages.length > 0 ? (
                            chatData.chats.find((element) => element.Id === currentChat).Messages.map((item) => (
                                <MessageItem key={item.id} item={item} chatData={chatData} currentChat={currentChat} onlineUsers={onlineUsers} />
                            ))
                        ) : (
                            <div>empty</div>
                        )}
                    </div>
                    {currentChat && <>
                    <AttachedMedia mesFiles={mesFiles} setMesFiles={setMesFiles} />
                    <div className="inputBox">
                        <input className="inputField" value={mesText} onChange={(e) => setMesText(e.target.value)} />
                        <button className="attachButton" onClick={() => setModal(true)}>Attach</button>
                        <button className="sendButton" onClick={()=>SendMessage() }>Send</button>
                        </div>
                    
                    </>}
                </div>
                <div className="aboutBox">some inf</div>
            </div>
        </>
    );
}

export default ChatRight;