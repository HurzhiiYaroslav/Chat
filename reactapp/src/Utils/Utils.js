export const checkAuth = async (event) => {
    event.preventDefault();
    const token = localStorage.getItem("accessToken")
    try {
        const response = await fetch("https://localhost:7222/CheckAuth", {
            method: "GET",
            headers: { "Accept": "application/json", "Content-Type": "application/json", "Authorization": "Bearer " + token }
        })
        const result = await response.json();
        console.log(result);
        localStorage.setItem("accessToken", result.access_token)
    }
    catch (er) {
        if (er) {
            console.log(er);
        }
    }
}

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
    const response = await fetch(url, request);

    if (response.status === 200) {
        return await response.json();
    } else {
        return response.status
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

    const response = await fetch(url, request);

    if (!token || token === '') {
        return undefined;
    }
    if (response.status === 200 || response.status === 201) {
        return await response.json();
    }
    else {
        //window.location.href = "https://localhost:3000/register";
        
        return response.status;
    }

}