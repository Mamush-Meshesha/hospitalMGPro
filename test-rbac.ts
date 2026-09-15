import { UserDAL } from './backend/src/dal/user.dal';
import { RoleDAL } from './backend/src/dal/role.dal';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function run() {
  console.log('Testing RBAC logic...');
  try {
    const roleName = 'TestAdminRole';
    
    // Check if role already exists, clean up
    try {
      await RoleDAL.deleteRole(roleName);
      console.log('Cleaned up old role');
    } catch(e) {}
    
    const newRole = await RoleDAL.createRole(roleName, 'A test role');
    console.log('Role created:', newRole);
    
    const username = 'testuser123';
    // Clean up old user
    await prisma.users.deleteMany({ where: { username } });

    const newUser = await UserDAL.createUser({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      username,
      password_plain: 'SecurePass123!',
      role: roleName,
      creatorId: 1
    });
    console.log('User created:', newUser);

    const allUsers = await UserDAL.getAllUsers();
    console.log('Fetched all users, found count:', allUsers.length);
    console.log('First user role:', allUsers.find(u => u.username === username)?.role);

    console.log('Testing login logic...');
    import { loginUser } from './backend/src/services/auth.service';
    const loginResult = await loginUser(username, 'SecurePass123!');
    console.log('Login successful! Token generated.');
    
    // Cleanup
    await UserDAL.deleteUser(newUser.id, 1);
    console.log('RBAC testing completed successfully!');
  } catch (error) {
    console.error('Error in RBAC tests:', error);
  } finally {
    await prisma.$disconnect();
  }
}

run();
