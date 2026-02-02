// Effects Module - CRT effects and glitch animations
const Effects = {
    // Glitch state
    glitchActive: false,
    glitchStartTime: 0,
    glitchCanvas: null,
    glitchCtx: null,

    /**
     * Initialize the effects module
     * @param {number} width - Canvas width
     * @param {number} height - Canvas height
     */
    init(width, height) {
        // Create offscreen canvas for glitch effect
        this.glitchCanvas = document.createElement('canvas');
        this.glitchCanvas.width = width;
        this.glitchCanvas.height = height;
        this.glitchCtx = this.glitchCanvas.getContext('2d');
    },

    /**
     * Trigger the glitch/death effect
     */
    triggerGlitch() {
        this.glitchActive = true;
        this.glitchStartTime = Date.now();
    },

    /**
     * Check if glitch animation is complete
     * @returns {boolean}
     */
    isGlitchComplete() {
        if (!this.glitchActive) return true;
        return Date.now() - this.glitchStartTime >= CONSTANTS.GLITCH_DURATION;
    },

    /**
     * Draw scanline overlay
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} width - Canvas width
     * @param {number} height - Canvas height
     */
    drawScanlines(ctx, width, height) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        for (let y = 0; y < height; y += 4) {
            ctx.fillRect(0, y, width, 2);
        }
    },

    /**
     * Apply subtle flicker effect
     * @param {HTMLElement} element - Element to flicker
     */
    applyFlicker(element) {
        const intensity = CONSTANTS.FLICKER_INTENSITY;
        const flicker = 1 - Math.random() * intensity;
        element.style.opacity = flicker;
    },

    /**
     * Draw the glitch effect during game over
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {HTMLCanvasElement} sourceCanvas - Source canvas to glitch
     * @param {number} width - Canvas width
     * @param {number} height - Canvas height
     */
    drawGlitch(ctx, sourceCanvas, width, height) {
        if (!this.glitchActive) return;

        const elapsed = Date.now() - this.glitchStartTime;
        const progress = Math.min(elapsed / CONSTANTS.GLITCH_DURATION, 1);

        // Copy source to glitch canvas
        this.glitchCtx.drawImage(sourceCanvas, 0, 0);

        // Red tint overlay
        ctx.fillStyle = `rgba(255, 0, 0, ${0.3 * (1 - progress)})`;
        ctx.fillRect(0, 0, width, height);

        // RGB split effect (wrapped in try-catch for cross-origin images)
        const splitAmount = Math.floor(10 * (1 - progress));
        if (splitAmount > 0) {
            try {
                // Get image data
                const imageData = this.glitchCtx.getImageData(0, 0, width, height);
                const data = imageData.data;

                // Shift red channel left, blue channel right
                for (let y = 0; y < height; y++) {
                    for (let x = 0; x < width; x++) {
                        const i = (y * width + x) * 4;

                        // Red from left
                        const redX = Math.max(0, x - splitAmount);
                        const redI = (y * width + redX) * 4;

                        // Blue from right
                        const blueX = Math.min(width - 1, x + splitAmount);
                        const blueI = (y * width + blueX) * 4;

                        // Create new pixel with split channels
                        data[i] = data[redI]; // Red stays
                        data[i + 2] = data[blueI + 2]; // Blue shifted
                    }
                }

                this.glitchCtx.putImageData(imageData, 0, 0);
            } catch (e) {
                // Canvas tainted by cross-origin image, skip RGB split
            }
        }

        // Random horizontal slice displacement
        const sliceCount = Math.floor(5 * (1 - progress));
        for (let i = 0; i < sliceCount; i++) {
            const sliceY = Math.floor(Math.random() * height);
            const sliceHeight = Math.floor(Math.random() * 20) + 5;
            const offset = (Math.random() - 0.5) * 40;

            ctx.drawImage(
                this.glitchCanvas,
                0, sliceY, width, sliceHeight,
                offset, sliceY, width, sliceHeight
            );
        }

        // Static noise overlay
        this.drawStatic(ctx, width, height, 0.15 * (1 - progress));

        // Mark complete
        if (progress >= 1) {
            this.glitchActive = false;
        }
    },

    /**
     * Draw static noise
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} width - Canvas width
     * @param {number} height - Canvas height
     * @param {number} intensity - Noise intensity (0-1)
     */
    drawStatic(ctx, width, height, intensity) {
        if (intensity <= 0) return;

        const imageData = ctx.createImageData(width, height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            if (Math.random() < intensity) {
                const noise = Math.random() * 255;
                data[i] = noise;     // R
                data[i + 1] = noise; // G
                data[i + 2] = noise; // B
                data[i + 3] = Math.random() * 100; // A
            }
        }

        ctx.putImageData(imageData, 0, 0);
    },

    /**
     * Draw heavy static for game over screen
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} width - Canvas width
     * @param {number} height - Canvas height
     */
    drawHeavyStatic(ctx, width, height) {
        const imageData = ctx.createImageData(width, height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            const noise = Math.random() * 60;
            data[i] = noise;     // R
            data[i + 1] = noise * 0.3; // G (less green for red tint)
            data[i + 2] = noise * 0.3; // B
            data[i + 3] = 40; // Low alpha
        }

        ctx.putImageData(imageData, 0, 0);
    },

    /**
     * Create screen flash effect
     * @param {HTMLElement} container - Container element
     * @param {string} color - Flash color
     * @param {number} duration - Flash duration in ms
     */
    screenFlash(container, color, duration) {
        const flash = document.createElement('div');
        flash.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: ${color};
            pointer-events: none;
            z-index: 100;
            animation: flash-fade ${duration}ms ease-out forwards;
        `;
        container.appendChild(flash);

        setTimeout(() => flash.remove(), duration);
    }
};
