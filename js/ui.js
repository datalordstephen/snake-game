// UI Module - Screen management and dossier card generation
const UI = {
    elements: {},

    /**
     * Initialize UI by caching DOM elements
     */
    init() {
        this.elements = {
            menuScreen: document.getElementById('menu-screen'),
            gameScreen: document.getElementById('game-screen'),
            gameOverScreen: document.getElementById('game-over-screen'),
            settingsScreen: document.getElementById('settings-screen'),
            leaderboardScreen: document.getElementById('leaderboard-screen'),
            startBtn: document.getElementById('start-btn'),
            leaderboardBtn: document.getElementById('leaderboard-btn'),
            leaderboardBackBtn: document.getElementById('leaderboard-back-btn'),
            settingsBtn: document.getElementById('settings-btn'),
            settingsBackBtn: document.getElementById('settings-back-btn'),
            soundToggle: document.getElementById('sound-toggle'),
            musicToggle: document.getElementById('music-toggle'),
            crtToggle: document.getElementById('crt-toggle'),
            buyBtn: document.getElementById('buy-btn'),
            playAgainBtn: document.getElementById('play-again-btn'),
            shareBtn: document.getElementById('share-btn'),
            menuBtn: document.getElementById('menu-btn'),
            scoreDisplay: document.getElementById('score'),
            highScoreDisplay: document.getElementById('high-score'),
            scoreValue: document.getElementById('score-value'),
            rankValue: document.getElementById('rank-value'),
            leaderboardSubmit: document.getElementById('leaderboard-submit'),
            usernameInput: document.getElementById('username-input'),
            submitScoreBtn: document.getElementById('submit-score-btn'),
            submitStatus: document.getElementById('submit-status'),
            leaderboardLoading: document.getElementById('leaderboard-loading'),
            leaderboardContent: document.getElementById('leaderboard-content'),
            leaderboardError: document.getElementById('leaderboard-error'),
            leaderboardList: document.getElementById('leaderboard-list'),
            dpad: document.getElementById('dpad'),
            epsteinBg: document.getElementById('epstein-bg'),
            screen: document.getElementById('screen')
        };

        this.updateHighScoreDisplay();
        this.loadSettings();
    },

    /**
     * Show a specific screen, hide others
     * @param {string} screenName - 'menu', 'game', 'gameover', 'settings', or 'leaderboard'
     */
    showScreen(screenName) {
        const { menuScreen, gameScreen, gameOverScreen, settingsScreen, leaderboardScreen, dpad, epsteinBg } = this.elements;

        menuScreen.classList.add('hidden');
        gameScreen.classList.add('hidden');
        gameOverScreen.classList.add('hidden');
        if (settingsScreen) settingsScreen.classList.add('hidden');
        if (leaderboardScreen) leaderboardScreen.classList.add('hidden');

        switch (screenName) {
            case 'menu':
                menuScreen.classList.remove('hidden');
                if (epsteinBg) {
                    epsteinBg.classList.remove('game-over-effect');
                }
                if (dpad) dpad.classList.add('hidden');
                break;
            case 'game':
                gameScreen.classList.remove('hidden');
                if (epsteinBg) {
                    epsteinBg.classList.remove('game-over-effect');
                }
                if (dpad) dpad.classList.remove('hidden');
                break;
            case 'gameover':
                gameOverScreen.classList.remove('hidden');
                if (epsteinBg) {
                    epsteinBg.classList.add('game-over-effect');
                }
                if (dpad) dpad.classList.add('hidden');
                break;
            case 'settings':
                if (settingsScreen) settingsScreen.classList.remove('hidden');
                if (epsteinBg) {
                    epsteinBg.classList.remove('game-over-effect');
                }
                if (dpad) dpad.classList.add('hidden');
                break;
            case 'leaderboard':
                if (leaderboardScreen) {
                    leaderboardScreen.classList.remove('hidden');
                    this.loadLeaderboard();
                }
                if (epsteinBg) {
                    epsteinBg.classList.remove('game-over-effect');
                }
                if (dpad) dpad.classList.add('hidden');
                break;
        }
    },

    /**
     * Update the score display during gameplay
     * @param {number} score - Current score
     */
    updateScore(score) {
        if (this.elements.scoreDisplay) {
            this.elements.scoreDisplay.textContent = `EVIDENCE: ${score}`;
        }
    },

    /**
     * Update the high score display
     */
    updateHighScoreDisplay() {
        const highScore = Storage.getHighScore();
        if (this.elements.highScoreDisplay) {
            this.elements.highScoreDisplay.textContent = `HIGH: ${highScore}`;
        }
    },

    /**
     * Calculate rank based on score
     * @param {number} score - Player's score
     * @returns {string} Rank name
     */
    calculateRank(score) {
        let rank = CONSTANTS.RANKS[0].name;
        for (const r of CONSTANTS.RANKS) {
            if (score >= r.minScore) {
                rank = r.name;
            }
        }
        return rank;
    },

    /**
     * Show the game over screen with results
     * @param {number} score - Final score
     */
    showGameOver(score) {
        const rank = this.calculateRank(score);
        const isNewHighScore = Storage.saveHighScore(score);

        if (this.elements.scoreValue) {
            let scoreText = `${score}`;
            if (isNewHighScore && score > 0) {
                scoreText += ' [NEW RECORD]';
            }
            this.elements.scoreValue.textContent = scoreText;
        }

        if (this.elements.rankValue) {
            this.elements.rankValue.textContent = rank.toUpperCase();
        }

        // Handle leaderboard submission
        if (score > 0 && this.elements.leaderboardSubmit) {
            const savedUsername = Storage.getUsername();
            if (savedUsername) {
                // Auto-submit for returning users
                this.elements.leaderboardSubmit.classList.add('hidden');
                this.autoSubmitToLeaderboard(savedUsername, score);
            } else {
                // Show input for new users
                this.elements.leaderboardSubmit.classList.remove('hidden');
                this.elements.usernameInput.value = '';
                this.elements.usernameInput.disabled = false;
                this.elements.submitScoreBtn.disabled = false;
                this.elements.submitStatus.textContent = '';
                this.elements.submitStatus.className = 'submit-status';
            }
        } else if (this.elements.leaderboardSubmit) {
            this.elements.leaderboardSubmit.classList.add('hidden');
        }

        this.updateHighScoreDisplay();
        this.showScreen('gameover');
    },

    /**
     * Generate the share text for Twitter
     * @param {number} score - Player's score
     * @returns {string} Tweet URL
     */
    generateShareUrl(score) {
        const rank = this.calculateRank(score);
        const text = [
            '[ INVESTIGATION TERMINATED ]',
            '',
            `Evidence collected: ${score}`,
            `Rank: ${rank}`,
            '',
            '$EPSTEIN',
            '',
            CONSTANTS.GAME_URL
        ].join('\n');

        return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    },

    /**
     * Open Twitter share dialog
     * @param {number} score - Player's score
     */
    shareToTwitter(score) {
        const url = this.generateShareUrl(score);
        window.open(url, '_blank');
    },

    /**
     * Load and apply saved settings
     */
    loadSettings() {
        const settings = Storage.getSettings();

        // Apply CRT effects setting
        if (this.elements.crtToggle) {
            this.elements.crtToggle.dataset.enabled = settings.crtEffects;
            this.elements.crtToggle.textContent = settings.crtEffects ? '[ ON ]' : '[ OFF ]';
        }
        this.applyCRTEffects(settings.crtEffects);

        // Apply sound setting
        if (this.elements.soundToggle) {
            this.elements.soundToggle.dataset.enabled = settings.sound;
            this.elements.soundToggle.textContent = settings.sound ? '[ ON ]' : '[ OFF ]';
        }

        // Apply music setting
        if (this.elements.musicToggle) {
            this.elements.musicToggle.dataset.enabled = settings.music;
            this.elements.musicToggle.textContent = settings.music ? '[ ON ]' : '[ OFF ]';
        }
    },

    /**
     * Toggle a setting button and return new state
     * @param {HTMLElement} toggleBtn - The toggle button element
     * @returns {boolean} New enabled state
     */
    toggleSetting(toggleBtn) {
        const isEnabled = toggleBtn.dataset.enabled === 'true';
        const newState = !isEnabled;
        toggleBtn.dataset.enabled = newState;
        toggleBtn.textContent = newState ? '[ ON ]' : '[ OFF ]';
        return newState;
    },

    /**
     * Apply CRT effects based on setting
     * @param {boolean} enabled - Whether CRT effects are enabled
     */
    applyCRTEffects(enabled) {
        if (this.elements.screen) {
            if (enabled) {
                this.elements.screen.classList.remove('no-crt');
            } else {
                this.elements.screen.classList.add('no-crt');
            }
        }
    },

    /**
     * Auto-submit score for returning users
     * @param {string} username - Saved username
     * @param {number} score - Player's score
     */
    async autoSubmitToLeaderboard(username, score) {
        const result = await Leaderboard.submitScore(username, score);
        // Silent submit - no UI feedback needed for auto-submit
        if (!result.success) {
            console.error('Auto-submit failed:', result.error);
        }
    },

    /**
     * Submit score to leaderboard (manual, for new users)
     * @param {number} score - Player's score
     */
    async submitToLeaderboard(score) {
        const username = this.elements.usernameInput.value.trim();

        if (!username) {
            this.elements.submitStatus.textContent = '[ ERROR: CODENAME REQUIRED ]';
            this.elements.submitStatus.className = 'submit-status error';
            return;
        }

        this.elements.submitStatus.textContent = '[ TRANSMITTING... ]';
        this.elements.submitStatus.className = 'submit-status';
        this.elements.submitScoreBtn.disabled = true;

        const result = await Leaderboard.submitScore(username, score);

        if (result.success) {
            Storage.saveUsername(username);
            this.elements.submitStatus.textContent = `[ SUBMITTED - RANK #${result.position} ]`;
            this.elements.submitStatus.className = 'submit-status success';
            this.elements.usernameInput.disabled = true;
            this.elements.submitScoreBtn.disabled = true;
        } else {
            this.elements.submitStatus.textContent = `[ ERROR: ${result.error.toUpperCase()} ]`;
            this.elements.submitStatus.className = 'submit-status error';
            this.elements.submitScoreBtn.disabled = false;
        }
    },

    /**
     * Load and display leaderboard
     */
    async loadLeaderboard() {
        const { leaderboardLoading, leaderboardContent, leaderboardError, leaderboardList } = this.elements;

        // Show loading
        if (leaderboardLoading) leaderboardLoading.classList.remove('hidden');
        if (leaderboardContent) leaderboardContent.classList.add('hidden');
        if (leaderboardError) leaderboardError.classList.add('hidden');

        const scores = await Leaderboard.fetchScores();

        if (scores.length === 0) {
            // Show error
            if (leaderboardLoading) leaderboardLoading.classList.add('hidden');
            if (leaderboardError) leaderboardError.classList.remove('hidden');
            return;
        }

        // Render scores
        if (leaderboardList) {
            leaderboardList.innerHTML = scores.map((entry, index) => {
                const position = index + 1;
                const topClass = position <= 3 ? 'top-3' : '';
                return `
                    <div class="leaderboard-row ${topClass}">
                        <span class="col-rank">${position}</span>
                        <span class="col-username">${this.escapeHtml(entry.username)}</span>
                        <span class="col-score">${entry.score}</span>
                        <span class="col-time">${Leaderboard.formatDate(entry.created_at)}</span>
                    </div>
                `;
            }).join('');
        }

        // Show content
        if (leaderboardLoading) leaderboardLoading.classList.add('hidden');
        if (leaderboardContent) leaderboardContent.classList.remove('hidden');
    },

    /**
     * Escape HTML to prevent XSS
     * @param {string} text - Text to escape
     * @returns {string} Escaped text
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    /**
     * Generate a dossier card canvas
     * @param {number} score - Player's score
     * @returns {HTMLCanvasElement} Canvas with dossier card
     */
    generateDossierCard(score) {
        const canvas = document.createElement('canvas');
        canvas.width = 600;
        canvas.height = 400;
        const ctx = canvas.getContext('2d');

        const rank = this.calculateRank(score);

        // Background
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, 600, 400);

        // Static noise effect
        Effects.drawHeavyStatic(ctx, 600, 400);

        // Border
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 4;
        ctx.strokeRect(10, 10, 580, 380);

        // TOP SECRET stamp
        ctx.save();
        ctx.translate(300, 80);
        ctx.rotate(-0.1);
        ctx.font = 'bold 48px monospace';
        ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';
        ctx.textAlign = 'center';
        ctx.fillText('TOP SECRET', 0, 0);
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 2;
        ctx.strokeRect(-150, -40, 300, 55);
        ctx.restore();

        // Main text
        ctx.font = 'bold 32px monospace';
        ctx.fillStyle = '#ff0000';
        ctx.textAlign = 'center';
        ctx.fillText('INVESTIGATION TERMINATED', 300, 160);

        // Score
        ctx.font = '24px monospace';
        ctx.fillStyle = '#00ff00';
        ctx.fillText(`EVIDENCE COLLECTED: ${score}`, 300, 220);

        // Rank
        ctx.fillText(`RANK: ${rank.toUpperCase()}`, 300, 260);

        // Footer
        ctx.font = '16px monospace';
        ctx.fillStyle = '#666666';
        ctx.fillText('$EPSTEIN', 300, 340);
        ctx.fillText(CONSTANTS.GAME_URL, 300, 365);

        // Scanlines
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        for (let y = 0; y < 400; y += 4) {
            ctx.fillRect(0, y, 600, 2);
        }

        return canvas;
    }
};
