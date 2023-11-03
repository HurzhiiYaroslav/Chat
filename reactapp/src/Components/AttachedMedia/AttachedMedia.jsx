import React from 'react';
import { useEffect } from 'react';
import "./AttachedMedia.scss"

function AttachedMedia({ mesFiles, setMesFiles }) {
    const handleRemoveFile = (file) => {
        setMesFiles((prevFiles) => prevFiles.filter((item) => item !== file));
    };

    function convertSize(size) {
        const units = ["b", "kb", "mb", "gb", "tb"];
        let i = 0;
        while (size > 1024) {
            size /= 1024;
            i++
        }
        return size.toFixed(2) + " " + units[i];
    }

    if (mesFiles && mesFiles.length > 0 && Array.isArray(mesFiles)) {
        return (
            <div className="AttachedMedia">
                {mesFiles.map((item,index) => (
                    <div className="mediaItem" key={index}>
                        {item.name}
                        <div className="mediaRight">
                            <div className="mediaSize">{convertSize(item.size)}</div>
                            <button className="removeButton" onClick={() => handleRemoveFile(item)}>Remove</button>
                        </div>
                    </div>
                ))}
            </div>
        );
    } else {
        return <></>;
    }
}

export default AttachedMedia;