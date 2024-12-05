import express from 'express';
import db from './db.js'; // Import the database client
import authRouter from './routes/authRoutes.js'; // Import the auth route
import roundRouter from './routes/roundRoutes.js'; // Import the auth route
import teamsRouter from './routes/teamsRoutes.js'; // Import the auth route
import profileRouter from './routes/profileRoutes.js'; // Import the auth route
import leagueRouter from './routes/leagueRoutes.js'; // Import the auth route
import tableRouter from './routes/tableRoutes.js'; // Import the auth route

const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON request bodies
app.use(express.json());

// Basic route to check if the server is working
app.get('/', (req, res) => {
    res.send('Hello, Express!');
});

// Route to check the DB connection status
app.get('/check-db', (req, res) => {
    db.query('SELECT NOW()', (err, result) => {
        if (err) {
            console.error('Error checking the database:', err.stack);
            res.status(500).send('Error connecting to the database');
        } else {
            res.send('Database is connected successfully!');
        }
    });
});

// Use the auth routes
app.use('/auth', authRouter); 
app.use('/auth', roundRouter); 
app.use('/auth', teamsRouter); 
app.use('/auth', profileRouter); 
app.use('/auth', leagueRouter); 
app.use('/auth', tableRouter); 

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
