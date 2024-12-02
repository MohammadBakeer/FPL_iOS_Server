
import db from '../db.js';  // Assuming you have a database connection

// Fetch current round function
export const fetchRound = async (req, res) => {
    try {
        // Query to find the highest round_num from the teams table
        const result = await db.query('SELECT MAX(round_num) AS highest_round FROM teams');

        // Check if a result was found
        if (result.rows.length > 0 && result.rows[0].highest_round !== null) {
            // Return the highest round_num from the query result
            res.status(200).json({
                message: 'Highest round fetched successfully',
                round_num: result.rows[0].highest_round
            });
        } else {
            // If no rounds are found or the result is null
            res.status(404).json({
                message: 'No rounds found in teams table'
            });
        }
    } catch (err) {
        console.error('Error fetching round number:', err.stack);
        res.status(500).json({
            message: 'Error fetching round number',
            error: err.message
        });
    }
};
