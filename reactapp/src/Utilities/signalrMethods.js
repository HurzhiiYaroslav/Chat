export const Kick = (connection, currentChatId, itemId) => {
    connection.invoke("Kick", currentChatId, itemId);
};

export const updateRole = (connection, currentChatId, itemId, role) => {
    connection.invoke("UpdateUserRole", currentChatId, itemId, role);
};

export const changePublicity = (connection,itemId) => {
    connection.invoke("ChangePublicity",itemId);
};

export const createDialod = (connection, itemId) => {
    connection.invoke("CreateDialog", itemId);
};

export const joinChannel = (connection, channelId) => {
    connection.invoke("JoinChannel", channelId)
};

export const searchChats = (connection, fieldInput) => {
    connection.invoke("SearchChats", fieldInput)
};

export const Invite = (connection, userId, currentChatId) => {
    connection.invoke("Invite", userId, currentChatId);
};

export const Leave = (connection, ChatId) => {
    connection.invoke("Leave", ChatId);
};