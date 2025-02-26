import io from "socket.io-client";
import { useEffect, useState } from "react";
import styles from "./Game.module.css";

const socket = io.connect("http://localhost:3000");

const Game = () => {
    const [roomId, setRoomId] = useState("");
    const [position, setPosition] = useState({ x: 50, y: 50 });

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const id = params.get("roomId");
        setRoomId(id);

        if (id) {
            socket.emit("join", { roomId: id, role: "game" });
        }

        socket.on("direction", (data) => {
            moveSquare(data.direction);
        });

        return () => {
            socket.off("direction");
        };
    }, []);

    const moveSquare = (direction) => {
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
    );
};

export default Game;
