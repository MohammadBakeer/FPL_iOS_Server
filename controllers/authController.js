
import bcrypt from 'bcrypt'; // Import bcrypt for hashing passwords
import db from '../db.js'; // Import the database client


export const signup = async (req, res) => {
    const { email, password, roundNum, teamName } = req.body;

    // Validate input (ensure that all necessary fields are provided)
    if (!email || !password || !roundNum || !teamName) {
        return res.status(400).json({
            message: 'Email, password, roundNum, and teamName are required.',
        });
    }

    const attempt_count = 1;
    const attempt_time = new Date().toISOString(); // Current time in ISO format
    const email_verified = true;

    try {
        // Check if the email already exists in the users table
        const emailCheck = await db.query('SELECT user_id FROM users WHERE email = $1', [email]);
        if (emailCheck.rows.length > 0) {
            return res.status(400).json({
                message: 'This email is already being used.',
            });
        }

        // Hash the password using bcrypt
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert the user into the "users" table
        const result = await db.query(
            'INSERT INTO users(email, password, team_name, attempt_count, attempt_time, email_verified) VALUES($1, $2, $3, $4, $5, $6) RETURNING user_id',
            [email, hashedPassword, teamName, attempt_count, attempt_time, email_verified]
        );

        // Retrieve the generated user_id
        const userId = result.rows[0].user_id;

        // Insert into fantasy_points table with initial points = 0
        await db.query(
            'INSERT INTO fantasy_points(user_id, points) VALUES($1, $2)',
            [userId, 0]
        );

        // Insert into teams table with initial formation and other fields
        await db.query(
            'INSERT INTO teams (user_id, formation, player_lineup, total_budget, round_num, points) VALUES ($1, $2, $3, $4, $5, $6)',
            [
                userId,
                '["GK", "DEF", "DEF", "DEF", "DEF", "MID", "MID", "MID", "FWD", "FWD", "FWD"]', // Default formation
                '["GK", "DEF", "DEF", "DEF", "DEF", "MID", "MID", "MID", "FWD", "FWD", "FWD"]', // Empty array for player lineup
                85, // Total budget
                roundNum, // Round number passed in the request
                0, // Initial points
            ]
        );

        // Return the user_id in the response
        res.status(201).json({
            message: 'User and associated data inserted successfully',
            user_id: userId,
        });
    } catch (err) {
        console.error('Error inserting user:', err.stack);
        res.status(500).json({
            message: 'Error inserting user and related data',
            error: err.message,
        });
    }
};


export const login = async (req, res) => {
    const { email, password } = req.body; // Destructure email and password from the request body

    try {
        // Query to find a user by email
        const result = await db.query(
            'SELECT user_id, password FROM users WHERE email = $1',
            [email]
        );

        // Check if a user was found
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Invalid email or password' });
        }

        // Get the hashed password and user_id from the result
        const { user_id, password: hashedPassword } = result.rows[0];

        // Compare the provided password with the hashed password
        const passwordMatch = await bcrypt.compare(password, hashedPassword);

        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // If the password matches, respond with the user_id
        res.status(200).json({
            message: 'Login successful',
            user_id: user_id,
        });
    } catch (err) {
        console.error('Error during login:', err.stack);
        res.status(500).json({
            message: 'Error during login',
            error: err.message,
        });
    }
};
