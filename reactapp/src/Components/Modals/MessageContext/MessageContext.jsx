import React, {useState } from 'react';
import Modal from '../../General/Modal/Modal';
import { OpenOrCreateDialog, isAbleToKick, DownloadFile } from '../../../Utilities/chatFunctions';
import { DeleteMessage, Kick } from '../../../Utilities/signalrMethods';
import './MessageContext.scss';

function MessageContext({ open, close, sender, userRole, message, connection, currentChat, chatData, setCurrentChatId }) {
    const [isCopied, setIsCopied] = useState(false);
    const curUser = localStorage.getItem("currentUser");
    const handleCopyClick = () => {
        const textArea = document.createElement('textarea');
        textArea.value = message.content;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setIsCopied(true);
    };

    const handleClose = () => {
        setIsCopied(false);
        close();
    };

    const openDialog = () => {
        if (sender && sender.Id !== curUser) {
            OpenOrCreateDialog(sender.Id, chatData, setCurrentChatId, connection);
            handleClose();
        }
    };

    const copyButtonText = isCopied ? 'Copied' : 'Copy';

    const kickButton = () => {
        if (sender && isAbleToKick(userRole, sender.Role)) {
            Kick(connection, currentChat.Id, sender.Id);
            handleClose();
        }
    };

    const handleDownloadCLick = () => {
        message?.Files?.map(file => {
            DownloadFile(file);
        })
    }

    return (
        <Modal open={open} closeModal={handleClose} additionalClass="message-context">
            {sender && sender.Id !== curUser && currentChat.Type !== "Dialog" && (
                <button className="btn open-dialog-button" onClick={openDialog}>
                    Open dialog
                </button>
            )}
            {message?.content?.length>0 &&
                (<button className={`btn copy-button ${isCopied ? "active" : ""}`} onClick={handleCopyClick}>
                    {copyButtonText}
                </button>)
            }
            {sender && isAbleToKick(userRole, sender.Role) && (
                <button className="btn kick-button" onClick={kickButton}>
                    Kick
                </button>
            )}
            {message?.Files?.length>0 && (
                <button className="btn download-button" onClick={handleDownloadCLick} >
                    Download All
                </button>
            )}
            {sender && (sender.Id === curUser || isAbleToKick(userRole, sender.Role)) && (
                <button className="btn delete-button" onClick={() => DeleteMessage(connection,currentChat.Id,message.Id )}>
                    Delete
                </button>
            )}
        </Modal>
    );
}

export default MessageContext;