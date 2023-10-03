import React from 'react';
import { useEffect } from 'react';
import "./AttachedMedia.scss"

function AttachedMedia({ mesFiles, setMesFiles }) {
    const handleRemoveFile = (file) => {
        setMesFiles((prevFiles) => prevFiles.filter((item) => item !== file));
    };


    if (mesFiles && mesFiles.length > 0 && Array.isArray(mesFiles)) {
        return (
            <div className="AttachedMedia">
                {mesFiles.map((item,index) => (
                    <div className="mediaItem" key={index}>
                        {item.name}
                        <button className="removeButton" onClick={() => handleRemoveFile(item)}>Remove</button>
                    </div>
                ))}
            </div>
        );
    } else {
        return <></>;
    }
}

export default AttachedMedia;