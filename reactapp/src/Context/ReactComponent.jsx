import { createContext, useState, useEffect } from "react";
import { authorizedRequest } from "../Utils/Utils";

export const AuthContext = createContext()

export const AuthContextProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null)
    useEffect(() => {
        const response = authorizedRequest("https://localhost:7222/checkAuth", "GET", "accessToken", null);
        response.then((data) => { console.log(data) })
    }, [])
    return (
        <AuthContext.Provider value={ currentUser}>
            {children}
        </AuthContext.Provider>
    )
};