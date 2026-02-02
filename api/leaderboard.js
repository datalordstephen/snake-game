import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        // GET: Fetch top 100 scores
        if (req.method === 'GET') {
            const result = await sql`
                SELECT username, score, rank, created_at
                FROM leaderboard
                ORDER BY score DESC, created_at ASC
                LIMIT 100
            `;

            return res.status(200).json({
                success: true,
                scores: result
            });
        }

        // POST: Submit a new score
        if (req.method === 'POST') {
            const { username, score } = req.body;

            // Validation
            if (!username || username.trim().length === 0) {
                return res.status(400).json({
                    success: false,
                    error: 'Username is required'
                });
            }

            if (username.length > 20) {
                return res.status(400).json({
                    success: false,
                    error: 'Username must be 20 characters or less'
                });
            }

            if (typeof score !== 'number' || score < 0) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid score'
                });
            }

            // Calculate rank based on score
            const rank = calculateRank(score);

            // Insert score
            await sql`
                INSERT INTO leaderboard (username, score, rank, created_at)
                VALUES (${username.trim()}, ${score}, ${rank}, NOW())
            `;

            // Get user's position
            const position = await sql`
                SELECT COUNT(*) as position
                FROM leaderboard
                WHERE score > ${score}
                   OR (score = ${score} AND created_at < (
                       SELECT created_at FROM leaderboard
                       WHERE username = ${username.trim()} AND score = ${score}
                       ORDER BY created_at DESC
                       LIMIT 1
                   ))
            `;

            return res.status(200).json({
                success: true,
                position: parseInt(position[0].position) + 1,
                rank
            });
        }

        res.status(405).json({ success: false, error: 'Method not allowed' });
    } catch (error) {
        console.error('Leaderboard error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
}

/**
 * Calculate rank based on score
 * @param {number} score - Player's score
 * @returns {string} Rank name
 */
function calculateRank(score) {
    const ranks = [
        { minScore: 40, name: 'Shadow Associate' },
        { minScore: 30, name: 'Deep State Threat' },
        { minScore: 20, name: 'Senior Investigator' },
        { minScore: 10, name: 'Field Operative' },
        { minScore: 5, name: 'Junior Analyst' },
        { minScore: 0, name: 'Rookie Leaker' }
    ];

    for (const rank of ranks) {
        if (score >= rank.minScore) {
            return rank.name;
        }
    }

    return 'Rookie Leaker';
}
