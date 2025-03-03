import io from "socket.io-client";
import { useEffect, useState } from "react";
import styles from "./Game.module.css";
import { QRCodeSVG } from "qrcode.react";

const socket = io.connect(import.meta.env.VITE_API_BASE_URL);

const Game = () => {
    const [roomId, setRoomId] = useState("");
    const [modal, setModal] = useState(true);
    const [position, setPosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const id = params.get("roomId");
        setRoomId(id);

        if (id) {
            socket.emit("join", { roomId: id, role: "game" });
            console.log(`Game entrou na sala ${id}`);
        }

        // Escutando o evento de movimento
        socket.on("direction", (data) => {
            setModal(false); // Fecha o modal quando o movimento for recebido
            moveSquare(data.direction);
        });

        // Escutando o evento 'controller_opened'
        socket.on("controller_opened", () => {          
            setModal(false); // Fecha o modal assim que o evento for recebido
        });

        return () => {
            socket.off("direction");
            socket.off("controller_opened");
        };
    }, []);

    const moveSquare = (direction) => {
        setModal(false);
        setPosition((prev) => {
            const step = 20;
            switch (direction) {
                case "Right ==>":
                    return { ...prev, x: prev.x + step };
                case "<== Left":
                    return { ...prev, x: prev.x - step };
                case "Up":
                    return { ...prev, y: prev.y - step };
                case "Down":
                    return { ...prev, y: prev.y + step };
                default:
                    return prev;
            }
        });
    };

    return (
        <div className={styles.gameWrapper}>
            {/* Modal */}
            {modal && (
                <div className={styles.overlay_modal}>
                    <h1>Por favor, escaneie o QR Code abaixo ou copie o link e acesse pelo seu smartphone</h1>
                    <QRCodeSVG value={`${import.meta.env.VITE_CLIENT_BASE_URL}/controller?roomId=${roomId}`} />
                    <p>{`${import.meta.env.VITE_CLIENT_BASE_URL}/controller?roomId=${roomId}`}</p>
                </div>
            )}

            {/* Jogo */}
            <div className={styles.gameContainer}>
                <div>
                    <h1>Game</h1>
                    <p>Room ID: {roomId}</p>
                </div>
                <div
                    className={styles.square}
                    style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
                />
            </div>
        </div>
    );
};

export default Game;
