import React, { useEffect, useState } from 'react';
import FileItem from '../FileItem/FileItem';
import Modal from "../Modal/Modal";
import DoYouWantModal from "../DoYouWantModal/DoYouWantModal";
import DialogCard from '../Cards/Dialog/DialogCard';
import {MediaUrl } from "../../Links";
import "./AboutBox.scss"
 
function AboutBox({ currentChat, onlineUsers, connection, chatData, setCurrentChatId }) {
    const [aboutBox, setAboutBox] = useState("Files");
    const [inviteModal, setInviteModal] = useState(false);
    const [leaveModal, setLeaveModal] = useState(false);
    const [kickModal, setKickModal] = useState(false);
    const [userToKick, setUserToKick] = useState(false);

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

    function handleKick(id) {
        connection.invoke("Kick", currentChat.Id,id);

        handleKickModal();
    }

    function handleKickModal(item) {
        setKickModal(!kickModal);
        setUserToKick(item);

    }

    const renderButton = (item) => {
        if (currentChat.CreatorId === item.Id) {
            return (
                <div style={{ position: 'absolute', top: '0px', right: '4px', color: 'green', fontWeight: 'bold' }}>Creator</div>
            );
        } else if (currentChat.CreatorId === localStorage.getItem("currentUser")) {
            return (<button onClick={(e) => { e.stopPropagation(); handleKickModal(item) }}
                style={{
                    position: 'absolute',
                    bottom: '2px',
                    right: '4px',
                    backgroundColor: 'red',
                    borderRadius: '5px',
                    color: 'white',
                    fontWeight: 'bold',
                    border: 'none',
                    cursor: 'pointer',
                }}
            >
                Kick
            </button>);
        }
    };

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
            { currentChat &&
                <>
                    <DoYouWantModal
                        closeModal={handleLeaveModal}
                        open={leaveModal}
                        action={handleLeave}
                    text={`to leave the "${currentChat.Title}" group`} />
                {userToKick && (<DoYouWantModal
                    closeModal={handleKickModal}
                    open={kickModal}
                    action={() => handleKick(userToKick.Id)}
                    text={`to kick "${userToKick.Name}" `} />) }
                    
                </>
            }
            <div className="aboutBox">
            <div className="aboutInfo">
                    {currentChat && !currentChat.Companion && (
                    <><div className="aboutLogoWrapper">
                        {currentChat && !currentChat.Companion ? (
                            currentChat.Logo.startsWith('#') ? (
                                <div
                                    className="aboutLogo"
                                    style={{
                                        backgroundColor: currentChat.Logo
                                    }} />
                            ) : (
                                        <img className="aboutLogo" src={MediaUrl + currentChat.Logo} alt="Group Logo" />
                            )
                        ) : null}
                        <div className="aboutTitle">{currentChat.Title}</div>
                        </div><div className="aboutDescription">{currentChat.Description}</div></>
                    )}
            </div>
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
                        {currentChat.Companion || aboutBox === "Files" ? (
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
                                            }}>{renderButton(item) }
                                        </DialogCard>)
                                })

                                }
                            </div>
                        ) : (
                            <></>
                        )}

                    </div>
                )}
                {currentChat && !currentChat.Companion ? (
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
        </>
    );
};

export default AboutBox;