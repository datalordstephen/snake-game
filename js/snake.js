// Snake Class - handles snake movement, growth, and collision
class Snake {
    constructor() {
        this.reset();
    }

    /**
     * Reset snake to initial state
     */
    reset() {
        // Start in the center of the grid
        const centerX = Math.floor(CONSTANTS.GRID_SIZE / 2);
        const centerY = Math.floor(CONSTANTS.GRID_SIZE / 2);

        // Snake body: array of segments, head is index 0
        // Each segment has position and label
        this.body = [
            { x: centerX, y: centerY, label: 'DATA-001' },
            { x: centerX - 1, y: centerY, label: 'DATA-000' },
            { x: centerX - 2, y: centerY, label: null }
        ];

        // Current direction
        this.direction = CONSTANTS.DIRECTIONS.RIGHT;

        // Direction queue for buffering inputs
        this.directionQueue = [];

        // Counter for labeling new segments
        this.segmentCounter = 2;
    }

    /**
     * Queue a direction change (prevents 180° turns)
     * @param {Object} newDirection - The direction to queue
     * @returns {boolean} Whether the direction was actually queued
     */
    setDirection(newDirection) {
        // Get the effective current direction (last queued or current)
        const effectiveDirection = this.directionQueue.length > 0
            ? this.directionQueue[this.directionQueue.length - 1]
            : this.direction;

        // Prevent 180° turns
        const isOpposite = (
            effectiveDirection.x + newDirection.x === 0 &&
            effectiveDirection.y + newDirection.y === 0
        );

        // Check if it's actually a different direction
        const isSame = (
            effectiveDirection.x === newDirection.x &&
            effectiveDirection.y === newDirection.y
        );

        if (!isOpposite && !isSame && this.directionQueue.length < 2) {
            this.directionQueue.push(newDirection);
            return true;
        }
        return false;
    }

    /**
     * Move the snake one step
     * @returns {Object} Result with collision info
     */
    move() {
        // Apply queued direction
        if (this.directionQueue.length > 0) {
            this.direction = this.directionQueue.shift();
        }

        // Calculate new head position
        const head = this.body[0];
        const newHead = {
            x: head.x + this.direction.x,
            y: head.y + this.direction.y,
            label: `DATA-${String(this.segmentCounter).padStart(3, '0')}`
        };

        // Check wall collision
        if (newHead.x < 0 || newHead.x >= CONSTANTS.GRID_SIZE ||
            newHead.y < 0 || newHead.y >= CONSTANTS.GRID_SIZE) {
            return { collision: true, type: 'wall' };
        }

        // Check self collision (exclude tail since it will move)
        for (let i = 0; i < this.body.length - 1; i++) {
            if (this.body[i].x === newHead.x && this.body[i].y === newHead.y) {
                return { collision: true, type: 'self' };
            }
        }

        // Move: add new head, remove tail
        this.body.unshift(newHead);
        this.body.pop();

        return { collision: false };
    }

    /**
     * Grow the snake by one segment
     */
    grow() {
        // Duplicate the tail (it will separate on next move)
        const tail = this.body[this.body.length - 1];
        this.body.push({
            x: tail.x,
            y: tail.y,
            label: null // Tail segment has no label
        });
        this.segmentCounter++;
    }

    /**
     * Check if the snake head is at a given position
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @returns {boolean}
     */
    isHeadAt(x, y) {
        return this.body[0].x === x && this.body[0].y === y;
    }

    /**
     * Check if any part of the snake occupies a position
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @returns {boolean}
     */
    occupies(x, y) {
        return this.body.some(segment => segment.x === x && segment.y === y);
    }

    /**
     * Get the head position
     * @returns {Object} Head position {x, y}
     */
    getHead() {
        return { x: this.body[0].x, y: this.body[0].y };
    }

    /**
     * Draw the snake on the canvas
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    draw(ctx) {
        const cellSize = CONSTANTS.CELL_SIZE;

        // Draw glow effect for the whole snake
        ctx.shadowColor = CONSTANTS.COLORS.SNAKE_GLOW;
        ctx.shadowBlur = 10;

        this.body.forEach((segment, index) => {
            const x = segment.x * cellSize;
            const y = segment.y * cellSize;

            // Head is brighter
            if (index === 0) {
                ctx.fillStyle = CONSTANTS.COLORS.SNAKE_HEAD;
            } else {
                // Gradient from bright to dim along the body
                const brightness = Math.max(0.4, 1 - (index / this.body.length) * 0.6);
                const green = Math.floor(204 * brightness);
                ctx.fillStyle = `rgb(0, ${green}, 0)`;
            }

            // Draw segment with small gap
            const gap = 2;
            ctx.fillRect(x + gap, y + gap, cellSize - gap * 2, cellSize - gap * 2);

            // Draw data label on segments (not head, not tail)
            if (segment.label && index > 0 && index < this.body.length - 1) {
                ctx.shadowBlur = 0;
                ctx.fillStyle = CONSTANTS.COLORS.BACKGROUND;
                ctx.font = '8px monospace';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(segment.label, x + cellSize / 2, y + cellSize / 2);
                ctx.shadowBlur = 10;
            }
        });

        // Reset shadow
        ctx.shadowBlur = 0;
    }
}
