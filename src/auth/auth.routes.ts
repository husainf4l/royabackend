import { Router } from 'express';
import { AuthController } from './auth.controller';
import { authenticate } from './auth.middleware';
import { JwtService } from './jwt.service';
import { DatabaseService } from '../database/database.service';

const router = Router();
const db = new DatabaseService();
const jwtService = new JwtService(db);
const authController = new AuthController(jwtService, db);

// Public routes
router.post('/register', authController.register.bind(authController));
router.post('/login', authController.login.bind(authController));
router.post('/refresh-token', authController.refreshToken.bind(authController));

// Protected routes
router.post('/logout', authenticate, authController.logout.bind(authController));

export default router;
