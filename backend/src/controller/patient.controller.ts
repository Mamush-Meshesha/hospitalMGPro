import { Request, Response } from 'express';
import { z } from 'zod';
import { PatientDAL } from '../dal/patient.dal';

// Validation Schema
const createPatientSchema = z.object({
  givenName: z.string().min(1, "Given name is required"),
  familyName: z.string().min(1, "Family name is required"),
  gender: z.enum(["M", "F", "O"], { errorMap: () => ({ message: "Gender must be M, F, or O" }) }),
  birthdate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid date format",
  }),
  email: z.string().optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal(''))
});

export const create = async (req: Request, res: Response) => {
  try {
    // 1. Validate incoming JSON payload
    const validatedData = createPatientSchema.parse(req.body);

    // 2. Ensure user is authenticated (from requireAuth middleware)
    const creatorId = req.user?.userId;
    if (!creatorId) {
      return res.status(401).json({ error: 'Unauthorized: User missing' });
    }

    // 3. Call Data Access Layer
    const newPatient = await PatientDAL.createPatient({
      givenName: validatedData.givenName,
      familyName: validatedData.familyName,
      gender: validatedData.gender,
      birthdate: new Date(validatedData.birthdate),
      email: validatedData.email,
      phone: validatedData.phone,
      creatorId: Number(creatorId),
    });

    // 4. Return formatted response (OpenMRS style 201 Created)
    res.status(201).json(newPatient);

    } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Validation failed", details: error.errors });
    }
    console.error("Patient Creation Error:", error.stack || error);
    res.status(500).json({ error: `Internal Server Error while creating patient: ${error.message}` });
  }
};

export const getAll = async (req: Request, res: Response) => {
  try {
    // Fetch all active patients (global patient index)
    const patients = await PatientDAL.getAllPatients();
    res.status(200).json({ results: patients });
  } catch (error: any) {
    console.error("Patient Fetch Error:", error);
    res.status(500).json({ error: "Internal Server Error while fetching patients" });
  }
};

export const globalSearch = async (req: Request, res: Response) => {
  try {
    const query = req.query.q as string;
    if (!query || query.length < 3) {
      return res.status(400).json({ error: "Search query 'q' must be at least 3 characters long." });
    }

    // Log the override since this bypasses RLS
    console.log(`[AUDIT] User ${req.user?.userId} performed GLOBAL PATIENT SEARCH with query: "${query}"`);
    
    const patients = await PatientDAL.globalSearch(query);
    res.status(200).json({ results: patients });
  } catch (error: any) {
    console.error("Global Patient Search Error:", error);
    res.status(500).json({ error: "Internal Server Error during global search" });
  }
};

export const getById = async (req: Request, res: Response) => {
  res.status(501).json({ error: 'Not Implemented Yet' });
};

export const update = async (req: Request, res: Response) => {
  res.status(501).json({ error: 'Not Implemented Yet' });
};

export const remove = async (req: Request, res: Response) => {
  res.status(501).json({ error: 'Not Implemented Yet' });
};

// Merge endpoint validation
const mergeSchema = z.object({
  preferredUuid: z.string().uuid("Invalid preferred UUID"),
  nonPreferredUuid: z.string().uuid("Invalid non-preferred UUID")
});

export const merge = async (req: Request, res: Response) => {
  try {
    const validatedData = mergeSchema.parse(req.body);
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const result = await PatientDAL.mergePatients(
      validatedData.preferredUuid,
      validatedData.nonPreferredUuid,
      userId
    );

    res.status(200).json(result);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Validation failed", details: error.errors });
    }
    console.error("Patient Merge Error:", error);
    res.status(500).json({ error: error.message || "Internal Server Error during merge" });
  }
};
