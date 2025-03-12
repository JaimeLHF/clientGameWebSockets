import io from "socket.io-client";
import { useEffect, useState, useRef } from "react";
import styles from "./Game.module.css";
import { QRCodeSVG } from "qrcode.react";
import ballImg from "../../assets/images/ball.png";
import paddleImg from "../../assets/images/paddle.png";
import life from "../../assets/images/life.png";
import brick from "../../assets/images/brick.png";
import brickHitSound from "../../assets/sounds/break.mp3";
import ballHitSound from "../../assets/sounds/ballhit.mp3";
import victorySound from "../../assets/sounds/win.mp3";
import gameOverSound from "../../assets/sounds/gameOver.mp3";
import lostLifeSound from "../../assets/sounds/lostLife.mp3";
import gameStartSound from "../../assets/sounds/gamestart.mp3";

import Phaser from "phaser";

const socket = io.connect(import.meta.env.VITE_API_BASE_URL);

const Game = () => {
    const [roomId, setRoomId] = useState("");
    const [modal, setModal] = useState(true);
    const gameRef = useRef(null);
    const ballAttached = useRef(true);
    const ballRef = useRef(null);
    const paddleRef = useRef(null);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const id = params.get("roomId");

        if (id) {
            setRoomId(id);
            socket.emit("join", { roomId: id, role: "game" });
            console.log(`Game entrou na sala ${id}`);
        }

        socket.on("direction", (data) => {
            launchBall();
            moveSquare(data.direction);
        });

        socket.on("controller_opened", () => {
            launchBall();
        });

        socket.on("room_id", (data) => {
            setRoomId(data.roomId);
            setModal(false);
            console.log(`Room ID recebido: ${data.roomId}`);
        });

        return () => {
            socket.off("direction");
            socket.off("controller_opened");
            socket.off("room_id");
        };
    }, []);



    useEffect(() => {
        let lives = 3;
        let livesText;

        if (!gameRef.current) {
            const preload = function () {
                this.load.image("ball", ballImg);
                this.load.image("paddle", paddleImg);
                this.load.image("life", life);
                this.load.image("brick", brick);
                this.load.audio("gameStart", gameStartSound);
                this.load.audio("brickHit", brickHitSound);
                this.load.audio("ballHit", ballHitSound);
                this.load.audio("victory", victorySound);
                this.load.audio("gameOver", gameOverSound);
                this.load.audio("lostLife", lostLifeSound);
            };

            const create = function () {
                this.sound.play('gameStart');
                this.add.graphics()
                    .lineStyle(4, 0xff0000, 1)
                    .strokeRect(0, 0, this.scale.width, this.scale.height)
                    .setAlpha(0.5);

                // Bola
                ballRef.current = this.physics.add.sprite(400, 520, "ball");
                ballRef.current.setCollideWorldBounds(true);
                ballRef.current.setBounce(1);

                // Paddle
                paddleRef.current = this.physics.add.sprite(400, 550, "paddle");
                paddleRef.current.setCollideWorldBounds(true);
                paddleRef.current.setImmovable(true);

                // Criar o grupo de blocos (ladrilhos)
                const colors = [0xff0000, 0xff7105, 0xffff00, 0x00ff00, 0x00c4fa, 0xeb02c4];
                const bricks = this.physics.add.staticGroup();
                let totalBricks = 0;

                for (let row = 0; row < colors.length; row++) {
                    for (let col = 0; col < 8; col++) {
                        const brick = bricks.create(100 + col * 80, 100 + row * 30, "brick");
                        brick.setTint(colors[row]);
                        brick.setOrigin(0.5, 0.5); // Centraliza o bloco
                        brick.refreshBody(); // Atualiza o corpo para refletir o novo tamanho
                        totalBricks++;
                    }
                }

                // Colisão da bola com os blocos
                this.physics.add.collider(ballRef.current, bricks, (ball, brick) => {
                    brick.destroy(); // Destruir o bloco ao colidir
                    this.sound.play('ballHit');

                    totalBricks--;

                    if (totalBricks === 0) {

                        this.add.text(300, 300, "Victory !!", {
                            fontSize: "40px",
                            fill: "#00ff00",
                        });

                        this.sound.play('victory');
                    }
                });

                // Texto das vidas
                livesText = this.add.group({
                    key: "life",
                    repeat: lives - 1,
                    setXY: { x: 27, y: 27, stepX: 40 },
                });

                livesText.children.iterate((child) => {
                    child.setScale(0.08);
                });
            };



            const update = function () {

                if (paddleRef.current) {
                    const paddleWidth = paddleRef.current.width;
                    if (paddleRef.current.x < 0) {
                        paddleRef.current.setX(0);
                    } else if (paddleRef.current.x + paddleWidth > 800) {
                        paddleRef.current.setX(800 - paddleWidth);
                    }
                }

                // Verificar se a bola saiu da tela
                if (ballRef.current && ballRef.current.y >= 590) {
                    loseLife.call(this);
                }
            };

            const config = {
                type: Phaser.AUTO,
                width: 800,
                height: 600,
                transparent: true,
                scale: {
                    mode: Phaser.Scale.FIT,
                    autoCenter: Phaser.Scale.CENTER_BOTH,
                },
                physics: {
                    default: "arcade",
                    arcade: {
                        gravity: { y: 0 },
                        debug: false,
                    },
                },
                scene: {
                    preload: preload,
                    create: create,
                    update: update,
                },
            };

            gameRef.current = new Phaser.Game(config);

            return () => {
                gameRef.current?.destroy(true);
                gameRef.current = null;
            };
        }

        function loseLife() {
            lives -= 1;

            const life = livesText.getChildren()[lives];
            if (life) {
                life.destroy();
                this.sound.play('lostLife');
            }

            if (lives <= 0) {
                console.log("Game Over");
                this.add.text(300, 300, "Game Over", {
                    fontSize: "40px",
                    fill: "#ff0000"
                });
                this.sound.play('gameOver');
                ballRef.current.setVelocity(0);
                ballRef.current.setPosition(400, 520);
                paddleRef.current.setPosition(400, 550);
            } else {

                ballRef.current.setPosition(paddleRef.current.x, 520);
                ballRef.current.setVelocity(0);
                ballAttached.current = true;
            }
        }

    }, []);

    function launchBall() {
        if (ballAttached.current && ballRef.current) {
            ballAttached.current = false;
            const randomX = Phaser.Math.Between(-200, 200);
            ballRef.current.setVelocity(randomX, -300);
        }
    }

    const moveSquare = (direction) => {
        setModal(false);
        console.log(direction);
        const step = 10;

        if (paddleRef.current) {
            switch (direction) {
                case "RIGHT":
                    paddleRef.current.x += step;
                    break;
                case "LEFT":
                    paddleRef.current.x -= step;
                    break;
                default:
                    break;
            }
        }
    };

    return (
        <>

            {/* Modal */}
            {modal && (
                <div className={styles.overlay_modal}>
                    <h1>Por favor, escaneie o QR Code abaixo ou copie o link e acesse pelo seu smartphone</h1>
                    <QRCodeSVG value={`${import.meta.env.VITE_CLIENT_BASE_URL}/controller?roomId=${roomId}`} />
                    <div className={styles.linkContainer}>
                        <p>{`${import.meta.env.VITE_CLIENT_BASE_URL}/controller?roomId=${roomId}`}</p>
                        <button
                            className={styles.copyButton}
                            onClick={() => navigator.clipboard.writeText(`${import.meta.env.VITE_CLIENT_BASE_URL}/controller?roomId=${roomId}`)}
                        >
                            📋
                        </button>
                    </div>
                </div>
            )}


        </>
    );
};

export default Game;
