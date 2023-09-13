import React, { useState } from 'react';
import DoYouWantModal from "../../Components/Modals/DoYouWantModal/DoYouWantModal";
import UserListModal from "../../Components/Modals/UserListModal/UserListModal";
import AboutSection from '../../Components/AboutSection/AboutSection';
import GroupHeader from '../../Components/GroupHeader/GroupHeader';
import { getCurrentUserRole } from "../../Utilities/chatFunctions"
import { Invite, Leave } from '../../Utilities/signalrMethods';
import "./ChatRight.scss"
function ChatRight({ currentChat, onlineUsers, connection, chatData, setCurrentChatId }) {
    const [inviteModal, setInviteModal] = useState(false);
    const [leaveModal, setLeaveModal] = useState(false);
    const userRole = getCurrentUserRole(currentChat);

    function handleInviteModal() {
        setInviteModal(!inviteModal);
    }

    function handleInvite(userId) {
        if (currentChat && currentChat.Id) {
            Invite(connection, userId, currentChat.Id);
        } else {
            console.error("currentChat is not properly initialized or does not have an 'Id' property.");
        }
    }

    function handleLeaveModal() {
        setLeaveModal(!leaveModal);
    }

    function handleLeave() {
        Leave(connection, currentChat.Id);
        setCurrentChatId(null);
        handleLeaveModal();
    }

    return (
        <>
            {chatData && currentChat &&  currentChat.Users && currentChat.Type !== "Dialog" && (
                <>
                    <UserListModal open={inviteModal} close={handleInviteModal} onClick={handleInvite} list={
                        chatData.chats.filter((item) => item.Companion && !currentChat.Users.some((u) => u.Id === item.Companion.Id)).map(item=>item.Companion)
                    } />
                    
                </>
            )}

            {currentChat &&
                <>
                    <DoYouWantModal
                        closeModal={handleLeaveModal}
                        open={leaveModal}
                        action={handleLeave}
                        text={`to leave the "${currentChat.Title} " ${currentChat.Type}`} />
                </>
            }
            <div className="chatRight">
                <div className="aboutInfo">
                    {currentChat && !currentChat.Companion && <GroupHeader currentChat={currentChat} userRole={userRole} />}
                    
                </div>
                {currentChat &&
                    <AboutSection chatData={chatData}
                        connection={connection}
                        currentChat={currentChat}
                        userRole={userRole}
                        onlineUsers={onlineUsers}
                        setCurrentChatId={setCurrentChatId }
                    />}
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

export default ChatRight;