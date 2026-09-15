import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../services/auth.service';
import { tenantContext } from '../utils/prisma';

// Extend Express Request object to hold user details
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: number;
        username: string;
        providerId?: number;
        privileges: string[];
        tenantId: number;
      };
      locationId?: number;
    }
  }
}

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid Bearer token' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    
    // Extract optional location ID
    const locId = req.headers['x-location-id'];
    if (locId && !isNaN(Number(locId))) {
      req.locationId = Number(locId);
    }
    
    // Wrap next() in AsyncLocalStorage context for Prisma
    tenantContext.run({ tenantId: decoded.tenantId }, () => {
      next();
    });
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
  }
};
