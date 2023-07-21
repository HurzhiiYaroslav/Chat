import React from 'react';
import "./AttachedMedia.scss"

function AttachedMedia({ mesFiles, setMesFiles }) {
    if (mesFiles && mesFiles.length > 0) {
        if (Array.isArray(mesFiles)) {
            return (
                <div className="AttachedMedia">
                    {mesFiles.map((item) => (
                        <div className="mediaItem" key={item.Id}>
                            {item.name}
                        </div>
                    ))}
                </div>
            );
        }
    } else {
        return <div>no attached files</div>;
    }
}

export default AttachedMedia;