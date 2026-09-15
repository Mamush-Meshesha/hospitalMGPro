import { PatientDAL } from './src/dal/patient.dal';

async function check() {
  try {
    const patients = await PatientDAL.getAllPatients();
    console.log(patients);
  } catch (err) {
    console.error("ERROR CAUGHT:");
    console.error(err);
  } finally {
    process.exit(0);
  }
}
check();
