import { Request, Response } from 'express';
import { PatientChartDAL } from '../dal/patientChart.dal';

export class PatientChartController {
  static async getFullChart(req: Request, res: Response) {
    try {
      const patientId = parseInt(req.params.id);
      if (isNaN(patientId)) return res.status(400).json({ error: 'Invalid patient ID' });
      
      const privileges = req.user?.privileges as string[] | undefined;
      const authLocationId = req.locationId;
      const chart = await PatientChartDAL.getFullPatientChart(patientId, privileges, authLocationId);
      return res.json(chart);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to fetch patient chart' });
    }
  }

  static async getVitals(req: Request, res: Response) {
    try {
      const privileges = req.user?.privileges as string[] | undefined;
      const authLocationId = req.locationId;
      const vitals = await PatientChartDAL.getPatientVitals(parseInt(req.params.id), privileges, authLocationId);
      return res.json({ results: vitals });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to fetch vitals' });
    }
  }

  static async postVitals(req: Request, res: Response) {
    try {
      const patientId = parseInt(req.params.id);
      if (isNaN(patientId)) return res.status(400).json({ error: 'Invalid patient ID' });
      
      const { vitals } = req.body;
      if (!Array.isArray(vitals)) return res.status(400).json({ error: 'vitals must be an array' });

      // creatorId could be pulled from auth token, hardcoding 1 for now
      await PatientChartDAL.addPatientVitals(patientId, vitals, 1);
      
      return res.status(201).json({ message: 'Vitals recorded successfully' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to record vitals' });
    }
  }

  static async getConditions(req: Request, res: Response) {
    try {
      const conditions = await PatientChartDAL.getPatientConditions(parseInt(req.params.id));
      return res.json({ results: conditions });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to fetch conditions' });
    }
  }

  static async getAllergies(req: Request, res: Response) {
    try {
      const allergies = await PatientChartDAL.getPatientAllergies(parseInt(req.params.id));
      return res.json({ results: allergies });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to fetch allergies' });
    }
  }

  static async getNotes(req: Request, res: Response) {
    try {
      const notes = await PatientChartDAL.getPatientNotes(parseInt(req.params.id));
      return res.json({ results: notes });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to fetch notes' });
    }
  }

  static async getOrders(req: Request, res: Response) {
    try {
      const privileges = req.user?.privileges as string[] | undefined;
      const authLocationId = req.locationId;
      const orders = await PatientChartDAL.getPatientOrders(parseInt(req.params.id), privileges, authLocationId);
      return res.json({ results: orders });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to fetch orders' });
    }
  }

  static async postCondition(req: Request, res: Response) {
    try {
      const patientId = parseInt(req.params.id);
      if (isNaN(patientId)) return res.status(400).json({ error: 'Invalid patient ID' });
      await PatientChartDAL.addPatientCondition(patientId, req.body, 1);
      return res.status(201).json({ message: 'Condition recorded successfully' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to record condition' });
    }
  }

  static async postAllergy(req: Request, res: Response) {
    try {
      const patientId = parseInt(req.params.id);
      if (isNaN(patientId)) return res.status(400).json({ error: 'Invalid patient ID' });
      await PatientChartDAL.addPatientAllergy(patientId, req.body, 1);
      return res.status(201).json({ message: 'Allergy recorded successfully' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to record allergy' });
    }
  }

  static async postNote(req: Request, res: Response) {
    try {
      const patientId = parseInt(req.params.id);
      if (isNaN(patientId)) return res.status(400).json({ error: 'Invalid patient ID' });
      await PatientChartDAL.addPatientNote(patientId, req.body, 1);
      return res.status(201).json({ message: 'Note recorded successfully' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to record note' });
    }
  }

  static async postImmunization(req: Request, res: Response) {
    try {
      const patientId = parseInt(req.params.id);
      if (isNaN(patientId)) return res.status(400).json({ error: 'Invalid patient ID' });
      await PatientChartDAL.addPatientImmunization(patientId, req.body, 1);
      return res.status(201).json({ message: 'Immunization recorded successfully' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to record immunization' });
    }
  }

  static async postOrder(req: Request, res: Response) {
    try {
      const patientId = parseInt(req.params.id);
      if (isNaN(patientId)) return res.status(400).json({ error: 'Invalid patient ID' });
      await PatientChartDAL.addPatientOrder(patientId, req.body, 1);
      return res.status(201).json({ message: 'Order recorded successfully' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to record order' });
    }
  }

  static async postMedication(req: Request, res: Response) {
    try {
      const patientId = parseInt(req.params.id);
      if (isNaN(patientId)) return res.status(400).json({ error: 'Invalid patient ID' });
      await PatientChartDAL.addPatientMedication(patientId, req.body, 1);
      return res.status(201).json({ message: 'Medication recorded successfully' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to record medication' });
    }
  }
}
