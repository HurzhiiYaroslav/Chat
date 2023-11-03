import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AttachedMedia from '../AttachedMedia/AttachedMedia';
import AttachMediaModal from '../Modals/AttachMediaModal/AttachMediaModal';
import { SendMessageUrl } from '../../Links';
import { MarkAsSeen } from '../../Utilities/signalrMethods';
import "./ChatInput.scss"
function ChatInput({ currentChat, connection }) {
    const [mesText, setMesText] = useState("");
    const [mesFiles, setMesFiles] = useState([]);
    const [modal, setModal] = useState(false);
    const [error, setError] = useState(null);
    const [source, setSource] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(null);

    const handleDrop = (event) => {
        const files = event.dataTransfer.files;

        Array.from(files).forEach((file) => {
            setMesFiles(mesFiles => [...mesFiles, file]);
        });
        setModal(false);
    };
    const handleBrowseFile = (e) => {
        const files = e.target.files;
        if (files) {
            Array.from(files).forEach((file) => {
                setMesFiles(mesFiles => [...mesFiles, file]);
            });
        }
        setModal(false);
    };

    const onUploadProgress = (progressEvent) => {
        if (mesFiles.length <= 0) {
            return;
        }
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress(`Upload progress: ${percentCompleted}%`);
    };

    async function SendMessage() {
        if (mesText.length > 0 || mesFiles.length > 0) {
            const headers = {
                Authorization: `Bearer ` + localStorage.getItem('accessToken'),
                ContentType: 'application/x-www-form-urlencoded'
            };
            const formData = new FormData();
            formData.append('AccessToken', localStorage.getItem("accessToken"));
            formData.append('ChatId', currentChat?.Id);
            formData.append('Message', mesText);
            for (let i = 0; i < mesFiles.length; i++) {
                formData.append('Attachments', mesFiles[i]);
            }
            if (currentChat?.Messages?.length > 0) MarkAsSeen(connection, currentChat.Id, currentChat.Messages[currentChat.Messages.length - 1].Id);

            axios.post(SendMessageUrl, formData, {
                onUploadProgress: onUploadProgress,
                cancelToken: source.token,
                maxContentLength: Infinity,
                maxBodyLength: Infinity,
                headers
            })
                .then(() => {
                    setMesFiles([]);
                    setMesText("");
                    setError(null);
                })
                .catch((error) => {
                    if (axios.isCancel(error)) {
                        setUploadProgress(null);
                        setSource(axios.CancelToken.source());
                    } else {
                        console.log(error);
                    }
                });
        }
    }

    useEffect(() => {
        if (!source) {
            setSource(axios.CancelToken.source());
            setError(null);
        }
    }, [])

    useEffect(() => {
        if (mesFiles?.length > 0) {
            const totalSize = mesFiles.reduce((total, item) => total + item.size, 0);
            if (totalSize > 100000000) {
                setError("Files are too large. Limit - 100mb");
                return;
            }
            if (mesFiles?.length > 10) {
                setError("Too many files. Limit - 10");
                return;
            }
        }
        setError(null)
    }, [mesFiles])

    useEffect(() => {
        if (error) {

        }
    },[error])

    return (
        <>
            <AttachMediaModal
                inputFileOnChange={handleBrowseFile}
                inputOnDropEvent={handleDrop}
                closeModal={() => {
                    setModal(false);
                }}
                open={modal}
                inputText="Drop file here"
                multiple={true}
            />

            <div className="inputWrapper">
                <div className="inputInner">
                    <AttachedMedia mesFiles={mesFiles} setMesFiles={setMesFiles} />
                    {error ? (
                        <div className="inputError"> {error}</div>
                    ) : uploadProgress ? ( <div className="inputUploadWrapper">
                            <div className="inputUpload">{uploadProgress}</div>
                            <button className="inputCancelBtn" onClick={() => { source.cancel() }}>Cancel</button>
                    </div>) :
                        (<>
                        <div className="inputBoxWrapper">
                            <div className="inputBox">
                                <input className="inputField" value={mesText} onChange={(e) => setMesText(e.target.value)} />
                                <div className="inputButtons">
                                    <button className="attachButton" onClick={() => setModal(true)}>Attach</button>
                                    <button className="sendButton" onClick={() => SendMessage()}>Send</button>
                                </div>
                            </div>
                        </div>
                    </>)}
                </div>
            </div>
            
        </>
    );
}

export default ChatInput;