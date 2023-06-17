import React, { useState } from 'react';
import { Link, Route, Routes } from 'react-router-dom';
import { unauthorizedRequest, } from '../../Utils/Utils';

function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const handleUsernameChange = (event) => {
        setUsername(event.target.value);
    };

    const handlePasswordChange = (event) => {
        setPassword(event.target.value);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const body = {
            Login: username,
            Password: password
        };
        const response = await unauthorizedRequest("https://localhost:7222/login", "POST", body);
        localStorage.setItem("accessToken", response.access_token)
    };

    return (
        <form id="loginform" onSubmit={handleSubmit}>
            <div>
                <label htmlFor="username">Login:</label>
                <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={handleUsernameChange}
                />
            </div>
            <div>
                <label htmlFor="password">Password:</label>
                <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={handlePasswordChange}
                />
            </div>
            <button type="submit">Enter</button>
            <Link to="/register">Register</Link>
        </form>
    );
}

export default LoginPage;