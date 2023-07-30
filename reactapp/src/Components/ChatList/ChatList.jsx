import React, { useState, useEffect } from 'react';
import DialogCard from "../Cards/Dialog/DialogCard"
import GroupCard from "../Cards/Group/GroupCard"
import { ImagesUrl } from '../../Links';
import "./ChatList.scss"
function ChatList({ connection, chatData, onlineUsers, currentChatId, setCurrentChatId }) {
    const [listMode, setListMode] = useState("Filter");
    const [fieldInput, setFieldInput] = useState("");
    const [foundData, setFoundData] = useState(null);
    const [timeoutId, setTimeoutId] = useState(null);
    function Filter(item) {
        if (item.Companion && item.Companion.Name && typeof item.Companion.Name === 'string' ) {
            return item.Companion.Name.toLowerCase().includes(fieldInput.toLowerCase());
        }
        else if (item.Title) {
            return item.Title.toLowerCase().includes(fieldInput.toLowerCase());
        }
    }

    const [isClickable, setIsClickable] = useState(true);
    const CreateDialog = (itemId) => {
        if (isClickable) {

            setIsClickable(false);
            connection.invoke("CreateDialog", itemId);
            setTimeout(() => {
                setIsClickable(true);
            }, 3000);
        }
    };

    useEffect(() => {
        connection.on('chatsSearched', (data) => {
            console.log(JSON.parse(data));
            setFoundData(JSON.parse(data));
        });
    }, []);

    useEffect(() => {
        if (fieldInput === "") {
            setFoundData(null);
        }
        if (listMode === "Search" && fieldInput !== "") {

            if (timeoutId) {
                clearTimeout(timeoutId);
            }

            const timeout = setTimeout(() => {
                connection.invoke("SearchChats", fieldInput);
            }, 1000);

            setTimeoutId(timeout);
        }
    }, [fieldInput]);

    return (
        <div className="ListWrapper">
            <div className="Bar">
                <input type="text" className="BarField" onChange={(e) => setFieldInput(e.target.value)} value={fieldInput}></input>
                <div className="BarBtns">
                    <button className={`btn ${listMode === "Filter" ? "active" : ""}`} onClick={() => { setListMode("Filter"); setFieldInput("")}}>List </button>
                    <button className={`btn ${listMode === "Search" ? "active" : ""}`} onClick={() => { setListMode("Search"); setFieldInput("") }}>Search </button>
                </div>
            </div>
            <div className="List">
                {listMode === "Filter" ? (
                    chatData.chats.length > 0 ? (
                        chatData.chats.filter(Filter).map((item) => {
                            if (item.Companion) {
                                return <DialogCard key={item.Id} item={item} onlineUsers={onlineUsers} func={setCurrentChatId } />;
                            } else if (item.Users) {
                                return <GroupCard key={item.Id} item={item} onlineUsers={onlineUsers} connection={connection} setCurrentChatId={setCurrentChatId} />;
                            }
                            return null;
                        })
                    ) : (
                        <div>empty</div>
                    )
                ) : listMode === "Search" ? (
                    <>
                        <div className="FoundUsers">
                            {foundData && foundData.Users && foundData.Users.length > 0 ? (
                                    foundData.Users.map((item) => {
                                        
                                    return <DialogCard key={item.Id} item={item} onlineUsers={onlineUsers} func={CreateDialog} />;
                                })
                            ) : (
                                <div>empty</div>
                            )}
                        </div>
                        <div className="FoundGroups">
                            <div>in development</div>
                        </div>
                    </>
                ) : (
                    <div>empty</div>
                )}
            </div>
        </div>
    );
}
export default ChatList;