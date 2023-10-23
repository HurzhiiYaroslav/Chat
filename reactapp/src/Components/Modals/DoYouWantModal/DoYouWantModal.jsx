import React from 'react';
import Modal from "../../General/Modal/Modal";
import "./DoYouWantModal.scss"

function DoYouWantModal({ closeModal, open, action, text }) {

  return (
      <Modal closeModal={closeModal} open={open} additionalClass="leave">
          <div className="DoYouWantModalWrapper">
              <p>Do you want {text} ? </p>
              <div className="yesNoBtns">
                    <button className="yesButton" onClick={() => action()}>Yes</button>
                    <button className="noButton" onClick={() => closeModal()}>No</button>
              </div>
          </div>
      </Modal>
  );
}

export default DoYouWantModal;