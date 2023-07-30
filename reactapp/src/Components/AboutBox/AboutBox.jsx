import React, { useEffect, useState } from 'react';
import FileItem from '../FileItem/FileItem';
import Modal from "../Modal/Modal";
import "./AboutBox.scss"
import DialogCard from '../Cards/Dialog/DialogCard';
 
function AboutBox({ currentChat, onlineUsers, connection, chatData, setCurrentChatId }) {
    const [aboutBox, setAboutBox] = useState("Files");
    const [inviteModal, setInviteModal] = useState(false);
    const [leaveModal, setLeaveModal] = useState(false);

    function handleInviteModal() {
        setInviteModal(!inviteModal);

    }

    function handleInvite(userId) {
        if (currentChat && currentChat.Id) {
            connection.invoke("Invite", userId, currentChat.Id)
        } else {
            console.error("currentChat is not properly initialized or does not have an 'Id' property.");
        }
    }

    function handleLeaveModal() {
        setLeaveModal(!leaveModal);
    }

    function handleLeave() {
        connection.invoke("Leave", currentChat.Id);
        setCurrentChatId(null);

        handleLeaveModal();
    }

    return (
        <>
            <Modal closeModal={handleInviteModal} open={inviteModal} additionalClass="invite-friend">
                <div className="InviteModalWrapper">
                    {chatData && currentChat && chatData.chats.map((item) => {
                        if (item.Companion && currentChat.Users && !currentChat.Users.some((u) => u.Id === item.Companion.Id)) {
                            return (
                                <DialogCard key={item.Id } item={item.Companion} onlineUsers={onlineUsers} func={handleInvite }></DialogCard>
                            );
                        } 
                    })
                    }
                </div>
            </Modal>
            <Modal closeModal={handleLeaveModal} open={leaveModal} additionalClass="leave">
                {currentChat &&
                    <div className="LeaveModalWrapper">
                        <p>Do you want to leave the "{currentChat.Title}" group? </p>
                        <button className="yesButton" onClick={() => handleLeave() }>Yes</button>
                        <button className="noButton" onClick={() => handleLeaveModal()}>No</button>
                    </div>}
            </Modal>
            <div className="aboutBox">
                <div className="aboutButtonsTop">
                    {currentChat && !currentChat.Companion && (
                        <>
                            <button
                                className={aboutBox === "Files" ? "active" : ""}
                                onClick={() => setAboutBox("Files")}
                            >
                                Files
                            </button>
                            <button
                                className={aboutBox === "Members" ? "active" : ""}
                                onClick={() => setAboutBox("Members")}
                            >
                                Members
                            </button>
                        </>
                    )}
                </div>

                {chatData && currentChat && (
                    <div className="aboutContent">
                        {aboutBox === "Files" ? (
                            currentChat.Messages.map((item) => {
                                return (
                                    item.Files && item.Files.length > 0 && (
                                        <div key={item.Id}>
                                            {item.Files.map((file) => {
                                                return (
                                                    <FileItem key={file.Id} file={file} />
                                                )
                                            })}
                                        </div>
                                    )
                                );
                            })
                        ) : !currentChat.Companion && aboutBox === "Members" ? (
                            <div className="membersSection">
                                    {currentChat.Users && currentChat.Users.length > 0 && currentChat.Users.map((item) => {
                                        return (<DialogCard
                                            key={item.Id}
                                            item={item}
                                            onlineUsers={onlineUsers}
                                            func={(userId) => {
                                                const filteredChats = chatData.chats.filter((chat) => chat.Companion && chat.Companion.Id === userId);
                                                if (filteredChats.length > 0) {
                                                    setCurrentChatId(filteredChats[0].Id);
                                                }
                                                else {
                                                    connection.invoke("CreateDialog", userId);
                                                }
                                                setAboutBox("Files");
                                        }}></DialogCard>)
                                })

                                }
                            </div>
                        ) : (
                            <></>
                        )}
                        {!currentChat.Companion ? (
                            <div className="aboutButtonsBot">
                                <button className="inviteButton" onClick={() => handleInviteModal()}>
                                    Invite
                                </button>
                                <button className="leaveButton" onClick={() => handleLeaveModal()}>
                                    Leave
                                </button>
                            </div>
                        ) : (
                            <></>
                        )}

                    </div>
                )}
            </div>
        </>
    );
};

export default AboutBox;