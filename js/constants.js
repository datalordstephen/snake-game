// Game Constants
const CONSTANTS = {
    // Canvas & Grid
    CANVAS_SIZE: 450,
    GRID_SIZE: 18,
    CELL_SIZE: 25, // CANVAS_SIZE / GRID_SIZE

    // Colors - CRT phosphor palette
    COLORS: {
        BACKGROUND: '#0a0f0a',
        GRID_LINE: '#0f2a0f',
        SNAKE_HEAD: '#00ff41',
        SNAKE_BODY: '#00cc33',
        SNAKE_GLOW: 'rgba(0, 255, 65, 0.5)',
        FOOD: '#ffb000',
        FOOD_GLOW: 'rgba(255, 176, 0, 0.5)',
        TEXT: '#00ff41',
        TEXT_DIM: '#4a7c4a',
        TEXT_ACCENT: '#00d9ff',
        RED_ALERT: '#ff0040',
        GOLD: '#ffd700',
        WHITE: '#ffffff',
        BEZEL: '#4a4a4a',
        BEZEL_DARK: '#2a2a2a',
        BEZEL_LIGHT: '#6a6a6a'
    },

    // Speed (milliseconds per move)
    BASE_SPEED: 150,
    MIN_SPEED: 50,
    SPEED_INCREMENT: 15, // Speed increase per 5 nodes
    NODES_PER_SPEED_INCREASE: 5,

    // Game States
    STATES: {
        MENU: 'menu',
        PLAYING: 'playing',
        GAME_OVER: 'gameover'
    },

    // Directions
    DIRECTIONS: {
        UP: { x: 0, y: -1 },
        DOWN: { x: 0, y: 1 },
        LEFT: { x: -1, y: 0 },
        RIGHT: { x: 1, y: 0 }
    },

    // Rank Thresholds
    RANKS: [
        { minScore: 0, name: 'Rookie Leaker' },
        { minScore: 5, name: 'Junior Analyst' },
        { minScore: 10, name: 'Field Operative' },
        { minScore: 20, name: 'Senior Investigator' },
        { minScore: 30, name: 'Deep State Threat' },
        { minScore: 40, name: 'Shadow Associate' }
    ],

    // Effects
    GLITCH_DURATION: 500,
    FLICKER_INTENSITY: 0.02,

    // External Links (placeholders)
    PUMPFUN_URL: '#', // User will replace with actual contract address
    GAME_URL: 'https://example.com/snake-game', // User will replace

    // LocalStorage Keys
    STORAGE_KEYS: {
        HIGH_SCORE: 'epstein_snake_high_score',
        USERNAME: 'epstein_snake_username',
        SETTINGS: 'epstein_snake_settings'
    }
};

// Prevent modification
Object.freeze(CONSTANTS);
Object.freeze(CONSTANTS.COLORS);
Object.freeze(CONSTANTS.STATES);
Object.freeze(CONSTANTS.DIRECTIONS);
Object.freeze(CONSTANTS.STORAGE_KEYS);
CONSTANTS.RANKS.forEach(r => Object.freeze(r));
Object.freeze(CONSTANTS.RANKS);
