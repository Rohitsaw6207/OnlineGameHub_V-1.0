// Game Settings
const BOARD_SIZE = 20;
const GAME_SPEED = 100;
let gameBoard;
let snake = [{ x: 10, y: 10 }];
let food = generateFood();
let direction = { x: 0, y: 0 };
let lastDirection = { x: 0, y: 0 };
let gameOver = false;
let score = 0;
let gameLoop;

// Initialize the game
function initGame() {
  gameBoard = document.getElementById('game-board');
  createBoard();
  updateScore(0);
  document.addEventListener('keydown', handleKeyPress);
  setupMobileControls();
  setupParticles();
  gameLoop = setInterval(update, GAME_SPEED);
}

// Create the game board grid
function createBoard() {
  gameBoard.innerHTML = '';
  gameBoard.style.display = 'grid';
  gameBoard.style.gridTemplateRows = `repeat(${BOARD_SIZE}, 1fr)`;
  gameBoard.style.gridTemplateColumns = `repeat(${BOARD_SIZE}, 1fr)`;
  
  // Create cells
  for (let i = 0; i < BOARD_SIZE * BOARD_SIZE; i++) {
    const cell = document.createElement('div');
    cell.style.width = '100%';
    cell.style.height = '100%';
    cell.style.border = '1px solid rgba(255, 255, 255, 0.05)';
    cell.dataset.x = i % BOARD_SIZE;
    cell.dataset.y = Math.floor(i / BOARD_SIZE);
    gameBoard.appendChild(cell);
  }
  
  renderSnake();
  renderFood();
}

// Update game state
function update() {
  if (gameOver) return;
  
  // Exit early if no movement direction is set
  if (direction.x === 0 && direction.y === 0) return;
  
  // Update snake position
  const head = { ...snake[0] };
  lastDirection = { ...direction };
  
  head.x += direction.x;
  head.y += direction.y;
  
  // Check for collisions
  if (isCollision(head)) {
    endGame();
    return;
  }
  
  snake.unshift(head);
  
  // Check if snake ate food
  if (head.x === food.x && head.y === food.y) {
    food = generateFood();
    renderFood();
    updateScore(score + 1);
    playEatAnimation(head);
  } else {
    snake.pop();
  }
  
  renderSnake();
}

// Render the snake on the board
function renderSnake() {
  // Clear previous snake cells
  const cells = gameBoard.querySelectorAll('div');
  cells.forEach(cell => {
    cell.style.background = '';
    cell.style.boxShadow = '';
    cell.style.borderRadius = '';
  });
  
  // Render snake
  snake.forEach((segment, index) => {
    const cell = getCell(segment.x, segment.y);
    if (cell) {
      const hue = 260 + (index * 5) % 40; // Gradient effect
      cell.style.background = `hsl(${hue}, 80%, 50%)`;
      cell.style.boxShadow = 'inset 0 0 5px rgba(255, 255, 255, 0.5)';
      cell.style.borderRadius = '30%';
      
      // Head styling
      if (index === 0) {
        cell.style.background = 'var(--snake-color)';
        cell.style.borderRadius = '40%';
        cell.style.boxShadow = '0 0 10px var(--snake-color)';
      }
    }
  });
}

// Render food with animation
function renderFood() {
  // Clear previous food animations first
  const allCells = gameBoard.querySelectorAll('div');
  allCells.forEach(cell => {
    if (cell.hasAttribute('data-food')) {
      cell.style.animation = '';
      cell.style.background = '';
      cell.style.borderRadius = '';
      cell.style.boxShadow = '';
      cell.removeAttribute('data-food');
    }
  });
  
  const cell = getCell(food.x, food.y);
  if (cell) {
    cell.style.background = 'var(--food-color)';
    cell.style.borderRadius = '50%';
    cell.style.animation = 'pulse 1.5s infinite';
    cell.style.boxShadow = '0 0 15px var(--food-color)';
    cell.setAttribute('data-food', 'true');
    
    // Add pulse animation if not exists
    if (!document.querySelector('style#food-animation')) {
      const style = document.createElement('style');
      style.id = 'food-animation';
      style.textContent = `
        @keyframes pulse {
          0% { transform: scale(0.8); box-shadow: 0 0 5px rgba(255, 71, 87, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 15px rgba(255, 71, 87, 0.8); }
          100% { transform: scale(0.8); box-shadow: 0 0 5px rgba(255, 71, 87, 0.7); }
        }
      `;
      document.head.appendChild(style);
    }
  }
}

