import React from 'react';
import { Menu, Item } from 'react-contexify';
import { Leave } from '../../Utilities/signalrMethods';
import 'react-contexify/ReactContexify.css';
function ChatCM({ MENU_ID, chat,connection }) {



  return (
      <Menu id={MENU_ID}>
          <Item disabled onClick={() => console.log("Pin")}>
              Pin
          </Item>
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