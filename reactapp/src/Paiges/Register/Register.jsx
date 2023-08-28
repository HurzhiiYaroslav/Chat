import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Register.scss';
import Loading from '../../Components/General/Loading/Loading';
import { RegisterUrl } from '../../Links';

function RegisterPage() {
    const [username, setUsername] = useState('');
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [image, setImage] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = (event) => {
        event.preventDefault();
        setLoading(true);

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }
        if (login.length < 4) {
            setError('Login must be at least 4 characters');
            setLoading(false);
            return;
        }
        if (password.length < 4) {
            setError('Password must be at least 4 characters');
            setLoading(false);
            return;
        }

        const formData = new FormData();
        formData.append('Username', username);
        formData.append('Login', login);
        formData.append('Password', password);
        formData.append('image', image);

        axios.post(RegisterUrl, formData)
            .then(function (response) {
                localStorage.setItem('accessToken', response.data.data.accessToken);
                localStorage.setItem('currentUser', response.data.data.username);
                console.log('Registration success');
                navigate('/chat', { replace: true });
                setLoading(false);
            })
            .catch(function (error) {
                console.error('Registration error:', error);
                setLoading(false);
            });
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