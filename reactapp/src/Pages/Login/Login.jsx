import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { unauthorizedRequest } from '../../Utilities/Utilities';
import Loading from '../../Components/General/Loading/Loading';
import { LoginUrl } from '../../Links';
import './Login.scss';

function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleUsernameChange = (event) => {
        setUsername(event.target.value);
    };

    const handlePasswordChange = (event) => {
        setPassword(event.target.value);
    };

    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);

        const body = {
            Login: username,
            Password: password
        };

        try {
            const response = await unauthorizedRequest(LoginUrl, 'POST', body);
            console.log(response);

            localStorage.setItem('accessToken', response.data.accessToken);
            localStorage.setItem('currentUser', response.data.username);

            setLoading(false);
            navigate('/chat', { replace: true });
        } catch (error) {
            console.error('An error occurred:', error);
            setLoading(false);
        }
    };

    return (
        <>
            {loading && <Loading />}
            <form id="loginform" onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="login">Login:</label>
                    <input
                        type="text"
                        id="login"
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