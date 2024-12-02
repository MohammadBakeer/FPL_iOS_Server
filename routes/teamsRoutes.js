


import express from 'express';
import { fetchTeam } from '../controllers/teamsController.js'; // Ensure the path is correct

const router = express.Router();

// Define the login route
router.post('/fetchTeam', fetchTeam);

export default router;
