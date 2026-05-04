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
    let gameSpeed = 300; // milliseconds between frames (even slower)
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
        // Clear canvas with dark background
        ctx.fillStyle = '#111122';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw food (egg)
        const eggX = food.x * gridSize + gridSize / 2;
        const eggY = food.y * gridSize + gridSize / 2;
        const radius = gridSize / 2 - 2;
        
        // Egg white with gradient
        const eggGrad = ctx.createRadialGradient(eggX, eggY - 2, 1, eggX, eggY, radius * 1.2);
        eggGrad.addColorStop(0, '#ffffff');
        eggGrad.addColorStop(1, '#dddddd');
        ctx.fillStyle = eggGrad;
        ctx.beginPath();
        ctx.ellipse(eggX, eggY, radius, radius * 1.2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#bbbbbb';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Yolk with gradient
        const yolkGrad = ctx.createRadialGradient(eggX, eggY + 1, 1, eggX, eggY + 2, radius * 0.5);
        yolkGrad.addColorStop(0, '#ffff00');
        yolkGrad.addColorStop(1, '#ff9900');
        ctx.fillStyle = yolkGrad;
        ctx.beginPath();
        ctx.arc(eggX, eggY + 2, radius * 0.5, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw snake
        snake.forEach((segment, index) => {
            const segX = segment.x * gridSize + gridSize / 2;
            const segY = segment.y * gridSize + gridSize / 2;
            const segRadius = gridSize / 2 - 1;
            
            if (index === 0) {
                // Head with bright gradient
                const headGrad = ctx.createRadialGradient(segX - 2, segY - 2, 1, segX, segY, segRadius);
                headGrad.addColorStop(0, '#00ff00');
                headGrad.addColorStop(1, '#006600');
                ctx.fillStyle = headGrad;
                ctx.beginPath();
                ctx.arc(segX, segY, segRadius, 0, Math.PI * 2);
                ctx.fill();
                
                // Eyes with white shine
                ctx.fillStyle = '#000000';
                const eyeOffsetX = dx !== 0 ? (dx / gridSize) * 3 : 3;
                const eyeOffsetY = dy !== 0 ? (dy / gridSize) * 3 : 0;
                
                // Left eye
                ctx.beginPath();
                ctx.arc(segX - eyeOffsetX + (dy !== 0 ? 3 : 0), segY - eyeOffsetY - (dx !== 0 ? 3 : 0), 2.5, 0, Math.PI * 2);
                ctx.fill();
                // Left eye shine
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.arc(segX - eyeOffsetX + (dy !== 0 ? 3 : 0) - 0.5, segY - eyeOffsetY - (dx !== 0 ? 3 : 0) - 0.5, 1, 0, Math.PI * 2);
                ctx.fill();
                
                // Right eye
                ctx.fillStyle = '#000000';
                ctx.beginPath();
                ctx.arc(segX + eyeOffsetX - (dy !== 0 ? 3 : 0), segY + eyeOffsetY + (dx !== 0 ? 3 : 0), 2.5, 0, Math.PI * 2);
                ctx.fill();
                // Right eye shine
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.arc(segX + eyeOffsetX - (dy !== 0 ? 3 : 0) - 0.5, segY + eyeOffsetY + (dx !== 0 ? 3 : 0) - 0.5, 1, 0, Math.PI * 2);
                ctx.fill();
            } else {
                // Body with gradient for volume
                const bodyGrad = ctx.createRadialGradient(segX - 1, segY - 1, 1, segX, segY, segRadius);
                if (index % 2 === 0) {
                    bodyGrad.addColorStop(0, '#00ff88');
                    bodyGrad.addColorStop(1, '#005533');
                } else {
                    bodyGrad.addColorStop(0, '#00cc66');
                    bodyGrad.addColorStop(1, '#004422');
                }
                ctx.fillStyle = bodyGrad;
                ctx.beginPath();
                ctx.arc(segX, segY, segRadius, 0, Math.PI * 2);
                ctx.fill();
            }
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