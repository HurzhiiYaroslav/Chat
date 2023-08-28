import React, { useState, useEffect } from 'react';
import DialogCard from "../../Cards/Dialog/DialogCard"
import GroupCard from "../../Cards/Group/GroupCard"
import ChannelCard from "../../Cards/Channel/ChannelCard"
import "./ChatList.scss"
function ChatList({ connection, chatData, onlineUsers, setCurrentChatId }) {
    const [listMode, setListMode] = useState("Filter");
    const [fieldInput, setFieldInput] = useState("");
    const [foundData, setFoundData] = useState(null);
    const [timeoutId, setTimeoutId] = useState(null);
    function Filter(item) {
        if (!item || fieldInput==="") {
            return item;
        }
        if (item.Type==="Dialog" && item.Companion && item.Companion.Name && typeof item.Companion.Name === 'string' ) {
            return item.Companion.Name.toLowerCase().includes(fieldInput.toLowerCase());
        }
        else if (item.Type !== "Dialog") {
            return item.Title.toLowerCase().includes(fieldInput.toLowerCase());
        }
        return item;
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

    const JoinChannel = (channelId) => {
        if (isClickable) {
            setIsClickable(false);
            connection.invoke("JoinChannel", channelId)
                .then(() => {
                    setFoundData((foundData) => {
                        const updatedData = foundData.Channels.filter((channel) => channel.Id !== channelId);
                        return {
                            ...foundData,
                            Channels: updatedData,
                        };
                    });
                })
                .catch((error) => {
                    console.error('fail', error);
                });
            setTimeout(() => {
                setIsClickable(true);
            },300);
        }
    }

    useEffect(() => {
        if (fieldInput === "") {
            setFoundData(null);
            return;
        }
        if (listMode === "Search" && fieldInput !== "") {

            if (timeoutId) {
                clearTimeout(timeoutId);
            }

            const timeout = setTimeout(() => {
                connection.invoke("SearchChats", fieldInput)
                    .then((response) => {
                        console.log(response);
                        setFoundData(JSON.parse(response));
                    })
                    .catch((error) => {
                        console.error('fail ', error);
                    });
            }, 1000);

            setTimeoutId(timeout);
        }
    }, [fieldInput]);

    useEffect(() => {
        if (fieldInput === "") {
            setFoundData(null);
            return;
        }
    }, [fieldInput, foundData]);

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
                {chatData && listMode === "Filter" ? (
                    chatData.chats.length > 0 ? (
                        chatData.chats.filter(Filter).map((item) => {
                            if (item.Type==="Dialog") {
                                return <DialogCard key={item.Id} item={item} onlineUsers={onlineUsers} func={setCurrentChatId} connection={ connection} />;
                            } else if(item.Type==="Group") {
                                return <GroupCard key={item.Id} item={item} onlineUsers={onlineUsers}  setCurrentChatId={setCurrentChatId} />;
                            }
                            else if (item.Type === "Channel") {
                                return <ChannelCard key={item.Id} item={item} func={setCurrentChatId} />;
                            }
                            return null;
                        })
                    ) : (
                        <div>empty</div>
                    )
                ) : listMode === "Search" ? (
                    <>
                            <div className="FoundUsers">
                                <p>Users:</p>
                            {foundData && foundData.Users && foundData.Users.length > 0 ? (
                                    foundData.Users.map((item) => {
                                        
                                        return <DialogCard key={item.Id} item={item} onlineUsers={onlineUsers} func={CreateDialog} />;
                                })
                            ) : (
                                <div></div>
                            )}
                        </div>
                            <div className="FoundChannels">
                                <p>Channels:</p>
                                {foundData && foundData.Channels && foundData.Channels.length > 0 ? (
                                    foundData.Channels.map((item) => {
                                        return <ChannelCard key={item.Id} item={item} func={JoinChannel} />;
                                    })
                                ) : (
                                    <div></div>
                                )}
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