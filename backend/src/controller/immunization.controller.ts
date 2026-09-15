import { Request, Response } from 'express';
import { ImmunizationDAL } from '../dal/immunization.dal';

export class ImmunizationController {
  static async getImmunizations(req: Request, res: Response) {
    try {
      const patientId = parseInt(req.params.id);
      if (isNaN(patientId)) return res.status(400).json({ error: 'Invalid patient ID' });
      
      const immunizations = await ImmunizationDAL.getPatientImmunizations(patientId);
      return res.json({ results: immunizations });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to fetch immunizations' });
    }
  }

  static async recordImmunization(req: Request, res: Response) {
    try {
      const patientId = parseInt(req.params.id);
      if (isNaN(patientId)) return res.status(400).json({ error: 'Invalid patient ID' });
      
      const { conceptId, dateAdministered } = req.body;
      if (!conceptId || !dateAdministered) return res.status(400).json({ error: 'conceptId and dateAdministered required' });

      // creatorId could be pulled from auth token, hardcoding 1 for now
      await ImmunizationDAL.recordImmunization(patientId, parseInt(conceptId), new Date(dateAdministered), 1);
      
      return res.status(201).json({ message: 'Immunization recorded successfully' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to record immunization' });
    }
  }
}
