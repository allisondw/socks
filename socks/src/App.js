import React, { useRef, useEffect, useState } from 'react';
import "./App.css";

const App = () => {

  const canvasRef = useRef(null);
 

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    let elon = { x: 375, y: 500, speed: 5 };
    let byte = { x: 325, y: 500, speed: 4 };

    let keysPressed = {};
    document.addEventListener('keydown', (event) => {
      keysPressed[event.key] = true;
    });
    document.addEventListener('keyup', (event) => {
      keysPressed[event.key] = false;
    });

    const moveElon = () => {
      if (keysPressed['ArrowUp']) elon.y -= elon.speed;
      if (keysPressed['ArrowDown']) elon.y += elon.speed;
      if (keysPressed['ArrowRight']) elon.x += elon.speed;
      if (keysPressed['ArrowLeft']) elon.x -= elon.speed;
    };
    // byte's movement is determined by socks falling, always trying to catch the socks/moving towards the falling socks
    const drawCharacters = () => {
      context.fillStyle = 'blue';
      context.fillRect(elon.x, elon.y, 50, 50);

      context.fillStyle = 'red';
      context.fillRect(byte.x, byte.y, 30, 30);
    };

    const updateGame = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);
      moveElon();
      drawCharacters();
      requestAnimationFrame(updateGame);
    };

    updateGame();
  }, []);

  

  return (
    <div className='app'>
      <canvas ref={canvasRef} width={800} height={600} className='game-canvas'/>
    </div>
  )
};

export default App;