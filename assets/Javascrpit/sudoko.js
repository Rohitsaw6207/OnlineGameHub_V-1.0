 // Sudoku Game Logic
 document.addEventListener('DOMContentLoaded', function() {
    // Game variables
    let selectedCell = null;
    let gameBoard = [];
    let solvedBoard = [];
    let timer = null;
    let seconds = 0;
    let difficulty = 'medium';
    let gameActive = false;

    // DOM elements
    const board = document.getElementById('sudoku-board');
    const difficultySelect = document.getElementById('difficulty-select');
    const newGameBtn = document.getElementById('new-game-btn');
    const resetBtn = document.getElementById('reset-btn');
    const numberBtns = document.querySelectorAll('.number-btn');
    const timerDisplay = document.getElementById('timer');
    const statusMessage = document.getElementById('status-message');

    // Initialize the board
    function initializeBoard() {
        board.innerHTML = '';
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                const cell = document.createElement('div');
                cell.classList.add('cell');
                cell.dataset.row = i;
                cell.dataset.col = j;
                
                // Add borders to separate 3x3 blocks
                if (i === 2 || i === 5) {
                    cell.style.borderBottom = '2px solid var(--border-color)';
                }
                if (j === 2 || j === 5) {
                    cell.style.borderRight = '2px solid var(--border-color)';
                }
                
                cell.addEventListener('click', handleCellClick);
                cell.addEventListener('touchstart', function(e) {
                    e.preventDefault(); // Prevent default touch behavior
                    handleCellClick(e);
                });
                board.appendChild(cell);
            }
        }
    }

    // Generate a new Sudoku board
    function generateNewGame() {
        clearBoard();
        gameBoard = createEmptyBoard();
        generateSolution(gameBoard);
        solvedBoard = copyBoard(gameBoard);
        
        // Remove numbers based on difficulty
        let cellsToRemove;
        switch (difficulty) {
            case 'easy':
                cellsToRemove = 40; // Easier - fewer empty cells
                break;
            case 'hard':
                cellsToRemove = 60; // Harder - more empty cells
                break;
            default: // medium
                cellsToRemove = 50;
        }
        
        removeCells(cellsToRemove);
        renderBoard();
        
        // Reset game state
        gameActive = true;
        seconds = 0;
        updateTimer();
        
        if (timer) {
            clearInterval(timer);
        }
        timer = setInterval(updateTimer, 1000);
        
        statusMessage.textContent = "Game started. Good luck!";
        statusMessage.style.color = 'var(--accent-color)';
    }
    
    // Create an empty 9x9 board
    function createEmptyBoard() {
        const board = [];
        for (let i = 0; i < 9; i++) {
            board[i] = Array(9).fill(0);
        }
        return board;
    }
    
    // Generate a solution for the Sudoku board
    function generateSolution(board) {
        // Simple backtracking algorithm to generate a valid Sudoku board
        solveBoard(board);
    }
    
    // Solve the board using backtracking
    function solveBoard(board) {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (board[row][col] === 0) {
                    const nums = shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9]);
                    for (let num of nums) {
                        if (isValid(board, row, col, num)) {
                            board[row][col] = num;
                            if (solveBoard(board)) {
                                return true;
                            }
                            board[row][col] = 0;
                        }
                    }
                    return false;
                }
            }
        }
        return true;
    }
    
    // Shuffle array (Fisher-Yates algorithm)
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
    
    // Check if a number can be placed in a given cell
    function isValid(board, row, col, num) {
        // Check row
        for (let i = 0; i < 9; i++) {
            if (board[row][i] === num) {
                return false;
            }
        }
        
        // Check column
        for (let i = 0; i < 9; i++) {
            if (board[i][col] === num) {
                return false;
            }
        }
        
        // Check 3x3 box
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (board[boxRow + i][boxCol + j] === num) {
                    return false;
                }
            }
        }
        
        return true;
    }
    
    // Create a copy of the board
    function copyBoard(board) {
        return board.map(row => [...row]);
    }
    
    // Remove cells to create the puzzle
    function removeCells(count) {
        const positions = [];
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                positions.push({ row, col });
            }
        }
        
        shuffleArray(positions);
        
        for (let i = 0; i < count && i < positions.length; i++) {
            const { row, col } = positions[i];
            gameBoard[row][col] = 0;
        }
    }
    
    // Render the board
    function renderBoard() {
        const cells = document.querySelectorAll('.cell');
        
        cells.forEach(cell => {
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);
            const value = gameBoard[row][col];
            
            cell.textContent = value !== 0 ? value : '';
            cell.classList.remove('fixed', 'error');
            
            if (value !== 0) {
                cell.classList.add('fixed');
            }
        });
    }
    
    // Clear the board display
    function clearBoard() {
        const cells = document.querySelectorAll('.cell');
        cells.forEach(cell => {
            cell.textContent = '';
            cell.classList.remove('selected', 'highlight', 'fixed', 'error');
        });
    }

    // Handle cell click
    function handleCellClick(e) {
        if (!gameActive) return;
        
        // Remove previously selected cell
        if (selectedCell) {
            selectedCell.classList.remove('selected');
            
            // Remove highlights from row, column, and block
            document.querySelectorAll('.highlight').forEach(cell => {
                cell.classList.remove('highlight');
            });
        }
        
        selectedCell = e.target;
        
        // Skip if cell is fixed
        if (selectedCell.classList.contains('fixed')) {
            selectedCell = null;
            return;
        }
        
        selectedCell.classList.add('selected');
        
        // Highlight row, column, and block
        const row = parseInt(selectedCell.dataset.row);
        const col = parseInt(selectedCell.dataset.col);
        
        // Highlight row
        document.querySelectorAll(`.cell[data-row="${row}"]`).forEach(cell => {
            if (cell !== selectedCell) {
                cell.classList.add('highlight');
            }
        });
        
        // Highlight column
        document.querySelectorAll(`.cell[data-col="${col}"]`).forEach(cell => {
            if (cell !== selectedCell) {
                cell.classList.add('highlight');
            }
        });
        
        // Highlight block
        const blockRow = Math.floor(row / 3) * 3;
        const blockCol = Math.floor(col / 3) * 3;
        
        for (let i = blockRow; i < blockRow + 3; i++) {
            for (let j = blockCol; j < blockCol + 3; j++) {
                const cell = document.querySelector(`.cell[data-row="${i}"][data-col="${j}"]`);
                if (cell !== selectedCell) {
                    cell.classList.add('highlight');
                }
            }
        }
    }

    // Handle number input
    function handleNumberInput(num) {
        if (!selectedCell || !gameActive) return;
        
        const row = parseInt(selectedCell.dataset.row);
        const col = parseInt(selectedCell.dataset.col);
        
        // Erase if 0
        if (num === 0) {
            selectedCell.textContent = '';
            gameBoard[row][col] = 0;
            selectedCell.classList.remove('error');
            return;
        }
        
        // Check if the number is valid
        const isCorrect = solvedBoard[row][col] === num;
        
        selectedCell.textContent = num;
        gameBoard[row][col] = num;
        
        // Add animation
        selectedCell.classList.add('animate-placement');
        setTimeout(() => {
            selectedCell.classList.remove('animate-placement');
        }, 300);
        
        selectedCell.classList.toggle('error', !isCorrect);
        
        // Check if the game is complete
        if (isGameComplete()) {
            gameComplete();
        }
    }
    
    // Check if the game is complete
    function isGameComplete() {
        // Check if the board is full
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (gameBoard[row][col] === 0) {
                    return false;
                }
                
                // Check if there are any errors
                if (gameBoard[row][col] !== solvedBoard[row][col]) {
                    return false;
                }
            }
        }
        
        return true;
    }
    
    // Game complete handler
    function gameComplete() {
        gameActive = false;
        clearInterval(timer);
        
        statusMessage.textContent = "Congratulations! You solved the puzzle!";
        statusMessage.style.color = 'var(--success-color)';
        
        // Add celebration animation
        document.querySelectorAll('.cell').forEach(cell => {
            cell.classList.add('animate-highlight');
            setTimeout(() => {
                cell.classList.remove('animate-highlight');
            }, 1500);
        });
    }
    
    // Reset the game to initial state
    function resetGame() {
        if (!gameActive) return;
        
        // Reset to initial game state
        const cells = document.querySelectorAll('.cell');
        
        cells.forEach(cell => {
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);
            
            if (gameBoard[row][col] !== 0 && !cell.classList.contains('fixed')) {
                cell.textContent = '';
                gameBoard[row][col] = 0;
                cell.classList.remove('error');
            }
        });
        
        // Deselect current cell
        if (selectedCell) {
            selectedCell.classList.remove('selected');
            document.querySelectorAll('.highlight').forEach(cell => {
                cell.classList.remove('highlight');
            });
            selectedCell = null;
        }
        
        statusMessage.textContent = "Game reset. Keep trying!";
        statusMessage.style.color = 'var(--accent-color)';
    }
    
    // Update the timer
    function updateTimer() {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        seconds++;
    }
    
    // Event listeners
    difficultySelect.addEventListener('change', function(e) {
        difficulty = e.target.value;
        if (gameActive) {
            if (confirm("Changing difficulty will start a new game. Continue?")) {
                generateNewGame();
            } else {
                difficultySelect.value = difficulty;
            }
        }
    });
    
    newGameBtn.addEventListener('click', generateNewGame);
    resetBtn.addEventListener('click', resetGame);
    
    numberBtns.forEach(btn => {
        // Add both click and touch events
        const handleButtonPress = function() {
            const num = parseInt(btn.dataset.number);
            handleNumberInput(num);
        };
        
        btn.addEventListener('click', handleButtonPress);
        btn.addEventListener('touchstart', function(e) {
            e.preventDefault(); // Prevent default touch behavior
            handleButtonPress();
        });
    });
    
    // Handle keyboard input
    document.addEventListener('keydown', function(e) {
        if (!selectedCell || !gameActive) return;
        
        if (e.key >= '1' && e.key <= '9') {
            handleNumberInput(parseInt(e.key));
        } else if (e.key === '0' || e.key === 'Backspace' || e.key === 'Delete') {
            handleNumberInput(0);
        }
    });
    
    // Initialize the game
    initializeBoard();
    statusMessage.textContent = "Click 'Start Game' to start playing!";
});