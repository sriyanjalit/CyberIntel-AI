import { Router, Request, Response } from 'express';
import { body, query, validationResult } from 'express-validator';
import { logger } from '../config/logger';

const router = Router();

// Mock user database (in production, this would be a real database)
const users = [
  {
    id: '1',
    email: 'admin@company.com',
    name: 'Admin User',
    role: 'admin',
    status: 'active',
    createdAt: new Date(),
    lastLogin: new Date(Date.now() - 3600000), // 1 hour ago
    permissions: ['read', 'write', 'delete', 'admin']
  },
  {
    id: '2',
    email: 'analyst@company.com',
    name: 'Security Analyst',
    role: 'analyst',
    status: 'active',
    createdAt: new Date(),
    lastLogin: new Date(Date.now() - 7200000), // 2 hours ago
    permissions: ['read', 'write']
  },
  {
    id: '3',
    email: 'viewer@company.com',
    name: 'Security Viewer',
    role: 'viewer',
    status: 'active',
    createdAt: new Date(),
    lastLogin: new Date(Date.now() - 86400000), // 1 day ago
    permissions: ['read']
  }
];

// Get all users (admin only)
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('role').optional().isIn(['admin', 'analyst', 'viewer']).withMessage('Invalid role'),
  query('status').optional().isIn(['active', 'inactive', 'suspended']).withMessage('Invalid status')
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      page = 1,
      limit = 20,
      role,
      status
    } = req.query;

    // Filter users
    let filteredUsers = users;

    if (role) {
      filteredUsers = filteredUsers.filter(u => u.role === role);
    }

    if (status) {
      filteredUsers = filteredUsers.filter(u => u.status === status);
    }

    // Apply pagination
    const startIndex = (parseInt(page as string) - 1) * parseInt(limit as string);
    const endIndex = startIndex + parseInt(limit as string);
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

    // Remove sensitive information
    const safeUsers = paginatedUsers.map(user => ({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
      permissions: user.permissions
    }));

    return res.json({
      users: safeUsers,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total: filteredUsers.length,
        pages: Math.ceil(filteredUsers.length / parseInt(limit as string))
      }
    });
  } catch (error) {
    logger.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = users.find(u => u.id === id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Remove sensitive information
    const safeUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
      permissions: user.permissions
    };

    res.json({ user: safeUser });
    return;
  } catch (error) {
    logger.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal server error' });
    return;
  }
});

// Create new user (admin only)
router.post('/', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('name').notEmpty().withMessage('Name is required'),
  body('role').isIn(['admin', 'analyst', 'viewer']).withMessage('Invalid role')
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, name, role } = req.body;

    // Check if user already exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Create new user
    const newUser = {
      id: (users.length + 1).toString(),
      email,
      password, // In production, this would be hashed
      name,
      role,
      status: 'active',
      createdAt: new Date(),
      lastLogin: new Date(),
      permissions: role === 'admin' ? ['read', 'write', 'delete', 'admin'] : 
                   role === 'analyst' ? ['read', 'write'] : ['read']
    };

    users.push(newUser);

    logger.info(`New user created: ${newUser.email} with role ${newUser.role}`);

    // Remove sensitive information
    const safeUser = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      status: newUser.status,
      createdAt: newUser.createdAt,
      lastLogin: newUser.lastLogin,
      permissions: newUser.permissions
    };

    return res.status(201).json({
      message: 'User created successfully',
      user: safeUser
    });
  } catch (error) {
    logger.error('Error creating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user (admin only)
router.put('/:id', [
  body('name').optional().notEmpty().withMessage('Name cannot be empty'),
  body('role').optional().isIn(['admin', 'analyst', 'viewer']).withMessage('Invalid role'),
  body('status').optional().isIn(['active', 'inactive', 'suspended']).withMessage('Invalid status')
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { name, role, status } = req.body;

    const user = users.find(u => u.id === id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update user fields
    if (name) user.name = name;
    if (role) {
      user.role = role;
      user.permissions = role === 'admin' ? ['read', 'write', 'delete', 'admin'] : 
                        role === 'analyst' ? ['read', 'write'] : ['read'];
    }
    if (status) user.status = status;

    logger.info(`User updated: ${id}`);

    // Remove sensitive information
    const safeUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
      permissions: user.permissions
    };

    return res.json({
      message: 'User updated successfully',
      user: safeUser
    });
  } catch (error) {
    logger.error('Error updating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete user (admin only)
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const userIndex = users.findIndex(u => u.id === id);
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = users[userIndex];
    users.splice(userIndex, 1);

    logger.info(`User deleted: ${id}`);

    return res.json({ message: 'User deleted successfully' });
  } catch (error) {
    logger.error('Error deleting user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user statistics
router.get('/stats/overview', async (req: Request, res: Response) => {
  try {
    const stats = {
      total: users.length,
      active: users.filter(u => u.status === 'active').length,
      inactive: users.filter(u => u.status === 'inactive').length,
      suspended: users.filter(u => u.status === 'suspended').length,
      byRole: {
        admin: users.filter(u => u.role === 'admin').length,
        analyst: users.filter(u => u.role === 'analyst').length,
        viewer: users.filter(u => u.role === 'viewer').length
      },
      lastLogin: {
        within24Hours: users.filter(u => u.lastLogin && (Date.now() - u.lastLogin.getTime()) < 86400000).length,
        within7Days: users.filter(u => u.lastLogin && (Date.now() - u.lastLogin.getTime()) < 604800000).length,
        never: users.filter(u => !u.lastLogin).length
      }
    };

    return res.json({ stats });
  } catch (error) {
    logger.error('Error fetching user statistics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user activity
router.get('/:id/activity', [
  query('period').optional().isIn(['24h', '7d', '30d']).withMessage('Invalid period')
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { period = '7d' } = req.query;

    const user = users.find(u => u.id === id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Mock activity data
    const activity = {
      userId: id,
      period,
      activities: [
        {
          id: 'activity_1',
          type: 'login',
          description: 'User logged in',
          timestamp: new Date(Date.now() - 3600000),
          metadata: { ip: '192.168.1.100', userAgent: 'Mozilla/5.0...' }
        },
        {
          id: 'activity_2',
          type: 'threat_view',
          description: 'Viewed threat details',
          timestamp: new Date(Date.now() - 7200000),
          metadata: { threatId: 'threat_123' }
        },
        {
          id: 'activity_3',
          type: 'report_generate',
          description: 'Generated threat report',
          timestamp: new Date(Date.now() - 10800000),
          metadata: { reportType: 'daily_summary' }
        }
      ],
      summary: {
        totalActivities: 3,
        loginCount: 1,
        threatViews: 1,
        reportsGenerated: 1
      }
    };

    return res.json({ activity });
  } catch (error) {
    logger.error('Error fetching user activity:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
