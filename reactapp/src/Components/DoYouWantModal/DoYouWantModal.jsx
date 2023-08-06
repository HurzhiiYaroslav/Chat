import React from 'react';
import Modal from "../Modal/Modal";
import "./DoYouWantModal.scss"

function DoYouWantModal({ closeModal, open, action, text }) {

  return (
      <Modal closeModal={closeModal} open={open} additionalClass="leave">
          <div className="DoYouWantModalWrapper">
              <p>Do you want {text} ? </p>
              <button className="yesButton" onClick={() => action()}>Yes</button>
              <button className="noButton" onClick={() => closeModal()}>No</button>
          </div>
      </Modal>
  );
}

export default DoYouWantModal;