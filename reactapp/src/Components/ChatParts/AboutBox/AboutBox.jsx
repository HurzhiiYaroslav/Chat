import React, { useState, useMemo } from 'react';
import FileItem from '../../FileItem/FileItem';
import Modal from "../../General/Modal/Modal";
import DoYouWantModal from "../../Modals/DoYouWantModal/DoYouWantModal";
import DialogCard from "../../Cards/Dialog/DialogCard";
import { MediaUrl } from "../../../Links";
import "./AboutBox.scss"

function AboutBox({ currentChat, onlineUsers, connection, chatData, setCurrentChatId }) {
    const [aboutBox, setAboutBox] = useState("Files");
    const [inviteModal, setInviteModal] = useState(false);
    const [leaveModal, setLeaveModal] = useState(false);
    const [kickModal, setKickModal] = useState(false);
    const [userToKick, setUserToKick] = useState(false);
    const [addSpecialModal, setAddSpecialModal] = useState(false);

    const [role, setRole] = useState("Publisher");

    const currentUser = localStorage.getItem("currentUser");
    const isAdmin = currentChat && currentChat.Users && currentChat.Users.find(u => u.Id === currentUser).Role === "Admin";

    const publicity = (currentChat && currentChat.isPublic) ? ("Public") : ("non-Public");

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
        connection.invoke("Kick", currentChat.Id, id);
        handleKickModal();
    }

    function handleKickModal(item) {
        setKickModal(!kickModal);
        setUserToKick(item);

    }

    function handleAddSpecial(id) {
        connection.invoke(`Add${role}`, currentChat.Id, id);

        handleAddSpecialModal();
    }

    function handleAddSpecialModal(item) {
        setAddSpecialModal(!addSpecialModal);
    }

    const renderRole = (item) => {
        if (currentChat.CreatorId === item.Id) {
            return (
                <div style={{ position: 'absolute', top: '0px', right: '4px', color: 'green', fontWeight: 'bold' }}>Creator</div>
            );
        }
        else if (item.Role === "Publisher") {
            return (
                <div style={{ position: 'absolute', top: '0px', right: '4px', color: 'purple', fontWeight: 'bold' }}>Publisher</div>
            );
        }
        else if (item.Role === "Admin") {
            return (
                <div style={{ position: 'absolute', top: '0px', right: '4px', color: 'blue', fontWeight: 'bold' }}>Admin</div>
            );
        }
    };

    const renderButton = (item) => {
        if (isAdmin && item.Role !== "Admin") {
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

    const OpenOrCreateDialod = (userId) => {
        const filteredChats = chatData.chats.filter((chat) => chat.Companion && chat.Companion.Id === userId);
        if (filteredChats.length > 0) {
            setCurrentChatId(filteredChats[0].Id);
        } else {
            connection.invoke("CreateDialog", userId);
        }
        setAboutBox("Files");
    }

    const renderedMembersSection = useMemo(() => {
        if (currentChat && currentChat.Users && currentChat.Users.length > 0) {
            return currentChat.Users.map((item) => (
                <DialogCard
                    key={item.Id}
                    item={item}
                    onlineUsers={onlineUsers}
                    func={(userId) => OpenOrCreateDialod(userId)}
                    connection={connection}
                >
                    {renderRole(item)}
                    {renderButton(item)}
                </DialogCard>
            ));
        }
        return null;
    }, [currentChat, setAboutBox]);

    const renderedSpecialSection = useMemo(() => {
        if (currentChat && currentChat.Users && currentChat.Users.length > 0) {
            return currentChat.Users.filter(p => p.Id !== currentChat.CreatorId && p.Role === role).map((item) => (
                <DialogCard
                    key={item.Id}
                    item={item}
                    onlineUsers={onlineUsers}
                    func={(userId) => OpenOrCreateDialod(userId)}
                    connection={connection}
                >
                    <button onClick={(e) => { e.stopPropagation(); connection.invoke(`MakeReader`, currentChat.Id, item.Id) }}>Remove</button>
                </DialogCard>
            ));
        }
        return null;
    }, [currentChat, role, onlineUsers]);

    const changePublicity = (chatId) => {
        connection.invoke("ChangePublicity", chatId)
            .then((response) => {

            })
            .catch((error) => {
                console.log(error);
            });

    }

    return (
        <>
            <Modal closeModal={handleInviteModal} open={inviteModal} additionalClass="invite-friend">
                <div className="InviteModalWrapper">
                    {chatData && currentChat && currentChat.Type !== "Dialog" && chatData.chats.map((item) => {
                        if (item.Companion && currentChat.Users && !currentChat.Users.some((u) => u.Id === item.Companion.Id)) {
                            return (
                                <DialogCard key={item.Id} item={item.Companion} onlineUsers={onlineUsers} func={handleInvite} connection={connection}></DialogCard>
                            );
                        }
                    })
                    }
                </div>
            </Modal>
            <Modal closeModal={handleAddSpecialModal} open={addSpecialModal} additionalClass="add-publisher">
                <div className="AddPubModalWrapper">
                    {currentChat && currentChat.Type === "Channel" && currentChat.Users.map((item) => {
                        if (currentChat && !currentChat.Users.some((u) => u.Id === item.Id && u.Role !== "Reader")) {
                            return (
                                <DialogCard key={item.Id} item={item} onlineUsers={onlineUsers} func={handleAddSpecial} connection={connection}></DialogCard>
                            );
                        }
                    })
                    }
                </div>
            </Modal>
            {currentChat &&
                <>
                    <DoYouWantModal
                        closeModal={handleLeaveModal}
                        open={leaveModal}
                        action={handleLeave}
                        text={`to leave the "${currentChat.Title} " ${currentChat.Type}`} />
                    {userToKick && (<DoYouWantModal
                        closeModal={handleKickModal}
                        open={kickModal}
                        action={() => handleKick(userToKick.Id)}
                        text={`to kick "${userToKick.Name}" `} />)}

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
                    {currentChat && currentChat.Type !== "Dialog" && (
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
                            {currentChat.Type === "Channel" && currentChat.CreatorId === currentUser && (
                                <button
                                    className={aboutBox === "Management" ? "active" : ""}
                                    onClick={() => setAboutBox("Management")}
                                >
                                    Manage
                                </button>
                            )}

                        </>
                    )}
                </div>

                {chatData && currentChat && (
                    <div className="aboutContent">
                        {currentChat.Type === "Dialog" || aboutBox === "Files" ? (
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
                        ) : currentChat && currentChat.Type !== "Dialog" ? (
                            <>
                                {aboutBox === "Members" ? (
                                    <div className="membersSection">
                                        {renderedMembersSection}
                                    </div>
                                ) : aboutBox === "Management" ? (
                                    <div className="managementSection">
                                        <div className="managementSpecialsBtns">
                                            <button className={`btn ${role === "Publisher" ? "active" : ""}`} onClick={() => { setRole("Publisher") }}>Publishers </button>
                                            <button className={`btn ${role === "Admin" ? "active" : ""}`} onClick={() => { setRole("Admin") }}>Admins </button>
                                        </div>
                                        <div className="manageSpecials">
                                            <label>{role}s:</label>
                                            <div className="specialsSection">
                                                {renderedSpecialSection}
                                            </div>
                                            <button onClick={handleAddSpecialModal}>Add {role.toLowerCase()}</button>
                                        </div>
                                        <div className="managePublicity">
                                            <label className="publicityStatus"
                                            > Publicity:</label>
                                            <div className={"publicityStatus " + publicity}>{publicity}</div>
                                            <button className="changePublicityBtn" onClick={() => changePublicity(currentChat.Id)}>Change</button>
                                        </div>
                                    </div>) : (<></>)
                                }
                            </>
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