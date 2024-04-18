import React, { useRef, useEffect, useMemo, useState } from 'react';
import "./App.css";

const App = () => {
  const canvasRef = useRef(null);
  const socksRef = useRef([]);
  const scoreRef = useRef(0);
  const requestRef = useRef();
  const [elonSpriteLoaded, setElonSpriteLoaded] = useState(false);

  const elonSprite = useMemo(() => {
    const img = new Image();
    img.onload = () => {
      console.log('Sprite has loaded');
      setElonSpriteLoaded(true);
    };
    img.onerror = () => {
      console.error('Failed to load sprite image');
    };  
    img.src = '/sprites/Elon_spritesheet.png';
    return img;
  }, []); 

  const elon = useRef({
    x: 375, 
    y: 500, 
    speed: 5,
    width: 32,
    height: 32, 
    state: 'idle',
    currentFrame: 0
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    canvas.width = 800;
    canvas.height = 600;

    const SPRITE_WIDTH = 32; 
    const SPRITE_HEIGHT = 28;
    const FRAMES_PER_STATE = 2;
    const FRAME_TIME = 150;
    let lastFrameTime = Date.now();

    const updateFrame = () => {
      const now = Date.now();
      if (now - lastFrameTime > FRAME_TIME) {
        elon.current.currentFrame = (elon.current.currentFrame + 1) % FRAMES_PER_STATE;
        lastFrameTime = now;
      }
    };

    let byte = { x: 325, y: 520, speed: 2 };
    let keysPressed = {};

    document.addEventListener('keydown', (event) => keysPressed[event.key] = true);
    document.addEventListener('keyup', (event) => keysPressed[event.key] = false);

    const moveElon = () => {
      const elonObj = elon.current;
      if (keysPressed['ArrowRight']) {
        elonObj.x = Math.min(elonObj.x + elonObj.speed, canvas.width - SPRITE_WIDTH);
        elonObj.state = 'walkingRight';
      }
      if (keysPressed['ArrowLeft']) {
        elonObj.x = Math.max(elonObj.x - elonObj.speed, 0);
        elonObj.state = 'walkingLeft';
      }
      if (keysPressed['ArrowUp']) {
        elonObj.y = Math.max(elonObj.y -= elonObj.speed, 200);
        elonObj.state = 'walkingUp';
      }
      if (keysPressed['ArrowDown']) {
        elonObj.y = Math.min(elonObj.y += elonObj.speed, canvas.height - SPRITE_HEIGHT);
        elonObj.state = 'walkingDown';
      }
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

    const moveByte = () => {
      if (socksRef.current.length > 0) {
        const closestSock = socksRef.current.reduce((closest, sock) => {
          return Math.abs(sock.x - byte.x) < Math.abs(closest.x - byte.x) ? sock : closest;
        }, socksRef.current[0]);
        if (closestSock.x < byte.x) {
          byte.x -= byte.speed;
          byte.y -= byte.speed;
        } else if (closestSock.x > byte.x) {
          byte.x += byte.speed;
          byte.y += byte.speed;
        }
      }
    }

    const checkCollision = (sock, character) => {
      return character.x < sock.x + 20 &&
             character.x + character.width > sock.x &&
             character.y < sock.y &&
             character.y + character.height > sock.y;
    };

    const moveSocks = () => {
      let elonObj = elon.current;
      socksRef.current = socksRef.current.map(sock => {
        if (checkCollision(sock, elonObj)) {
          scoreRef.current += 1;
          console.log('Elon caught a sock');
          return null;
        } else if (checkCollision(sock, byte)) {
          scoreRef.current -= 1;
          console.log('Byte caught a sock');
          return null;
        }
        return { ...sock, y: sock.y + sock.speed };
      }).filter(sock => sock !== null && sock.y <= canvas.height);
    };

    const STATES = {
      idle: 0,
      walkingRight: 1,
      walkingLeft: 2,
      walkingDown: 3,
      walkingUp: 4
    };

    const drawElon = () => {
      console.log('drawElon called', elonSpriteLoaded);
      if(elonSpriteLoaded) {
        const elonObj = elon.current;
        const frameX = elonObj.currentFrame * elonObj.width;
        const frameY = STATES[elonObj.state] * elonObj.height;

        const SCALE = 3;
      
        context.drawImage(
          elonSprite,
          frameX,
          frameY,
          elonObj.width,
          elonObj.height,
          elonObj.x,
          elonObj.y,
          elonObj.width * SCALE,
          elonObj.height * SCALE
        );
      }
    };
    
    const drawElements = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);
      drawElon();
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
      moveByte();
      drawElon();
      drawElements();
      updateFrame();
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
  }, [elonSpriteLoaded, elonSprite]);

  return (
    <div className='app'>
      <canvas ref={canvasRef} width={800} height={600} className='game-canvas'/>
    </div>
  );
};

export default App;