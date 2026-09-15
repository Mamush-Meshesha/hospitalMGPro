import { Request, Response } from 'express';
import { loginUser } from '../services/auth.service';
import { prisma } from '../utils/prisma';

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const result = await loginUser(username, password);
    
    // Also fetch subscriptions for the user's tenant
    let subscriptions: string[] = [];
    if (result.user.tenantId) {
      const subs = await prisma.tenant_subscription.findMany({
        where: { tenant_id: result.user.tenantId }
      });
      subscriptions = subs.map(s => s.module);
    }
    
    res.status(200).json({ ...result, subscriptions });
  } catch (error: any) {
    res.status(401).json({ error: error.message || 'Login failed' });
  }
};

export const me = async (req: Request, res: Response) => {
  try {
    const tenantId = req.user?.tenantId;
    let subscriptions: string[] = [];
    
    if (tenantId) {
      const subs = await prisma.tenant_subscription.findMany({
        where: { tenant_id: tenantId }
      });
      subscriptions = subs.map(s => s.module);
    }
    
    // Return current user session details
    res.status(200).json({ user: req.user, subscriptions });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
};
