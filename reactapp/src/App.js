import React from 'react';
import Login from './Paiges/Login/Login';
import Register from './Paiges/Register/Register';
import Chat from './Paiges/Chat/Chat';
import NotFound from './Paiges/NotFound/NotFound'
import { AuthContext } from './Context/ReactComponent';
import { Link, Route, Router, Routes } from 'react-router-dom'; 

const App = () => {
    const currentUser = React.useContext(AuthContext);
    const ProtectedRoute = ({ children }) => {
        if (currentUser === null) {
            window.location.href = "https://localhost:3000/login"
        }
        return children
    }
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            < Route path="/chat" element={< ProtectedRoute ><Chat /></ProtectedRoute>} />
            <Route path="/*" element={<NotFound />} />
        </Routes>
    )
}
export default App