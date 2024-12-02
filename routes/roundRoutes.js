

import express from 'express';
import { fetchRound } from '../controllers/roundController.js'; // Ensure the path is correct

const router = express.Router();

// Define the login route
router.get('/fetchRound', fetchRound);

export default router;
