import express from 'express';
import { registerUser, loginUser, forgotPassword } from '../controllers/authController.js';

const router = express.Router();

// Semua endpoint di bawah ini nanti diawali dengan /api/auth
router.post('/register', registerUser);      
router.post('/login', loginUser);           
router.post('/forgot-password', forgotPassword);  

export default router;