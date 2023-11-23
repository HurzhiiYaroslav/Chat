import React, {useState } from 'react';
import { Menu, Item } from 'react-contexify';
import { OpenOrCreateDialog, isAbleToKick, DownloadFile } from '../../Utilities/chatFunctions';
import { Kick, DeleteMessage,PinMessage, UnpinMessage } from '../../Utilities/signalrMethods';
import 'react-contexify/ReactContexify.css';

function MessageCM({MENU_ID, sender, userRole, message, connection, currentChat, chatData, setCurrentChatId }) {

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
        //close();
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
      <Menu id={MENU_ID}>
          {sender && sender.Id !== curUser && currentChat.Type !== "Dialog" && (
              <Item onClick={openDialog}>
                  Open dialog
              </Item>
          )}
          {!message.Pin&&(currentChat.Type !== "Channel" || userRole !== "Reader") && (
              <Item onClick={() => PinMessage(connection, currentChat.Id, message.Id)}>
                  Pin
              </Item>
          )}
          {message.Pin && (currentChat.Type !== "Channel" || userRole !== "Reader") && (
              <Item onClick={() => UnpinMessage(connection, currentChat.Id, message.Id)}>
                  Unpin
              </Item>
          )}
          {message?.content?.length > 0 &&
              (<Item onClick={handleCopyClick}>
                  {copyButtonText}
              </Item>)
          }
          {sender && isAbleToKick(userRole, sender.Role) && (
              <Item onClick={kickButton}>
                  Kick
              </Item>
          )}
          {message?.Files?.length > 0 && (
              <Item onClick={handleDownloadCLick} >
                  Download All
              </Item>
          )}
          {sender && (sender.Id === curUser || isAbleToKick(userRole, sender.Role)) && (
              <Item onClick={() => DeleteMessage(connection, currentChat.Id, message.Id)}>
                  Delete
              </Item>
          )}
      </Menu>
  );
}

export default MessageCM;