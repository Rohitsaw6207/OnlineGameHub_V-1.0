document.addEventListener('DOMContentLoaded', () => {
    // Create bubbles/particles
    createParticles();
    
    // Initialize game
    initGame();
  });

  function createParticles() {
    const container = document.getElementById('particles');
    const particleCount = 40;
    
    for (let i = 0; i < particleCount; i++) {
      const size = Math.random() * 40 + 5;
      const particle = document.createElement('div');
      particle.classList.add('particle');
      
      // Random positions
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.top = `${Math.random() * 100}%`;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      
      // Different opacities for depth
      particle.style.opacity = Math.random() * 0.5 + 0.1;
      
      // Purple tints with occasional accent
      const particleColor = Math.random() > 0.9 ? 
          `rgba(255, 109, 0, ${Math.random() * 0.3})` : 
          `rgba(124, 77, 255, ${Math.random() * 0.4})`;
      particle.style.background = particleColor;
      
      container.appendChild(particle);
      
      // Animate
      animateParticle(particle);
    }
  }

  function animateParticle(particle) {
    const speed = Math.random() * 3 + 1;
    let posX = parseFloat(particle.style.left);
    let posY = parseFloat(particle.style.top);
    let dirX = Math.random() > 0.5 ? 1 : -1;
    let dirY = Math.random() > 0.5 ? 1 : -1;
    
    function move() {
      posX += speed * 0.05 * dirX;
      posY += speed * 0.05 * dirY;
      
      // Bounce off edges
      if (posX > 100 || posX < 0) dirX *= -1;
      if (posY > 100 || posY < 0) dirY *= -1;
      
      particle.style.left = `${posX}%`;
      particle.style.top = `${posY}%`;
      
      requestAnimationFrame(move);
    }
    
    move();
  }

  function initGame() {
    const cells = document.querySelectorAll('.cell');
    const playerScoreEl = document.getElementById('player-score');
    const computerScoreEl = document.getElementById('computer-score');
    const drawsScoreEl = document.getElementById('draws-score');
    const restartBtn = document.getElementById('restart-btn');
    const newGameBtn = document.getElementById('new-game-btn');
    const messageOverlay = document.getElementById('message-overlay');
    const messageTitle = document.getElementById('message-title');
    
    let board = Array(9).fill('');
    let currentPlayer = 'X'; // Player is X, Computer is O
    let gameActive = true;
    let playerScore = 0;
    let computerScore = 0;
    let drawsScore = 0;
    
    const winPatterns = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
      [0, 4, 8], [2, 4, 6] // diagonals
    ];
    
    // Add event listeners to cells
    cells.forEach(cell => {
      cell.addEventListener('click', () => {
        const index = cell.dataset.index;
        
        // Check if cell is already taken or game is not active
        if (board[index] !== '' || !gameActive || currentPlayer !== 'X') return;
        
        // Player makes a move
        makeMove(index, 'X');
        
        // Check game status after player's move
        if (gameActive && currentPlayer === 'O') {
          // Computer's turn
          setTimeout(computerTurn, 700);
        }
      });
    });
    
    // Restart button event listener
    restartBtn.addEventListener('click', resetGame);
    newGameBtn.addEventListener('click', () => {
      messageOverlay.classList.remove('active');
      resetGame();
    });
    
    function makeMove(index, player) {
      board[index] = player;
      
      // Render the move on the board with animation
      const cell = document.querySelector(`.cell[data-index="${index}"]`);
      cell.textContent = player;
      cell.classList.add(player.toLowerCase());
      
      // Add bounce animation
      cell.animate([
        { transform: 'scale(0)', opacity: 0.5 },
        { transform: 'scale(1.2)', opacity: 1 },
        { transform: 'scale(1)', opacity: 1 }
      ], {
        duration: 300,
        easing: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        fill: 'forwards'
      });
      
      // Check for win or draw
      if (checkWin(player)) {
        gameActive = false;
        
        if (player === 'X') {
          playerScore++;
          animateScore(playerScoreEl, playerScore);
          showMessage('You Win!');
        } else {
          computerScore++;
          animateScore(computerScoreEl, computerScore);
          showMessage('You Lose!');
        }
        
        highlightWinningCombination();
        return;
      }
      
      if (checkDraw()) {
        gameActive = false;
        drawsScore++;
        animateScore(drawsScoreEl, drawsScore);
        showMessage('It\'s a Draw!');
        return;
      }
      
      // Switch player
      currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    }
    
    function computerTurn() {
      if (!gameActive) return;
      
      let index;
      
      // Try to win
      index = findBestMove('O');
      if (index !== -1) {
        makeMove(index, 'O');
        return;
      }
      
      // Try to block player
      index = findBestMove('X');
      if (index !== -1) {
        makeMove(index, 'O');
        return;
      }
      
      // Take center if available
      if (board[4] === '') {
        makeMove(4, 'O');
        return;
      }
      
      // Take a random empty cell
      const emptyCells = board.map((cell, index) => cell === '' ? index : null).filter(cell => cell !== null);
      if (emptyCells.length > 0) {
        const randomIndex = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        makeMove(randomIndex, 'O');
      }
    }
    
    function findBestMove(player) {
      // Check if there's any winning move
      for (const pattern of winPatterns) {
        const [a, b, c] = pattern;
        
        if (board[a] === player && board[b] === player && board[c] === '') {
          return c;
        }
        if (board[a] === player && board[c] === player && board[b] === '') {
          return b;
        }
        if (board[b] === player && board[c] === player && board[a] === '') {
          return a;
        }
      }
      
      return -1;
    }
    
    function checkWin(player) {
      return winPatterns.some(pattern => {
        return pattern.every(index => board[index] === player);
      });
    }
    
    function checkDraw() {
      return board.every(cell => cell !== '');
    }
    
    function highlightWinningCombination() {
      for (const pattern of winPatterns) {
        if (pattern.every(index => board[index] === 'X')) {
          highlightCells(pattern, 'X');
          break;
        } else if (pattern.every(index => board[index] === 'O')) {
          highlightCells(pattern, 'O');
          break;
        }
      }
    }
    
    function highlightCells(indexes, player) {
      const color = player === 'X' ? 'rgba(77, 124, 255, 0.3)' : 'rgba(255, 77, 109, 0.3)';
      
      indexes.forEach(index => {
        const cell = document.querySelector(`.cell[data-index="${index}"]`);
        
        cell.animate([
          { background: 'rgba(255, 255, 255, 0.1)' },
          { background: color },
          { background: 'rgba(255, 255, 255, 0.1)' },
          { background: color }
        ], {
          duration: 1200,
          iterations: 3
        });
      });
    }
    
    function resetGame() {
      board = Array(9).fill('');
      currentPlayer = 'X';
      gameActive = true;
      
      cells.forEach(cell => {
        cell.textContent = '';
        cell.className = 'cell';
      });
    }
    
    function showMessage(message) {
      messageTitle.textContent = message;
      messageOverlay.classList.add('active');
    }
    
    function animateScore(element, newScore) {
      element.textContent = newScore;
      element.classList.add('animated');
      
      setTimeout(() => {
        element.classList.remove('animated');
      }, 500);
    }
  }