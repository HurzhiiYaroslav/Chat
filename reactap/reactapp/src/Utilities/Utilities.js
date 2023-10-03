
export const unauthorizedRequest = async (url, method, body) => {
    const request = body ? {
        method: method,
        headers: {
            "Accept": "application/json", "Content-Type": "application/json"
        },
        body: JSON.stringify(body)

    } : {
        method: method,
        headers: {
            "Accept": "application/json", "Content-Type": "application/json"
        }
    }
    try {
        const response = await fetch(url, request);
        if (response.status === 200) {
            return await response.json();
        } else {
            return response.status
        }
    }
    catch (er) {
        if (er) {
            console.log(er);
        }
    }
}

export const authorizedRequest = async (url, method, tokenType = 'accessToken', body) => {
    const token = localStorage.getItem(tokenType);
    const request = body ? {
        method: method,
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
        },
        body: JSON.stringify(body)
    } : {
        method: method,
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
        }
    }
    try {
        const response = await fetch(url, request);
        if (!token || token === ''|| response.status === 401) {
            return null;
        }
        else if (response.status === 200 || response.status === 201) {
            return await response;
        }
        else {
            localStorage.removeItem("accessToken");
            return response.status;
        }
    }
    catch (er) {
        if (er) {
            console.log(er);
        }
    }
}