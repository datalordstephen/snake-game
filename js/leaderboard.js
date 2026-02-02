// Leaderboard API Client
const Leaderboard = {
    // API endpoint (will be /api/leaderboard in production)
    apiUrl: '/api/leaderboard',

    /**
     * Fetch top 100 scores from leaderboard
     * @returns {Promise<Array>} Array of leaderboard entries
     */
    async fetchScores() {
        try {
            const response = await fetch(this.apiUrl);
            const data = await response.json();

            if (data.success) {
                return data.scores;
            } else {
                console.error('Failed to fetch leaderboard:', data.error);
                return [];
            }
        } catch (error) {
            console.error('Leaderboard fetch error:', error);
            return [];
        }
    },

    /**
     * Submit a score to the leaderboard
     * @param {string} username - Player's username
     * @param {number} score - Player's score
     * @returns {Promise<Object>} Result with position and rank
     */
    async submitScore(username, score) {
        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, score })
            });

            const data = await response.json();

            if (data.success) {
                return {
                    success: true,
                    position: data.position,
                    rank: data.rank
                };
            } else {
                return {
                    success: false,
                    error: data.error
                };
            }
        } catch (error) {
            console.error('Leaderboard submit error:', error);
            return {
                success: false,
                error: 'Network error'
            };
        }
    },

    /**
     * Format date for display
     * @param {string} dateString - ISO date string
     * @returns {string} Formatted date
     */
    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'JUST NOW';
        if (diffMins < 60) return `${diffMins}M AGO`;
        if (diffHours < 24) return `${diffHours}H AGO`;
        if (diffDays < 30) return `${diffDays}D AGO`;

        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
};
