import { DownloadUrl } from "../Links"
import { createDialod } from "./signalrMethods";

export const OpenOrCreateDialog = (userId, chatData, setCurrentChatId, connection) => {
    const filteredChats = chatData.chats.filter((chat) => chat.Companion && chat.Companion.Id === userId);
    if (filteredChats.length > 0) {
        setCurrentChatId(filteredChats[0].Id);
    } else {
        createDialod(connection, userId);
    }
}

export const getCurrentUserRole = (currentChat) => {
    const currentUserId = localStorage.getItem("currentUser");
    if (!currentChat || !currentChat.Users) return null;
    const currentUser = currentChat.Users.find((u) => u.Id === currentUserId);
    return currentUser ? currentUser.Role : null;
};

export const isAbleToKick = (userRole, punishedRole) => {
    const isModer = userRole === "Moder" || userRole === "Owner";
    return isModer && (userRole !== punishedRole || punishedRole !== "Owner");
}

export const DownloadFile = (file) => {
    const accessToken = localStorage.getItem('accessToken');

    fetch(DownloadUrl + `?filePath=${file.Path}&fileType=${file.Type}&fileName=${file.Name}`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    })
        .then(response => {
            if (!response.ok) {
                console.log('Download error');
            }
            return response.blob();
        })
        .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = file.Name;
            link.click();
            URL.revokeObjectURL(url);
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

export const findLastMessage = (chat) => {
    if (!chat || !chat.Messages) {
        return null;
    }

    if (chat.Type === "Channel") {
        return chat.Messages[chat.Messages.length - 1];
    }
    else {
        const user = localStorage.getItem('currentUser');
        const userMes = chat.Messages
            .slice()
            .reverse()
            .find((m) => m.sender === user);

        const mes = chat.Messages.find((m) => {
            const time1 = new Date(m.time);
            const time2 = new Date(chat.LastSeenMessage.time);
            return time1 >= time2;
        });

        return userMes && mes && (
            new Date(userMes.time) >= new Date(mes.time) ? userMes : mes
        );
    }
};