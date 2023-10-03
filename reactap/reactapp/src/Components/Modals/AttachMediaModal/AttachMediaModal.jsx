import { useState, FormEvent } from 'react';
import Modal from "../../General/Modal/Modal";
import './AttachMediaModal.scss';


const AttachMediaModal = ({
    inputFileOnChange,
    inputOnDropEvent,
    closeModal,
    open,
    inputText,
    multiple = false,
}) => {
    const [dragging, setDragging] = useState(false);
    const handleDragEnter = (event) => {
        event.preventDefault();
        setDragging(true);
    };

    const handleDragLeave = (event) => {
        event.preventDefault();
        setDragging(false);
    };

    const handleDragOver = (event) => {
        event.preventDefault();
        setDragging(true);
    };

    const handleDrop = (event) => {
        event.preventDefault();
        setDragging(false);
        inputOnDropEvent(event);
    };

    return (
        <Modal closeModal={closeModal} open={open} additionalClass="browse-avatar">
            <div className="browse-avatar-container">
                <div
                    className={`drop-zone drop-image  ${dragging ? 'dragging' : ''}`}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                >
                    <div className="drop-image-text">drop file</div>
                </div>
                <div className="or">Or</div>
                <div className="browse-file-input">
                    <label htmlFor="file" className="browse-input">
                        Browse file
                    </label>

                    {multiple ? (
                        <input
                            type="file"
                            id="file"
                            hidden
                            multiple
                            name=""
                            onChange={(e) => inputFileOnChange(e)}
                        />
                    ) : (
                            <input
                            type="file"
                            id="file"
                            hidden
                            name=""
                            onChange={(e) => inputFileOnChange(e)}
                        />
                    )}
                </div>
            </div>
        </Modal>
    );
};

export default AttachMediaModal;