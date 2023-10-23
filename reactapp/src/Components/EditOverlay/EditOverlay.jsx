import React from 'react';
import "./EditOverlay.scss"
function EditOverlay({func }) {
  return (
      <div className="editOverlay" onClick={func}>Edit</div>
  );
}

export default EditOverlay;