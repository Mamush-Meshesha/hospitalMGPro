import { PatientDAL } from './src/dal/patient.dal';
(async () => {
  try {
    const res = await PatientDAL.createPatient({
      givenName: "Test",
      familyName: "User",
      gender: "M",
      birthdate: new Date(),
      email: "test@example.com",
      phone: "123456789",
      creatorId: 1
    });
    console.log("Success:", res);
  } catch (e) {
    console.error("Error:", e);
  }
})();
