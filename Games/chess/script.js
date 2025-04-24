        // Initialize the chess game using chess.js
        const chess = new Chess();

        // DOM elements
        const boardElement = document.getElementById('board');
        const statusText = document.getElementById('status-text');
        const restartBtn = document.getElementById('restart-btn');
        const undoBtn = document.getElementById('undo-btn');
        const difficultySelect = document.getElementById('difficulty');
        const capturedWhiteContainer = document.querySelector('#captured-white .pieces');
        const capturedBlackContainer = document.querySelector('#captured-black .pieces');
        const modal = document.getElementById('gameEndModal');
        const modalTitle = document.getElementById('modal-title');
        const modalMessage = document.getElementById('modal-message');
        const modalCloseBtn = document.getElementById('modal-close-btn');

        // Game state
        let selectedSquare = null;
        let playerColor = 'w';
        let isAnimating = false;
        let isGameOver = false;
        const capturedPieces = {
            w: [],
            b: []
        };

        // Piece images mapping
        const pieceImages = {
            'wp': 'https://images.chesscomfiles.com/chess-themes/pieces/neo/150/wp.png',
            'wn': 'https://images.chesscomfiles.com/chess-themes/pieces/neo/150/wn.png',
            'wb': 'https://images.chesscomfiles.com/chess-themes/pieces/neo/150/wb.png',
            'wr': 'https://images.chesscomfiles.com/chess-themes/pieces/neo/150/wr.png',
            'wq': 'https://images.chesscomfiles.com/chess-themes/pieces/neo/150/wq.png',
            'wk': 'https://images.chesscomfiles.com/chess-themes/pieces/neo/150/wk.png',
            'bp': 'https://images.chesscomfiles.com/chess-themes/pieces/neo/150/bp.png',
            'bn': 'https://images.chesscomfiles.com/chess-themes/pieces/neo/150/bn.png',
            'bb': 'https://images.chesscomfiles.com/chess-themes/pieces/neo/150/bb.png',
            'br': 'https://images.chesscomfiles.com/chess-themes/pieces/neo/150/br.png',
            'bq': 'https://images.chesscomfiles.com/chess-themes/pieces/neo/150/bq.png',
            'bk': 'https://images.chesscomfiles.com/chess-themes/pieces/neo/150/bk.png'
        };

        // Initialize the board
        function initializeBoard() {
            boardElement.innerHTML = '';
            const files = 'abcdefgh';
            const ranks = '87654321'; 

            // Create squares
            for (let r = 0; r < 8; r++) {
                for (let f = 0; f < 8; f++) {
                    const square = document.createElement('div');
                    square.className = `square ${(r + f) % 2 === 0 ? 'dark' : 'light'}`;
                    square.dataset.square = files[f] + ranks[r];
                    
                    // Add event listeners for interaction
                    square.addEventListener('click', handleSquareClick);
                    
                    boardElement.appendChild(square);
                }
            }
            
            // Update pieces on the board
            updateBoard();
            createBackgroundParticles();
        }

        // Update the board based on current game state
        function updateBoard() {
            // Clear valid move indicators
            document.querySelectorAll('.square').forEach(square => {
                square.classList.remove('valid-move');
                square.classList.remove('selected');
                // Remove existing pieces
                const piece = square.querySelector('.piece');
                if (piece) {
                    piece.remove();
                }
            });

            // Place pieces according to current position
            for (let r = 0; r < 8; r++) {
                for (let c = 0; c < 8; c++) {
                    const piece = chess.board()[r][c];
                    if (piece) {
                        const squareId = 'abcdefgh'[c] + '87654321'[r];
                        const squareElement = document.querySelector(`[data-square="${squareId}"]`);
                        
                        if (squareElement) {
                            const pieceElement = document.createElement('img');
                            pieceElement.className = `piece ${piece.color === 'w' ? 'white' : 'black'}`;
                            pieceElement.src = pieceImages[piece.color + piece.type];
                            pieceElement.draggable = true;
                            pieceElement.dataset.piece = piece.color + piece.type;
                            
                            // Add drag events
                            pieceElement.addEventListener('dragstart', handleDragStart);
                            pieceElement.addEventListener('dragend', handleDragEnd);
                            
                            squareElement.appendChild(pieceElement);
                        }
                    }
                }
            }

            // Update selected square if any
            if (selectedSquare) {
                const squareElement = document.querySelector(`[data-square="${selectedSquare}"]`);
                if (squareElement) {
                    squareElement.classList.add('selected');
                    
                    // Show valid moves
                    const moves = chess.moves({ square: selectedSquare, verbose: true });
                    moves.forEach(move => {
                        const targetSquare = document.querySelector(`[data-square="${move.to}"]`);
                        if (targetSquare) {
                            targetSquare.classList.add('valid-move');
                        }
                    });
                }
            }

            // Update game status
            updateGameStatus();
            updateCapturedPieces();
        }

        // Handle square click
        function handleSquareClick(event) {
            if (isAnimating || chess.game_over() || chess.turn() !== playerColor) return;

            const squareElement = event.target.closest('.square');
            const square = squareElement.dataset.square;
            
            // If clicking on a piece of player's color
            const piece = chess.get(square);
            if (piece && piece.color === playerColor) {
                selectSquare(square);
                return;
            }
            
            // If a square is already selected, try to move
            if (selectedSquare) {
                const from = selectedSquare;
                const to = square;
                
                // Check if the move is valid
                const moves = chess.moves({ square: from, verbose: true });
                const isValidMove = moves.some(move => move.to === to);
                
                if (isValidMove) {
                    // Check for captures
                    const capturedPiece = chess.get(to);
                    
                    // Make the move
                    const move = chess.move({ from, to, promotion: 'q' });
                    
                    if (move) {
                        // Animate the piece movement
                        animateMove(from, to, capturedPiece);
                        
                        // After player's move, make computer move
                        setTimeout(makeComputerMove, 500);
                    }
                }
                
                // Clear selection
                selectedSquare = null;
            } else {
                selectSquare(square);
            }
            
            updateBoard();
        }

        // Select a square and show valid moves
        function selectSquare(square) {
            const piece = chess.get(square);
            
            if (piece && piece.color === playerColor) {
                selectedSquare = square;
                updateBoard();
            }
        }

        // Handle drag start
        function handleDragStart(event) {
            if (chess.game_over() || chess.turn() !== playerColor) {
                event.preventDefault();
                return;
            }

            const pieceElement = event.target;
            const squareElement = pieceElement.closest('.square');
            const square = squareElement.dataset.square;
            const piece = chess.get(square);
            
            if (piece && piece.color === playerColor) {
                selectedSquare = square;
                pieceElement.classList.add('dragging');
                event.dataTransfer.setData('text/plain', square);
                
                // Add dragover and drop events to all squares
                document.querySelectorAll('.square').forEach(sq => {
                    sq.addEventListener('dragover', handleDragOver);
                    sq.addEventListener('drop', handleDrop);
                });
                
                updateBoard();
            } else {
                event.preventDefault();
            }
        }

        // Handle drag over
        function handleDragOver(event) {
            event.preventDefault();
        }

        // Handle drag end
        function handleDragEnd(event) {
            event.target.classList.remove('dragging');
            
            // Remove dragover and drop events
            document.querySelectorAll('.square').forEach(sq => {
                sq.removeEventListener('dragover', handleDragOver);
                sq.removeEventListener('drop', handleDrop);
            });
        }

        // Handle drop
        function handleDrop(event) {
            event.preventDefault();
            
            if (isAnimating) return;
            
            const from = event.dataTransfer.getData('text/plain');
            const to = event.target.closest('.square').dataset.square;
            
            // Check if the move is valid
            const moves = chess.moves({ square: from, verbose: true });
            const isValidMove = moves.some(move => move.to === to);
            
            if (isValidMove) {
                // Check for captures
                const capturedPiece = chess.get(to);
                
                // Make the move
                const move = chess.move({ from, to, promotion: 'q' });
                
                if (move) {
                    // Animate the piece movement
                    animateMove(from, to, capturedPiece);
                    
                    // After player's move, make computer move
                    setTimeout(makeComputerMove, 500);
                }
            }
            
            selectedSquare = null;
            updateBoard();
        }

        // Move a piece without animation
        function animateMove(from, to, capturedPiece) {
            // If there was a captured piece, add to captured pieces list
            if (capturedPiece) {
                capturedPieces[capturedPiece.color].push(capturedPiece.type);
            }
            
            // Update the board immediately
            isAnimating = false;
            updateBoard();
            
            // Check game status after move completes
            checkGameEnd();
        }

        // Make a computer move
        function makeComputerMove() {
            if (chess.game_over() || chess.turn() === playerColor) return;
            
            let move;
            const difficulty = difficultySelect.value;
            
            if (difficulty === 'beginner') {
                // Random legal move for beginner
                const moves = chess.moves({ verbose: true });
                if (moves.length > 0) {
                    const randomIndex = Math.floor(Math.random() * moves.length);
                    move = moves[randomIndex];
                }
            } else {
                // More intelligent move for intermediate
                move = getBestMove();
            }
            
            if (move) {
                // Check for captures
                const capturedPiece = chess.get(move.to);
                
                // Make the move
                chess.move(move);
                
                // Animate the move
                animateMove(move.from, move.to, capturedPiece);
            }
        }

        // Simple minimax algorithm for AI (intermediate level)
        function getBestMove() {
            // Get all possible moves
            const moves = chess.moves({ verbose: true });
            let bestMove = null;
            let bestScore = -Infinity;
            
            for (let i = 0; i < moves.length; i++) {
                const move = moves[i];
                
                // Make the move
                chess.move(move);
                
                // Evaluate position
                const score = evaluateBoard();
                
                // Undo the move
                chess.undo();
                
                // Update best move if needed
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = move;
                }
            }
            
            return bestMove;
        }

        // Simple board evaluation function
        function evaluateBoard() {
            const pieceValues = {
                'p': 1,
                'n': 3,
                'b': 3,
                'r': 5,
                'q': 9,
                'k': 0  // The king is not given a material value
            };
            
            let score = 0;
            
            // Evaluate material
            chess.board().forEach(row => {
                row.forEach(piece => {
                    if (piece) {
                        const multiplier = piece.color === playerColor ? -1 : 1;
                        score += multiplier * pieceValues[piece.type];
                        
                        // Bonus for controlling center (for intermediate AI)
                        if (piece.type === 'p' || piece.type === 'n') {
                            const square = piece.square;
                            if (square === 'd4' || square === 'e4' || square === 'd5' || square === 'e5') {
                                score += multiplier * 0.5;
                            }
                        }
                    }
                });
            });
            
            return score;
        }

        // Update the game status
        function updateGameStatus() {
            if (chess.game_over()) {
                if (!isGameOver) {
                    // Mark game as over (to prevent multiple popups)
                    isGameOver = true;
                    
                    // Apply grayscale effect to board
                    boardElement.classList.add('game-over');
                }
                
                if (chess.in_checkmate()) {
                    const winner = chess.turn() === 'w' ? 'Black' : 'White';
                    statusText.textContent = `Checkmate! ${winner} wins!`;
                } else if (chess.in_draw()) {
                    statusText.textContent = 'Game Over! It\'s a draw.';
                } else if (chess.in_stalemate()) {
                    statusText.textContent = 'Game Over! Stalemate.';
                } else if (chess.in_threefold_repetition()) {
                    statusText.textContent = 'Game Over! Draw by repetition.';
                } else if (chess.insufficient_material()) {
                    statusText.textContent = 'Game Over! Insufficient material.';
                }
            } else {
                // Make sure game-over class is removed
                isGameOver = false;
                boardElement.classList.remove('game-over');
                
                if (chess.in_check()) {
                    const inCheck = chess.turn() === 'w' ? 'White' : 'Black';
                    statusText.textContent = `${inCheck} is in check!`;
                } else {
                    const turn = chess.turn() === 'w' ? 'White' : 'Black';
                    statusText.textContent = `${turn}'s turn to move.`;
                }
            }
        }

        // Update captured pieces display
        function updateCapturedPieces() {
            // Clear containers
            capturedWhiteContainer.innerHTML = '';
            capturedBlackContainer.innerHTML = '';
            
            // Add white captured pieces
            capturedPieces.w.forEach(pieceType => {
                const img = document.createElement('img');
                img.src = pieceImages['w' + pieceType];
                capturedBlackContainer.appendChild(img);
            });
            
            // Add black captured pieces
            capturedPieces.b.forEach(pieceType => {
                const img = document.createElement('img');
                img.src = pieceImages['b' + pieceType];
                capturedWhiteContainer.appendChild(img);
            });
        }

        // Create background particles
        function createBackgroundParticles() {
            const particlesContainer = document.getElementById('particles');
            const particleCount = 50; // number of particles
            
            for (let i = 0; i < particleCount; i++) {
                const particle = document.createElement('div');
                particle.className = 'particle';
                
                // Random size between 1 and 3px
                const size = Math.random() * 2 + 1;
                
                // Random position
                const posX = Math.random() * 100;
                const posY = Math.random() * 100;
                
                // Random animation duration between 20 and 60 seconds
                const duration = Math.random() * 40 + 20;
                
                // Random color (cyan or magenta with varying opacity)
                const color = Math.random() > 0.5 ? 
                    `rgba(0, 255, 255, ${Math.random() * 0.3 + 0.1})` : 
                    `rgba(255, 0, 255, ${Math.random() * 0.3 + 0.1})`;
                
                // Add styles
                particle.style.cssText = `
                    position: absolute;
                    width: ${size}px;
                    height: ${size}px;
                    background-color: ${color};
                    left: ${posX}%;
                    top: ${posY}%;
                    border-radius: 50%;
                    box-shadow: 0 0 ${size * 2}px ${color};
                    animation: float ${duration}s infinite linear;
                    opacity: ${Math.random() * 0.5 + 0.3};
                `;
                
                particlesContainer.appendChild(particle);
            }
            
            // Add CSS animation
            const style = document.createElement('style');
            style.textContent = `
                @keyframes float {
                    0% {
                        transform: translate(0, 0);
                    }
                    25% {
                        transform: translate(${Math.random() * 20 - 10}px, ${Math.random() * 20 - 10}px);
                    }
                    50% {
                        transform: translate(${Math.random() * 20 - 10}px, ${Math.random() * 20 - 10}px);
                    }
                    75% {
                        transform: translate(${Math.random() * 20 - 10}px, ${Math.random() * 20 - 10}px);
                    }
                    100% {
                        transform: translate(0, 0);
                    }
                }
            `;
            document.head.appendChild(style);
        }

        // Restart the game
        function restartGame() {
            chess.reset();
            selectedSquare = null;
            capturedPieces.w = [];
            capturedPieces.b = [];
            isGameOver = false;
            boardElement.classList.remove('game-over');
            closeModal();
            updateBoard();
        }

        // Undo last move (both player and computer)
        function undoMove() {
            if (chess.history().length >= 2) {
                chess.undo(); // Undo computer's move
                chess.undo(); // Undo player's move
                selectedSquare = null;
                
                // Update captured pieces
                recalculateCapturedPieces();
                
                updateBoard();
            }
        }

        // Recalculate captured pieces after undo
        function recalculateCapturedPieces() {
            // Reset captured pieces
            capturedPieces.w = [];
            capturedPieces.b = [];
            
            // Count pieces of each type that should be on the board
            const expectedPieces = {
                'p': 8, 'n': 2, 'b': 2, 'r': 2, 'q': 1, 'k': 1
            };
            
            // Count actual pieces on the board
            const actualPieces = {
                'w': { 'p': 0, 'n': 0, 'b': 0, 'r': 0, 'q': 0, 'k': 0 },
                'b': { 'p': 0, 'n': 0, 'b': 0, 'r': 0, 'q': 0, 'k': 0 }
            };
            
            chess.board().forEach(row => {
                row.forEach(piece => {
                    if (piece) {
                        actualPieces[piece.color][piece.type]++;
                    }
                });
            });
            
            // Calculate captured pieces
            for (const pieceType in expectedPieces) {
                const whiteCaptures = expectedPieces[pieceType] - actualPieces.w[pieceType];
                const blackCaptures = expectedPieces[pieceType] - actualPieces.b[pieceType];
                
                for (let i = 0; i < whiteCaptures; i++) {
                    capturedPieces.w.push(pieceType);
                }
                
                for (let i = 0; i < blackCaptures; i++) {
                    capturedPieces.b.push(pieceType);
                }
            }
        }

        // Check for game end and show modal
        function checkGameEnd() {
            if (chess.game_over() && !modal.classList.contains('show')) {
                let title, message;
                
                if (chess.in_checkmate()) {
                    const winner = chess.turn() === 'w' ? 'Black' : 'White';
                    title = `${winner} Wins!`;
                    message = `Checkmate! ${winner} has won the game.`;
                } else if (chess.in_stalemate()) {
                    title = "Stalemate";
                    message = "The game has ended in a stalemate.";
                } else if (chess.in_draw()) {
                    title = "Draw";
                    message = "The game has ended in a draw.";
                } else if (chess.in_threefold_repetition()) {
                    title = "Draw by Repetition";
                    message = "The game has ended in a draw due to threefold repetition.";
                } else if (chess.insufficient_material()) {
                    title = "Draw";
                    message = "The game has ended in a draw due to insufficient material.";
                }
                
                showModal(title, message);
            }
        }

        // Show modal with custom message
        function showModal(title, message) {
            modalTitle.textContent = title;
            modalMessage.textContent = message;
            modal.classList.add('show');
        }

        // Close the modal
        function closeModal() {
            modal.classList.remove('show');
        }

        // Event Listeners
        restartBtn.addEventListener('click', restartGame);
        undoBtn.addEventListener('click', undoMove);
        modalCloseBtn.addEventListener('click', closeModal);

        // Initialize the game
        initializeBoard();