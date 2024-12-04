


import express from 'express';
import { storeProfile, fetchProfile, deleteProfile } from '../controllers/profileController.js'; // Ensure the path is correct

const router = express.Router();

// Define the login route
router.post('/storeProfile', storeProfile);
router.post('/fetchProfile', fetchProfile);
router.post('/deleteProfile', deleteProfile);

export default router;
