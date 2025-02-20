import io from 'socket.io-client';
import './App.css';
import { useState, useEffect } from 'react';

const socket = io.connect('http://82.29.59.166:3000'); // Conecta ao servidor ao carregar o componente

const App = () => {
  const [direction, setDirection] = useState('');

  const handleRight = () => {
    console.log('right')
    socket.emit('move', 'Right ==>');
  };
  const handleLeft = () => {
    console.log('left')
    socket.emit('move', '<== Left');
  };

  useEffect(() => {
    socket.on('direction', (data) => {
      setDirection(data);
    });

    return () => {
      socket.off('direction');
    };
  }), [];

  return (
    <div className='App'>
      <h1>Robot Controller</h1>
      <div className='cointainer'>
        <button onClick={handleLeft}>Left</button>
        <button onClick={handleRight}>Right</button>
      </div>
      <div>
        <span>{direction}</span>
      </div>
    </div>
  );
};

export default App;
