document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const scoreElement = document.getElementById('score');
    const finalScoreElement = document.getElementById('finalScore');
    const gameOverDiv = document.getElementById('gameOver');
    const restartBtn = document.getElementById('restartBtn');
    
    // Touch controls
    const upBtn = document.getElementById('up');
    const leftBtn = document.getElementById('left');
    const downBtn = document.getElementById('down');
    const rightBtn = document.getElementById('right');
    
    // Game settings
    const gridSize = 20;
    const tileCount = canvas.width / gridSize;
    
    // Game variables
    let snake = [];
    let food = {};
    let dx = 0;
    let dy = 0;
    let score = 0;
    let gameSpeed = 200; // milliseconds between frames (slowed down)
    let gameLoop = null;
    
    // Initialize game
    function initGame() {
        snake = [{x: 10, y: 10}];
        food = generateFood();
        dx = 1; // Start moving right (1 cell)
        dy = 0;
        score = 0;
        scoreElement.textContent = score;
        gameOverDiv.classList.add('hidden');
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Start game loop
        if (gameLoop) clearInterval(gameLoop);
        gameLoop = setInterval(gameLoopFn, gameSpeed);
    }
    
    // Generate random food position
    function generateFood() {
        let foodX, foodY;
        do {
            foodX = Math.floor(Math.random() * tileCount);
            foodY = Math.floor(Math.random() * tileCount);
        } while (snake.some(segment => segment.x === foodX && segment.y === foodY));
        
        return {x: foodX, y: foodY};
    }
    
    // Main game loop
    function gameLoopFn() {
        // Move snake
        const head = {x: snake[0].x + dx, y: snake[0].y + dy};
        
        // Check wall collision
        if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
            endGame();
            return;
        }
        
        // Check self collision
        if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
            endGame();
            return;
        }
        
        // Add new head
        snake.unshift(head);
        
        // Check if food eaten
        if (head.x === food.x && head.y === food.y) {
            score += 10;
            scoreElement.textContent = score;
            food = generateFood();
            // Increase speed slightly as score increases
            if (score % 50 === 0) {
                clearInterval(gameLoop);
                gameSpeed = Math.max(50, gameSpeed - 5);
                gameLoop = setInterval(gameLoopFn, gameSpeed);
            }
        } else {
            // Remove tail if no food eaten
            snake.pop();
        }
        
        // Draw everything
        draw();
    }
    
    // Draw game elements
    function draw() {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw food
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize - 2, gridSize - 2);
        
        // Draw snake
        snake.forEach((segment, index) => {
            if (index === 0) {
                // Head
                ctx.fillStyle = '#00ff00';
            } else {
                // Body
                ctx.fillStyle = '#00cc00';
            }
            ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2);
        });
    }
    
    // End game
    function endGame() {
        clearInterval(gameLoop);
        finalScoreElement.textContent = score;
        gameOverDiv.classList.remove('hidden');
    }
    
    // Keyboard controls
    document.addEventListener('keydown', (e) => {
        // Prevent reversing direction
        switch(e.key) {
            case 'ArrowUp':
                if (dy === 0) { dx = 0; dy = -1; }
                break;
            case 'ArrowDown':
                if (dy === 0) { dx = 0; dy = 1; }
                break;
            case 'ArrowLeft':
                if (dx === 0) { dx = -1; dy = 0; }
                break;
            case 'ArrowRight':
                if (dx === 0) { dx = 1; dy = 0; }
                break;
        }
    });
    
    // Touch controls
    upBtn.addEventListener('click', () => {
        if (dy === 0) { dx = 0; dy = -1; }
    });
    
    downBtn.addEventListener('click', () => {
        if (dy === 0) { dx = 0; dy = 1; }
    });
    
    leftBtn.addEventListener('click', () => {
        if (dx === 0) { dx = -1; dy = 0; }
    });
    
    rightBtn.addEventListener('click', () => {
        if (dx === 0) { dx = 1; dy = 0; }
    });
    
    // Restart button
    restartBtn.addEventListener('click', initGame);
    
    // Initialize game on load
    initGame();
    
    // Handle touch events for mobile
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;
    
    canvas.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
    }, false);
    
    canvas.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        touchEndY = e.changedTouches[0].screenY;
        handleSwipe();
    }, false);
    
    function handleSwipe() {
        const swipeDx = touchEndX - touchStartX;
        const swipeDy = touchEndY - touchStartY;
        const absSwipeDx = Math.abs(swipeDx);
        const absSwipeDy = Math.abs(swipeDy);
        
        if (absSwipeDx > absSwipeDy) {
            // Horizontal swipe
            if (swipeDx > 0 && swipeDx > 30) { // Right swipe
                if (dy === 0) { dx = 1; dy = 0; }
            } else if (swipeDx < 0 && Math.abs(swipeDx) > 30) { // Left swipe
                if (dy === 0) { dx = -1; dy = 0; }
            }
        } else {
            // Vertical swipe
            if (swipeDy > 0 && swipeDy > 30) { // Down swipe
                if (dx === 0) { dx = 0; dy = 1; }
            } else if (swipeDy < 0 && Math.abs(swipeDy) > 30) { // Up swipe
                if (dx === 0) { dx = 0; dy = -1; }
            }
        }
    }
});