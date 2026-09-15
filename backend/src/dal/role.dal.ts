import crypto from 'crypto';

import { prisma } from '../utils/prisma';
const generateUuid = () => crypto.randomUUID();

export class RoleDAL {
  static async getAllRoles() {
    const roles = await prisma.role.findMany({
      include: { reverse_role_privilege_role_privilege_to_role: true }
    });
    return roles.map(r => ({
      role: r.role,
      description: r.description,
      uuid: r.uuid,
      privileges: r.reverse_role_privilege_role_privilege_to_role.map(rp => rp.privilege)
    }));
  }

  static async getAllPrivileges() {
    return await prisma.privilege.findMany();
  }

  static async updateRolePrivileges(roleName: string, privileges: string[]) {
    // Transaction to delete existing and create new
    await prisma.$transaction(async (tx) => {
      await tx.role_privilege.deleteMany({
        where: { role: roleName }
      });
      
      if (privileges.length > 0) {
        await tx.role_privilege.createMany({
          data: privileges.map(p => ({
            role: roleName,
            privilege: p
          }))
        });
      }
    });
    return true;
  }

  static async createRole(roleName: string, description: string) {
    // Check if role exists
    const existing = await prisma.role.findUnique({ where: { role: roleName } });
    if (existing) {
      throw new Error(`Role '${roleName}' already exists`);
    }

    const newRole = await prisma.role.create({
      data: {
        role: roleName,
        description: description,
        uuid: generateUuid(),
      }
    });

    return {
      role: newRole.role,
      description: newRole.description,
      uuid: newRole.uuid
    };
  }

  static async deleteRole(roleName: string) {
    // Check if role is used by any user
    const usersWithRole = await prisma.user_role.count({ where: { role: roleName } });
    if (usersWithRole > 0) {
      throw new Error(`Cannot delete role '${roleName}' because it is assigned to ${usersWithRole} user(s)`);
    }

    // Delete role privileges first to avoid foreign key constraint error
    await prisma.role_privilege.deleteMany({ where: { role: roleName } });
    await prisma.role.delete({ where: { role: roleName } });
    return true;
  }
}
