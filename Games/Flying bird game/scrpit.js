document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const gameContainer = document.getElementById('gameContainer');
    const scoreElement = document.getElementById('score');
    const gameOverScreen = document.querySelector('.game-over');
    const restartBtn = document.getElementById('restartBtn');
    const aiToggle = document.getElementById('aiToggle');
    
    // Set canvas dimensions
    canvas.width = gameContainer.offsetWidth;
    canvas.height = gameContainer.offsetHeight;
    
    // Game variables
    let score = 0;
    let gameActive = false;
    let particles = [];
    
    // Bird properties
    const bird = {
        x: canvas.width * 0.2,
        y: canvas.height / 2,
        width: 40,
        height: 30,
        gravity: 0.35,
        velocity: 0,
        lift: -8,
        trail: [],
        maxTrail: 5,
        
        draw() {
            // Draw trail
            for (let i = 0; i < this.trail.length; i++) {
                const t = this.trail[i];
                const alpha = (i / this.trail.length) * 0.3;
                const size = this.width - (this.trail.length - i) * 5;
                
                ctx.beginPath();
                ctx.fillStyle = `rgba(0, 238, 255, ${alpha})`;
                ctx.arc(t.x + this.width / 2, t.y + this.height / 2, size / 2, 0, Math.PI * 2);
                ctx.fill();
            }
            
            // Bird body glow
            ctx.shadowBlur = 20;
            ctx.shadowColor = "#00eeff";
            
            // Bird body
            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.ellipse(this.x + this.width / 2, this.y + this.height / 2, 
                        this.width / 2, this.height / 2, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Bird eye
            ctx.fillStyle = "#000";
            ctx.beginPath();
            ctx.arc(this.x + this.width * 0.7, this.y + this.height * 0.4, 3, 0, Math.PI * 2);
            ctx.fill();
            
            // Bird beak
            ctx.fillStyle = "#ff9900";
            ctx.beginPath();
            ctx.moveTo(this.x + this.width * 0.9, this.y + this.height * 0.5);
            ctx.lineTo(this.x + this.width * 1.2, this.y + this.height * 0.4);
            ctx.lineTo(this.x + this.width * 0.9, this.y + this.height * 0.3);
            ctx.closePath();
            ctx.fill();
            
            ctx.shadowBlur = 0;
        },
        
        update() {
            // Add current position to trail
            if (gameActive) {
                this.trail.push({x: this.x, y: this.y});
                if (this.trail.length > this.maxTrail) {
                    this.trail.shift();
                }
            }
            
            // Apply gravity and update position
            this.velocity += this.gravity;
            this.y += this.velocity;
            
            // Bounce effect on top
            if (this.y <= 0) {
                this.y = 0;
                this.velocity = 0;
            }
            
            // Check if bird hits the ground
            if (this.y + this.height >= canvas.height) {
                this.y = canvas.height - this.height;
                if (gameActive) endGame();
            }
        },
        
        flap() {
            this.velocity = this.lift;
        }
    };
    
    // Pipe properties
    const pipes = {
        array: [],
        width: 80,
        minHeight: 50,
        gap: 160,
        spawnInterval: 100,
        frameCount: 0,
        speed: 3,
        
        reset() {
            this.array = [];
            this.frameCount = 0;
        },
        
        update() {
            this.frameCount++;
            
            // Add new pipe
            if (this.frameCount % this.spawnInterval === 0) {
                const centerY = Math.random() * (canvas.height - this.gap - this.minHeight * 2) + this.minHeight;
                
                // Make each pipe have variable heights
                const heightVariation = Math.random() * 60 - 30; // Random value between -30 and +30
                
                this.array.push({
                    x: canvas.width,
                    topHeight: centerY - this.gap / 2 + heightVariation,
                    bottomY: centerY + this.gap / 2 + heightVariation,
                    counted: false
                });
            }
            
            // Update pipes
            for (let i = this.array.length - 1; i >= 0; i--) {
                const pipe = this.array[i];
                pipe.x -= this.speed;
                
                // Check if pipe is offscreen
                if (pipe.x + this.width < 0) {
                    this.array.splice(i, 1);
                    continue;
                }
                
                // Check for collision
                if (gameActive && 
                    bird.x + bird.width > pipe.x && 
                    bird.x < pipe.x + this.width) {
                    
                    // Top pipe collision
                    if (bird.y < pipe.topHeight || 
                        bird.y + bird.height > pipe.bottomY) {
                        endGame();
                    }
                    
                    // Update score
                    if (!pipe.counted && bird.x > pipe.x + this.width / 2) {
                        score++;
                        scoreElement.textContent = score;
                        pipe.counted = true;
                    }
                }
            }
        },
        
        draw() {
            for (const pipe of this.array) {
                // Pipe glow
                ctx.shadowBlur = 15;
                ctx.shadowColor = "#00ff66";
                
                // Top pipe
                const gradient1 = ctx.createLinearGradient(pipe.x, 0, pipe.x + this.width, 0);
                gradient1.addColorStop(0, "#00ff66");
                gradient1.addColorStop(0.5, "#66ffaa");
                gradient1.addColorStop(1, "#00ff66");
                
                ctx.fillStyle = gradient1;
                ctx.fillRect(pipe.x, 0, this.width, pipe.topHeight);
                
                // Border for top pipe
                ctx.strokeStyle = "#88ffcc";
                ctx.lineWidth = 2;
                ctx.strokeRect(pipe.x, 0, this.width, pipe.topHeight);
                
                // Bottom pipe
                const gradient2 = ctx.createLinearGradient(pipe.x, pipe.bottomY, pipe.x + this.width, canvas.height);
                gradient2.addColorStop(0, "#00ff66");
                gradient2.addColorStop(0.5, "#66ffaa");
                gradient2.addColorStop(1, "#00ff66");
                
                ctx.fillStyle = gradient2;
                ctx.fillRect(pipe.x, pipe.bottomY, this.width, canvas.height - pipe.bottomY);
                
                // Border for bottom pipe
                ctx.strokeRect(pipe.x, pipe.bottomY, this.width, canvas.height - pipe.bottomY);
                
                ctx.shadowBlur = 0;
            }
        }
    };
    
    // Background effects
    function createParticles() {
        particles = [];
        const particleCount = 100;
        
        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * 3 + 1,
                speed: Math.random() * 0.5 + 0.1,
                brightness: Math.random() * 70 + 30,
                angle: Math.random() * Math.PI * 2
            });
        }
    }
    
    function updateParticles() {
        for (let p of particles) {
            p.x += Math.cos(p.angle) * p.speed;
            p.y += Math.sin(p.angle) * p.speed;
            
            // Wrap around edges
            if (p.x < 0) p.x = canvas.width;
            if (p.x > canvas.width) p.x = 0;
            if (p.y < 0) p.y = canvas.height;
            if (p.y > canvas.height) p.y = 0;
            
            // Slightly change direction occasionally
            if (Math.random() < 0.01) {
                p.angle += (Math.random() - 0.5) * 0.2;
            }
        }
    }
    
    function drawParticles() {
        for (let p of particles) {
            ctx.shadowBlur = 5;
            ctx.shadowColor = `rgba(${p.brightness}, ${p.brightness + 30}, 255, 0.8)`;
            ctx.fillStyle = `rgba(${p.brightness}, ${p.brightness + 30}, 255, 0.8)`;
            
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.shadowBlur = 0;
        }
    }
    
    function drawBackground() {
        // Create gradient background
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#000000');
        gradient.addColorStop(0.5, '#050528');
        gradient.addColorStop(1, '#0a0a2a');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw wave effect
        const time = Date.now() * 0.001;
        const waveHeight = 5;
        const waveCount = 3;
        
        for (let i = 0; i < waveCount; i++) {
            ctx.beginPath();
            ctx.moveTo(0, canvas.height);
            
            const opacity = 0.1 - (i * 0.03);
            ctx.strokeStyle = `rgba(0, 238, 255, ${opacity})`;
            ctx.lineWidth = 2 + i;
            
            for (let x = 0; x <= canvas.width; x += 10) {
                const y = canvas.height - 100 + Math.sin(x * 0.01 + time + i) * waveHeight * (i + 1);
                ctx.lineTo(x, y);
            }
            
            ctx.lineTo(canvas.width, canvas.height);
            ctx.stroke();
        }
        
        drawParticles();
    }
    
    // AI functions
    function aiPlay() {
        if (!gameActive || !aiMode) return;
        
        const nearestPipe = pipes.array.find(p => p.x + pipes.width >= bird.x);
        
        if (nearestPipe) {
            const gapCenter = nearestPipe.topHeight + ((nearestPipe.bottomY - nearestPipe.topHeight) / 2);
            
            if (bird.y > gapCenter) {
                if (bird.velocity > 0) {
                    bird.flap();
                }
            } else if (bird.y < gapCenter - 20 && bird.velocity < 0) {
                // Let it fall
            } else if (Math.random() < 0.05) { // Add some randomness to the AI
                bird.flap();
            }
        }
    }
    
    // Game control
    function startGame() {
        gameActive = true;
        score = 0;
        scoreElement.textContent = score;
        
        bird.y = canvas.height / 2;
        bird.velocity = 0;
        bird.trail = [];
        
        pipes.reset();
        
        gameOverScreen.style.display = 'none';
    }
    
    function endGame() {
        gameActive = false;
        gameOverScreen.style.display = 'block';
    }
    
    // Initialize
    function init() {
        createParticles();
        startGame(); // Start with game ready but paused until first input
        gameActive = false;
        
        restartBtn.addEventListener('click', () => {
            startGame();
        });
        

        
        window.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                if (!gameActive) {
                    startGame();
                } else {
                    bird.flap();
                }
            }
        });
        
        canvas.addEventListener('click', () => {
            if (!gameActive) {
                startGame();
            } else {
                bird.flap();
            }
        });
        
        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (!gameActive) {
                startGame();
            } else {
                bird.flap();
            }
        });
        
        // Handle resize
        window.addEventListener('resize', () => {
            canvas.width = gameContainer.offsetWidth;
            canvas.height = gameContainer.offsetHeight;
            createParticles();
        });
        
        // Main game loop
        gameLoop();
    }
    
    function gameLoop() {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw background
        drawBackground();
        updateParticles();
        
        // Update and draw game elements
        if (gameActive) {
            pipes.update();
            bird.update();
        }
        
        pipes.draw();
        bird.draw();
        
        // Continue loop
        requestAnimationFrame(gameLoop);
    }
    
    init();
});