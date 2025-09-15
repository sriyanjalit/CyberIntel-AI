import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions, Secret } from 'jsonwebtoken';
import { logger } from '../config/logger';
import { User } from '../models';

const router = Router();

const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '10', 10);
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// Register new user
router.post('/register', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('name').notEmpty().withMessage('Name is required'),
  body('role').optional().isIn(['admin', 'analyst', 'viewer']).withMessage('Invalid role')
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, name, role = 'viewer' } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

    // Create new user
    const newUser = await User.create({ email, password: hashedPassword, name, role });

    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email, role: newUser.role },
      JWT_SECRET as Secret,
      { expiresIn: JWT_EXPIRES_IN } as SignOptions
    );

    logger.info(`New user registered: ${newUser.email}`);

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        createdAt: newUser.createdAt
      },
      token
    });
    return;
  } catch (error) {
    logger.error('Error registering user:', error);
    res.status(500).json({ error: 'Internal server error' });
    return;
  }
});

// Login user
router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, (user as any).password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    await (user as any).update({ lastLogin: new Date() });

    // Generate JWT token
    const token = jwt.sign(
      { userId: (user as any).id, email: (user as any).email, role: (user as any).role },
      JWT_SECRET as Secret,
      { expiresIn: JWT_EXPIRES_IN } as SignOptions
    );

    logger.info(`User logged in: ${(user as any).email}`);

    res.json({
      message: 'Login successful',
      user: {
        id: (user as any).id,
        email: (user as any).email,
        name: (user as any).name,
        role: (user as any).role,
        lastLogin: (user as any).lastLogin
      },
      token
    });
    return;
  } catch (error) {
    logger.error('Error logging in user:', error);
    res.status(500).json({ error: 'Internal server error' });
    return;
  }
});

// Get current user profile
router.get('/profile', async (req: Request, res: Response) => {
  try {
    // Extract from JWT (auth middleware should set req.user)
    const userId = (req as any).user?.userId as string;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id: (user as any).id,
        email: (user as any).email,
        name: (user as any).name,
        role: (user as any).role,
        createdAt: (user as any).createdAt,
        lastLogin: (user as any).lastLogin
      }
    });
    return;
  } catch (error) {
    logger.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Internal server error' });
    return;
  }
});

// Update user profile
router.put('/profile', [
  body('name').optional().notEmpty().withMessage('Name cannot be empty'),
  body('email').optional().isEmail().withMessage('Valid email is required')
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = (req as any).user?.userId as string;
    const { name, email } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update user fields
    const updates: any = {};
    if (name) updates.name = name;
    if (email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser && (existingUser as any).id !== userId) {
        return res.status(400).json({ error: 'Email already in use' });
      }
      updates.email = email;
    }
    await (user as any).update(updates);

    logger.info(`User profile updated: ${userId}`);

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: (user as any).id,
        email: (user as any).email,
        name: (user as any).name,
        role: (user as any).role,
        createdAt: (user as any).createdAt,
        lastLogin: (user as any).lastLogin
      }
    });
  } catch (error) {
    logger.error('Error updating user profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Change password
router.put('/change-password', [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = (req as any).user?.userId as string;
    const { currentPassword, newPassword } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, (user as any).password);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
    await (user as any).update({ password: hashedNewPassword });

    logger.info(`Password changed for user: ${userId}`);

    res.json({ message: 'Password changed successfully' });
    return;
  } catch (error) {
    logger.error('Error changing password:', error);
    res.status(500).json({ error: 'Internal server error' });
    return;
  }
});

// Logout (in a real application, this might involve token blacklisting)
router.post('/logout', async (req: Request, res: Response) => {
  try {
    // In a real application, you might blacklist the token
    logger.info('User logged out');
    res.json({ message: 'Logout successful' });
    return;
  } catch (error) {
    logger.error('Error during logout:', error);
    res.status(500).json({ error: 'Internal server error' });
    return;
  }
});

// Refresh token
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    // Find user
    const user = await User.findByPk(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Generate new token
    const newToken = jwt.sign(
      { userId: (user as any).id, email: (user as any).email, role: (user as any).role },
      JWT_SECRET as Secret,
      { expiresIn: JWT_EXPIRES_IN } as SignOptions
    );

    res.json({
      message: 'Token refreshed successfully',
      token: newToken
    });
    return;
  } catch (error) {
    logger.error('Error refreshing token:', error);
    res.status(401).json({ error: 'Invalid token' });
    return;
  }
});

export default router;
