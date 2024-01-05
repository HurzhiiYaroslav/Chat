import React, { useState} from 'react';
import { Menu, Item } from 'react-contexify';
import { Leave, PinChat, UnpinChat, DeleteChat } from '../../Utilities/signalrMethods';
import { getCurrentUserRole } from '../../Utilities/chatFunctions';
import DoYouWantModal from '../Modals/DoYouWantModal/DoYouWantModal';
import 'react-contexify/ReactContexify.css';



function ChatCM({ MENU_ID, chat, connection }) {
    const [DeleteModal, setDeleteModal] = useState(false);
    const deleteSign = chat.Type.toLowerCase() + " '" + (chat.Title ? chat.Title : chat.Companion.Name)+"'";
    
    const handlePinBtn = () => {
        if (chat.isPinned) {
            UnpinChat(connection, chat.Id)
        }
        else {
            PinChat(connection, chat.Id)
        }
    }

    const handleDelete = () => {
        DeleteChat(connection, chat.Id)
    }

    function handleDeleteModal() {
        setDeleteModal(!DeleteModal);
    }

    return (
        <>
            <DoYouWantModal open={DeleteModal} closeModal={handleDeleteModal} action={handleDelete } text={"to delete " + deleteSign  }>
            </DoYouWantModal>
            <Menu id={MENU_ID}>
                {chat.Type !== "Dialog" && (
                    <Item onClick={() => handlePinBtn()}>
                        {chat.isPinned ? ("Unpin") : ("Pin")}
                    </Item>
                )}
                {(chat.Type === "Group" || chat.Type === "Channel") && chat?.Id && (
                    <Item onClick={() => Leave(connection, chat.Id)}>
                        Leave
                    </Item>
                )}
                {(chat.Type === "Dialog" || getCurrentUserRole(chat) === "Owner") && (
                    <Item className="DeleteBtn" onClick={() => handleDeleteModal()}>
                        Delete
                    </Item>
                )}
            </Menu>
      </>
      
  );
}

export default ChatCM;