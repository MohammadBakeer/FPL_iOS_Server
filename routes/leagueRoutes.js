

import express from 'express';
import {fetchFantasyLeague, createLeague, joinLeague, deleteLeague, fetchPrivateLeagueData, fetchPrivateLeagues} from '../controllers/leagueController.js'; // Ensure the path is correct

const router = express.Router();

// Define the login route
router.get('/fetchFantasyLeague', fetchFantasyLeague);
router.post('/createLeague', createLeague);
router.post('/joinLeague', joinLeague);
router.post('/deleteLeague', deleteLeague);
router.post('/fetchPrivateLeagueData', fetchPrivateLeagueData);
router.post('/fetchPrivateLeagues', fetchPrivateLeagues);


export default router;