// Helper function to get cell by coordinates
function getCell(x, y) {
  return gameBoard.querySelector(`div[data-x="${x}"][data-y="${y}"]`);
}

// Handle keyboard controls
function handleKeyPress(e) {
  switch (e.key) {
    case 'ArrowUp':
      if (lastDirection.y !== 1) direction = { x: 0, y: -1 };
      break;
    case 'ArrowDown':
      if (lastDirection.y !== -1) direction = { x: 0, y: 1 };
      break;
    case 'ArrowLeft':
      if (lastDirection.x !== 1) direction = { x: -1, y: 0 };
      break;
    case 'ArrowRight':
      if (lastDirection.x !== -1) direction = { x: 1, y: 0 };
      break;
  }
}

// Setup mobile controls
function setupMobileControls() {
  // Helper function to handle both touch and click events
  const addControlEvents = (id, dirX, dirY, condition) => {
    const button = document.getElementById(id);
    
    const handleEvent = () => {
      if (condition()) {
        direction = { x: dirX, y: dirY };
      }
    };
    
    // Add both click and touch events
    button.addEventListener('click', handleEvent);
    button.addEventListener('touchstart', (e) => {
      e.preventDefault(); // Prevent default touch behavior
      handleEvent();
    });
  };
  
  // Set up all controls with the helper function
  addControlEvents('up', 0, -1, () => lastDirection.y !== 1);
  addControlEvents('down', 0, 1, () => lastDirection.y !== -1);
  addControlEvents('left', -1, 0, () => lastDirection.x !== 1);
  addControlEvents('right', 1, 0, () => lastDirection.x !== -1);
}

// Check for collisions
function isCollision(position) {
  // Wall collision
  if (
    position.x < 0 || 
    position.y < 0 || 
    position.x >= BOARD_SIZE || 
    position.y >= BOARD_SIZE
  ) {
    return true;
  }
  
  // Self collision
  for (let i = 1; i < snake.length; i++) {
    if (snake[i].x === position.x && snake[i].y === position.y) {
      return true;
    }
  }
  
  return false;
}

// Generate food at random position
function generateFood() {
  let newFood;
  do {
    newFood = {
      x: Math.floor(Math.random() * BOARD_SIZE),
      y: Math.floor(Math.random() * BOARD_SIZE)
    };
    // Ensure food doesn't spawn on snake
  } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
  
  return newFood;
}

// Update score display
function updateScore(newScore) {
  score = newScore;
  const scoreElement = document.getElementById('score');
  scoreElement.textContent = score;
  
  // Add animation when score increases
  const scoreDisplay = document.querySelector('.score-display');
  scoreDisplay.classList.add('score-updated');
  
  // Remove animation class after animation completes
  setTimeout(() => {
    scoreDisplay.classList.remove('score-updated');
  }, 500);
}

// Animation when snake eats food
function playEatAnimation(position) {
  const cell = getCell(position.x, position.y);
  if (cell) {
    // Create particle effect at eat position
    createEatParticles(position);
    
    // Scale animation for the head
    cell.style.transform = 'scale(1.3)';
    cell.style.boxShadow = `0 0 20px var(--snake-color)`;
    cell.style.zIndex = '10';
    
    setTimeout(() => {
      cell.style.transform = 'scale(1)';
      cell.style.boxShadow = '';
      cell.style.zIndex = '';
    }, 300);
    
    // Flash effect for game board
    gameBoard.style.boxShadow = `0 0 20px var(--score-color)`;
    setTimeout(() => {
      gameBoard.style.boxShadow = '0 8px 32px 0 rgba(0, 0, 0, 0.3)';
    }, 200);
  }
}

