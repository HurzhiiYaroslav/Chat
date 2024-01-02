import React from 'react';
import { Menu, Item } from 'react-contexify';
import { Leave,PinChat,UnpinChat } from '../../Utilities/signalrMethods';
import 'react-contexify/ReactContexify.css';


function ChatCM({ MENU_ID, chat, connection }) {
    console.log(chat);

    const handlePinBtn = () => {
        if (chat.isPinned) {
            UnpinChat(connection, chat.Id)
        }
        else {
            PinChat(connection, chat.Id)
        }
    }

  return (
      <Menu id={MENU_ID}>
          {chat.Type !== "Dialog" && (
              <Item onClick={() => handlePinBtn()}>
                  {chat.isPinned ? ("Unpin") : ("Pin")}
              </Item>
          )}
          {chat.Type==="Dialog" && (
              <Item onClick={() => console.log("delete dialog")}>
                  Delete
              </Item>
          )}
          {(chat.Type === "Group" || chat.Type === "Channel")&& chat?.Id && (
              <Item onClick={() => Leave(connection,chat.Id)}>
                  Leave
              </Item>
          )}
      </Menu>
  );
}

export default ChatCM;