import React, { useEffect, useState } from 'react';
import './Modal.scss';

const Modal = ({
    closeModal,
    closeButton = true,
    open,
    additionalClass,
    children,
}) => {
    useEffect(() => {
        const handleScroll = (event) => {
            event.preventDefault();
        };

        if (open) {
            document.body.classList.add('no-scroll');
            document.addEventListener('scroll', handleScroll, { passive: false });
        }

        return () => {
            document.body.classList.remove('no-scroll');
            document.removeEventListener('scroll', handleScroll);
        };
    }, [open]);

    return (
        <>
            {open ? (
                <>
                    <div onClick={closeModal} className={'dark-bg'}></div>
                    <div className="modal-wrapper">
                        <div className={`modal ${open ? 'modal-animate-in' : 'modal-animate-out'}`}>
                            {closeButton && (
                                <div className="modal-header">
                                    <span
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            closeModal();
                                        }}
                                        className="close-animate"
                                    >
                                        X
                                    </span>
                                </div>
                            )}
                            <div className={`modal-container ${additionalClass}`}>{children}</div>
                        </div>
                    </div>
                </>
            ) : null}
        </>
    );
};

export default Modal;