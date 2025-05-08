// Create dynamic stars background
function createStars() {
    const stars = document.getElementById('stars');
    stars.innerHTML = '';
    
    const starCount = window.innerWidth < 600 ? 50 : 100;
    
    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        const size = Math.random() * 3 + 1;
        const opacity = Math.random() * 0.7 + 0.3;
        
        star.style.position = 'absolute';
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        star.style.background = size > 2 ? 
            `rgba(0, 255, 255, ${opacity})` : 
            `rgba(255, 255, 255, ${opacity})`;
        star.style.borderRadius = '50%';
        star.style.boxShadow = size > 2 ? 
            `0 0 ${size * 2}px rgba(0, 255, 255, ${opacity})` : 
            `0 0 ${size * 2}px rgba(255, 255, 255, ${opacity})`;
        star.style.animation = `twinkle ${Math.random() * 5 + 3}s infinite alternate`;
        
        stars.appendChild(star);
    }
}

// Add twinkling animation to stylesheet
const styleSheet = document.styleSheets[0];
styleSheet.insertRule(`
    @keyframes twinkle {
        0% { opacity: 0.3; }
        100% { opacity: 1; }
    }
`, styleSheet.cssRules.length);

styleSheet.insertRule(`
    #stars {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: -1;
        pointer-events: none;
    }
`, styleSheet.cssRules.length);

// Initialize stars
createStars();
// Recreate stars on window resize
window.addEventListener('resize', createStars);

// Fullscreen functionality
let isFullscreen = false;
const gameSection = document.createElement('div');
gameSection.className = 'game-section';
const fullscreenContainer = document.createElement('div');
fullscreenContainer.className = 'fullscreen-container';
fullscreenContainer.style.display = 'none';

document.body.appendChild(fullscreenContainer);

function toggleFullscreen() {
    const gameContainer = document.getElementById('game-container');
    const gameControls = document.getElementById('game-controls');
    const allContent = document.querySelectorAll('body > *:not(.fullscreen-container)');
    
    if (!isFullscreen) {
        // Enter fullscreen mode
        isFullscreen = true;
        
        // Move game elements to fullscreen container
        fullscreenContainer.innerHTML = '';
        fullscreenContainer.appendChild(gameContainer.cloneNode(true));
        fullscreenContainer.appendChild(gameControls.cloneNode(true));
        
        // Hide regular content
        allContent.forEach(el => {
            el.classList.add('fullscreen-active');
        });
        
        fullscreenContainer.style.display = 'flex';
        
        // Add exit fullscreen button
        const exitBtn = document.createElement('button');
        exitBtn.textContent = '✖️ Exit Fullscreen';
        exitBtn.className = 'exit-fullscreen-btn';
        exitBtn.style.marginTop = '15px';
        exitBtn.style.padding = '8px 16px';
        exitBtn.style.background = 'rgba(255, 50, 50, 0.2)';
        exitBtn.style.color = '#fff';
        exitBtn.style.border = '1px solid rgba(255, 50, 50, 0.5)';
        exitBtn.style.borderRadius = '5px';
        exitBtn.style.cursor = 'pointer';
        
        exitBtn.addEventListener('click', toggleFullscreen);
        fullscreenContainer.appendChild(exitBtn);
        
        // Attach event listeners to the cloned controls
        attachControlListeners();
        
        // Request actual fullscreen if supported
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen();
        }
    } else {
        // Exit fullscreen mode
        isFullscreen = false;
        
        // Show regular content
        allContent.forEach(el => {
            el.classList.remove('fullscreen-active');
        });
        
        fullscreenContainer.style.display = 'none';
        
        // Exit actual fullscreen if needed
        if (document.fullscreenElement && document.exitFullscreen) {
            document.exitFullscreen();
        }
        
        // Force resize to update game canvas
        window.dispatchEvent(new Event('resize'));
    }
}

function attachControlListeners() {
    if (isFullscreen) {
        const upBtn = fullscreenContainer.querySelector('#up-btn');
        const downBtn = fullscreenContainer.querySelector('#down-btn');
        const restartBtn = fullscreenContainer.querySelector('#restart-btn');
        
        if (upBtn) {
            upBtn.addEventListener('mousedown', () => keys.ArrowUp = true);
            upBtn.addEventListener('mouseup', () => keys.ArrowUp = false);
            upBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                keys.ArrowUp = true;
            });
            upBtn.addEventListener('touchend', (e) => {
                e.preventDefault();
                keys.ArrowUp = false;
            });
        }
        
        if (downBtn) {
            downBtn.addEventListener('mousedown', () => keys.ArrowDown = true);
            downBtn.addEventListener('mouseup', () => keys.ArrowDown = false);
            downBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                keys.ArrowDown = true;
            });
            downBtn.addEventListener('touchend', (e) => {
                e.preventDefault();
                keys.ArrowDown = false;
            });
        }
        
        if (restartBtn) {
            restartBtn.addEventListener('click', resetGame);
        }
    }
}

