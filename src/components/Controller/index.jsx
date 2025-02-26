import io from "socket.io-client";
import styles from "./Controller.module.css";
import { useState, useEffect, useRef } from "react";

const socket = io.connect(import.meta.env.VITE_API_BASE_URL);

const Controller = () => {
    const [roomId, setRoomId] = useState("");
    const intervalRef = useRef(null); // Referência para armazenar o intervalo

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const id = params.get("roomId");
        setRoomId(id);

        if (id) {
            socket.emit("join", { roomId: id, role: "controller" });
        }
    }, []);

    const startMoving = (direction) => {
        // Evita múltiplos intervalos
        if (intervalRef.current) return;

        socket.emit("move", { roomId, direction });

        intervalRef.current = setInterval(() => {
            socket.emit("move", { roomId, direction });
        }, 35); // Envia a ação a cada 100ms enquanto o botão estiver pressionado
    };

    const stopMoving = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    };

    return (
        <div className={styles.container}>
            <h1>Robot Controller</h1>
            <p>Room ID: {roomId}</p>
            <div className={styles.buttons}>
                <button
                    onMouseDown={() => startMoving("<== Left")}
                    onMouseUp={stopMoving}
                    onMouseLeave={stopMoving} // Para garantir que pare ao sair do botão
                    style={{ userSelect: "none" }}
                >
                    Left
                </button>
                <button
                    onMouseDown={() => startMoving("Right ==>")}
                    onMouseUp={stopMoving}
                    onMouseLeave={stopMoving}
                    style={{ userSelect: "none" }}
                >
                    Right
                </button>
            </div>
        </div>
    );
};

export default Controller;
