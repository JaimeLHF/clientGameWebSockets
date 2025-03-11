import { useEffect, useRef, useState } from 'react';
import io from "socket.io-client";
import styles from './App.module.css';
import { CiPlay1 } from 'react-icons/ci';
import { Link, useNavigate } from 'react-router-dom';
import ballImg from './assets/images/ball.png';
import Phaser from 'phaser';
import { FaQuestionCircle } from 'react-icons/fa';

const socket = io.connect(import.meta.env.VITE_API_BASE_URL);

const App = () => {
  const [roomId, setRoomId] = useState("");
  const navigate = useNavigate();
  const gameRef = useRef(null);

  const handleCreateRoom = () => {
    socket.emit("create-room");
    socket.on("room-created", (id) => {
      if (id) {
        navigate(`/game?roomId=${id}`);
        setRoomId(id);
      }
    });
  };

  useEffect(() => {
    const handleResize = () => {
      if (gameRef.current) {
        gameRef.current.scale.resize(window.innerWidth, window.innerHeight);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (gameRef.current) {
      const preload = function () {
        this.load.image("ball", ballImg);
      }
      const create = function () {
        const ball = this.physics.add.image(window.innerWidth / 2, window.innerHeight / 2, "ball");
        ball.setCollideWorldBounds(true);
        ball.setBounce(1);

        const particles = this.add.particles(0, 0, "ball", {
          speed: 100,
          scale: { start: 0.75, end: 0 },
          blendMode: 'ADD'
        });
        particles.startFollow(ball);

        const randomSpeedX = Phaser.Math.Between(100, 300);
        const randomSpeedY = Phaser.Math.Between(100, 300);
        ball.setVelocity(randomSpeedX, randomSpeedY);

        // Atualizar o tamanho da física do mundo
        this.physics.world.setBounds(0, 0, window.innerWidth, window.innerHeight);

        this.physics.world.on('worldstep', () => {
          if (ball.x <= 0 || ball.x >= window.innerWidth) {
            ball.setVelocityX(ball.body.velocity.x * -1); // Inverter a velocidade no eixo X
          }
          if (ball.y <= 0 || ball.y >= window.innerHeight) {
            ball.setVelocityY(ball.body.velocity.y * -1); // Inverter a velocidade no eixo Y
          }
        });
      }


      const config = {
        type: Phaser.AUTO,
        width: window.innerWidth,
        height: window.innerHeight,
        parent: gameRef.current,
        transparent: true,
        physics: {
          default: 'arcade',
          arcade: {
            gravity: { y: 0 },
            debug: false,
          },
        },
        scene: {
          preload: preload,
          create: create,
        },
      };

      gameRef.current = new Phaser.Game(config);

      return () => {
        gameRef.current?.destroy(true);
        gameRef.current = null;
      };
    }
  }, []);

  return (
    <div className={styles.app}>
      <div className={styles.instructions}>
        <FaQuestionCircle />
      </div>
      <p className={styles.welcome}>Welcome to</p>
      <h1 className={styles.name_game}>Brick Breaker Game</h1>
      <Link to={`/game?roomId=${roomId}`}>
        <button className={styles.btn_play} onClick={handleCreateRoom}><CiPlay1 /></button>
      </Link>
      <div className={styles["phaser-container"]} ref={gameRef}></div>
      <p className={styles.howtoplay}>How to play?</p>
    </div>
  );
};

export default App;
