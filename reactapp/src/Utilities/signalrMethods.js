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
    return connection.invoke("SearchChats", fieldInput)
};

export const Invite = (connection, userId, currentChatId) => {
    connection.invoke("Invite", userId, currentChatId);
};

export const Leave = (connection, ChatId) => {
    connection.invoke("Leave", ChatId);
};

export const MarkAsSeen = (connection, chatId, MesId) => {
    connection.invoke("MarkAsSeen",chatId, MesId);
};

export const DeleteMessage = (connection, chatId, MesId) => {
    connection.invoke("DeleteMessage", chatId, MesId);
};

export const PinMessage = (connection, chatId, MesId) => {
    connection.invoke("PinMessage", chatId, MesId);
};

export const UnpinMessage = (connection, chatId, MesId) => {
    connection.invoke("UnpinMessage", chatId, MesId);
};

export const PinChat = (connection, chatId) => {
    connection.invoke("PinChat", chatId);
};

export const UnpinChat = (connection, chatId) => {
    connection.invoke("UnpinChat", chatId);
};
