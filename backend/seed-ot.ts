import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function run() {
  let otLocation = await prisma.location.findFirst({
    where: { name: 'Main Operation Theatre' }
  });

  if (!otLocation) {
    otLocation = await prisma.location.create({
      data: {
        name: 'Main Operation Theatre',
        description: 'Primary Operating Theatre',
        creator: 1,
        date_created: new Date(),
        retired: false,
        uuid: uuidv4()
      }
    });
    console.log('Created OT Location');
  }

  let surgerySpeciality = await prisma.appointment_speciality.findFirst({
    where: { name: 'Surgery' }
  });

  if (!surgerySpeciality) {
    surgerySpeciality = await prisma.appointment_speciality.create({
      data: {
        name: 'Surgery',
        uuid: uuidv4(),
        creator: 1,
        date_created: new Date()
      }
    });
  }

  const services = [
    { name: 'General Surgery', desc: 'Standard General Surgery' },
    { name: 'Orthopedic Surgery', desc: 'Bone and joint surgery' }
  ];

  for (const s of services) {
    let existingService = await prisma.appointment_service.findFirst({
      where: { name: s.name }
    });

    if (!existingService) {
      await prisma.appointment_service.create({
        data: {
          name: s.name,
          description: s.desc,
          uuid: uuidv4(),
          creator: 1,
          date_created: new Date(),
          voided: false,
          location_id: otLocation.location_id,
          speciality_id: surgerySpeciality.speciality_id,
          initial_appointment_status: 'Scheduled',
          duration_mins: 120,
          color: '#ef4444'
        }
      });
      console.log(`Created Service: ${s.name}`);
    }
  }

  console.log('OT Seed Complete');
}

run().catch(console.error).finally(() => prisma.$disconnect());
