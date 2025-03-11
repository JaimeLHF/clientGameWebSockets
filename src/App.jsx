import { useState } from 'react';
import io from "socket.io-client";
import styles from './App.module.css';
import { CiPlay1 } from 'react-icons/ci';
import { Link, useNavigate } from 'react-router-dom';

const socket = io.connect(import.meta.env.VITE_API_BASE_URL);

const App = () => {
  const [roomId, setRoomId] = useState("");
  const navigate = useNavigate(); // Hook para navegação programática

  const handleCreateRoom = () => {
    socket.emit("create-room");
    socket.on("room-created", (id) => {
      if (id) {
        navigate(`/game?roomId=${id}`);
        setRoomId(id);
      }
    });
  };

  return (
    <div className={styles.app}>
      <p className={styles.welcome}>Welcome to</p>
      <h1 className={styles.name_game}>Brick Breaker Game</h1>
      <Link to={`/game?roomId=${roomId}`}> <button className={styles.btn_play} onClick={handleCreateRoom}><CiPlay1 /></button></Link>
    </div>
  );
};

export default App;
