import { DownloadUrl,LinkPreviewUrl } from "../Links"
import { createDialod } from "./signalrMethods";

const accessToken = localStorage.getItem('accessToken');

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
    return isModer && (userRole !== punishedRole && punishedRole !== "Owner");
}

export const DownloadFile = (file) => {

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
        let lastSeenMessage = chat.LastSeenMessage;
        if (!lastSeenMessage) {
            return userMes;
        }
        else if (!userMes) return lastSeenMessage;

        if (userMes.time > lastSeenMessage.time) return userMes;
        else {
            return lastSeenMessage;
        }
        
    }
};

export const getSender=(chat,message,chatData)=>{
    const foundSender = chat?.Users?.find((element) => element.Id === message?.sender);
    if (chat && chat.Companion && !foundSender) {
        if (message.sender === chat.Companion.Id) {
            return chat.Companion;
        } else if (message.sender === localStorage.getItem("currentUser")) {
            return chatData.user;
        }
    } else if (foundSender) {
        return foundSender;
    }
}

export const getLinkPreview = async (url) => {
    try {
        const response = await fetch(LinkPreviewUrl + `?url=${encodeURIComponent(url)}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            }
        });
        
        if (response.status === 200) {
            const data = await response.json();
            return data.data;
        } else {
            throw new Error(`Failed to fetch data. Status: ${response.status}`);
        }
    } catch (error) {
        console.error(error);
        throw error;
    }
};