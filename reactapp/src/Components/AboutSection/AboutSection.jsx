import React, { useEffect, useMemo, useState } from 'react';
import DialogCard from '../Cards/Dialog/DialogCard';
import FileItem from '../FileItem/FileItem';
import UserListModal from '../Modals/UserListModal/UserListModal';
import DoYouWantModal from '../Modals/DoYouWantModal/DoYouWantModal';
import "./AboutSection.scss";

function AboutSection({ chatData, currentChat, connection, userRole, onlineUsers, setCurrentChatId }) {
    const [aboutBox, setAboutBox] = useState("Files");
    const [addSpecialModal, setAddSpecialModal] = useState(false);
    const [role, setRole] = useState("Publisher");
    const [kickModal, setKickModal] = useState(false);
    const [userToKick, setUserToKick] = useState(null);

    const isModer = userRole === "Moder" || userRole === "Owner";
    const publicity = currentChat && currentChat.isPublic ? "Public" : "non-Public";

    const changePublicity = (chatId) => {
        connection.invoke("ChangePublicity", chatId);
    }

    const renderDialogCard = (item, additionalContent) => (
        <DialogCard
            key={item.Id}
            item={item}
            onlineUsers={onlineUsers}
            func={(userId) => OpenOrCreateDialog(userId)}
            connection={connection}
        >
            {additionalContent}
        </DialogCard>
    );

    const renderButton = (item) => {
        if (isModer && item.Role !== "Moder" && item.Role !== "Owner") {
            return (
                <button className="kickBtn" onClick={(e) => { e.stopPropagation(); handleKickModal(item) }}>
                    Kick
                </button>
            );
        }
    };

    const handleKick = (item) => {
        connection.invoke("Kick", currentChat.Id, item.Id);
        handleKickModal(null);
    }

    const handleKickModal = (item) => {
        if (item) {
            setUserToKick(item);
        }
        setKickModal(!kickModal);
    }

    const handleAddSpecialModal = () => {
        setAddSpecialModal(!addSpecialModal);
    }

    const renderRole = (item) => {
        const roleStyles = {};
        let roleColor = '';
        switch (item.Role) {
            case 'Owner':
                roleColor = 'green';
                break;
            case 'Publisher':
                roleColor = 'purple';
                break;
            case 'Moder':
                roleColor = 'blue';
                break;
            default:
                return;
        }
        roleStyles.color = roleColor;
        return (
            <div className="statusBar" style={roleStyles}>
                {item.Role}
            </div>
        );
    };

    const OpenOrCreateDialog = (userId) => {
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
            return currentChat.Users.reverse().map((item) => (
                renderDialogCard(item, (
                    <>
                        {renderRole(item)}
                        {renderButton(item)}
                    </>
                ))
            ));
        }
        return null;
    }, [currentChat, aboutBox]);

    const renderedSpecialSection = useMemo(() => {
        if (currentChat && currentChat.Users && currentChat.Users.length > 0) {
            const filteredUsers = currentChat.Users.filter((p) => p.Role === role);
            return filteredUsers.map((item) => (
                renderDialogCard(item, (
                    <button onClick={(e) => { e.stopPropagation(); connection.invoke(`MakeReader`, currentChat.Id, item.Id) }}>
                        Remove
                    </button>
                ))
            ));
        }
        return null;
    }, [currentChat, role, onlineUsers]);

    const handleAddSpecial = (id) => {
        connection.invoke(`Add${role}`, currentChat.Id, id);
        handleAddSpecialModal();
    }

    useEffect(() => {
        if (currentChat.Type === "Dialog") {
            setAboutBox("Files")
        }
        else if (currentChat.Type === "Group") {
            setRole("Moder");
        }
    }, [currentChat.Type])

    return (
        <>
            {currentChat && currentChat.Users &&
                (<UserListModal open={addSpecialModal}
                    close={handleAddSpecialModal}
                    onClick={handleAddSpecial}
                    list={currentChat.Users.filter((item) => item.Role === "Reader")} />)}
            
            {userToKick && (
                <DoYouWantModal
                    closeModal={handleKickModal}
                    open={kickModal}
                    action={() => handleKick(userToKick)}
                    text={`to kick "${userToKick.Name}" `}
                />
            )}
            <div className="aboutButtonsTop">
                {currentChat && currentChat.Type !== "Dialog" && (
                    <>
                        <button className={aboutBox === "Files" ? "active" : ""} onClick={() => setAboutBox("Files")}>
                            Files
                        </button>
                        <button className={aboutBox === "Members" ? "active" : ""} onClick={() => setAboutBox("Members")}>
                            Members
                        </button>
                        { userRole === "Owner" && (
                            <button className={aboutBox === "Management" ? "active" : ""} onClick={() => setAboutBox("Management")}>
                                Manage
                            </button>
                        )}
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
                                            return <FileItem key={file.Id} file={file} />;
                                        })}
                                    </div>
                                )
                            );
                        })
                    ) : currentChat.Type !== "Dialog" ? (
                        <>
                                {aboutBox === "Members" ? (
                                    <div className="membersSection">{renderedMembersSection}</div>
                                ) : aboutBox === "Management" ? (
                                    <div className="managementSection">
                                        {currentChat.Type === "Channel" && (<div className="managementSpecialsBtns">
                                            <button className={`btn ${role === "Publisher" ? "active" : ""}`} onClick={() => setRole("Publisher")}>
                                                Publishers
                                            </button>
                                            <button className={`btn ${role === "Moder" ? "active" : ""}`} onClick={() => setRole("Moder")}>
                                                Moders
                                            </button>
                                        </div>)}
                                        <div className="manageSpecials">
                                            <label>{role}s:</label>
                                            <div className="specialsSection">{renderedSpecialSection}</div>
                                            <button onClick={handleAddSpecialModal}>Add {role.toLowerCase()}</button>
                                        </div>
                                        {currentChat.Type === "Channel" && (<div className="managePublicity">
                                            <label className="publicityStatus">Publicity:</label>
                                            <div className={"publicityStatus " + publicity}>{publicity}</div>
                                            <button className="changePublicityBtn" onClick={() => changePublicity(currentChat.Id)}>
                                                Change
                                            </button>
                                        </div>)}

                                    </div>
                            ) : <></>}
                        </>
                    ) : <></>}
                </div>
            )}
        </>
    );
}

export default AboutSection;