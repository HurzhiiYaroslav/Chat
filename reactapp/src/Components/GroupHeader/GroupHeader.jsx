import React, { useState } from 'react';
import EditGroupModal from "../Modals/EditGroupModal/EditGroupModal"
import { MediaUrl } from "../../Links"
import "./GroupHeader.scss"
import EditOverlay from '../EditOverlay/EditOverlay';
function GroupHeader({currentChat, userRole }) {
    const [editGroupModal, setEditGroupModal] = useState(false);

    function handleEditGroupModal() {
        setEditGroupModal(!editGroupModal);
    }

    return (
        <>
            <EditGroupModal open={editGroupModal} close={handleEditGroupModal} chatId={currentChat.Id} />
            <div className="aboutLogoWrapper">
                {currentChat && userRole === "Owner" ? (<EditOverlay func={handleEditGroupModal } />) : null}
                {(
                    currentChat.Logo.startsWith('#') ? (
                        <div
                            className="aboutLogo"
                            style={{
                                backgroundColor: currentChat.Logo
                            }} />
                    ) : (
                        <img className="aboutLogo" src={MediaUrl + currentChat.Logo} alt="Group Logo" />
                    )
                )}
                <div className="aboutTitle">{currentChat.Title}</div>
            </div>
            <div className="aboutDescription">{currentChat.Description}</div>
        </>
  );
}

export default GroupHeader;