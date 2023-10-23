import React, {useState} from 'react';
import axios from 'axios';
import Modal from "../../General/Modal/Modal"
import { EditProfileUrl } from "../../../Links"

function EditProfileModal({open,close }) {
    const [photoFile, setPhotoFile] = useState(null);
    const [newName, setNewName] = useState('');
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [error, setError] = useState(null);

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
                close();
            })
            .catch(function (error) {
                console.error("Error - ", error);
                setError(error.response.data.message);
            });
    };

  return (
      <Modal closeModal={close} open={open} additionalClass="edit-profile">
          <>
              {error ? (<p className="modalError">{error}</p>) : (null)}
              <label htmlFor="username">New name:</label>
              <input type="text" name="username" value={newName} onChange={handleNameChange} autocomplete="off" />

              <label htmlFor="image">New image:</label>
              <input type="file" name="image" accept="image/*" onChange={handlePhotoChange} />

              <label htmlFor="oldPass">Old password:</label>
              <input type="password" name="oldPass" value={oldPassword} onChange={handleOldPasswordChange} autocomplete="off" />

              <label htmlFor="NewPass">New password:</label>
              <input type="password" name="NewPass" value={newPassword} onChange={handleNewPasswordChange} autocomplete="off" />

              <button className="saveBtn" onClick={handleSave}>Save</button>
          </>
      </Modal>
  );
}

export default EditProfileModal;