import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Register.scss';
import Loading from '../../Components/General/Loading/Loading';
import { RegisterUrl } from '../../Links';
import { useEffect } from 'react';

function RegisterPage() {
    const [username, setUsername] = useState('');
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [image, setImage] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);

        try {
            if (password !== confirmPassword) {
                throw new Error('Passwords do not match');
            }
            if (login.length < 4) {
                throw new Error('Login must be at least 4 characters');
            }
            if (password.length < 4) {
                throw new Error('Password must be at least 4 characters');
            }
            if (username.length > 30) {
                throw new Error('Username must be shorter than 30 characters');
            }

            const formData = new FormData();
            formData.append('Username', username);
            formData.append('Login', login);
            formData.append('Password', password);
            formData.append('image', image);

            const response = await axios.post(RegisterUrl, formData);
            localStorage.setItem('accessToken', response.data.data.accessToken);
            localStorage.setItem('currentUser', response.data.data.username);
            console.log('Registration success');
            navigate('/chat', { replace: true });
        } catch (error) {
            setError(error.message);
            //console.error('Registration error:', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {loading && <Loading />}
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="username">Username</label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(event) => setUsername(event.target.value)}
                    />
                </div>
                <div>
                    <label htmlFor="login">Login</label>
                    <input
                        type="text"
                        id="login"
                        value={login}
                        onChange={(event) => setLogin(event.target.value)}
                    />
                </div>
                <div>
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                    />
                </div>
                <div>
                    <label htmlFor="confirm-password">Confirm Password</label>
                    <input
                        type="password"
                        id="confirm-password"
                        value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.target.value)}
                    />
                </div>
                <div>
                    <label htmlFor="photo">Photo</label>
                    <input
                        id="photo"
                        accept="image/*"
                        type="file"
                        name="image"
                        onChange={(event) => setImage(event.target.files[0])}
                    />
                    {image && <img src={URL.createObjectURL(image)} alt="Uploaded" />}
                </div>
                {error && <div>{error}</div>}
                <button type="submit">Register</button>
            </form>
        </>
    );
}

export default RegisterPage;