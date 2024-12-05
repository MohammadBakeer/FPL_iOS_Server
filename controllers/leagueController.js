
import db from '../db.js'; // Import the database client



export const fetchFantasyLeague = async (req, res) => {
    try {
        // Step 1: Get the user IDs and points from the fantasy_points table
        const fantasyPointsQuery = 'SELECT user_id, points FROM fantasy_points';
        const fantasyPointsResult = await db.query(fantasyPointsQuery);
        
        // Step 2: Get all the users from the users table and create a map of user_id -> team_name
        const userIds = fantasyPointsResult.rows.map(row => row.user_id);
        const userQuery = `SELECT user_id, team_name FROM users WHERE user_id = ANY($1)`;
        
        const userResult = await db.query(userQuery, [userIds]);
        const usersMap = userResult.rows.reduce((acc, row) => {
            acc[row.user_id] = row.team_name;
            return acc;
        }, {});

        // Step 3: Combine fantasy points with team name for each user
        const userWithPoints = fantasyPointsResult.rows.map(row => ({
            team_name: usersMap[row.user_id], // Get the team name
            points: row.points,               // Get the points
        }));

        // Step 4: Sort the users by points in descending order
        userWithPoints.sort((a, b) => b.points - a.points);

        // Step 5: Assign ranks
        const globalRank = userWithPoints.map((user, index) => ({
            Rank: index + 1,           // Rank starts from 1
            Team: user.team_name,     // Team name
            Points: user.points       // Points
        }));

        // Step 6: Return the ranked users
        res.status(200).json(globalRank);
    } catch (err) {
        console.error('Error fetching fantasy league data:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};




export const createLeague = async (req, res) => {
    const { user_id, leagueName, start_round } = req.body;

    try {
        // Step 1: Prepare the SQL query to insert the league into the private_fantasy_league table
        const insertQuery = `
            INSERT INTO fantasy_private_leagues (league_name, start_round, owner_id, league_badge)
            VALUES ($1, $2, $3, $4)
        `;
        
        // Step 2: Execute the query with the provided data
        await db.query(insertQuery, [leagueName, start_round, user_id, 'none']);
        
        // Step 3: Send the success response
        res.status(201).json({ message: 'League created successfully' });
    } catch (err) {
        console.error('Error creating league:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};





export const joinLeague = async (req, res) => {
    const { user_id, league_code } = req.body;

    try {
        // Step 1: Check if the league_code exists in the fantasy_private_leagues table
        const leagueQuery = 'SELECT league_id FROM fantasy_private_leagues WHERE league_code = $1';
        const leagueResult = await db.query(leagueQuery, [league_code]);

        // If no league with the given code is found
        if (leagueResult.rows.length === 0) {
            return res.status(404).json({ error: 'League not found' });
        }

        const league_id = leagueResult.rows[0].league_id;

        // Step 2: Check if the user is already part of the league
        const memberQuery = 'SELECT * FROM fantasy_league_members WHERE user_id = $1 AND league_id = $2';
        const memberResult = await db.query(memberQuery, [user_id, league_id]);

        // If the user is already a member of the league
        if (memberResult.rows.length > 0) {
            return res.status(400).json({ error: 'User is already part of the league' });
        }

        // Step 3: Insert the user into the fantasy_league_members table
        const insertQuery = 'INSERT INTO fantasy_league_members (user_id, league_id) VALUES ($1, $2)';
        await db.query(insertQuery, [user_id, league_id]);

        // Step 4: Return success message
        res.status(200).json({ message: 'Successfully joined the league' });
    } catch (err) {
        console.error('Error joining league:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};




export const fetchPrivateLeagueData = async (req, res) => {
    const { leagueName } = req.body;
    console.log(leagueName);
    console.log("hi");
    try {
        // Step 1: Query the fantasy_private_leagues table to get the league_id and league_code based on leagueName
        const leagueQuery = 'SELECT league_id, league_code FROM fantasy_private_leagues WHERE league_name = $1';
        const leagueResult = await db.query(leagueQuery, [leagueName]);

        // If no league with the given name is found
        if (leagueResult.rows.length === 0) {
            return res.status(404).json({ error: 'League not found' });
        }

        const league_id = leagueResult.rows[0].league_id;
        let league_code = leagueResult.rows[0].league_code; // Get the league_code

        league_code = parseInt(league_code, 10);

        // Step 2: Query the fantasy_league_members table to get all user_ids associated with the league_id
        const membersQuery = 'SELECT user_id FROM fantasy_league_members WHERE league_id = $1';
        const membersResult = await db.query(membersQuery, [league_id]);

        // If no members found for the league
        if (membersResult.rows.length === 0) {
            return res.status(404).json({ error: 'No members found for this league' });
        }

        const userIds = membersResult.rows.map(row => row.user_id);

        // Step 3: Query the fantasy_points table to get the points for each user_id
        const pointsQuery = 'SELECT user_id, points FROM fantasy_points WHERE user_id = ANY($1)';
        const pointsResult = await db.query(pointsQuery, [userIds]);

        // Step 4: Query the users table to get the team_name for each user_id
        const usersQuery = 'SELECT user_id, team_name FROM users WHERE user_id = ANY($1)';
        const usersResult = await db.query(usersQuery, [userIds]);

        // Step 5: Combine all data into objects representing each user
        const usersMap = usersResult.rows.reduce((acc, row) => {
            acc[row.user_id] = row.team_name;
            return acc;
        }, {});

        const pointsMap = pointsResult.rows.reduce((acc, row) => {
            acc[row.user_id] = row.points;
            return acc;
        }, {});

        const usersWithPoints = membersResult.rows.map(row => {
            const user_id = row.user_id;
            return {
                Team: usersMap[user_id],    // Get the team_name
                Points: pointsMap[user_id],  // Get the points
            };
        });

        // Step 6: Rank users from highest points to lowest
        usersWithPoints.sort((a, b) => b.Points - a.Points); // Sort by Points in descending order

        // Step 7: Assign ranks to users
        usersWithPoints.forEach((user, index) => {
            user.Rank = index + 1; // Rank starts from 1
        });

        // Step 8: Return the users with Rank, Team, Points, and League Code
        const privateRank = usersWithPoints.map(user => ({
            rank: user.Rank,
            team: user.Team,
            points: user.Points,
        }));
        console.log(league_code);
        console.log(privateRank);
        res.status(200).json({
            leagueCode: league_code,  // Include the leagueCode in the response
            privateRank: privateRank,    // Include the rankings array
        });
    } catch (err) {
        console.error('Error fetching private league data:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};



export const deleteLeague = async (req, res) => {
    const { user_id, leagueName } = req.body;

    try {
        // Step 1: Query the fantasy_private_leagues table to check if the league exists and if the user is the owner
        const leagueQuery = 'SELECT league_id, owner_id FROM fantasy_private_leagues WHERE league_name = $1';
        const leagueResult = await db.query(leagueQuery, [leagueName]);

        // If no league with the given name is found
        if (leagueResult.rows.length === 0) {
            return res.status(404).json({ error: 'League not found' });
        }

        const { league_id, owner_id } = leagueResult.rows[0];

        // Step 2: If the user is the owner, delete the league and all its members
        if (owner_id === user_id) {
            // Delete all members from the fantasy_league_members table
            const deleteMembersQuery = 'DELETE FROM fantasy_league_members WHERE league_id = $1';
            await db.query(deleteMembersQuery, [league_id]);

            // Delete the league itself from the fantasy_private_leagues table
            const deleteLeagueQuery = 'DELETE FROM fantasy_private_leagues WHERE league_id = $1';
            await db.query(deleteLeagueQuery, [league_id]);

            return res.status(200).json({ message: 'League and all members have been deleted successfully' });
        } else {
            // Step 3: If the user is not the owner, just remove the user from the league
            const deleteMemberQuery = 'DELETE FROM fantasy_league_members WHERE user_id = $1 AND league_id = $2';
            await db.query(deleteMemberQuery, [user_id, league_id]);

            return res.status(200).json({ message: 'User has been removed from the league successfully' });
        }
    } catch (err) {
        console.error('Error deleting league data:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};





export const fetchPrivateLeagues = async (req, res) => {
    try {
        const { user_id } = req.body;

        // Check if user_id is provided
        if (!user_id) {
            return res.status(400).json({ error: "User ID is required" });
        }

        // Step 1: Query `fantasy_league_members` table to get all `league_id` for the user
        const leagueIdsQuery = `SELECT league_id FROM fantasy_league_members WHERE user_id = $1`;
        const leagueIdsResult = await db.query(leagueIdsQuery, [user_id]);

        // Extract league IDs from the query result
        const leagueIds = leagueIdsResult.rows.map(row => row.league_id);

        if (leagueIds.length === 0) {
            return res.status(200).json({ leagueNames: [] }); // Return empty array if no leagues are found
        }

        // Step 2: Query `fantasy_private_leagues` table to get all `league_name` for the `league_id`
        const leaguesQuery = `
            SELECT league_name 
            FROM fantasy_private_leagues 
            WHERE league_id = ANY($1)
        `;
        const leaguesResult = await db.query(leaguesQuery, [leagueIds]);

        // Extract league names from the query result
        const leagueNames = leaguesResult.rows.map(row => row.league_name);

        // Step 3: Return the league names
        return res.status(200).json({ leagueNames });
    } catch (error) {
        console.error("Error fetching private leagues:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};


