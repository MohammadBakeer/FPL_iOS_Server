

import db from '../db.js';  // Assuming you have a database connection


export const storeProfile = async (req, res) => {
    const { team_name, phone_number, address, user_id } = req.body;

    try {

        // Update the user's profile in the database
        const query = `
            UPDATE users
            SET team_name = $1, phone_number = $2, address = $3
            WHERE user_id = $4
        `;
        const values = [team_name, phone_number, address, user_id];

        const result = await db.query(query, values);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json({ message: "Profile updated successfully" });
    } catch (error) {
        console.error("Error updating profile:", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};


export const fetchProfile = async (req, res) => {
    const { user_id } = req.body;

    try {
        // Validate input
        if (!user_id) {
            return res.status(400).json({ error: "User ID is required" });
        }

        // Fetch user profile from the database
        const query = `
            SELECT team_name, phone_number, address
            FROM users
            WHERE user_id = $1
        `;
        const values = [user_id];

        const result = await db.query(query, values);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        // Send profile data to the client
        const { team_name, phone_number, address } = result.rows[0];
        res.status(200).json({ team_name, phone_number, address });
    } catch (error) {
        console.error("Error fetching profile:", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};



export const deleteProfile = async (req, res) => {
    const { user_id } = req.body;

    try {
        // Validate input
        if (!user_id) {
            return res.status(400).json({ error: "User ID is required" });
        }

        // Start a transaction to ensure all deletes are handled atomically
        await db.query("BEGIN");

        // Delete from fantasy_league_members
        await db.query(
            `DELETE FROM fantasy_league_members WHERE user_id = $1`,
            [user_id]
        );

        await db.query(
            `DELETE FROM fantasy_private_leagues WHERE user_id = $1`,
            [user_id]
        );

        // Delete from fantasy_points
        await db.query(
            `DELETE FROM fantasy_points WHERE user_id = $1`,
            [user_id]
        );

        // Delete from teams
        await db.query(
            `DELETE FROM teams WHERE user_id = $1`,
            [user_id]
        );

        // Delete from users
        const userResult = await db.query(
            `DELETE FROM users WHERE user_id = $1 RETURNING *`,
            [user_id]
        );

        // Check if the user existed before deleting
        if (userResult.rowCount === 0) {
            await db.query("ROLLBACK");
            return res.status(404).json({ error: "User not found" });
        }

        // Commit the transaction
        await db.query("COMMIT");

        res.status(200).json({ message: "User profile and related data deleted successfully" });
    } catch (error) {
        // Rollback transaction on error
        await db.query("ROLLBACK");
        console.error("Error deleting profile:", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};


