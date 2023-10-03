import React, { useEffect, useMemo, useState } from 'react';
import { DialogCard } from '../Cards/Cards';
import FileItem from '../FileItem/FileItem';
import UserListModal from '../Modals/UserListModal/UserListModal';
import DoYouWantModal from '../Modals/DoYouWantModal/DoYouWantModal';
import { OpenOrCreateDialog, isAbleToKick } from "../../Utilities/chatFunctions"
import { Kick ,updateRole,changePublicity } from "../../Utilities/signalrMethods"
import "./AboutSection.scss";

function AboutSection({ chatData, currentChat, connection, userRole, onlineUsers, setCurrentChatId }) {
    const [aboutSection, setAboutSection] = useState("Files");
    const [addSpecialModal, setAddSpecialModal] = useState(false);
    const [role, setRole] = useState("Publisher");
    const [kickModal, setKickModal] = useState(false);
    const [userToKick, setUserToKick] = useState(null);

    const publicity = currentChat && currentChat.isPublic ? "Public" : "non-Public";

    const changePublic = (chatId) => {
        changePublicity(connection, chatId);
    }

    const renderDialogCard = (item, additionalContent) => (
        <DialogCard
            key={item.Id}
            item={item}
            onlineUsers={onlineUsers}
            func={(userId) => OpenOrCreateDialog(userId, chatData, setCurrentChatId, connection)}
            connection={connection}
        >
            {additionalContent}
        </DialogCard>
    );

    const renderButton = (item) => {
        if (isAbleToKick(userRole,item.Role)) {
            return (
                <button className="kickBtn" onClick={(e) => { e.stopPropagation(); handleKickModal(item) }}>
                    Kick
                </button>
            );
        }
    };

    const handleKick = (item) => {
        Kick(connection,currentChat.Id,item.Id);
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

    

    const renderedMembersSection = useMemo(() => {
        if (currentChat && currentChat.Users && currentChat.Users.length > 0) {
            return currentChat.Users.slice().reverse().map((item) => (
                renderDialogCard(item, (
                    <>
                        {renderRole(item)}
                        {renderButton(item)}
                    </>
                ))
            ));
        }
        return null;
    }, [currentChat, aboutSection]);

    const renderedSpecialSection = useMemo(() => {
        if (currentChat && currentChat.Users && currentChat.Users.length > 0) {
            const filteredUsers = currentChat.Users.filter((p) => p.Role === role);
            return filteredUsers.map((item) => (
                renderDialogCard(item, (
                    <button onClick={(e) => { e.stopPropagation(); updateRole(connection, currentChat.Id, item.Id, "Reader"); }}>
                        Remove
                    </button>
                ))
            ));
        }
        return null;
    }, [currentChat, role, onlineUsers]);

    const handleUpdateRole = (id) => {
        updateRole(connection, currentChat.Id, id, role);
        handleAddSpecialModal();
    }

    useEffect(() => {
        if (currentChat.Type === "Dialog") {
            setAboutSection("Files")
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
                    onClick={handleUpdateRole}
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
                        <button className={aboutSection === "Files" ? "active" : ""} onClick={() => setAboutSection("Files")}>
                            Files
                        </button>
                        <button className={aboutSection === "Members" ? "active" : ""} onClick={() => setAboutSection("Members")}>
                            Members
                        </button>
                        { userRole === "Owner" && (
                            <button className={aboutSection === "Management" ? "active" : ""} onClick={() => setAboutSection("Management")}>
                                Manage
                            </button>
                        )}
                    </>
                )}
            </div>

            {chatData && currentChat && (
                <div className="aboutContent">
                    {aboutSection === "Files" ? (
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
                                {aboutSection === "Members" ? (
                                    <div className="membersSection">{renderedMembersSection}</div>
                                ) : aboutSection === "Management" ? (
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
                                                <button className="changePublicityBtn" onClick={() => changePublic(currentChat.Id)}>
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