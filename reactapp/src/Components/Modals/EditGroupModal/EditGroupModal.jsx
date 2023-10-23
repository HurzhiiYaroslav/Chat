import React, { useState } from 'react';
import axios from 'axios';
import Modal from "../../General/Modal/Modal"
import { EditGroupUrl } from "../../../Links"

function EditGroupModal({ open,close,chatId}) {
    const [newTitle, setNewTitle] = useState("");
    const [newDescription, setNewDescription] = useState("");
    const [newImage, setNewImage] = useState(null);
    const [error, setError] = useState(null);
    function handleEditGroup() {
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
        formData.append('GroupId', chatId);
        formData.append('Title', newTitle.trim());
        formData.append('Description', newDescription.trim());
        formData.append('LogoImage', newImage);
        axios.post(EditGroupUrl, formData, { headers })
            .then(function (response) {
                setError(null);
                close();
            })
            .catch(function (error) {
                console.error("Error - ", error);
                setError(error.response.data.message);
            });

    }

  return (
      <Modal closeModal={close} open={open} additionalClass="edit-group">
          {error ? (<p classTitle="modalError">{error}</p>) : (null)}
          <label htmlFor="Title">Title:</label>
          <input type="text" id="Title" value={newTitle} onChange={(e) => setNewTitle(e.target.value) } />
          <label htmlFor="description">Description:</label>
          <input type="text" id="description" value={newDescription} onChange={(e) => setNewDescription(e.target.value)} />
          <label htmlFor="image">Image:</label>
          <input type="file" id="image" accept="image/*" onChange={(e) => setNewImage(e.target.files[0])} />
          <button className="saveBtn" onClick={handleEditGroup}>Save</button>
      </Modal>
  );
}

export default EditGroupModal;