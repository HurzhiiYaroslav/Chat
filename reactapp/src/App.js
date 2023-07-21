import React, { useState } from 'react';
import Login from './Paiges/Login/Login';
import Register from './Paiges/Register/Register';
import Chat from './Paiges/Chat/Chat';
import NotFound from './Paiges/NotFound/NotFound';
import {  Routes, Route, useNavigate } from 'react-router-dom';
import "./App.scss"
import ProtectedRoute from './Utils/ProtectedRoute';

const App = () => {
    const navigate = useNavigate();
    React.useEffect(() => {
        navigate('/chat');
    }, []);

    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route element={<ProtectedRoute />} >
                <Route path="/chat" element={<Chat />}></Route>
            </Route>
            <Route path="/*" element={<NotFound />} />
        </Routes>
    )
}
export default App