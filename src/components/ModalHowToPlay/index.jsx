import './ModalHowToPlay.css';
import PropTypes from 'prop-types';
import { Carousel } from 'antd';

const ModalHowToPlay = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className='modal-header'>
                    <h2><span style={{ fontSize: "48px" }}>🎮</span> How to Play</h2>
                    <p>Hey there! Ready to rock? 🤘 Here’s how to get started:</p>
                </div>
                <Carousel
                    className={"carousel"}
                    arrows
                >
                    <div className="carousel-slide">
                        <h3>1️⃣ Step One</h3>
                        <p>Pop this page open on your PC or laptop. Easy, right? 😎</p>
                    </div>
                    <div className="carousel-slide">
                        <h3>2️⃣ Step Two</h3>
                        <p>Hit that *PLAAAY!* button! 🚀 You'll be taken to the game screen. Now, just scan the QR code or copy the link and open it on your phone. 📱</p>
                    </div>
                    <div className="carousel-slide">
                        <h3>3️⃣ The Fun Part!</h3>
                        <p>Once you open the link on your phone, voilà! Your phone is now your game controller! Just tap *PLAAAY!* on your phone and get ready to game! 💥</p>
                    </div>
                    <div className="carousel-slide">
                        <h3>4️⃣ You’re All Set!</h3>
                        <p>Your phone’s the controller and your PC is the game! So.. have fun and enjoy the experience! 🏆</p>
                    </div>
                </Carousel>

                <button onClick={onClose}>Got it! 👍</button>
            </div>
        </div>
    );
};

ModalHowToPlay.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
};

export default ModalHowToPlay;
