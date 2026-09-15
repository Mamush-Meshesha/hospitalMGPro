import { Request, Response } from 'express';

export const getAll = async (req: Request, res: Response) => { res.status(200).json([]); };
export const create = async (req: Request, res: Response) => { res.status(201).json({}); };
export const getById = async (req: Request, res: Response) => { res.status(200).json({}); };
export const update = async (req: Request, res: Response) => { res.status(200).json({}); };
export const remove = async (req: Request, res: Response) => { res.status(204).send(); };
