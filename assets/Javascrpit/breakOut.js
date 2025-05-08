        // Game Constants and Variables
        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        const startScreen = document.getElementById('startScreen');
        const gameOverScreen = document.getElementById('gameOverScreen');
        const levelCompleteScreen = document.getElementById('levelCompleteScreen');
        const startBtn = document.getElementById('startBtn');
        const restartBtn = document.getElementById('restartBtn');
        const nextLevelBtn = document.getElementById('nextLevelBtn');
        const pauseBtn = document.getElementById('pauseBtn');
        const fullscreenBtn = document.getElementById('fullscreenBtn');
        const scoreElement = document.getElementById('score');
        const livesElement = document.getElementById('lives');
        const levelElement = document.getElementById('level');
        const finalScoreElement = document.getElementById('finalScore');
        const levelScoreElement = document.getElementById('levelScore');
        
        // Mouse position for paddle control
        let mousePaddlePosition = null;
        
        // Flag to track fullscreen state
        let isFullscreen = false;

        // Game state
        let score = 0;
        let lives = 3;
        let level = 1;
        let gameRunning = false;
        let isPaused = false;
        let screenShake = 0;
        let paddleVelocity = 0;
        let mouseControl = false;

        // Ball properties
        let ball = {
            x: canvas.width / 2,
            y: canvas.height - 50,
            radius: 10,
            dx: 4,
            dy: -4,
            color: 'rgb(0, 243, 255)'
        };

        // Paddle properties
        let paddle = {
            width: 100,
            height: 15,
            x: canvas.width / 2 - 50,
            y: canvas.height - 30,
            dx: 8,
            color: 'rgb(255, 0, 230)'
        };

        // Bricks properties
        let brickRowCount = 5;
        let brickColumnCount = 9;
        let brickWidth = 75;
        let brickHeight = 20;
        let brickPadding = 10;
        let brickOffsetTop = 80;
        let brickOffsetLeft = 30;
        let bricks = [];

        // Particles array
        let particles = [];

        // Background particles
        let bgParticles = [];

        // Key states
        let rightPressed = false;
        let leftPressed = false;

        // Initialize bricks with different patterns based on level
        function initBricks() {
            bricks = [];
            const brickColors = [
                'rgb(255, 0, 230)',   // Neon pink
                'rgb(0, 255, 157)',   // Neon green
                'rgb(255, 236, 0)',   // Neon yellow
                'rgb(255, 153, 0)',   // Neon orange
                'rgb(0, 243, 255)'    // Neon blue
            ];

            // Different patterns based on level
            let pattern = level % 5;
            
            for (let c = 0; c < brickColumnCount; c++) {
                bricks[c] = [];
                for (let r = 0; r < brickRowCount; r++) {
                    const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
                    const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
                    
                    // Default brick status
                    let status = 1;
                    
                    // Apply different patterns based on level
                    switch(pattern) {
                        case 0: // Standard pattern
                            // All bricks are active
                            break;
                        case 1: // Checkerboard pattern
                            if ((c + r) % 2 === 0) {
                                status = 1;
                            } else {
                                status = (level > 3) ? 1 : 0; // Harder levels fill in the gaps
                            }
                            break;
                        case 2: // Diagonal pattern
                            if ((c + r) % 3 === 0) {
                                status = 0;
                            }
                            break;
                        case 3: // Border pattern
                            if (r > 0 && r < brickRowCount - 1 && c > 0 && c < brickColumnCount - 1 && level < 4) {
                                status = 0;
                            }
                            break;
                        case 4: // Random pattern
                            if (Math.random() < 0.2 && level < 5) {
                                status = 0;
                            }
                            break;
                    }
                    
                    // Some bricks are special (stronger or have power-ups) in higher levels
                    let health = 1;
                    let powerup = null;
                    
                    if (level > 2 && status === 1) {
                        // 15% chance of stronger brick in higher levels
                        if (Math.random() < 0.15) {
                            health = 2;
                        }
                        
                        // 10% chance of power-up brick in higher levels
                        if (Math.random() < 0.1) {
                            powerup = ['extraLife', 'widePaddle', 'slowBall', 'multiBall'][Math.floor(Math.random() * 4)];
                        }
                    }
                    
                    bricks[c][r] = { 
                        x: brickX, 
                        y: brickY, 
                        status: status,
                        health: health,
                        powerup: powerup,
                        color: brickColors[r % brickColors.length],
                        glowIntensity: 0.5 + Math.random() * 0.5
                    };
                }
            }
        }

        // Initialize background particles
        function initBackgroundParticles() {
            bgParticles = [];
            for (let i = 0; i < 50; i++) {
                bgParticles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    size: Math.random() * 2 + 1,
                    color: `rgba(${Math.floor(Math.random() * 100 + 155)}, ${Math.floor(Math.random() * 100 + 155)}, 255, ${Math.random() * 0.5 + 0.3})`,
                    vx: (Math.random() - 0.5) * 0.5,
                    vy: (Math.random() - 0.5) * 0.5
                });
            }
        }

        // Draw background particles
        function drawBackgroundParticles() {
            bgParticles.forEach((particle) => {
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fillStyle = particle.color;
                ctx.fill();
                
                // Update position
                particle.x += particle.vx;
                particle.y += particle.vy;
                
                // Wrap around the screen
                if (particle.x < 0) particle.x = canvas.width;
                if (particle.x > canvas.width) particle.x = 0;
                if (particle.y < 0) particle.y = canvas.height;
                if (particle.y > canvas.height) particle.y = 0;
            });
        }

        // Draw ball
        function drawBall() {
            ctx.beginPath();
            ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
            ctx.fillStyle = ball.color;
            ctx.fill();
            ctx.closePath();
            
            // Add glow effect
            ctx.beginPath();
            ctx.arc(ball.x, ball.y, ball.radius + 5, 0, Math.PI * 2);
            const gradient = ctx.createRadialGradient(
                ball.x, ball.y, ball.radius,
                ball.x, ball.y, ball.radius + 5
            );
            gradient.addColorStop(0, 'rgba(0, 243, 255, 0.5)');
            gradient.addColorStop(1, 'rgba(0, 243, 255, 0)');
            ctx.fillStyle = gradient;
            ctx.fill();
            ctx.closePath();
        }

        // Draw paddle
        function drawPaddle() {
            ctx.beginPath();
            ctx.rect(paddle.x, paddle.y, paddle.width, paddle.height);
            ctx.fillStyle = paddle.color;
            ctx.fill();
            ctx.closePath();
            
            // Add glow effect
            ctx.beginPath();
            ctx.rect(paddle.x - 5, paddle.y - 5, paddle.width + 10, paddle.height + 10);
            const gradient = ctx.createLinearGradient(
                paddle.x, paddle.y,
                paddle.x, paddle.y + paddle.height
            );
            gradient.addColorStop(0, 'rgba(255, 0, 230, 0.5)');
            gradient.addColorStop(1, 'rgba(255, 0, 230, 0)');
            ctx.fillStyle = gradient;
            ctx.fill();
            ctx.closePath();
        }

        // Draw bricks
        function drawBricks() {
            for (let c = 0; c < brickColumnCount; c++) {
                for (let r = 0; r < brickRowCount; r++) {
                    const brick = bricks[c][r];
                    if (brick.status >= 1) {
                        // Base brick color - adjust based on health
                        let brickColor = brick.color;
                        if (brick.health > 1) {
                            // For stronger bricks, make them more saturated/brighter
                            const color = brick.color.substring(4, brick.color.length - 1).split(',');
                            brickColor = `rgb(${Math.min(parseInt(color[0]) + 50, 255)}, ${Math.min(parseInt(color[1]) + 50, 255)}, ${Math.min(parseInt(color[2]) + 50, 255)})`;
                        }
                        
                        ctx.beginPath();
                        ctx.rect(brick.x, brick.y, brickWidth, brickHeight);
                        ctx.fillStyle = brickColor;
                        ctx.fill();
                        ctx.closePath();
                        
                        // Draw pattern or indicator if brick has a powerup
                        if (brick.powerup) {
                            ctx.beginPath();
                            ctx.arc(brick.x + brickWidth/2, brick.y + brickHeight/2, brickHeight/3, 0, Math.PI * 2);
                            ctx.strokeStyle = 'white';
                            ctx.lineWidth = 2;
                            ctx.stroke();
                            ctx.closePath();
                        }
                        
                        // For multi-hit bricks, add an interior border
                        if (brick.health > 1) {
                            ctx.beginPath();
                            ctx.rect(brick.x + 3, brick.y + 3, brickWidth - 6, brickHeight - 6);
                            ctx.strokeStyle = 'white';
                            ctx.lineWidth = 1;
                            ctx.stroke();
                            ctx.closePath();
                        }
                        
                        // Pulsing glow effect
                        brick.glowIntensity = 0.3 + Math.sin(Date.now() / 500 + c + r) * 0.3;
                        
                        ctx.beginPath();
                        ctx.rect(brick.x - 2, brick.y - 2, brickWidth + 4, brickHeight + 4);
                        const glow = ctx.createLinearGradient(
                            brick.x, brick.y,
                            brick.x, brick.y + brickHeight
                        );
                        const color = brickColor.substring(4, brickColor.length - 1).split(',');
                        glow.addColorStop(0, `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${brick.glowIntensity})`);
                        glow.addColorStop(1, `rgba(${color[0]}, ${color[1]}, ${color[2]}, 0)`);
                        ctx.fillStyle = glow;
                        ctx.fill();
                        ctx.closePath();
                    }
                }
            }
        }

        // Create explosion particles
        function createExplosion(x, y, color) {
            const particleCount = 30;
            for (let i = 0; i < particleCount; i++) {
                particles.push({
                    x: x + brickWidth / 2,
                    y: y + brickHeight / 2,
                    size: Math.random() * 3 + 1,
                    speed: Math.random() * 3 + 1,
                    angle: Math.random() * Math.PI * 2,
                    color: color,
                    alpha: 1,
                    decay: 0.02 + Math.random() * 0.03
                });
            }
        }

        // Update and draw particles
        function updateParticles() {
            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                p.x += Math.cos(p.angle) * p.speed;
                p.y += Math.sin(p.angle) * p.speed;
                p.alpha -= p.decay;
                
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = p.color.replace('rgb', 'rgba').replace(')', `, ${p.alpha})`);
                ctx.fill();
                ctx.closePath();
                
                // Remove particles that have faded out
                if (p.alpha <= 0) {
                    particles.splice(i, 1);
                    i--;
                }
            }
        }

        // Collision detection
        function collisionDetection() {
            let allBricksDestroyed = true;
            
            for (let c = 0; c < brickColumnCount; c++) {
                for (let r = 0; r < brickRowCount; r++) {
                    const brick = bricks[c][r];
                    if (brick.status === 1) {
                        allBricksDestroyed = false;
                        
                        // Check for collision with brick
                        if (
                            ball.x + ball.radius > brick.x && 
                            ball.x - ball.radius < brick.x + brickWidth && 
                            ball.y + ball.radius > brick.y && 
                            ball.y - ball.radius < brick.y + brickHeight
                        ) {
                            // Calculate collision point to determine better bounce angle
                            const hitX = ball.x < brick.x ? brick.x : (ball.x > brick.x + brickWidth ? brick.x + brickWidth : ball.x);
                            const hitY = ball.y < brick.y ? brick.y : (ball.y > brick.y + brickHeight ? brick.y + brickHeight : ball.y);
                            
                            // Calculate distance from center of ball to impact point
                            const dx = ball.x - hitX;
                            const dy = ball.y - hitY;
                            const distance = Math.sqrt(dx * dx + dy * dy);
                            
                            // If the distance is less than or equal to the ball radius, there's a collision
                            if (distance <= ball.radius) {
                                // Determine collision side (horizontal or vertical)
                                const collideX = Math.abs(hitX - (brick.x + brickWidth/2)) >= brickWidth/2 * 0.9;
                                const collideY = Math.abs(hitY - (brick.y + brickHeight/2)) >= brickHeight/2 * 0.9;
                                
                                // Reverse direction based on collision side
                                if (collideX) {
                                    ball.dx = -ball.dx;
                                }
                                if (collideY) {
                                    ball.dy = -ball.dy;
                                }
                                // If we can't determine side clearly (corner hit), reverse both
                                if (!collideX && !collideY) {
                                    ball.dx = -ball.dx;
                                    ball.dy = -ball.dy;
                                }
                                
                                // Add a small random factor to prevent repetitive patterns
                                ball.dx += (Math.random() - 0.5) * 0.5;
                                ball.dy += (Math.random() - 0.5) * 0.5;
                                
                                // Update brick status, score and create particles
                                brick.status = 0;
                                score += 10;
                                updateScore();
                                
                                // Create particle explosion
                                createExplosion(brick.x, brick.y, brick.color);
                                
                                // Add screen shake effect on collision
                                shakeScreen(3);
                                
                                // Only process one collision per frame to avoid ball getting stuck
                                return;
                            }
                        }
                    }
                }
            }

            // Check if all bricks are destroyed
            if (allBricksDestroyed && gameRunning) {
                levelComplete();
            }
        }

        // Ball movement and boundary check
        function moveBall() {
            // Predict next position
            const nextX = ball.x + ball.dx;
            const nextY = ball.y + ball.dy;
            
            // Wall collision with improved physics
            if (nextX > canvas.width - ball.radius || nextX < ball.radius) {
                // Wall collision sound/visual effect could be added here
                ball.dx = -ball.dx * 1.01; // Slightly increase speed on wall bounce
                shakeScreen(1); // Small screen shake on wall collision
            }
            
            if (nextY < ball.radius) {
                // Ceiling collision
                ball.dy = -ball.dy * 1.01; // Slightly increase speed on ceiling bounce
                shakeScreen(1); // Small screen shake
            } 
            
            // Check paddle collision - using improved detection with ball's current position and velocity
            // This checks if the ball will cross the paddle in the next frame
            const ballBottom = ball.y + ball.radius;
            const paddleTop = paddle.y;
            
            // Check if ball is moving downward and will cross or touch the paddle's top boundary
            if (ball.dy > 0 && ballBottom <= paddleTop && ballBottom + ball.dy >= paddleTop) {
                // Check if ball is within paddle's horizontal bounds
                if (ball.x >= paddle.x - ball.radius && ball.x <= paddle.x + paddle.width + ball.radius) {
                    // Calculate new angle based on where ball hit the paddle
                    let hitPoint = (ball.x - (paddle.x + paddle.width / 2)) / (paddle.width / 2);
                    
                    // Add some influence from paddle movement for more dynamic gameplay
                    hitPoint += paddleVelocity * 0.05;
                    
                    // Clamp the hit point to prevent extreme angles
                    hitPoint = Math.max(-0.9, Math.min(0.9, hitPoint));
                    
                    let angle = hitPoint * Math.PI / 3; // max ±60 degrees
                    
                    // Set new velocity with progressive speed increase
                    const currentSpeed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
                    const newSpeed = currentSpeed * 1.025; // Gradual speed increase
                    
                    // Ensure minimum vertical velocity to prevent horizontal locking
                    const minVerticalComponent = newSpeed * 0.4;
                    
                    // Change ball direction
                    ball.dx = newSpeed * Math.sin(angle);
                    ball.dy = -Math.max(newSpeed * Math.cos(angle), minVerticalComponent);
                    
                    // Reposition ball to prevent it going through paddle
                    ball.y = paddleTop - ball.radius - 1;
                    
                    // Add small bounce effect and screen shake
                    createExplosion(ball.x - 5, paddle.y, 'rgb(255, 255, 255)');
                    shakeScreen(2);
                    
                    // Prevent further checks in this frame
                    return;
                }
            }
            
            // Check if ball has gone below the bottom of the screen
            if (ball.y + ball.radius > canvas.height) {
                lives--;
                updateLives();
                
                shakeScreen(8); // Strong screen shake when losing a life
                
                if (lives <= 0) {
                    gameOver();
                } else {
                    resetBall();
                }
                return;
            }

            // Add a very slight random variation to prevent repetitive patterns
            if (Math.random() < 0.05) {
                ball.dx += (Math.random() - 0.5) * 0.1;
                ball.dy += (Math.random() - 0.5) * 0.1;
            }
            
            // Normalize ball speed if it gets too fast or too slow
            const currentSpeed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
            if (currentSpeed > 15) {
                // Cap maximum speed
                ball.dx = (ball.dx / currentSpeed) * 15;
                ball.dy = (ball.dy / currentSpeed) * 15;
            } else if (currentSpeed < 4 && level > 1) {
                // Ensure minimum speed in higher levels
                ball.dx = (ball.dx / currentSpeed) * 4;
                ball.dy = (ball.dy / currentSpeed) * 4;
            }

            // Update ball position
            ball.x += ball.dx;
            ball.y += ball.dy;
        }

        // Move paddle
        function movePaddle() {
            // Apply acceleration/deceleration physics for smoother movement
            const acceleration = 0.8;
            const friction = 0.85;
            const maxSpeed = 12;
            
            if (rightPressed) {
                paddleVelocity += acceleration;
            } else if (leftPressed) {
                paddleVelocity -= acceleration;
            } else {
                // Apply friction to slow down when no keys are pressed
                paddleVelocity *= friction;
            }
            
            // Limit max speed
            if (paddleVelocity > maxSpeed) paddleVelocity = maxSpeed;
            if (paddleVelocity < -maxSpeed) paddleVelocity = -maxSpeed;
            
            // Update position
            paddle.x += paddleVelocity;
            
            // Prevent paddle from going off the screen
            if (paddle.x < 0) {
                paddle.x = 0;
                paddleVelocity *= -0.5; // Bounce effect
            }
            if (paddle.x > canvas.width - paddle.width) {
                paddle.x = canvas.width - paddle.width;
                paddleVelocity *= -0.5; // Bounce effect
            }
            
            // Handle mouse control if enabled
            if (mouseControl) {
                if (mousePaddlePosition !== null) {
                    // Smooth transition to mouse position
                    paddle.x += (mousePaddlePosition - paddle.x) * 0.2;
                }
            }
        }

        // Update score display
        function updateScore() {
            scoreElement.textContent = score;
            finalScoreElement.textContent = score;
            levelScoreElement.textContent = score;
        }

        // Update lives display
        function updateLives() {
            livesElement.textContent = lives;
        }

        // Update level display
        function updateLevel() {
            levelElement.textContent = level;
        }
        


        // Reset ball position
        function resetBall() {
            ball.x = canvas.width / 2;
            ball.y = canvas.height - 50;
            ball.dx = 4 * (Math.random() > 0.5 ? 1 : -1);
            ball.dy = -4;
        }

        // Game over
        function gameOver() {
            gameRunning = false;
            gameOverScreen.classList.add('active');
            finalScoreElement.textContent = score;
        }

        // Level complete
        function levelComplete() {
            gameRunning = false;
            levelCompleteScreen.classList.add('active');
            levelScoreElement.textContent = score;
        }

        // Start next level
        function nextLevel() {
            level++;
            updateLevel();
            resetBall();
            initBricks();
            levelCompleteScreen.classList.remove('active');
            gameRunning = true;
            
            // Increase difficulty
            ball.dx *= 1.1;
            ball.dy *= 1.1;
            if (level % 3 === 0 && brickRowCount < 8) {
                brickRowCount++;
            }
            
            animate();
        }

        // Screen shake effect
        function shakeScreen(intensity) {
            screenShake = intensity;
        }
        
        // Draw game
        function draw() {
            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Apply screen shake if active
            if (screenShake > 0) {
                const shakeOffsetX = (Math.random() - 0.5) * screenShake;
                const shakeOffsetY = (Math.random() - 0.5) * screenShake;
                ctx.save();
                ctx.translate(shakeOffsetX, shakeOffsetY);
                
                // Reduce shake intensity for next frame
                screenShake *= 0.9;
                if (screenShake < 0.5) screenShake = 0;
            }
            
            // Draw grid lines or pattern (background)
            drawBackgroundParticles();
            
            // Draw game elements
            drawBricks();
            drawBall();
            drawPaddle();
            updateParticles();
            
            // Restore canvas if screen shake was applied
            if (screenShake > 0) {
                ctx.restore();
            }
        }

        // Handle powerup
        function activatePowerup(type) {
            switch(type) {
                case 'extraLife':
                    lives++;
                    updateLives();
                    createExplosion(canvas.width/2, canvas.height/2, 'rgb(0, 255, 157)');
                    break;
                case 'widePaddle':
                    // Widen paddle temporarily
                    paddle.width = 150;
                    setTimeout(() => { paddle.width = 100; }, 10000);
                    break;
                case 'slowBall':
                    // Slow down ball speed temporarily
                    const currentSpeed = Math.sqrt(ball.dx*ball.dx + ball.dy*ball.dy);
                    const slowFactor = 0.6;
                    ball.dx *= slowFactor;
                    ball.dy *= slowFactor;
                    
                    // Return to normal speed after 8 seconds
                    setTimeout(() => {
                        const slowedSpeed = Math.sqrt(ball.dx*ball.dx + ball.dy*ball.dy);
                        const speedupFactor = currentSpeed / slowedSpeed;
                        ball.dx *= speedupFactor;
                        ball.dy *= speedupFactor;
                    }, 8000);
                    break;
                case 'multiBall':
                    // Not implemented fully in this version
                    // Would create additional balls
                    break;
            }
            
            // Visual feedback for powerup
            shakeScreen(5);
        }
        
        // Game animation loop
        function animate() {
            if (!gameRunning || isPaused) return;
            
            requestAnimationFrame(animate);
            draw();
            
            if (gameRunning) {
                moveBall();
                movePaddle();
                collisionDetection();
            }
        }

        // Start game
        function startGame() {
            score = 0;
            lives = 3;
            level = 1;
            updateScore();
            updateLives();
            updateLevel();
            
            gameRunning = true;
            startScreen.classList.remove('active');
            gameOverScreen.classList.remove('active');
            
            resetBall();
            initBricks();
            initBackgroundParticles();
            
            animate();
        }

        // Restart game
        function restartGame() {
            gameOverScreen.classList.remove('active');
            startGame();
        }

        // Toggle pause
        function togglePause() {
            isPaused = !isPaused;
            pauseBtn.textContent = isPaused ? 'Resume' : 'Pause';
            
            if (!isPaused && gameRunning) {
                animate();
            }
        }



        // Event listeners for keyboard control
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Right' || e.key === 'ArrowRight') {
                rightPressed = true;
            } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
                leftPressed = true;
            }
        });

        document.addEventListener('keyup', (e) => {
            if (e.key === 'Right' || e.key === 'ArrowRight') {
                rightPressed = false;
            } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
                leftPressed = false;
            } else if (e.key === 'p' || e.key === 'P') {
                togglePause();
            } else if (e.key === ' ' && !gameRunning) {
                startGame();
            } else if (e.key === 'm' || e.key === 'M') {
                mouseControl = !mouseControl;
                document.getElementById('toggleMouseBtn').textContent = mouseControl ? 'Use Keyboard' : 'Use Mouse';
            }
        });

        // Improved touch controls for mobile
        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touchX = e.touches[0].clientX - canvas.getBoundingClientRect().left;
            
            // Calculate the ratio of actual canvas size to its rendered size
            const canvasRect = canvas.getBoundingClientRect();
            const scaleRatio = canvas.width / canvasRect.width;
            
            // Apply the scaling to get the correct position
            const scaledX = touchX * scaleRatio;
            
            // Use smooth transition for better feel
            const targetX = scaledX - paddle.width / 2;
            paddle.x += (targetX - paddle.x) * 0.3;
            
            // Keep paddle within bounds
            if (paddle.x < 0) paddle.x = 0;
            if (paddle.x > canvas.width - paddle.width) paddle.x = canvas.width - paddle.width;
        });
        
        // Mobile control buttons
        const leftBtn = document.getElementById('leftBtn');
        const rightBtn = document.getElementById('rightBtn');
        
        // Left button
        leftBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            leftPressed = true;
        });
        
        leftBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            leftPressed = false;
        });
        
        // Right button
        rightBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            rightPressed = true;
        });
        
        rightBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            rightPressed = false;
        });
        
        // Mouse movement for paddle control
        canvas.addEventListener('mousemove', (e) => {
            if (mouseControl) {
                const relativeX = e.clientX - canvas.getBoundingClientRect().left;
                mousePaddlePosition = relativeX - paddle.width / 2;
            }
        });

        // Button event listeners with debug and improved touch handling
        function addClickHandlers(element, handler) {
            // Add both click and touch events to ensure mobile compatibility
            element.addEventListener('click', (e) => {
                console.log('Button clicked:', element.id);
                handler(e);
            });
            
            element.addEventListener('touchend', (e) => {
                console.log('Button touched:', element.id);
                e.preventDefault(); // Prevent ghost clicks
                handler(e);
            }, { passive: false });
        }
        
        addClickHandlers(startBtn, () => {
            startGame();
        });
        
        addClickHandlers(restartBtn, restartGame);
        addClickHandlers(nextLevelBtn, nextLevel);
        addClickHandlers(pauseBtn, togglePause);
        addClickHandlers(document.getElementById('toggleMouseBtn'), () => {
            mouseControl = !mouseControl;
            document.getElementById('toggleMouseBtn').textContent = mouseControl ? 'Use Keyboard' : 'Use Mouse';
        });
        
        // Fullscreen functionality with improved touch handling
        addClickHandlers(fullscreenBtn, toggleFullscreen);
        
        function toggleFullscreen() {
            if (!isFullscreen) {
                if (document.documentElement.requestFullscreen) {
                    document.documentElement.requestFullscreen();
                } else if (document.documentElement.webkitRequestFullscreen) {
                    document.documentElement.webkitRequestFullscreen();
                } else if (document.documentElement.msRequestFullscreen) {
                    document.documentElement.msRequestFullscreen();
                }
                isFullscreen = true;
                fullscreenBtn.textContent = 'Exit Fullscreen';
            } else {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                } else if (document.webkitExitFullscreen) {
                    document.webkitExitFullscreen();
                } else if (document.msExitFullscreen) {
                    document.msExitFullscreen();
                }
                isFullscreen = false;
                fullscreenBtn.textContent = 'Fullscreen';
            }
            
            // Resize canvas after fullscreen change
            setTimeout(resizeCanvas, 100);
        }

        // Initialize game
        initBricks();
        initBackgroundParticles();
        draw();
        
        // Force the start screen to be visible
        setTimeout(() => {
            startScreen.classList.add('active');
            // Make sure canvas is properly sized
            resizeCanvas();
        }, 100);
        
        // Simplified resize function for better responsiveness
        function resizeCanvas() {
            console.log('Resizing canvas...');
            const container = document.querySelector('.game-container');
            
            // Keep aspect ratio at 4:3 (800x600)
            const aspectRatio = 800 / 600;
            
            // Get available width (use 95% of container width to leave some margin)
            const availableWidth = container.clientWidth * 0.95;
            
            // Determine best fit size based on available height and width
            let newWidth, newHeight;
            
            // Start by using full available width
            newWidth = availableWidth;
            newHeight = newWidth / aspectRatio;
            
            // If height is too tall (more than 70% of viewport), scale down
            const maxHeight = window.innerHeight * 0.7;
            if (newHeight > maxHeight) {
                newHeight = maxHeight;
                newWidth = newHeight * aspectRatio;
            }
            
            // Apply styles with pixel values
            canvas.style.width = `${Math.floor(newWidth)}px`;
            canvas.style.height = `${Math.floor(newHeight)}px`;
            
            // Ensure container has enough height for the canvas plus some padding
            container.style.minHeight = `${Math.floor(newHeight + 30)}px`;
            
            // Ensure overlays are properly displayed
            if (!gameRunning) {
                startScreen.classList.add('active');
            }
            
            // Ensure mobile controls are properly positioned
            positionMobileControls();
            
            console.log(`Canvas resized to ${Math.floor(newWidth)}x${Math.floor(newHeight)}`);
        }
        
        // Position mobile controls based on canvas size
        function positionMobileControls() {
            if (window.innerWidth <= 768) {
                const mobileControls = document.querySelector('.mobile-controls');
                const canvas = document.getElementById('gameCanvas');
                const canvasRect = canvas.getBoundingClientRect();
                
                // Position controls below the canvas
                mobileControls.style.marginTop = '10px';
                mobileControls.style.display = 'flex';
            }
        }
        
        // Listen for orientation changes too for better mobile experience
        window.addEventListener('resize', resizeCanvas);
        window.addEventListener('orientationchange', resizeCanvas);
        resizeCanvas();