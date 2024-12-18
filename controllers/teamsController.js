import db from '../db.js'; // Assuming you have a database connection

// Fetch team function by user_id and highest round_num
export const fetchTeam = async (req, res) => {
    try {
        const { user_id } = req.body; // Extract user_id from the request body

        if (!user_id) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        // Query to find the row with the highest round_num for the given user_id
        const result = await db.query(
            'SELECT formation, player_lineup, total_budget, points, delete_count, change_count FROM teams WHERE user_id = $1 ORDER BY round_num DESC LIMIT 1',
            [user_id]  // Parameterized query to avoid SQL injection
        );

        // Check if a result was found
        if (result.rows.length > 0) {
            const team = result.rows[0];

            // Filter player lineup to include only the desired fields, convert price to a double, and extract first name part
            const filteredPlayerLineup = team.player_lineup.map(player => ({
                shirtName: player.club,
                price: parseFloat(player.price), // Convert price to a double
                name: player.lastName.split(' ')[0], // Extract only the first part of the lastName
                position: player.position,
            }));

            // Send the structured response to the client
            res.status(200).json({
                team: {
                    playerLineup: filteredPlayerLineup,
                    totalBudget: team.total_budget,
                    points: team.points,
                    deleteCount: team.delete_count,
                    changeCount: team.change_count,
                },
            });
        } else {
            // If no team is found for the given user_id
            res.status(404).json({
                message: 'No team found for the provided user_id',
            });
        }
    } catch (err) {
        console.error('Error fetching team:', err.stack);
        res.status(500).json({
            message: 'Error fetching team',
            error: err.message,
        });
    }
};



