import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { prisma } from '../utils/prisma';
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-hospital-key-change-me';
const JWT_EXPIRES_IN = '24h';

export const loginUser = async (username: string, password_plain: string) => {
  // Find user by username
  const user = await prisma.users.findFirst({
    where: { username, retired: false },
    include: { 
      reverse_user_role_user_role_to_users: {
        include: {
          role_role_definitions: {
            include: {
              reverse_role_privilege_role_privilege_to_role: true
            }
          }
        }
      } 
    }
  });

  if (!user) {
    throw new Error('Invalid credentials');
  }

  // Compare password (assuming legacy passwords were also bcrypt or we migrate them)
  const isMatch = await bcrypt.compare(password_plain, user.password || '');
  
  if (!isMatch) {
    throw new Error('Invalid credentials');
  }

  // Extract roles and privileges
  const roles = user.reverse_user_role_user_role_to_users?.map((r: any) => r.role) || [];
  
  const privilegeSet = new Set<string>();
  user.reverse_user_role_user_role_to_users?.forEach((ur: any) => {
    ur.role_role_definitions?.reverse_role_privilege_role_privilege_to_role?.forEach((rp: any) => {
      privilegeSet.add(rp.privilege);
    });
  });
  
  const privileges = Array.from(privilegeSet);

  // Check if this user is also a Provider
  const providerRecord = await prisma.provider.findFirst({
    where: { person_id: user.person_id, retired: false }
  });
  const providerId = providerRecord?.provider_id;

  // Generate JWT
  const token = jwt.sign(
    { userId: user.user_id, username: user.username, privileges, providerId, tenantId: user.tenant_id },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  return {
    token,
    user: {
      userId: user.user_id,
      username: user.username,
      systemId: user.system_id,
      roles,
      privileges,
      providerId,
      tenantId: user.tenant_id
    }
  };
};

export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: number; username: string; providerId?: number; privileges: string[]; tenantId: number };
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};
