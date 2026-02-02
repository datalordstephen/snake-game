// Storage Module - localStorage wrapper for high scores
const Storage = {
    /**
     * Get the stored high score
     * @returns {number} The high score, or 0 if none exists
     */
    getHighScore() {
        try {
            const score = localStorage.getItem(CONSTANTS.STORAGE_KEYS.HIGH_SCORE);
            return score ? parseInt(score, 10) : 0;
        } catch (e) {
            console.warn('Could not access localStorage:', e);
            return 0;
        }
    },

    /**
     * Save a new high score (only if it beats the current one)
     * @param {number} score - The score to potentially save
     * @returns {boolean} True if this was a new high score
     */
    saveHighScore(score) {
        try {
            const currentHigh = this.getHighScore();
            if (score > currentHigh) {
                localStorage.setItem(CONSTANTS.STORAGE_KEYS.HIGH_SCORE, score.toString());
                return true;
            }
            return false;
        } catch (e) {
            console.warn('Could not save to localStorage:', e);
            return false;
        }
    },

    /**
     * Get the stored username
     * @returns {string|null} The username, or null if none exists
     */
    getUsername() {
        try {
            return localStorage.getItem(CONSTANTS.STORAGE_KEYS.USERNAME);
        } catch (e) {
            console.warn('Could not access localStorage:', e);
            return null;
        }
    },

    /**
     * Save a username
     * @param {string} username - The username to save
     */
    saveUsername(username) {
        try {
            localStorage.setItem(CONSTANTS.STORAGE_KEYS.USERNAME, username);
        } catch (e) {
            console.warn('Could not save to localStorage:', e);
        }
    },

    /**
     * Clear all game data
     */
    clearAll() {
        try {
            localStorage.removeItem(CONSTANTS.STORAGE_KEYS.HIGH_SCORE);
            localStorage.removeItem(CONSTANTS.STORAGE_KEYS.USERNAME);
            localStorage.removeItem(CONSTANTS.STORAGE_KEYS.SETTINGS);
        } catch (e) {
            console.warn('Could not clear localStorage:', e);
        }
    },

    /**
     * Get stored settings
     * @returns {Object} Settings object with defaults
     */
    getSettings() {
        try {
            const settings = localStorage.getItem(CONSTANTS.STORAGE_KEYS.SETTINGS);
            return settings ? JSON.parse(settings) : { sound: false, crtEffects: true };
        } catch (e) {
            console.warn('Could not access localStorage:', e);
            return { sound: false, crtEffects: true };
        }
    },

    /**
     * Save settings
     * @param {Object} settings - Settings object to save
     */
    saveSettings(settings) {
        try {
            localStorage.setItem(CONSTANTS.STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
        } catch (e) {
            console.warn('Could not save settings:', e);
        }
    }
};
