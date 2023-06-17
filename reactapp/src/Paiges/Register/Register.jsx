import React, { useState,useEffect } from 'react';
import axios from 'axios';

function RegisterPage() {
    const [username, setUsername] = useState('');
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [image, setImage] = useState(null);
    const [imagePath, setImagePath] = useState('default');
    const [loading, setLoading] = useState(false);
    
    const handleSubmit = (event) => {

        event.preventDefault();
        setLoading(true);
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }
        if (login.length < 4) {
            setError('Login must be at least 4 symbols');
            setLoading(false);
            return;
        }
        if (password.length<4) {
            setError('Passwords must be at least 4 symbols');
            setLoading(false);
            return;
        }
        fetch('https://localhost:7222/register', {
            method: 'POST',
            headers: { "Accept": "application/json", "Content-Type": "application/json" },
            body: JSON.stringify({
                Username: username,
                Login: login,
                Password: password,
                PhotoPath: imagePath
            })
        })
            .then(response => response.json())
            .then(data => {
                if (data.status === 409) {
                    setError('login is already used');
                    setLoading(false);
                }
                else {
                    localStorage.setItem("accessToken", data.access_token)
                    setLoading(false);
                }
            })
            .catch((error) => {
                setError(error.message);
                setLoading(false);
            });
    };  

    const handleImageUpload = async (event) => {
        const file = event.target.files[0];
        if (file) {
            await setImage(file);
            const formData = new FormData();
            formData.append('image', file);
            formData.append('text',"1");
            const response = await axios.post('https://localhost:7222/setPhoto', formData);
            setImagePath(response.data.photoName);
        }
    };

    return (
        <>{
            loading ? <div>loading...</div> : <form onSubmit={handleSubmit}> 
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
                        type="login"
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
                        accept = "image/*"
                        type="file"
                        name="image"
                        onChange={handleImageUpload} />
                        {image && <img src={URL.createObjectURL(image)} alt="Uploaded" />}
                </div>
                {error && <div>{error}</div>}
                <button type="submit">Register</button>
            </form>
        }</>
    );
};

export default RegisterPage;