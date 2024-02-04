import React, { useState, useEffect, useMemo, useRef, useReducer } from 'react';
import { throttle, debounce } from 'lodash';
import Modal from "../../General/Modal/Modal";
import { GetChatLogs } from '../../../Utilities/signalrMethods';
import { LogsLoading } from '../../../assets/animated';
import "./LogsModal.scss";

function LogsModal({ connection, chat, open, close }) {
    const [items, setItems] = useState([]);
    const [pageNumber, setPageNumber] = useState(0);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [filter, setFilter] = useState('');
    const logsContainer = useRef(null);

    const fetchData = async () => {
        if (!hasMore || loading) return;
        try {
            setLoading(true);
            GetChatLogs(connection, chat.Id, pageNumber);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const recieveLogs = (logs) => {
        if (logs !== null) {
            setItems((prevItems) => [...prevItems, ...logs]);
            setPageNumber((prevPageNumber) => prevPageNumber + 1);
            setHasMore(logs.length > 0);
        } else {
            setHasMore(false);
            console.log("Logs are null");
        }
        setLoading(false);
    };

    const filteredLogs = useMemo(() => {
        return items
            .filter((item) => item.message.toLowerCase().includes(filter.toLowerCase()) || item.time.includes(filter.toLowerCase()))
            .map((item, index) => (
                <div className="logItem" key={index}>
                    <div className="logTime">{item.time}</div>
                    <div className="logMessage">{item.message}</div>
                </div>
            ));
    }, [items, filter]);

    const handleScroll = () => {
        const scrollContainer = logsContainer.current;
        if (scrollContainer.scrollHeight - scrollContainer.scrollTop < scrollContainer.clientHeight + 50) {
            fetchData();
        }
    };

    const throttledHandleScroll = throttle(handleScroll, 300);

    const handleFilterChange = (event) => {
        const { value } = event.target;
        setFilter(value);
    };

    useEffect(() => {
        const scrollContainer = logsContainer.current;
        scrollContainer.addEventListener('scroll', throttledHandleScroll);
        return () => scrollContainer.removeEventListener('scroll', throttledHandleScroll);
    }, [throttledHandleScroll]);

    useEffect(() => {
        if (connection !== null) {
            connection.on("ReceiveChatLogs", recieveLogs);
        }
        window.addEventListener('scroll', handleScroll);
        return () => {
            connection.off("ReceiveChatLogs", recieveLogs);
            window.removeEventListener('scroll', handleScroll);
        };
    }, [connection]);

    useEffect(() => {
        if (hasMore && !loading) {
            fetchData();
        }
    }, [pageNumber]);

    return (
        <Modal closeModal={close} open={open}>
            <input
                value={filter}
                onChange={handleFilterChange}
            />
            <div className="logsInner" ref={logsContainer}>
                {filteredLogs}
                {loading ? <LogsLoading /> : null}
            </div>
        </Modal>
    );
}

export default LogsModal;