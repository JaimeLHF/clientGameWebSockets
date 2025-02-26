import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import io from "socket.io-client";
import styles from "./HomePage.module.css";
import { useNavigate } from "react-router-dom";

const socket = io.connect(import.meta.env.VITE_API_BASE_URL);

const HomePage = () => {
    const [roomId, setRoomId] = useState("");
    const navigate = useNavigate(); // Hook para navegação programática

    const handleCreateRoom = () => {
        socket.emit("create-room");
        socket.on("room-created", (id) => {
            setRoomId(id);
            window.open(`/controller?roomId=${id}`, "_blank");          
            navigate(`/game?roomId=${id}`);
        });
    };

    return (
        <div className={styles.homePage}>
            <h1 className={styles.title}>Welcome to this Game !!</h1>
            <p className={styles.description}>
                Scan the QR Code or copy the link to access from your phone
            </p>

            <div className={styles.container}>
                <QRCodeSVG value={`localhost/game?roomId=${roomId}`} />
                <button onClick={handleCreateRoom}>Create and Join Game</button>
            </div>
        </div>
    );
};

export default HomePage;
