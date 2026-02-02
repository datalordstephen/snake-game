import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Create leaderboard table
        await sql`
            CREATE TABLE IF NOT EXISTS leaderboard (
                id SERIAL PRIMARY KEY,
                username VARCHAR(20) NOT NULL,
                score INTEGER NOT NULL,
                rank VARCHAR(50) NOT NULL,
                created_at TIMESTAMP NOT NULL DEFAULT NOW()
            )
        `;

        // Create index for faster queries
        await sql`
            CREATE INDEX IF NOT EXISTS idx_leaderboard_score
            ON leaderboard(score DESC, created_at ASC)
        `;

        res.status(200).json({
            success: true,
            message: 'Database initialized successfully'
        });
    } catch (error) {
        console.error('Database init error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}
