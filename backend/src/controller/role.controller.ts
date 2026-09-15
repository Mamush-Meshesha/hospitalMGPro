import { Request, Response } from 'express';
import { RoleDAL } from '../dal/role.dal';
import { z } from 'zod';

const createRoleSchema = z.object({
  role: z.string().min(1, 'Role name is required'),
  description: z.string().optional().or(z.literal('')),
});

export const getAll = async (req: Request, res: Response) => {
  try {
    const roles = await RoleDAL.getAllRoles();
    res.status(200).json(roles);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllPrivileges = async (req: Request, res: Response) => {
  try {
    const privs = await RoleDAL.getAllPrivileges();
    res.status(200).json(privs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updatePrivileges = async (req: Request, res: Response) => {
  try {
    const roleName = req.params.id;
    const { privileges } = req.body;
    if (!Array.isArray(privileges)) {
      return res.status(400).json({ error: 'privileges must be an array of strings' });
    }
    await RoleDAL.updateRolePrivileges(roleName, privileges);
    res.status(200).json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const create = async (req: Request, res: Response) => {
  try {
    const validatedData = createRoleSchema.parse(req.body);
    const newRole = await RoleDAL.createRole(validatedData.role, validatedData.description || '');
    res.status(201).json(newRole);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    res.status(400).json({ error: error.message });
  }
};

export const getById = async (req: Request, res: Response) => { res.status(200).json({}); };
export const update = async (req: Request, res: Response) => { res.status(200).json({}); };

export const remove = async (req: Request, res: Response) => {
  try {
    const roleName = req.params.id; // role is passed as ID parameter in string
    await RoleDAL.deleteRole(roleName);
    res.status(204).send();
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
