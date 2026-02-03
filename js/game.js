// Game Controller - Main game loop and state management
const Game = {
    canvas: null,
    ctx: null,
    snake: null,
    food: null,
    state: CONSTANTS.STATES.MENU,
    score: 0,
    lastMoveTime: 0,
    lastFrameTime: 0,
    moveInterval: CONSTANTS.BASE_SPEED,
    backgroundImage: null,
    collisionType: null,

    /**
     * Initialize the game
     */
    init() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');

        // Set canvas size
        this.canvas.width = CONSTANTS.CANVAS_SIZE;
        this.canvas.height = CONSTANTS.CANVAS_SIZE;

        // Initialize game objects
        this.snake = new Snake();
        this.food = new Food();

        // Initialize effects
        Effects.init(CONSTANTS.CANVAS_SIZE, CONSTANTS.CANVAS_SIZE);

        // Load background image
        this.loadBackgroundImage();
    },

    /**
     * Load the Epstein background image
     */
    loadBackgroundImage() {
        const img = new Image();
        img.onload = () => {
            this.backgroundImage = img;
        };
        img.onerror = () => {
            console.warn('Background image not found. Place epstein.png in assets folder.');
        };
        img.src = 'assets/epstein.jpeg';
    },

    /**
     * Start a new game
     */
    start() {
        this.state = CONSTANTS.STATES.PLAYING;
        this.score = 0;
        this.moveInterval = CONSTANTS.BASE_SPEED;
        this.collisionType = null;

        this.snake.reset();
        this.food.spawn(this.snake);

        UI.updateScore(this.score);
        UI.showScreen('game');

        // Play start sound and start music
        Audio.gameStart();
        Audio.startMusic();

        this.lastMoveTime = performance.now();
        this.lastFrameTime = performance.now();
        this.gameLoop();
    },

    /**
     * Main game loop
     */
    gameLoop() {
        if (this.state !== CONSTANTS.STATES.PLAYING) return;

        const now = performance.now();
        const deltaTime = now - this.lastFrameTime;
        this.lastFrameTime = now;

        // Update food animation
        this.food.update(deltaTime);

        // Move snake at fixed interval
        if (now - this.lastMoveTime >= this.moveInterval) {
            this.update();
            this.lastMoveTime = now;
        }

        // Render
        this.render();

        // Continue loop
        requestAnimationFrame(() => this.gameLoop());
    },

    /**
     * Update game state
     */
    update() {
        // Move snake
        const result = this.snake.move();

        // Check collision
        if (result.collision) {
            this.gameOver(result.type);
            return;
        }

        // Check food collection
        const head = this.snake.getHead();
        if (this.food.isAt(head.x, head.y)) {
            this.collectFood();
        }
    },

    /**
     * Handle food collection
     */
    collectFood() {
        this.score++;
        this.snake.grow();
        this.food.spawn(this.snake);
        UI.updateScore(this.score);

        // Play eat sound
        Audio.eat();

        // Increase speed every N nodes
        if (this.score % CONSTANTS.NODES_PER_SPEED_INCREASE === 0) {
            this.moveInterval = Math.max(
                CONSTANTS.MIN_SPEED,
                this.moveInterval - CONSTANTS.SPEED_INCREMENT
            );
        }
    },

    /**
     * Handle game over
     * @param {string} collisionType - 'wall' or 'self'
     */
    gameOver(collisionType) {
        this.state = CONSTANTS.STATES.GAME_OVER;
        this.collisionType = collisionType;

        // Stop music and play collision/game over sounds
        Audio.stopMusic();
        Audio.wallHit();
        setTimeout(() => Audio.gameOver(), 100);

        // Trigger glitch effect
        Effects.triggerGlitch();

        // Flash screen red
        const gameContainer = document.getElementById('game-container');
        if (gameContainer) {
            Effects.screenFlash(gameContainer, 'rgba(255, 0, 0, 0.8)', 300);
        }

        // Wait for glitch to complete, then show game over screen
        const checkGlitch = () => {
            this.renderGameOver();
            if (Effects.isGlitchComplete()) {
                UI.showGameOver(this.score);
            } else {
                requestAnimationFrame(checkGlitch);
            }
        };
        checkGlitch();
    },

    /**
     * Render the game
     */
    render() {
        const ctx = this.ctx;
        const size = CONSTANTS.CANVAS_SIZE;

        // Clear canvas
        ctx.fillStyle = CONSTANTS.COLORS.BACKGROUND;
        ctx.fillRect(0, 0, size, size);

        // Draw background image at low opacity
        if (this.backgroundImage) {
            ctx.globalAlpha = 0.1;
            this.drawBackgroundImage();
            ctx.globalAlpha = 1;
        }

        // Draw grid lines
        this.drawGrid();

        // Draw food
        this.food.draw(ctx);

        // Draw snake
        this.snake.draw(ctx);

        // Draw scanlines
        Effects.drawScanlines(ctx, size, size);
    },

    /**
     * Render during game over glitch
     */
    renderGameOver() {
        const ctx = this.ctx;
        const size = CONSTANTS.CANVAS_SIZE;

        // Draw base game state
        ctx.fillStyle = CONSTANTS.COLORS.BACKGROUND;
        ctx.fillRect(0, 0, size, size);

        // Draw background at full opacity during game over
        if (this.backgroundImage) {
            ctx.globalAlpha = 0.3;
            this.drawBackgroundImage();
            ctx.globalAlpha = 1;
        }

        // Draw glitch effect
        Effects.drawGlitch(ctx, this.canvas, size, size);
    },

    /**
     * Draw the background image centered and covering the canvas
     */
    drawBackgroundImage() {
        const ctx = this.ctx;
        const img = this.backgroundImage;
        const size = CONSTANTS.CANVAS_SIZE;

        // Calculate scaling to cover canvas while maintaining aspect ratio
        const imgAspect = img.width / img.height;
        const canvasAspect = 1; // Square canvas

        let drawWidth, drawHeight, drawX, drawY;

        if (imgAspect > canvasAspect) {
            drawHeight = size;
            drawWidth = drawHeight * imgAspect;
            drawX = (size - drawWidth) / 2;
            drawY = 0;
        } else {
            drawWidth = size;
            drawHeight = drawWidth / imgAspect;
            drawX = 0;
            drawY = (size - drawHeight) / 2;
        }

        ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
    },

    /**
     * Draw the game grid
     */
    drawGrid() {
        const ctx = this.ctx;
        const cellSize = CONSTANTS.CELL_SIZE;
        const gridSize = CONSTANTS.GRID_SIZE;

        ctx.strokeStyle = CONSTANTS.COLORS.GRID_LINE;
        ctx.lineWidth = 1;

        for (let i = 0; i <= gridSize; i++) {
            const pos = i * cellSize;

            // Vertical line
            ctx.beginPath();
            ctx.moveTo(pos, 0);
            ctx.lineTo(pos, CONSTANTS.CANVAS_SIZE);
            ctx.stroke();

            // Horizontal line
            ctx.beginPath();
            ctx.moveTo(0, pos);
            ctx.lineTo(CONSTANTS.CANVAS_SIZE, pos);
            ctx.stroke();
        }
    },

    /**
     * Handle direction input
     * @param {string} direction - 'up', 'down', 'left', 'right'
     */
    handleInput(direction) {
        if (this.state !== CONSTANTS.STATES.PLAYING) return;

        const dirMap = {
            up: CONSTANTS.DIRECTIONS.UP,
            down: CONSTANTS.DIRECTIONS.DOWN,
            left: CONSTANTS.DIRECTIONS.LEFT,
            right: CONSTANTS.DIRECTIONS.RIGHT
        };

        if (dirMap[direction]) {
            const changed = this.snake.setDirection(dirMap[direction]);
            if (changed) {
                Audio.turn();
            }
        }
    },

    /**
     * Return to main menu
     */
    returnToMenu() {
        this.state = CONSTANTS.STATES.MENU;
        Audio.stopMusic();
        UI.showScreen('menu');
    },

    /**
     * Get current score (for sharing)
     * @returns {number}
     */
    getScore() {
        return this.score;
    }
};
