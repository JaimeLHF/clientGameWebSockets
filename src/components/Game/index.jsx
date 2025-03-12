import io from "socket.io-client";
import { useEffect, useState, useRef } from "react";
import styles from "./Game.module.css";
import { QRCodeSVG } from "qrcode.react";
import ballImg from "../../assets/images/ball.png";
import paddleImg from "../../assets/images/paddle.png";
import life from "../../assets/images/life.png";
import brick from "../../assets/images/brick.png";
import Phaser from "phaser";

const socket = io.connect(import.meta.env.VITE_API_BASE_URL);

const Game = () => {
    const [roomId, setRoomId] = useState("");
    const [modal, setModal] = useState(true);
    const [loading, setLoading] = useState(true);
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
            };
            const create = function () {
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

                for (let row = 0; row < colors.length; row++) {
                    for (let col = 0; col < 8; col++) {
                        const brick = bricks.create(100 + col * 80, 100 + row * 30, "brick");
                        brick.setTint(colors[row]);
                        brick.setOrigin(0.5, 0.5); // Centraliza o bloco
                        brick.refreshBody(); // Atualiza o corpo para refletir o novo tamanho
                    }
                }

                // Colisão da bola com o paddle
                this.physics.add.collider(ballRef.current, paddleRef.current, () => {
                    const randomDirection = Phaser.Math.Between(-50, 50);
                    ballRef.current.setVelocityX(ballRef.current.body.velocity.x + randomDirection);
                });

                // Colisão da bola com os blocos
                this.physics.add.collider(ballRef.current, bricks, (ball, brick) => {
                    brick.destroy(); // Destruir o bloco ao colidir
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

                // Verificar posição do paddle
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
                    loseLife();
                }
            };

            const config = {
                type: Phaser.AUTO,
                width: 800,
                height: 600,
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

        // Função para perder uma vida
        function loseLife() {
            lives -= 1;

            // Remover uma das vidas visuais
            const life = livesText.getChildren()[lives];
            if (life) {
                life.destroy();
            }

            if (lives <= 0) {
                console.log("Game Over");
                this.add.text(350, 300, "Game Over", {
                    fontSize: "40px",
                    fill: "#ff0000"
                });
                ballRef.current.setVelocity(0); // Parar a bola
                ballRef.current.setPosition(400, 520); // Resetar a posição da bola
                paddleRef.current.setPosition(400, 550); // Resetar a posição do paddle
            } else {
                // Reiniciar a posição da bola
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
                    <p>{`${import.meta.env.VITE_CLIENT_BASE_URL}/controller?roomId=${roomId}`}</p>
                </div>
            )}

        </>
    );
};

export default Game;
