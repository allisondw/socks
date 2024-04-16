import React, { useRef, useEffect } from 'react';
import "./App.css";

const App = () => {
  const canvasRef = useRef(null);
  const socksRef = useRef([]);
  const scoreRef = useRef(0);
  const requestRef = useRef();

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    canvas.width = 800;
    canvas.height = 600;

    let elon = { x: 375, y: 500, speed: 5 };
    let byte = { x: 325, y: 520, speed: 4 };
    let keysPressed = {};

    document.addEventListener('keydown', (event) => keysPressed[event.key] = true);
    document.addEventListener('keyup', (event) => keysPressed[event.key] = false);

    const moveElon = () => {
      if (keysPressed['ArrowRight']) elon.x = Math.min(elon.x + elon.speed, canvas.width - 50);
      if (keysPressed['ArrowLeft']) elon.x = Math.max(elon.x - elon.speed, 0);
      if (keysPressed['ArrowUp']) elon.y = Math.max(elon.y -= elon.speed, 200);
      if (keysPressed['ArrowDown']) elon.y = Math.min(elon.y += elon.speed, canvas.height - 50);
    };

    const addNewSock = () => {
      socksRef.current.push({
        x: Math.random() * (canvas.width - 20),
        y: 0,
        height: 10,
        width: 20,
        speed: Math.random() * 3 + 2
      });
    };

    const checkCollision = (sock) => {
      return elon.x < sock.x + 20 && 
             elon.x + 50 > sock.x && 
             elon.y < sock.y + 10 && 
             elon.y + 50 > sock.y;   
  };

    const moveSocks = () => {
      socksRef.current = socksRef.current.map(sock => {
        if (checkCollision(sock)) {
          scoreRef.current += 1;
          return null;
        }
        return { ...sock, y: sock.y + sock.speed };
      }).filter(sock => sock !== null && sock.y <= canvas.height);
    };
    
    const drawElements = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);
      // Draw Elon
      context.fillStyle = 'blue';
      context.fillRect(elon.x, elon.y, 50, 50);
      // Draw Byte
      context.fillStyle = 'red';
      context.fillRect(byte.x, byte.y, 30, 30);
      // Draw Socks
      socksRef.current.forEach(sock => {
        context.fillStyle = 'grey';
        context.fillRect(sock.x, sock.y, 20, 10);
      });

      context.font = '12px Arial';
      context.fillStyle = 'black';
      context.fillText(`Score: ${scoreRef.current}`, 10, 20);
    };

    const updateGame = () => {
      moveElon();
      moveSocks();
      drawElements();
      requestRef.current = requestAnimationFrame(updateGame);
    };

    updateGame();
    const sockInterval = setInterval(addNewSock, 1500);

    return () => {
      clearInterval(sockInterval);
      cancelAnimationFrame(requestRef.current);
      document.removeEventListener('keydown', (event) => keysPressed[event.key] = true);
      document.removeEventListener('keyup', (event) => keysPressed[event.key] = false);
    };
  }, []);

  return (
    <div className='app'>
      <canvas ref={canvasRef} width={800} height={600} className='game-canvas'/>
    </div>
  );
};

export default App;
