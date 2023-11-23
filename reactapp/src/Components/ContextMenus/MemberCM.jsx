import React from 'react';
import { Menu, Item,Submenu } from 'react-contexify';
import { Kick, updateRole } from '../../Utilities/signalrMethods';
import { getCurrentUserRole,isAbleToKick } from '../../Utilities/chatFunctions';
import 'react-contexify/ReactContexify.css';
import { useEffect } from 'react';

function MemberCM({ MENU_ID, member, chat, connection }) {
    const userRole = getCurrentUserRole(chat);
    const currentUserId = localStorage.getItem("currentUser");

    return (<>{
        member?.Id && chat?.Id && currentUserId !== member.Id &&
        <Menu id={MENU_ID}>
            {userRole === "Owner" &&  (
                <Submenu label="Update Role">
                        { member.Role !== "Reader" && (
                        <Item onClick={() => updateRole(connection, chat.Id, member.Id, "Reader")}>
                            Reader
                        </Item>
                    )}
                    { member.Role !== "Publisher" && chat.Type === "Channel" && (
                        <Item onClick={() => updateRole(connection, chat.Id, member.Id, "Publisher")}>
                            Publisher
                        </Item>
                    )}
                        {member.Role !== "Moder" && (
                        <Item onClick={() => updateRole(connection, chat.Id, member.Id, "Moder")}>
                                Moder
                        </Item>
                    )}
                </Submenu>
            )}
            {isAbleToKick(userRole, member.Role) && (
                <Item onClick={() => Kick(connection, chat.Id, member.Id)}>
                    Kick
                </Item>
            )}
        </Menu>

    }

    </>);
}

export default MemberCM;