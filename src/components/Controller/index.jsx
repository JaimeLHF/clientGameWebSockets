import io from "socket.io-client";
import styles from "./Controller.module.css";
import { useState, useEffect, useRef } from "react";
import { CiPlay1 } from "react-icons/ci";

const socket = io.connect(import.meta.env.VITE_API_BASE_URL);

const Controller = () => {
    const [roomId, setRoomId] = useState("");
    const [showPlayButton, setShowPlayButton] = useState(true); // Estado do botão Play
    const intervalRef = useRef(null);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const id = params.get("roomId");
        setRoomId(id);

        if (id) {
            socket.emit("join", { roomId: id, role: "controller" });
        }
    }, []);

    const handlePlayClick = () => {
        setShowPlayButton(false); // Esconde o modal ao clicar
        socket.emit("controller_opened", { roomId }); // Envia evento para o Game
        socket.emit("move", 'UP');
    };

    const startMoving = (direction) => {
        if (intervalRef.current) return;
        socket.emit("move", { direction });
        console.log("startMoving", direction);
        intervalRef.current = setInterval(() => {
            socket.emit("move", { direction });
        }, 35);
    };

    const stopMoving = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    };

    return (
        <div className={styles.container}>
            {showPlayButton && (
                <div className={styles.overlay}>
                    <div className={styles.modal}>
                        <button className={styles.btn_play} onClick={handlePlayClick}><CiPlay1 /></button>
                    </div>
                </div>
            )}

            <h1>Controller</h1>
            <p>Room ID: {roomId}</p>
            <div className={styles.buttons}>
                <button
                    onMouseDown={() => startMoving("LEFT")}
                    onMouseUp={stopMoving}
                    onMouseLeave={stopMoving}
                    onTouchStart={() => startMoving("LEFT")}
                    onTouchEnd={stopMoving}
                    style={{ userSelect: "none" }}
                >
                    Left
                </button>
                <button
                    onMouseDown={() => startMoving("RIGHT")}
                    onMouseUp={stopMoving}
                    onMouseLeave={stopMoving}
                    onTouchStart={() => startMoving("RIGHT")}
                    onTouchEnd={stopMoving}
                    style={{ userSelect: "none" }}
                >
                    Right
                </button>
            </div>
        </div>
    );
};

export default Controller;