// Add glowing line effect
function createGlowingLines() {
    const canvas = document.createElement('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.zIndex = '-1';
    canvas.style.opacity = '0.3';
    document.getElementById('stars').appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    const lines = [];
    
    class Line {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.length = Math.random() * 50 + 20;
            this.angle = Math.random() * Math.PI * 2;
            this.speed = Math.random() * 0.01 + 0.005;
            this.opacity = Math.random() * 0.5 + 0.2;
            this.color = Math.random() > 0.5 ? '#0ff' : '#05f';
        }
        
        update() {
            this.angle += this.speed;
        }
        
        draw() {
            const endX = this.x + Math.cos(this.angle) * this.length;
            const endY = this.y + Math.sin(this.angle) * this.length;
            
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(endX, endY);
            ctx.strokeStyle = this.color;
            ctx.globalAlpha = this.opacity;
            ctx.lineWidth = 1;
            ctx.stroke();
            
            ctx.beginPath();
            ctx.arc(this.x, this.y, 1, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
        }
    }
    
    // Create lines
    for (let i = 0; i < 20; i++) {
        lines.push(new Line());
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        for (let i = 0; i < lines.length; i++) {
            lines[i].update();
            lines[i].draw();
        }
        
        requestAnimationFrame(animate);
    }
    
    animate();
    
    // Handle resize
    window.addEventListener('resize', function() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

// Initialize glowing lines
createGlowingLines();

// Pong Game
const canvas = document.getElementById('game-canvas');
const game = canvas.getContext('2d');

canvas.width = canvas.offsetWidth;
canvas.height = canvas.offsetHeight;

// Game variables
const isMobile = window.innerWidth <= 768;
const paddleHeight = canvas.height * (isMobile ? 0.12 : 0.15);
const paddleWidth = canvas.width * (isMobile ? 0.015 : 0.02);
const ballSize = canvas.width * (isMobile ? 0.015 : 0.02);
let ballSpeedX = 5;
let ballSpeedY = 5;
let playerY = (canvas.height - paddleHeight) / 2;
let computerY = (canvas.height - paddleHeight) / 2;
let ballX = canvas.width / 2;
let ballY = canvas.height / 2;
let playerScore = 0;
let computerScore = 0;
let gameRunning = true;
let difficultyMultiplier = 1;
let lastTime = 0;
let trailPositions = [];

// Keyboard controls
const keys = {
    ArrowUp: false,
    ArrowDown: false
};

window.addEventListener('keydown', function(e) {
    if (e.key in keys) {
        keys[e.key] = true;
        e.preventDefault();
    }
});

window.addEventListener('keyup', function(e) {
    if (e.key in keys) {
        keys[e.key] = false;
        e.preventDefault();
    }
});

// Touch controls
canvas.addEventListener('touchmove', function(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const touchY = touch.clientY - rect.top;
    
    playerY = touchY - (paddleHeight / 2);
    
    // Keep paddle in bounds
    if (playerY < 0) {
        playerY = 0;
    }
    if (playerY > canvas.height - paddleHeight) {
        playerY = canvas.height - paddleHeight;
    }
});

// Control buttons for mobile
document.getElementById('up-btn').addEventListener('mousedown', function() {
    keys.ArrowUp = true;
});

document.getElementById('up-btn').addEventListener('mouseup', function() {
    keys.ArrowUp = false;
});

document.getElementById('up-btn').addEventListener('touchstart', function(e) {
    e.preventDefault();
    keys.ArrowUp = true;
});

document.getElementById('up-btn').addEventListener('touchend', function(e) {
    e.preventDefault();
    keys.ArrowUp = false;
});

document.getElementById('down-btn').addEventListener('mousedown', function() {
    keys.ArrowDown = true;
});

document.getElementById('down-btn').addEventListener('mouseup', function() {
    keys.ArrowDown = false;
});

document.getElementById('down-btn').addEventListener('touchstart', function(e) {
    e.preventDefault();
    keys.ArrowDown = true;
});

document.getElementById('down-btn').addEventListener('touchend', function(e) {
    e.preventDefault();
    keys.ArrowDown = false;
});

// Prevent buttons from losing focus when touched
document.getElementById('up-btn').addEventListener('touchmove', function(e) {
    e.preventDefault();
});

document.getElementById('down-btn').addEventListener('touchmove', function(e) {
    e.preventDefault();
});

// Restart button
document.getElementById('restart-btn').addEventListener('click', function() {
    resetGame();
});



function resetGame() {
    ballX = canvas.width / 2;
    ballY = canvas.height / 2;
    ballSpeedX = 5 * (Math.random() > 0.5 ? 1 : -1);
    ballSpeedY = 5 * (Math.random() > 0.5 ? 1 : -1);
    playerScore = 0;
    computerScore = 0;
    difficultyMultiplier = 1;
    gameRunning = true;
    trailPositions = [];
    
    // Update score display
    document.getElementById('player-score').textContent = playerScore;
    document.getElementById('computer-score').textContent = computerScore;
}

function drawPaddle(x, y, isPlayer) {
    game.shadowBlur = 15;
    game.shadowColor = isPlayer ? '#0ff' : '#f55';
    
    // Create gradient for paddle
    const gradient = game.createLinearGradient(x, y, x + paddleWidth, y);
    
    if (isPlayer) {
        gradient.addColorStop(0, '#0ff');
        gradient.addColorStop(1, '#008b8b');
    } else {
        gradient.addColorStop(0, '#f55');
        gradient.addColorStop(1, '#8b0000');
    }
    
    game.fillStyle = gradient;
    game.fillRect(x, y, paddleWidth, paddleHeight);
    
    // Reset shadow for other elements
    game.shadowBlur = 0;
}

function drawBall() {
    // Draw trail
    for (let i = 0; i < trailPositions.length; i++) {
        const pos = trailPositions[i];
        game.beginPath();
        game.arc(pos.x, pos.y, ballSize * (i / trailPositions.length), 0, Math.PI * 2);
        game.fillStyle = `rgba(255, 255, 255, ${i / trailPositions.length * 0.5})`;
        game.fill();
    }
    
    // Draw the main ball
    game.beginPath();
    game.arc(ballX, ballY, ballSize, 0, Math.PI * 2);
    
    // Create radial gradient for ball
    const gradient = game.createRadialGradient(
        ballX, ballY, 0,
        ballX, ballY, ballSize
    );
    
    gradient.addColorStop(0, '#fff');
    gradient.addColorStop(0.7, ballSpeedX > 0 ? '#0ff' : '#f55');
    gradient.addColorStop(1, ballSpeedX > 0 ? '#00ffff33' : '#ff555533');
    
    game.fillStyle = gradient;
    game.shadowBlur = 15;
    game.shadowColor = ballSpeedX > 0 ? '#0ff' : '#f55';
    game.fill();
    game.shadowBlur = 0;
}

function drawNet() {
    game.setLineDash([10, 15]);
    game.beginPath();
    game.moveTo(canvas.width / 2, 0);
    game.lineTo(canvas.width / 2, canvas.height);
    game.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    game.lineWidth = 2;
    game.stroke();
    game.setLineDash([]);
}

function updateGame(timestamp) {
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;
    
    if (!gameRunning) {
        return;
    }
    
    // Clear canvas
    game.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw net
    drawNet();
    
    // Update player paddle position based on keyboard
    if (keys.ArrowUp) {
        playerY -= 10;
    }
    if (keys.ArrowDown) {
        playerY += 10;
    }
    
    // Keep player paddle in bounds
    if (playerY < 0) playerY = 0;
    if (playerY > canvas.height - paddleHeight) playerY = canvas.height - paddleHeight;
    
    // Computer AI
    const computerSpeed = 5 * difficultyMultiplier;
    const computerCenter = computerY + paddleHeight / 2;
    const ballMovingTowardsComputer = ballSpeedX > 0;
    
    if (ballMovingTowardsComputer) {
        // Add prediction with some randomness to make it beatable
        if (computerCenter < ballY - (paddleHeight * 0.1)) {
            computerY += computerSpeed;
        } else if (computerCenter > ballY + (paddleHeight * 0.1)) {
            computerY -= computerSpeed;
        }
    } else {
        // Return to center when ball moving away
        if (computerCenter < canvas.height / 2 - paddleHeight * 0.1) {
            computerY += computerSpeed * 0.3;
        } else if (computerCenter > canvas.height / 2 + paddleHeight * 0.1) {
            computerY -= computerSpeed * 0.3;
        }
    }
    
    // Keep computer paddle in bounds
    if (computerY < 0) computerY = 0;
    if (computerY > canvas.height - paddleHeight) computerY = canvas.height - paddleHeight;
    
    // Add ball position to trail
    trailPositions.push({x: ballX, y: ballY});
    
    // Limit trail length
    if (trailPositions.length > 5) {
        trailPositions.shift();
    }
    
    // Update ball position
    ballX += ballSpeedX;
    ballY += ballSpeedY;
    
    // Ball collision with top and bottom walls
    if (ballY - ballSize < 0 || ballY + ballSize > canvas.height) {
        ballSpeedY = -ballSpeedY;
        
        // Add angle variation on wall bounce
        ballSpeedY += (Math.random() - 0.5) * 0.5;
    }
    
    // Ball collision with paddles
    // Player paddle
    if (
        ballX - ballSize <= paddleWidth &&
        ballY >= playerY &&
        ballY <= playerY + paddleHeight
    ) {
        // Calculate angle based on where the ball hits the paddle
        const hitPos = (ballY - (playerY + paddleHeight / 2)) / (paddleHeight / 2);
        ballSpeedX = -ballSpeedX;
        ballSpeedY += hitPos * 2;
        
        // Increase speed slightly with each hit
        ballSpeedX *= 1.03;
        
        // Add slight randomness for unpredictability
        ballSpeedY += (Math.random() - 0.5) * 0.5;
    }
    
    // Computer paddle
    if (
        ballX + ballSize >= canvas.width - paddleWidth &&
        ballY >= computerY &&
        ballY <= computerY + paddleHeight
    ) {
        // Calculate angle based on where the ball hits the paddle
        const hitPos = (ballY - (computerY + paddleHeight / 2)) / (paddleHeight / 2);
        ballSpeedX = -ballSpeedX;
        ballSpeedY += hitPos * 2;
        
        // Increase speed slightly with each hit
        ballSpeedX *= 1.03;
        
        // Add slight randomness for unpredictability
        ballSpeedY += (Math.random() - 0.5) * 0.5;
    }
    
    // Ball out of bounds (scoring)
    if (ballX < 0) {
        // Computer scores
        computerScore++;
        document.getElementById('computer-score').textContent = computerScore;
        resetBall();
    } else if (ballX > canvas.width) {
        // Player scores
        playerScore++;
        document.getElementById('player-score').textContent = playerScore;
        resetBall();
        
        // Increase difficulty as player scores
        difficultyMultiplier += 0.05;
    }
    
    // Keep ball speed in check
    const maxSpeed = 15;
    if (Math.abs(ballSpeedX) > maxSpeed) {
        ballSpeedX = maxSpeed * Math.sign(ballSpeedX);
    }
    if (Math.abs(ballSpeedY) > maxSpeed) {
        ballSpeedY = maxSpeed * Math.sign(ballSpeedY);
    }
    
    // Render game objects
    drawPaddle(0, playerY, true);
    drawPaddle(canvas.width - paddleWidth, computerY, false);
    drawBall();
    
    requestAnimationFrame(updateGame);
}

function resetBall() {
    ballX = canvas.width / 2;
    ballY = canvas.height / 2;
    
    // Randomize ball direction
    ballSpeedX = 5 * (Math.random() > 0.5 ? 1 : -1);
    ballSpeedY = 5 * (Math.random() > 0.5 ? 1 : -1);
    
    trailPositions = [];
}

// Handle window resize
window.addEventListener('resize', function() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    // Check if mobile
    const isMobile = window.innerWidth <= 768;
    
    // Adjust game elements for new size
    paddleHeight = canvas.height * (isMobile ? 0.12 : 0.15);
    paddleWidth = canvas.width * (isMobile ? 0.015 : 0.02);
    ballSize = canvas.width * (isMobile ? 0.015 : 0.02);
    
    // Reposition elements
    playerY = (canvas.height - paddleHeight) / 2;
    computerY = (canvas.height - paddleHeight) / 2;
    ballX = canvas.width / 2;
    ballY = canvas.height / 2;
});

// Start the game
resetGame();
requestAnimationFrame(updateGame);
