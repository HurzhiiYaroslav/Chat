import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { AvatarUrl, EditProfileUrl, CreateChatUrl } from '../../../Links';
import ChatList from '../ChatList/ChatList'
import DoYouWantModal from "../../Modals/DoYouWantModal/DoYouWantModal";
import Modal from "../../General/Modal/Modal";
import "./ChatLeft.scss"

function ChatLeft({ connection, chatData, onlineUsers, currentChatId, setCurrentChatId, navigate }) {
    const [logoutModal, setLogoutModal] = useState(false);
    const [editModal, setEditModal] = useState(false);
    const [newChatModal, setNewChatModal] = useState(false);
    
    const [error, setError] = useState(null);

    const [photoFile, setPhotoFile] = useState(null);
    const [newName, setNewName] = useState('');
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');

    const [newChatType, setNewChatType] = useState("Group");
    const [newChatTitle, setNewChatTitle] = useState("");
    const [newChatDescription, setNewChatDescription] = useState("");
    const [newChatImage, setNewChatImage] = useState(null);

    function handleLogoutModal() {
        setLogoutModal(!logoutModal);
    }

    function handleLogout() {

        localStorage.clear();
        handleLogoutModal();
        navigate("/login", { replace: true });
    }

    function handleEditModal() {
        setEditModal(!editModal);
        setError(null);
    }

    const handlePhotoChange = (event) => {
        setPhotoFile(event.target.files[0]);
    };

    const handleNameChange = (event) => {
        setNewName(event.target.value);
    };

    const handleOldPasswordChange = (event) => {
        setOldPassword(event.target.value);
    };

    const handleNewPasswordChange = (event) => {
        setNewPassword(event.target.value);
        if (event.target.value.length < 4) {
            setError("password must be at least 4 symbols");
        }
        else {
            setError(null);
        }
    };

    const handleSave = () => {
        const formData = new FormData();
        const accessToken = localStorage.getItem('accessToken');

        if (!accessToken) {
            setError("Access token is missing");
            return;
        }

        const headers = {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'multipart/form-data',
        };
        formData.append('AccessToken', accessToken);
        formData.append('NewName', newName.trim());
        formData.append('Avatar', photoFile);

        if ((oldPassword.length >= 1 || newPassword.length >= 1) && (oldPassword.length < 4 || newPassword.length < 4)) {
            setError("Password must be at least 4 characters");
            return;
        } else if (oldPassword.length >= 4 && newPassword.length >= 4) {
            formData.append('OldPassword', oldPassword);
            formData.append('NewPassword', newPassword);
        }
        axios.post(EditProfileUrl, formData, { headers })
            .then(function (response) {
                setError(null);
                handleEditModal();
            })
            .catch(function (error) {
                console.error("Error - ", error);
                setError(error.response.data.message);
            });
    };

    function handleNewChatModal() {
        setNewChatTitle("");
        setNewChatDescription("");
        setNewChatImage(null);
        setNewChatModal(!newChatModal);
        setError(null);
    }

    function createNewChat() {
        const formData = new FormData();
        const headers = {
            Authorization: `Bearer ` + localStorage.getItem('accessToken'),
            'Content-Type': 'multipart/form-data',
        };
        formData.append('AccessToken', localStorage.getItem("accessToken"));
        formData.append('Title', newChatTitle);
        formData.append('Description', newChatDescription);
        formData.append('Image', newChatImage);
        formData.append('Type', newChatType);
        axios.post(CreateChatUrl, formData, { headers })
            .then(function (response) {
                const data = JSON.parse(response.data.data);
                connection.invoke("Invite", data.userId, data.chatId);
                setError(null);
                handleNewChatModal();
            })
            .catch(function (error) {
                setError("something went wrong");
                console.error("error - ", error);
            });

        handleNewChatModal();
    }

    return (
        <>
            <DoYouWantModal
                closeModal={handleLogoutModal}
                open={logoutModal}
                action={handleLogout}
                text={`to logout`}
            />
            <Modal closeModal={handleEditModal} open={editModal} additionalClass="edit">
                <div className="editModalWrapper">
                <>
                        {error ? (<p className="modalError">{ error}</p>) : (null) }
                    <p>New name:</p>
                    <input type="text" value={newName} onChange={handleNameChange} />

                    <p>New photo:</p>
                    <input type="file" accept="image/*" onChange={handlePhotoChange} />

                    <p>Old password:</p>
                    <input type="password" value={oldPassword} onChange={handleOldPasswordChange} />

                    <p>New password:</p>
                    <input type="password" value={newPassword} onChange={handleNewPasswordChange} />

                    <button onClick={handleSave}>Save</button>
                    <button onClick={handleEditModal}>Close</button>
                    
                    </>
                </div>
            </Modal>

            <Modal closeModal={handleNewChatModal} open={newChatModal} additionalClass="new-chat">
                <div className="newChatModalWrapper">
                    {error ? (<p className="modalError">{error}</p>) : (null)}
                    <p>Title:</p>

                    <input type="text" value={newChatTitle} onChange={(e)=>setNewChatTitle(e.target.value) }></input>
                    <p>Description:</p>

                    <input type="text" value={newChatDescription} onChange={(e) => setNewChatDescription(e.target.value)}></input>
                    <p>Logo:</p>

                    <input type="file" accept="image/*" onChange={(e) => { setNewChatImage(e.target.files[0]) }} />
                    <p>Type:</p>

                    <div className="chatTypeBtns">
                        <button className={`chatTypeBtn  ${newChatType === "Group" ? "active" : ""}`} onClick={() => setNewChatType("Group")}>Group</button>
                        <button className={`chatTypeBtn  ${newChatType === "Channel" ? "active" : ""}`} onClick={() => setNewChatType("Channel")}>Channel</button>
                    </div>

                    <div class="buttonGroup">
                        <button class="createBtn" onClick={()=>createNewChat() }>Create</button>
                        <button class="closeBtn" onClick={handleNewChatModal}>Close</button>
                    </div>
                </div>
            </Modal>
            <div className="leftSide">
                <div className="ButtonsWrapper">
                    <button className="logoutButton" onClick={() => { handleLogoutModal() }}>Logout</button>
                    <button className="editButton" onClick={() => { handleEditModal() }}>Edit</button>
                </div>
                <div className="UserInfo">
                    <div className="UserPhotoWrapper">
                        {chatData && chatData.user && chatData.user.Photo ? (
                            <img
                                className="UserPhoto"
                                src={AvatarUrl + chatData.user.Photo}
                                alt="YourAvatar"
                            />
                        ) : (
                            <div className="DefaultPhoto">photo</div>
                        )}
                    </div>
                    <div className="UserName">
                        {chatData && chatData.user && chatData.user.Name ? chatData.user.Name : "name"}
                    </div>
                </div>

                <ChatList connection={connection}
                    chatData={chatData}
                    onlineUsers={onlineUsers}
                    setCurrentChatId={setCurrentChatId} />
                <button className="newChatButton" onClick={handleNewChatModal }>+</button>
            </div>
        </>
    );
}

export default ChatLeft;