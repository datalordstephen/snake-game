// Food Class - Evidence Node (Floppy Disk)
class Food {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.pulsePhase = 0;
    }

    /**
     * Spawn food at a random position not occupied by the snake
     * @param {Snake} snake - The snake to avoid
     */
    spawn(snake) {
        let attempts = 0;
        const maxAttempts = 100;

        do {
            this.x = Math.floor(Math.random() * CONSTANTS.GRID_SIZE);
            this.y = Math.floor(Math.random() * CONSTANTS.GRID_SIZE);
            attempts++;
        } while (snake.occupies(this.x, this.y) && attempts < maxAttempts);

        this.pulsePhase = 0;
    }

    /**
     * Check if food is at a given position
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @returns {boolean}
     */
    isAt(x, y) {
        return this.x === x && this.y === y;
    }

    /**
     * Update animation state
     * @param {number} deltaTime - Time since last update
     */
    update(deltaTime) {
        this.pulsePhase += deltaTime * 0.005;
    }

    /**
     * Draw the floppy disk evidence node
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    draw(ctx) {
        const cellSize = CONSTANTS.CELL_SIZE;
        const x = this.x * cellSize;
        const y = this.y * cellSize;

        // Pulsing glow effect with amber color
        const pulse = 0.5 + Math.sin(this.pulsePhase) * 0.3;
        ctx.shadowColor = CONSTANTS.COLORS.FOOD_GLOW;
        ctx.shadowBlur = 15 * pulse;

        // Draw floppy disk pixel art
        this.drawFloppyDisk(ctx, x + 3, y + 3, cellSize - 6);

        ctx.shadowBlur = 0;
    }

    /**
     * Draw a pixelated floppy disk
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} size - Size of the disk
     */
    drawFloppyDisk(ctx, x, y, size) {
        const color = CONSTANTS.COLORS.FOOD;
        const pixelSize = size / 8;

        ctx.fillStyle = color;

        // Floppy disk shape (8x8 pixel art)
        // prettier-ignore
        const pixels = [
            [0,1,1,1,1,1,1,0],
            [1,1,1,1,1,1,1,1],
            [1,1,0,0,0,0,1,1],
            [1,1,0,0,0,0,1,1],
            [1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1],
            [1,0,0,0,0,0,0,1],
            [1,1,1,1,1,1,1,1]
        ];

        pixels.forEach((row, py) => {
            row.forEach((pixel, px) => {
                if (pixel) {
                    ctx.fillRect(
                        x + px * pixelSize,
                        y + py * pixelSize,
                        pixelSize,
                        pixelSize
                    );
                }
            });
        });

        // Metal slider (darker)
        ctx.fillStyle = CONSTANTS.COLORS.TEXT_DIM;
        ctx.fillRect(x + 2 * pixelSize, y + 2 * pixelSize, 4 * pixelSize, 2 * pixelSize);

        // Label area (bottom rectangle, even darker)
        ctx.fillStyle = CONSTANTS.COLORS.BACKGROUND;
        ctx.fillRect(x + 1 * pixelSize, y + 6 * pixelSize, 6 * pixelSize, pixelSize);
    }
}
