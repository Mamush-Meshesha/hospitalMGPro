import { Request, Response, NextFunction } from 'express';
import { hasPrivilege } from '../services/rbac.service';
import { AuditEngine } from '../utils/audit.engine';

export const requirePrivilege = (privilege: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.userId) {
        return res.status(401).json({ error: 'Unauthorized: No user attached to request' });
      }

      // Break-the-Glass Override
      const btgReason = req.headers['x-break-the-glass-reason'];
      
      let authorized = false;
      let usedBtg = false;

      if (btgReason && typeof btgReason === 'string') {
        authorized = true;
        usedBtg = true;
      } else {
        authorized = await hasPrivilege(req.user.userId, privilege);
      }

      if (!authorized) {
        return res.status(403).json({ error: `Forbidden: Requires privilege '${privilege}'` });
      }

      if (usedBtg) {
        // Asynchronously log the emergency override
        AuditEngine.logEvent('BREAK_THE_GLASS', req.user.userId, {
          target_privilege: privilege,
          reason: btgReason,
          path: req.originalUrl,
          method: req.method
        });
      }

      next();
    } catch (error) {
      console.error('RBAC Error:', error);
      return res.status(500).json({ error: 'Internal Server Error during authorization check' });
    }
  };
};

export const requireLocation = (req: Request, res: Response, next: NextFunction) => {
  if (!req.locationId) {
    return res.status(400).json({ error: 'Bad Request: Missing X-Location-Id header. A valid session location is required for this operation.' });
  }
  next();
};
