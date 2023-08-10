import React, { useState } from 'react';
import { DownloadUrl,MediaUrl,BaseUrl} from "../../Links";
import "./FileItem.scss";

function FileItem({ file }) {
    const display = file.Type.includes("image") || file.Type.includes("video") || file.Type.includes("audio") || file.Type.includes("pdf");
    const [videoUrl, setVideoUrl] = useState(null);
    const [audioUrl, setAudioUrl] = useState(null);

    const handleDownloadClick = () => {
        const accessToken = localStorage.getItem('accessToken');

        fetch(DownloadUrl + `?filePath=${file.Path}&fileType=${file.Type}&fileName=${file.Name}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        })
            .then(response => {
                if (!response.ok) {
                    console.log('Download error');
                }
                return response.blob();
            })
            .then(blob => {
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = file.Name;
                link.click();
                URL.revokeObjectURL(url);
            })
            .catch(error => {
                console.error('Error:', error);
            });
    };

    const handleViewClick = () => {
        const accessToken = localStorage.getItem('accessToken');

        const headers = {
            Authorization: `Bearer ${accessToken}`,
        };

        const apiUrl = BaseUrl + `/GetVideo?filePath=${file.Path}`;
        fetch(apiUrl, {
            method: 'GET',
            headers: headers,
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.blob();
            })
            .then(blobData => {
                const url = URL.createObjectURL(blobData);
                setVideoUrl(url);
            })
            .catch(error => {
                console.error('Error:', error);
            });
    };

  return (
      <div key={file.Id} className="FileItem">
          <div className="fileName" >{file.Name}</div>
          
          <button className="Download Btn" onClick={() => {
              handleDownloadClick();
          }}>Download</button>
          {display ? (
              <button className="View Btn" onClick={() => {
                  if (file.Type.includes("image")) {
                      window.open(MediaUrl + file.Path, '_blank');
                  }
                  else if (file.Type.includes("video")) {
                      handleViewClick();
                  }
                  else if (file.Type.includes("audio")) {
                      setAudioUrl(MediaUrl + file.Path);
                  }
                  else if (file.Type.includes("pdf")) {
                      window.open(MediaUrl + file.Path, '_blank');
                  }
              }}>View</button>
          ) : null}
          {videoUrl && (
              <>
                  <button className="Close Btn" onClick={() => {setVideoUrl(null) } }>close</button>
              <video className="attachedVideo" x-webkit-airplay="allow" controls muted style={{ width: '100%' }} >
                  <source src={videoUrl} type={file.Type}/>
                      something went wrong</video>
              </>
          )}
          {audioUrl && (
              <>
                  <button className="Close Btn" onClick={() => { setAudioUrl(null) }}>close</button>
                  <audio className="attachedAudio" controls>
                      <source src={audioUrl} type={file.Type} />
                          Your browser does not support the audio tag.
                  </audio>
              </>
          )}
      </div>
  );
}

export default FileItem;