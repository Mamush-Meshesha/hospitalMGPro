import { Router } from 'express';
import { Request, Response } from 'express';
import { PatientProgramDAL } from '../../dal/patientProgram.dal';

const router = Router();

router.get('/patient/:id', async (req: Request, res: Response) => {
  try {
    const data = await PatientProgramDAL.getPatientPrograms(parseInt(req.params.id));
    return res.json(data);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to fetch programs' });
  }
});

router.post('/patient/:id', async (req: Request, res: Response) => {
  try {
    console.log("ENROLL PATIENT BODY:", req.body);
    const data = await PatientProgramDAL.enrollPatient({
      patientId: parseInt(req.params.id),
      programId: req.body.programId || req.body.program_id,
      locationId: req.body.locationId || req.body.location_id || null,
      dateEnrolled: new Date(req.body.dateEnrolled || req.body.date_enrolled || Date.now()),
      creatorId: 1 // TODO: get from auth token
    });
    return res.status(201).json(data);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to enroll in program' });
  }
});

export default router;
