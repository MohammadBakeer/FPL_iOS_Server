
import express from 'express';
import { login, signup } from '../controllers/authController.js'; // Ensure the path is correct

const router = express.Router();

// Define the login route
router.post('/login', login);
router.post('/signup', signup);

export default router;
