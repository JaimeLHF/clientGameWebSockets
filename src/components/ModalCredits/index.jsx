import React from 'react';
import './ModalCredits.css';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import { RiInstagramFill } from 'react-icons/ri';

const ModalCredits = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal_credits-content">

                <p>Thank you for playing our game!</p>
                <p>This is a simple game, but it means a lot to my learning.</p>
                <h2>Developed by Jaime Luiz Hansen Filho</h2>
                <p>Follow me on:</p>
                <ul>
                    <li>
                        <a href="https://github.com/your-github-username" target="_blank" rel="noopener noreferrer">
                            GitHub <FaGithub />
                        </a>
                    </li>
                    <li>
                        <a href="https://instagram.com/your-instagram-username" target="_blank" rel="noopener noreferrer">
                            Instagram <RiInstagramFill />
                        </a>
                    </li>
                    <li>
                        <a href="https://instagram.com/your-instagram-username" target="_blank" rel="noopener noreferrer">
                            Linkedin <FaLinkedin />
                        </a>
                    </li>
                </ul>
                <button onClick={onClose}>Close</button>
            </div>
        </div>
    );
};

export default ModalCredits;