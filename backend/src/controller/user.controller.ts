import { Request, Response } from 'express';
import { UserDAL } from '../dal/user.dal';
import { z } from 'zod';

const createUserSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email format').optional().or(z.literal('')),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.string().min(1, 'Role is required'),
});

export const getAll = async (req: Request, res: Response) => {
  try {
    const users = await UserDAL.getAllUsers();
    res.status(200).json(users);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const create = async (req: Request, res: Response) => {
  try {
    const validatedData = createUserSchema.parse(req.body);
    const creatorId = Number(req.user?.userId || 1);

    const newUser = await UserDAL.createUser({
      firstName: validatedData.firstName,
      lastName: validatedData.lastName,
      email: validatedData.email,
      username: validatedData.username,
      password_plain: validatedData.password,
      role: validatedData.role,
      creatorId
    });

    res.status(201).json(newUser);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};

export const getById = async (req: Request, res: Response) => { res.status(200).json({}); };
export const update = async (req: Request, res: Response) => { res.status(200).json({}); };

export const remove = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    const retiredBy = Number(req.user?.userId || 1);
    await UserDAL.deleteUser(userId, retiredBy);
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
