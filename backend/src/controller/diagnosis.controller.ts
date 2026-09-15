import { Request, Response } from 'express';
import { DiagnosisDAL } from '../dal/diagnosis.dal';

export class DiagnosisController {
  static async addDiagnosis(req: Request, res: Response) {
    try {
      const { encounterId, patientId, diagnosisCoded, diagnosisNonCoded, certainty } = req.body;
      
      if (!encounterId || !patientId || !certainty) {
        return res.status(400).json({ error: 'encounterId, patientId, and certainty are required' });
      }
      
      if (!diagnosisCoded && !diagnosisNonCoded) {
        return res.status(400).json({ error: 'Either diagnosisCoded or diagnosisNonCoded must be provided' });
      }

      const diagnosis = await DiagnosisDAL.addEncounterDiagnosis({
        encounterId: parseInt(encounterId),
        patientId: parseInt(patientId),
        diagnosisCoded: diagnosisCoded ? parseInt(diagnosisCoded) : undefined,
        diagnosisNonCoded,
        certainty,
        creatorId: 1 // TODO: extract from auth
      });

      return res.status(201).json({ message: 'Diagnosis added', results: diagnosis });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to add diagnosis' });
    }
  }
}
