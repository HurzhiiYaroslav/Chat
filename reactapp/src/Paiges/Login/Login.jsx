import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate} from 'react-router-dom';
import { unauthorizedRequest } from '../../Utils/Utils';
import Loading from '../../Components/Loading/Loading';
import { LoginUrl } from '../../Links';
import "./Login.scss"

function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setloading] = useState(false);
    const handleUsernameChange = (event) => {
        setUsername(event.target.value);
    };
    const handlePasswordChange = (event) => {
        setPassword(event.target.value);
    };
    const navigate = useNavigate();
    const handleSubmit = async (event) => {
        event.preventDefault();
        setloading(true);
        const body = {
            Login: username,
            Password: password
        };

        try {
            const response = await unauthorizedRequest(LoginUrl, "POST", body);
            localStorage.setItem("accessToken", response.access_token);
            localStorage.setItem("currentUser", response.username);
            setloading(false);
            navigate("/chat", { replace: true });
        } catch (error) {
            // Handle error
            console.error(error);
            setloading(false);
        }
    };

    return (
        <>{loading && <Loading></Loading>}
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
        </>
    );
}

export default LoginPage;