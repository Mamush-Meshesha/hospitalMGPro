
import { prisma } from '../utils/prisma';

/**
 * Fetch all privileges a user has, including inherited privileges from child roles.
 */
export const getUserPrivileges = async (userId: number): Promise<Set<string>> => {
  const privileges = new Set<string>();

  // 1. Get user's direct roles
  const userRoles = await prisma.user_role.findMany({
    where: { user_id: userId }
  });

  const rolesToProcess = userRoles.map(ur => ur.role);
  const processedRoles = new Set<string>();

  // 2. Expand all roles (including inherited)
  while (rolesToProcess.length > 0) {
    const currentRole = rolesToProcess.pop()!;
    
    if (processedRoles.has(currentRole)) {
      continue;
    }
    
    processedRoles.add(currentRole);

    // Get privileges for this role
    const rolePrivileges = await prisma.role_privilege.findMany({
      where: { role: currentRole }
    });

    for (const rp of rolePrivileges) {
      privileges.add(rp.privilege);
    }

    // Get inherited roles (OpenMRS: if A is parent of B, A inherits B's privileges)
    // role_role: parent_role inherits child_role
    const childRoles = await prisma.role_role.findMany({
      where: { parent_role: currentRole }
    });

    for (const cr of childRoles) {
      if (!processedRoles.has(cr.child_role)) {
        rolesToProcess.push(cr.child_role);
      }
    }
  }

  // 3. Superuser check (Optional: If they have 'Superuser' role, they bypass checks)
  if (processedRoles.has('Superuser') || processedRoles.has('System Developer')) {
    // We can add a wildcard privilege if needed, but explicitly listing privileges is safer.
  }

  return privileges;
};

/**
 * Check if user has specific privilege
 */
export const hasPrivilege = async (userId: number, requiredPrivilege: string): Promise<boolean> => {
  if (userId === 1) return true; // Superadmin always has access
  const privileges = await getUserPrivileges(userId);
  return privileges.has(requiredPrivilege) || privileges.has('Superuser');
};
