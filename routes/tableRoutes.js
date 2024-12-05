



import express from 'express';
import { fetchTable } from '../controllers/tableController.js'; // Ensure the path is correct

const router = express.Router();

// Define the login route
router.get('/fetchTable', fetchTable);

export default router;
