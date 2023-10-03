import React, { useState } from 'react';
import Modal from "../../General/Modal/Modal"
import { DialogCard } from '../../Cards/Cards';
import "./UserListModal.scss"

function UserListModal({ close, open, list, onClick }) {
    const [filter, setFilter] = useState("");
    
    function Filter(item) {
        const user = item.Companion ? item.Companion : item;
        return user.Name.toLowerCase().includes(filter.toLowerCase());
    }

    function onClose(item) {
        setFilter('');
        close();
    }

    return (
        <Modal closeModal={onClose} open={open} additionalClass="UserList">
            <input onChange={(e) => setFilter(e.target.value)} value={filter}></input>
            <div className="UserListWrapper">
                {list.filter(Filter).map((item) => {
                    return (
                        <DialogCard key={item.Id} item={item} func={onClick}></DialogCard>
                    );
                })
                }
            </div>
      </Modal>
  );
}

export default UserListModal;