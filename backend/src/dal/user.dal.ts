import bcrypt from 'bcrypt';
import crypto from 'crypto';

import { prisma } from '../utils/prisma';
const generateUuid = () => crypto.randomUUID();

export interface CreateUserInput {
  firstName: string;
  lastName: string;
  email?: string;
  username: string;
  password_plain: string;
  role: string;
  creatorId: number;
}

export class UserDAL {
  static async getAllUsers() {
    const usersList = await prisma.users.findMany({
      where: { retired: false },
      include: {
        person_person_id_for_user: {
          include: {
            reverse_person_name_name_for_person: {
              where: { preferred: true, voided: false }
            },
            reverse_person_attribute_identifies_person: {
              where: { voided: false },
              include: { person_attribute_type_defines_attribute_type: true }
            }
          }
        },
        reverse_user_role_user_role_to_users: true
      }
    });

    return usersList.map((u: any) => {
      const person = u.person_person_id_for_user;
      const name = person?.reverse_person_name_name_for_person?.[0];
      
      let email = 'N/A';
      person?.reverse_person_attribute_identifies_person?.forEach((attr: any) => {
        if (attr.person_attribute_type_defines_attribute_type?.name === 'Email') {
          email = attr.value;
        }
      });

      return {
        id: u.user_id,
        username: u.username,
        firstName: name?.given_name || 'Unknown',
        lastName: name?.family_name || 'Unknown',
        email,
        role: u.reverse_user_role_user_role_to_users?.[0]?.role || 'No Role',
        systemId: u.system_id,
        uuid: u.uuid,
        lastLogin: 'Never' // Mock for now
      };
    });
  }

  static async createUser(input: CreateUserInput) {
    // 1. Check if username exists
    const existing = await prisma.users.findFirst({
      where: { username: input.username, retired: false }
    });
    
    if (existing) {
      throw new Error(`Username '${input.username}' is already taken.`);
    }

    // 2. Hash password
    const hashedPassword = await bcrypt.hash(input.password_plain, 10);

    // 3. Generate system_id (e.g., USR-XXXX)
    const systemId = `USR-${Math.floor(Math.random() * 90000) + 10000}`;

    return await prisma.$transaction(async (tx) => {
      // Get next max IDs manually to bypass SQLite sequence bugs
      const maxPerson = await tx.person.findFirst({ orderBy: { person_id: 'desc' } });
      const nextPersonId = (maxPerson?.person_id || 0) + 1;
      
      const maxUser = await tx.users.findFirst({ orderBy: { user_id: 'desc' } });
      const nextUserId = (maxUser?.user_id || 0) + 1;

      // Create Person
      const person = await tx.person.create({
        data: {
          person_id: nextPersonId,
          gender: 'O',
          birthdate: new Date(),
          dead: false,
          creator: input.creatorId,
          date_created: new Date(),
          voided: false,
          uuid: generateUuid(),
          birthdate_estimated: true,
          deathdate_estimated: false,
        }
      });

      // Create PersonName
      await tx.person_name.create({
        data: {
          person_id: person.person_id,
          given_name: input.firstName,
          family_name: input.lastName,
          preferred: true,
          creator: input.creatorId,
          date_created: new Date(),
          voided: false,
          uuid: generateUuid()
        }
      });

      // Create Email Attribute if provided
      if (input.email) {
        // Find Email attribute type
        const attrType = await tx.person_attribute_type.findFirst({
          where: { name: 'Email' }
        });

        if (attrType) {
          await tx.person_attribute.create({
            data: {
              person_id: person.person_id,
              value: input.email,
              person_attribute_type_id: attrType.person_attribute_type_id,
              creator: input.creatorId,
              date_created: new Date(),
              voided: false,
              uuid: generateUuid()
            }
          });
        }
      }

      // Create User
      const user = await tx.users.create({
        data: {
          user_id: nextUserId,
          person_id: person.person_id,
          system_id: systemId,
          username: input.username,
          password: hashedPassword,
          creator: input.creatorId,
          date_created: new Date(),
          retired: false,
          uuid: generateUuid()
        }
      });

      // Assign Role
      await tx.user_role.create({
        data: {
          user_id: user.user_id,
          role: input.role
        }
      });

      return {
        id: user.user_id,
        username: user.username,
        systemId: user.system_id,
        role: input.role
      };
    });
  }

  static async deleteUser(userId: number, retiredBy: number) {
    // Soft delete user
    await prisma.users.update({
      where: { user_id: userId },
      data: {
        retired: true,
        retired_by: retiredBy,
        date_retired: new Date(),
        retire_reason: 'Admin deleted'
      }
    });
    return true;
  }
}
