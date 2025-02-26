import io from "socket.io-client";
import styles from "./Controller.module.css"
import { useState, useEffect } from "react";

const socket = io.connect(import.meta.env.VITE_API_BASE_URL);

const Controller = () => {
    const [roomId, setRoomId] = useState("");

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const id = params.get("roomId");
        setRoomId(id);

        if (id) {
            socket.emit("join", { roomId: id, role: "controller" });
        }
    }, []);

    const handleRight = () => {
        socket.emit("move", { roomId, direction: "Right ==>" });
    };

    const handleLeft = () => {
        socket.emit("move", { roomId, direction: "<== Left" });
    };

    return (
        <div className={styles.container}>
            <h1>Robot Controller</h1>
            <p>Room ID: {roomId}</p>
            <div className={styles.buttons}>
                <button onClick={handleLeft}>Left</button>
                <button onClick={handleRight}>Right</button>
            </div>
        </div>
    );
};

export default Controller;
