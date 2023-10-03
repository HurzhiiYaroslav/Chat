import React, {useState } from 'react';
import axios from 'axios';
import Modal from "../../General/Modal/Modal"
import { CreateChatUrl } from "../../../Links"
import "./CreateChatModal.scss"

function CreateChatModal({setChatData,connection,setCurrentChatId,close,open }) {
    const [newChatType, setNewChatType] = useState("Group");
    const [newChatTitle, setNewChatTitle] = useState("");
    const [newChatDescription, setNewChatDescription] = useState("");
    const [newChatImage, setNewChatImage] = useState(null);
    const [error, setError] = useState(null);

    function handleNewChatModal() {
        setNewChatTitle("");
        setNewChatDescription("");
        setNewChatImage(null);
        setError(null);
        close();
    }

    function createNewChat() {
        const formData = new FormData();
        const token = localStorage.getItem('accessToken');
        const headers = {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
        };
        formData.append('AccessToken', token);
        formData.append('Title', newChatTitle);
        formData.append('Description', newChatDescription);
        formData.append('LogoImage', newChatImage);
        formData.append('Type', newChatType);
        formData.append('UserConnection', connection.connectionId);
        axios.post(CreateChatUrl, formData, { headers })
            .then(function (response) {
                const data = JSON.parse(response.data.data);
                setChatData((prevChatData) => {
                    return {
                        ...prevChatData,
                        chats: [...prevChatData.chats, data],
                    };
                });
                setCurrentChatId(data.Id);
                setError(null);
                handleNewChatModal();
            })
            .catch(function (error) {
                setError("Something went wrong");
                console.error("Error - ", error);
            });
    }

  return (
      <Modal closeModal={handleNewChatModal} open={open} additionalClass="new-chat">
          <div className="newChatModalWrapper">
              {error ? (<p className="modalError">{error}</p>) : (null)}
              <p>Title:</p>

              <input type="text" value={newChatTitle} onChange={(e) => setNewChatTitle(e.target.value)}></input>
              <p>Description:</p>

              <input type="text" value={newChatDescription} onChange={(e) => setNewChatDescription(e.target.value)}></input>
              <p>Logo:</p>

              <input type="file" accept="image/*" onChange={(e) => { setNewChatImage(e.target.files[0]) }} />
              <p>Type:</p>

              <div className="chatTypeBtns">
                  <button className={`chatTypeBtn  ${newChatType === "Group" ? "active" : ""}`} onClick={() => setNewChatType("Group")}>Group</button>
                  <button className={`chatTypeBtn  ${newChatType === "Channel" ? "active" : ""}`} onClick={() => setNewChatType("Channel")}>Channel</button>
              </div>

              <div className="buttonGroup">
                  <button className="createBtn" onClick={createNewChat}>Create</button>
                  <button className="closeBtn" onClick={handleNewChatModal}>Close</button>
              </div>
          </div>
      </Modal>
  );
}

export default CreateChatModal;