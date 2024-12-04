

import express from 'express';
import {fetchFantasyLeague, createLeague, joinLeague, deleteLeague, fetchPrivateLeague} from '../controllers/leagueController.js'; // Ensure the path is correct

const router = express.Router();

// Define the login route
router.get('/fetchFantasyLeague', fetchFantasyLeague);
router.post('/createLeague', createLeague);
router.post('/joinLeague', joinLeague);
router.post('/deleteLeague', deleteLeague);
router.post('/fetchPrivateLeague', fetchPrivateLeague);


export default router;