// Create particle effect when food is eaten
function createEatParticles(position) {
  const particleCount = 15; // Increased particle count
  const cell = getCell(position.x, position.y);
  
  if (!cell) return;
  
  const cellRect = cell.getBoundingClientRect();
  const centerX = cellRect.left + cellRect.width / 2;
  const centerY = cellRect.top + cellRect.height / 2;
  
  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    const size = Math.random() * 8 + 4; // Larger particles
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * 40 + 20; // Longer distance
    
    // Use consistent color for all food particles
    const color = 'var(--food-color)';
    
    particle.style.position = 'absolute';
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.borderRadius = '50%';
    particle.style.backgroundColor = color; // Random color
    particle.style.left = `${centerX}px`;
    particle.style.top = `${centerY}px`;
    particle.style.zIndex = '20';
    particle.style.pointerEvents = 'none';
    particle.style.opacity = '1';
    particle.style.boxShadow = `0 0 ${size}px ${color}`; // Add glow effect
    particle.style.transition = 'all 0.7s ease-out'; // Longer animation
    
    document.body.appendChild(particle);
    
    // Start animation in next frame
    requestAnimationFrame(() => {
      particle.style.transform = `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px) scale(0.5)`;
      particle.style.opacity = '0';
    });
    
    // Remove particle after animation
    setTimeout(() => {
      if (particle.parentNode) {
        document.body.removeChild(particle);
      }
    }, 700); // Longer time to match transition
  }
}

// End game
function endGame() {
  gameOver = true;
  clearInterval(gameLoop);
  document.getElementById('finalScore').textContent = score;
  document.getElementById('gameOverScreen').classList.add('show');
}

// Restart game
function restartGame() {
  snake = [{ x: 10, y: 10 }];
  food = generateFood();
  direction = { x: 0, y: 0 };
  lastDirection = { x: 0, y: 0 };
  gameOver = false;
  createBoard(); // Recreate the board to ensure clean state
  updateScore(0);
  document.getElementById('gameOverScreen').classList.remove('show');
  clearInterval(gameLoop); // Clear any existing interval
  gameLoop = setInterval(update, GAME_SPEED);
}

// Setup dynamic background particles
function setupParticles() {
  const canvas = document.getElementById('particles');
  const ctx = canvas.getContext('2d');
  
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
  const particles = [];
  const particleCount = 100; // More particles for dynamic effect
  
  // Create more dynamic particles
  for (let i = 0; i < particleCount; i++) {
    const size = Math.random() * 3 + 1;
    // Add dynamic elements - slow movement, color variation
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: size,
      // Small amount of movement
      speedX: Math.random() * 0.2 - 0.1,
      speedY: Math.random() * 0.2 - 0.1,
      // Use solid colors with no transparency
      color: getRandomColor(),
      // Add size pulsing effect
      pulse: {
        speed: Math.random() * 0.02 + 0.005,
        min: size * 0.8,
        max: size * 2,
        direction: Math.random() > 0.5 ? 1 : -1,
        current: size
      }
    });
  }
  
  // Fixed white color for all background particles
  function getRandomColor() {
    return '#ffffff'; // Only use white
  }
  
  // Draw particles with animation effects
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    particles.forEach(particle => {
      // Update position with subtle movement
      particle.x += particle.speedX;
      particle.y += particle.speedY;
      
      // Wrap around edges
      if (particle.x < -50) particle.x = canvas.width + 50;
      if (particle.x > canvas.width + 50) particle.x = -50;
      if (particle.y < -50) particle.y = canvas.height + 50;
      if (particle.y > canvas.height + 50) particle.y = -50;
      
      // Update pulse effect
      particle.pulse.current += particle.pulse.speed * particle.pulse.direction;
      
      // Reverse direction at min/max values
      if (particle.pulse.current >= particle.pulse.max) {
        particle.pulse.direction = -1;
      } else if (particle.pulse.current <= particle.pulse.min) {
        particle.pulse.direction = 1;
      }
      
      // Draw the particle - solid fill with size pulsing
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.pulse.current, 0, Math.PI * 2);
      ctx.fillStyle = particle.color;
      ctx.fill();
    });
    
    requestAnimationFrame(animate);
  }
  
  animate();
  
  // Resize handler
  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Reposition particles after resize
    particles.forEach(particle => {
      particle.x = Math.random() * canvas.width;
      particle.y = Math.random() * canvas.height;
    });
  });
}

// Set up restart button
document.getElementById('restartBtn').addEventListener('click', restartGame);

// Initialize the game when window loads
window.addEventListener('load', initGame);