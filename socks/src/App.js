// create sprite sheet for socks
// create background
// add "click to start" to begin socks falling
// add sound effects
// add how to win
// deploy
// chunk out what I can from App.js into separate files for readability

import React, { useRef, useEffect, useMemo, useState } from 'react';
import "./App.css";

const App = () => {
  const canvasRef = useRef(null);
  const socksRef = useRef([]);
  const scoreRef = useRef(0);
  const requestRef = useRef();
  const [elonSpriteLoaded, setElonSpriteLoaded] = useState(false);
  const [byteSpriteLoaded, setByteSpriteLoaded] = useState(false);
  const [byteIdleSince, setByteIdleSince] = useState(null);
  const [byteIsSpinning, setByteIsSpinning] = useState(false);


  const elonSprite = useMemo(() => {
    const img = new Image();
    img.onload = () => {
      console.log('Elon sprite has loaded');
      setElonSpriteLoaded(true);
    };
    img.onerror = () => {
      console.error('Failed to load Elon sprite image');
    };  
    img.src = '/sprites/elon_spritesheet.png';
    return img;
  }, []); 

  const elon = useRef({
    x: 375, 
    y: 450, 
    speed: 5,
    width: 32,
    height: 32, 
    state: 'idle',
    currentFrame: 0
  });

  const byteSprite = useMemo(() => {
    const img = new Image();
    img.onload = () => {
      console.log('Byte sprite has loaded');
      setByteSpriteLoaded(true);
    };
    img.onerror = () => {
      console.error('Failed to load Byte sprite image');
    };  
    img.src = '/sprites/byte_spritesheet2.png';
    return img;
  }, []); 

  const byte = useRef({
    x: 400, 
    y: 550, 
    speed: 3.5,
    width: 12,
    height: 12, 
    state: 'idle',
    currentFrame: 0
  });

  useEffect(() => {

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    canvas.width = 800;
    canvas.height = 600;

    elon.current.lastFrameTime = Date.now();
    byte.current.lastFrameTime = Date.now();
    const FRAMES_PER_STATE = 2;
    const FRAME_TIME = 150;

    const updateFrame = () => {
      const now = Date.now();
      const updateCharacterFrame = (character) => {
        if (now - character.lastFrameTime > FRAME_TIME) {
          character.currentFrame = (character.currentFrame + 1) % FRAMES_PER_STATE;
          character.lastFrameTime = now;
        }
      };

      updateCharacterFrame(elon.current);
      updateCharacterFrame(byte.current);
    };

    let keysPressed = {};

    document.addEventListener('keydown', (event) => keysPressed[event.key] = true);
    document.addEventListener('keyup', (event) => keysPressed[event.key] = false);

    const moveElon = () => {
      const elonObj = elon.current;
      let moved = false;

      if (keysPressed['ArrowRight']) {
        elonObj.x = Math.min(elonObj.x + elonObj.speed, canvas.width - 100);
        elonObj.state = 'walkingRight';
        moved = true;
      }
      if (keysPressed['ArrowLeft']) {
        elonObj.x = Math.max(elonObj.x - elonObj.speed, 100);
        elonObj.state = 'walkingLeft';
        moved = true;
      }
      if (keysPressed['ArrowUp']) {
        elonObj.y = Math.max(elonObj.y -= elonObj.speed, 200);
        elonObj.state = 'walkingUp';
        moved = true;
      }
      if (keysPressed['ArrowDown']) {
        elonObj.y = Math.min(elonObj.y += elonObj.speed, canvas.height - elonObj.height);
        elonObj.state = 'walkingDown';
        moved = true;
      }
      if (!moved) {
        elonObj.state = 'idle';
      }
    };

    const addNewSock = () => {
      const startX = 100;
      const activeWidth = 600;
      socksRef.current.push({
        x: startX + Math.random() * activeWidth,
        y: 0,
        height: 10,
        width: 20,
        speed: Math.random() * 3 + 2
      });
    };

    const moveByte = () => {
      let byteObj = byte.current;
      if (socksRef.current.length > 0) {
        const closestSock = socksRef.current.reduce((closest, sock) => {
          return Math.abs(sock.x - byteObj.x) < Math.abs(closest.x - byteObj.x) ? sock : closest;
        }, socksRef.current[0]);
         
        const tolerance = 5;
        const now = Date.now();

        if (Math.abs(closestSock.x - byteObj.x) <= tolerance) {
          if (byteObj.state !== 'idle') {
            byteObj.state = 'idle';
            setByteIdleSince(now);
            if (byte.current.timeoutId) {
              clearTimeout(byte.current.timeoutId);
            }
            byte.current.timeoutId = setTimeout(() => {
              if (now - byteIdleSince >= 2000) { 
                setByteIsSpinning(true);
                setTimeout(() => setByteIsSpinning(false), 300);
              }
            }, 2000);
          }
        } else {
          setByteIdleSince(null);
          setByteIsSpinning(false);
          if (closestSock.x < byteObj.x) {
            byteObj.x -= byteObj.speed;
            byteObj.state = 'walkingLeft';
          } 
          if (closestSock.x > byteObj.x) {
            byteObj.x += byteObj.speed;
            byteObj.state = 'walkingRight';
          }
        }
      }
    }

    const COLLISION_BUFFER = 10;
    const VERTICAL_BUFFER = 20;

    const checkCollision = (sock, character) => {
      if (!character || !sock) {
        console.warn("Character or sock is undefined", character, sock);
        return false;
      }
      return (
        character.x - COLLISION_BUFFER < sock.x + sock.width &&
        character.x + character.width + COLLISION_BUFFER > sock.x &&
        character.y - VERTICAL_BUFFER < sock.y + sock.height &&
        character.y + character.height + VERTICAL_BUFFER >= sock.y
      )
    };

    const moveSocks = () => {
      let elonObj = elon.current;
      let byteObj = byte.current;
      socksRef.current = socksRef.current.map(sock => {
        if (checkCollision(sock, elonObj)) {
          scoreRef.current += 1;
          console.log('Elon caught a sock');
          return null;
        } else if (checkCollision(sock, byteObj)) {
          scoreRef.current -= 1;
          console.log('Byte caught a sock');
          return null;
        }
        return { ...sock, y: sock.y + sock.speed };
      }).filter(sock => sock !== null && sock.y <= canvas.height);
    };

    const ELON_STATES = {
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
        const frameY = ELON_STATES[elonObj.state] * elonObj.height;

        const SCALE = 4;
      
        context.drawImage(
          elonSprite,
          frameX,
          frameY,
          elonObj.width,
          elonObj.height,
          elonObj.x - (elonObj.width * SCALE / 2),
          elonObj.y - (elonObj.height * SCALE / 2),
          elonObj.width * SCALE,
          elonObj.height * SCALE
        );

        context.imageSmoothingEnabled = false; 
        context.mozImageSmoothingEnabled = false;
        context.webkitImageSmoothingEnabled = false;
        context.msImageSmoothingEnabled = false;
      }
    };

    const BYTE_STATES = {
      idle: 0,
      walkingLeft: 1,
      walkingRight: 2,
      spin: 3
    };

    const drawByte = () => {
      console.log('drawByte called', byteSpriteLoaded);
      if(byteSpriteLoaded) {
        const byteObj = byte.current;
        let frameX, frameY;

        if (byteIsSpinning) {
          byteObj.currentFrame = (byteObj.currentFrame + 1) % FRAMES_PER_STATE;
          frameX = byteObj.currentFrame * byteObj.width;
          frameY = BYTE_STATES.spin * byteObj.height;
        } else {
          frameX = byteObj.currentFrame * byteObj.width;
          frameY = BYTE_STATES[byteObj.state] * byteObj.height;
        }
 
        const SCALE = 4;

        context.drawImage(
          byteSprite,
          frameX, 
          frameY, 
          byteObj.width,
          byteObj.height,
          byteObj.x - (byteObj.width * SCALE / 2),
          byteObj.y - (byteObj.height * SCALE / 2),
          byteObj.width * SCALE,
          byteObj.height * SCALE
        );

        context.imageSmoothingEnabled = false; 
        context.mozImageSmoothingEnabled = false;
        context.webkitImageSmoothingEnabled = false;
        context.msImageSmoothingEnabled = false;
      }
    }
    
    const drawElements = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);
      drawElon();
      drawByte();
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
      drawByte();
      drawElements();
      checkCollision();
      updateFrame();
      requestRef.current = requestAnimationFrame(updateGame);
    };

    updateGame();
    const sockInterval = setInterval(addNewSock, 500);

    return () => {
      clearInterval(sockInterval);
      cancelAnimationFrame(requestRef.current);
      document.removeEventListener('keydown', (event) => keysPressed[event.key] = true);
      document.removeEventListener('keyup', (event) => keysPressed[event.key] = false);
    };
  }, [elonSpriteLoaded, elonSprite, byteSpriteLoaded, byteSprite, byteIdleSince, byteIsSpinning]);

  return (
    <div className='app pixelart'>
      <canvas ref={canvasRef} width={800} height={600} className='game-canvas'/>
    </div>
  );
};

export default App;