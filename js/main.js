// Main Entry Point - Initialize and wire everything together
(function() {
    'use strict';

    /**
     * Initialize the application when DOM is ready
     */
    function init() {
        // Initialize modules
        UI.init();
        Game.init();

        // Set up event listeners
        setupMenuListeners();
        setupKeyboardControls();
        setupTouchControls();
        setupMobileControls();

        // Trigger CRT power-on effect
        const screen = document.getElementById('screen');
        if (screen) {
            screen.classList.add('power-on');
        }

        // Show menu
        UI.showScreen('menu');

        // Start flicker effect
        startFlickerEffect();
    }

    /**
     * Set up menu button listeners
     */
    function setupMenuListeners() {
        const { startBtn, leaderboardBtn, leaderboardBackBtn, buyBtn, playAgainBtn, shareBtn, menuBtn,
                settingsBtn, settingsBackBtn, soundToggle, crtToggle, submitScoreBtn, usernameInput } = UI.elements;

        if (startBtn) {
            startBtn.addEventListener('click', () => Game.start());
        }

        if (leaderboardBtn) {
            leaderboardBtn.addEventListener('click', () => UI.showScreen('leaderboard'));
        }

        if (leaderboardBackBtn) {
            leaderboardBackBtn.addEventListener('click', () => UI.showScreen('menu'));
        }

        if (submitScoreBtn) {
            submitScoreBtn.addEventListener('click', () => {
                UI.submitToLeaderboard(Game.getScore());
            });
        }

        if (usernameInput) {
            usernameInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    UI.submitToLeaderboard(Game.getScore());
                }
            });
        }

        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => UI.showScreen('settings'));
        }

        if (settingsBackBtn) {
            settingsBackBtn.addEventListener('click', () => UI.showScreen('menu'));
        }

        if (soundToggle) {
            soundToggle.addEventListener('click', () => {
                const enabled = UI.toggleSetting(soundToggle);
                const settings = Storage.getSettings();
                settings.sound = enabled;
                Storage.saveSettings(settings);
            });
        }

        if (crtToggle) {
            crtToggle.addEventListener('click', () => {
                const enabled = UI.toggleSetting(crtToggle);
                UI.applyCRTEffects(enabled);
                const settings = Storage.getSettings();
                settings.crtEffects = enabled;
                Storage.saveSettings(settings);
            });
        }

        if (buyBtn) {
            buyBtn.addEventListener('click', () => {
                if (CONSTANTS.PUMPFUN_URL !== '#') {
                    window.open(CONSTANTS.PUMPFUN_URL, '_blank');
                } else {
                    alert('Token contract address coming soon!');
                }
            });
        }

        if (playAgainBtn) {
            playAgainBtn.addEventListener('click', () => Game.start());
        }

        if (shareBtn) {
            shareBtn.addEventListener('click', () => {
                UI.shareToTwitter(Game.getScore());
            });
        }

        if (menuBtn) {
            menuBtn.addEventListener('click', () => Game.returnToMenu());
        }
    }

    /**
     * Set up keyboard controls
     */
    function setupKeyboardControls() {
        document.addEventListener('keydown', (e) => {
            // Prevent default for arrow keys (stops page scrolling)
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
                e.preventDefault();
            }

            // Direction mappings
            const keyMap = {
                // Arrow keys
                'ArrowUp': 'up',
                'ArrowDown': 'down',
                'ArrowLeft': 'left',
                'ArrowRight': 'right',
                // WASD
                'KeyW': 'up',
                'KeyS': 'down',
                'KeyA': 'left',
                'KeyD': 'right'
            };

            if (keyMap[e.code]) {
                Game.handleInput(keyMap[e.code]);
            }

            // Space to start/restart
            if (e.code === 'Space') {
                if (Game.state === CONSTANTS.STATES.MENU ||
                    Game.state === CONSTANTS.STATES.GAME_OVER) {
                    Game.start();
                }
            }
        });
    }

    /**
     * Set up touch controls for swipe gestures
     */
    function setupTouchControls() {
        let touchStartX = 0;
        let touchStartY = 0;
        const minSwipeDistance = 30;

        const gameCanvas = document.getElementById('game-canvas');
        if (!gameCanvas) return;

        gameCanvas.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        }, { passive: true });

        gameCanvas.addEventListener('touchend', (e) => {
            if (!e.changedTouches.length) return;

            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;

            const dx = touchEndX - touchStartX;
            const dy = touchEndY - touchStartY;

            // Determine swipe direction
            if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > minSwipeDistance) {
                Game.handleInput(dx > 0 ? 'right' : 'left');
            } else if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > minSwipeDistance) {
                Game.handleInput(dy > 0 ? 'down' : 'up');
            }
        }, { passive: true });
    }

    /**
     * Set up mobile D-pad controls
     */
    function setupMobileControls() {
        const dpadButtons = {
            'dpad-up': 'up',
            'dpad-down': 'down',
            'dpad-left': 'left',
            'dpad-right': 'right'
        };

        Object.entries(dpadButtons).forEach(([id, direction]) => {
            const btn = document.getElementById(id);
            if (btn) {
                // Handle both touch and click
                const handler = (e) => {
                    e.preventDefault();
                    Game.handleInput(direction);
                };

                btn.addEventListener('touchstart', handler, { passive: false });
                btn.addEventListener('mousedown', handler);
            }
        });
    }

    /**
     * Start the CRT flicker effect
     */
    function startFlickerEffect() {
        const screen = document.getElementById('screen');
        if (!screen) return;

        function flicker() {
            Effects.applyFlicker(screen);
            requestAnimationFrame(flicker);
        }

        flicker();
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
