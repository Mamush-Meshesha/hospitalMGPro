import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

const prisma = new PrismaClient();
const generateUuid = () => crypto.randomUUID();

async function main() {
  console.log('🌱 Starting Enterprise Database Seed for Phase 4...');

  // 0. Default Tenant
  const defaultTenant = await prisma.tenant.upsert({
    where: { tenant_id: 1 },
    update: {},
    create: {
      tenant_id: 1,
      name: 'Default Hospital',
      domain: 'default',
      active: true,
    }
  });

  // 1. Core Users and Roles
  const passwordHash = await bcrypt.hash('Admin123', 10);
  
  await prisma.$executeRawUnsafe('SET session_replication_role = replica;');

  let adminUser = await prisma.users.findFirst({ where: { username: 'admin' } });
  if (!adminUser) {
    const adminPerson = await prisma.person.create({
      data: {
        person_id: 1, gender: 'M', dead: false, creator: 1, date_created: new Date(),
        voided: false, uuid: generateUuid(), birthdate_estimated: false, deathdate_estimated: false
      }
    });

    adminUser = await prisma.users.create({
      data: {
        user_id: 1, person_id: 1, system_id: 'ADMIN', username: 'admin', password: passwordHash,
        salt: 'salt', uuid: generateUuid(), creator: 1, date_created: new Date(), retired: false
      }
    });
  }

  // 2. Locations
  const locationsData = [
    { name: 'General Ward A', uuid: generateUuid(), creator: 1, date_created: new Date(), retired: false },
    { name: 'Laboratory', uuid: generateUuid(), creator: 1, date_created: new Date(), retired: false },
    { name: 'Radiology', uuid: generateUuid(), creator: 1, date_created: new Date(), retired: false },
    { name: 'Pharmacy', uuid: generateUuid(), creator: 1, date_created: new Date(), retired: false },
  ];
  for (const loc of locationsData) {
    const exists = await prisma.location.findFirst({ where: { name: loc.name } });
    if (!exists) await prisma.location.create({ data: loc });
  }
  const labLoc = await prisma.location.findFirst({ where: { name: 'Laboratory' } });

  // 2.5 Location Attribute Types
  let totalCapacityAttr = await prisma.location_attribute_type.findFirst({ where: { name: 'Total Capacity' } });
  if (!totalCapacityAttr) {
    totalCapacityAttr = await prisma.location_attribute_type.create({
      data: {
        name: 'Total Capacity',
        description: 'Total number of beds available in this location',
        datatype: 'integer',
        min_occurs: 0,
        max_occurs: 1,
        creator: 1,
        date_created: new Date(),
        uuid: generateUuid(),
        retired: false
      }
    });
  }

  // 3. Concept Dictionary
  let classNumeric = await prisma.concept_class.findFirst({ where: { name: 'Numeric' } });
  if (!classNumeric) {
    classNumeric = await prisma.concept_class.create({
      data: { name: 'Numeric', description: 'Numeric', creator: 1, date_created: new Date(), uuid: generateUuid(), retired: false }
    });
  }

  let dtNumeric = await prisma.concept_datatype.findFirst({ where: { name: 'Numeric' } });
  if (!dtNumeric) {
    dtNumeric = await prisma.concept_datatype.create({
      data: { name: 'Numeric', description: 'Numeric', creator: 1, date_created: new Date(), uuid: generateUuid(), retired: false }
    });
  }

  const conceptsData = [
    { concept_id: 5085, name: 'Systolic Blood Pressure', class_id: classNumeric.concept_class_id, datatype_id: dtNumeric.concept_datatype_id },
    { concept_id: 5086, name: 'Diastolic Blood Pressure', class_id: classNumeric.concept_class_id, datatype_id: dtNumeric.concept_datatype_id },
    { concept_id: 5087, name: 'Pulse (Heart Rate)', class_id: classNumeric.concept_class_id, datatype_id: dtNumeric.concept_datatype_id },
    { concept_id: 5088, name: 'Temperature', class_id: classNumeric.concept_class_id, datatype_id: dtNumeric.concept_datatype_id },
    { concept_id: 5092, name: 'Blood Oxygen Saturation (SpO2)', class_id: classNumeric.concept_class_id, datatype_id: dtNumeric.concept_datatype_id },
    { concept_id: 1000, name: 'Complete Blood Count (CBC)', class_id: classNumeric.concept_class_id, datatype_id: dtNumeric.concept_datatype_id }, // Test
    { concept_id: 1001, name: 'Chest X-Ray', class_id: classNumeric.concept_class_id, datatype_id: dtNumeric.concept_datatype_id }, // Test
    { concept_id: 886, name: 'BCG Vaccine', class_id: classNumeric.concept_class_id, datatype_id: dtNumeric.concept_datatype_id }, // Vaccine
    { concept_id: 1030, name: 'Hepatitis B Vaccine', class_id: classNumeric.concept_class_id, datatype_id: dtNumeric.concept_datatype_id }, // Vaccine
    { concept_id: 781, name: 'Polio Vaccine', class_id: classNumeric.concept_class_id, datatype_id: dtNumeric.concept_datatype_id } // Vaccine
  ];

  for (const c of conceptsData) {
    const exists = await prisma.concept.findUnique({ where: { concept_id: c.concept_id } });
    if (!exists) {
      await prisma.concept.create({
        data: {
          concept_id: c.concept_id,
          class_id: c.class_id,
          datatype_id: c.datatype_id,
          creator: 1,
          date_created: new Date(),
          retired: false,
          uuid: generateUuid(),
          is_set: false
        }
      });
      await prisma.concept_name.create({
        data: {
          concept_id: c.concept_id,
          name: c.name,
          locale: 'en',
          creator: 1,
          date_created: new Date(),
          voided: false,
          uuid: generateUuid(),
          concept_name_type: 'FULLY_SPECIFIED'
        }
      });
    }
  }

  // 4. Patients
  const patientsData = [
    { id: 10, gender: 'M', first: 'James', last: 'Wilson' },
    { id: 11, gender: 'F', first: 'Sarah', last: 'Connor' },
    { id: 12, gender: 'F', first: 'Emma', last: 'Stone' }
  ];

  for (const p of patientsData) {
    const exists = await prisma.person.findUnique({ where: { person_id: p.id } });
    if (!exists) {
      await prisma.person.create({
        data: {
          person_id: p.id, gender: p.gender, dead: false, creator: 1, date_created: new Date(),
          voided: false, uuid: generateUuid(), birthdate_estimated: false, deathdate_estimated: false
        }
      });
      await prisma.patient.create({
        data: {
          patient_id: p.id, creator: 1, date_created: new Date(), voided: false, allergy_status: 'Unknown'
        }
      });
    }
  }

  // 5. Providers
  const provider = await prisma.provider.upsert({
    where: { provider_id: 1 },
    update: {},
    create: {
      provider_id: 1, person_id: 1, name: 'Dr. Gregory House', creator: 1, date_created: new Date(),
      retired: false, uuid: generateUuid()
    }
  });

  // 6. Care Setting & Order Types
  let careSetting = await prisma.care_setting.findFirst({ where: { care_setting_id: 1 } });
  if (!careSetting) {
    careSetting = await prisma.care_setting.create({
      data: { care_setting_id: 1, name: 'Inpatient', care_setting_type: 'INPATIENT', creator: 1, date_created: new Date(), uuid: generateUuid(), retired: false }
    });
  }

  let labOrderType = await prisma.order_type.findFirst({ where: { order_type_id: 2 } });
  if (!labOrderType) {
    labOrderType = await prisma.order_type.create({
      data: { order_type_id: 2, name: 'Lab Test', java_class_name: 'org.openmrs.TestOrder', creator: 1, date_created: new Date(), uuid: generateUuid(), retired: false }
    });
  }

  let radOrderType = await prisma.order_type.findFirst({ where: { order_type_id: 3 } });
  if (!radOrderType) {
    radOrderType = await prisma.order_type.create({
      data: { order_type_id: 3, name: 'Radiology', java_class_name: 'org.openmrs.TestOrder', creator: 1, date_created: new Date(), uuid: generateUuid(), retired: false }
    });
  }
  
  // Encounter Type
  let encType = await prisma.encounter_type.findFirst({ where: { encounter_type_id: 1 } });
  if (!encType) {
    encType = await prisma.encounter_type.create({
      data: { encounter_type_id: 1, name: 'Visit', description: 'General Visit', creator: 1, date_created: new Date(), retired: false, uuid: generateUuid() }
    });
  }

  // 7. Seed Encounters, Orders, Observations
  for (const p of patientsData) {
    const enc = await prisma.encounter.create({
      data: {
        encounter_type: 1, patient_id: p.id, location_id: labLoc?.location_id || 1, encounter_datetime: new Date(),
        creator: 1, date_created: new Date(), voided: false, uuid: generateUuid()
      }
    });

    // Observations (Vitals)
    await prisma.obs.create({
      data: { person_id: p.id, concept_id: 5087, encounter_id: enc.encounter_id, obs_datetime: new Date(), value_numeric: Math.floor(Math.random() * (100 - 60) + 60), creator: 1, date_created: new Date(), uuid: generateUuid(), voided: false, status: 'FINAL' }
    });
    await prisma.obs.create({
      data: { person_id: p.id, concept_id: 5085, encounter_id: enc.encounter_id, obs_datetime: new Date(), value_numeric: Math.floor(Math.random() * (140 - 110) + 110), creator: 1, date_created: new Date(), uuid: generateUuid(), voided: false, status: 'FINAL' }
    });
    await prisma.obs.create({
      data: { person_id: p.id, concept_id: 5092, encounter_id: enc.encounter_id, obs_datetime: new Date(), value_numeric: Math.floor(Math.random() * (100 - 95) + 95), creator: 1, date_created: new Date(), uuid: generateUuid(), voided: false, status: 'FINAL' }
    });

    // Orders
    // Lab Order
    const labOrder = await prisma.orders.create({
      data: {
        patient_id: p.id, orderer: 1, encounter_id: enc.encounter_id, concept_id: 1000, order_type_id: 2, care_setting: 1,
        urgency: "ROUTINE", order_action: "NEW", order_number: `LAB-${Date.now()}-${p.id}`, creator: 1, date_created: new Date(),
        uuid: generateUuid(), instructions: 'Fasting', voided: false
      }
    });
    await prisma.test_order.create({ data: { order_id: labOrder.order_id, clinical_history: 'Routine check' } });

    // Rad Order
    const radOrder = await prisma.orders.create({
      data: {
        patient_id: p.id, orderer: 1, encounter_id: enc.encounter_id, concept_id: 1001, order_type_id: 3, care_setting: 1,
        urgency: p.id === 11 ? "STAT" : "ROUTINE", order_action: "NEW", order_number: `RAD-${Date.now()}-${p.id}`, creator: 1, date_created: new Date(),
        uuid: generateUuid(), instructions: 'RAD Chest X-Ray', voided: false
      }
    });
    await prisma.test_order.create({ data: { order_id: radOrder.order_id, clinical_history: 'Cough' } });

    // Drug Order
    let drugConcept = await prisma.concept.findFirst({ where: { concept_id: 2000 } });
    if (!drugConcept) {
      drugConcept = await prisma.concept.create({
        data: { concept_id: 2000, class_id: classNumeric.concept_class_id, datatype_id: dtNumeric.concept_datatype_id, creator: 1, date_created: new Date(), retired: false, uuid: generateUuid(), is_set: false }
      });
      await prisma.concept_name.create({
        data: { concept_id: 2000, name: 'Amoxicillin 500mg', locale: 'en', creator: 1, date_created: new Date(), voided: false, uuid: generateUuid(), concept_name_type: 'FULLY_SPECIFIED' }
      });
    }

    let drugOrderType = await prisma.order_type.findFirst({ where: { order_type_id: 1 } });
    if (!drugOrderType) {
      drugOrderType = await prisma.order_type.create({
        data: { order_type_id: 1, name: 'Drug', java_class_name: 'org.openmrs.DrugOrder', creator: 1, date_created: new Date(), uuid: generateUuid(), retired: false }
      });
    }

    const drugOrder = await prisma.orders.create({
      data: {
        patient_id: p.id, orderer: 1, encounter_id: enc.encounter_id, concept_id: 2000, order_type_id: 1, care_setting: 1,
        urgency: "ROUTINE", order_action: "NEW", order_number: `DRUG-${Date.now()}-${p.id}`, creator: 1, date_created: new Date(),
        uuid: generateUuid(), instructions: '1 tablet PO every 8 hours', voided: false
      }
    });
    await prisma.drug_order.create({ data: { order_id: drugOrder.order_id, dose: 500, dispense_as_written: true } });
  }

  await prisma.$executeRawUnsafe('SET session_replication_role = DEFAULT;');

  // 8. Inventory & Pharmacy Seeding
  const pharmLoc = await prisma.location.findFirst({ where: { name: 'Pharmacy' } });
  
  // Concept for Amoxicillin
  let amoxConcept = await prisma.concept.findFirst({ where: { concept_id: 2000 } });
  if (!amoxConcept) {
    amoxConcept = await prisma.concept.create({
      data: { concept_id: 2000, class_id: classNumeric.concept_class_id, datatype_id: dtNumeric.concept_datatype_id, creator: 1, date_created: new Date(), retired: false, uuid: generateUuid(), is_set: false }
    });
    await prisma.concept_name.create({
      data: { concept_id: 2000, name: 'Amoxicillin 500mg', locale: 'en', creator: 1, date_created: new Date(), voided: false, uuid: generateUuid(), concept_name_type: 'FULLY_SPECIFIED' }
    });
  }

  // Create Stock Category
  let medCategory = await prisma.concept.findFirst({ where: { concept_id: 2001 } });
  if (!medCategory) {
    medCategory = await prisma.concept.create({
      data: { concept_id: 2001, class_id: classNumeric.concept_class_id, datatype_id: dtNumeric.concept_datatype_id, creator: 1, date_created: new Date(), retired: false, uuid: generateUuid(), is_set: false }
    });
    await prisma.concept_name.create({
      data: { concept_id: 2001, name: 'Medications', locale: 'en', creator: 1, date_created: new Date(), voided: false, uuid: generateUuid(), concept_name_type: 'FULLY_SPECIFIED' }
    });
  }

  // Add Stock Item
  let amoxItem = await prisma.stockmgmt_stock_item.findFirst({ where: { common_name: 'Amoxicillin 500mg Capsule' } });
  if (!amoxItem) {
    amoxItem = await prisma.stockmgmt_stock_item.create({
      data: {
        concept_id: 2000,
        has_expiration: true,
        purchase_price: 1.50,
        common_name: 'Amoxicillin 500mg Capsule',
        is_drug: true,
        category_id: 2001,
        creator: 1,
        date_created: new Date(),
        voided: false,
        uuid: generateUuid()
      }
    });

    // Add initial receipt operation
    const op = await prisma.stockmgmt_stock_operation.create({
      data: {
        operation_type: 'RECEIPT',
        operation_number: `OP-INITIAL-${Date.now()}`,
        operation_date: new Date(),
        destination_id: pharmLoc?.location_id,
        status: 'COMPLETED',
        creator: 1,
        date_created: new Date(),
        voided: false,
        uuid: generateUuid()
      }
    });

    // Create a stock batch
    const batch = await prisma.stockmgmt_stock_batch.create({
      data: {
        stock_item_id: amoxItem.stock_item_id,
        batch_no: 'BATCH-001',
        expiration: new Date(new Date().setFullYear(new Date().getFullYear() + 2)), // 2 years expiration
        quantity: 500,
        location_id: pharmLoc?.location_id,
        creator: 1,
        date_created: new Date(),
        voided: false,
        uuid: generateUuid()
      }
    });

    // Create operation item
    await prisma.stockmgmt_stock_operation_item.create({
      data: {
        stock_operation_id: op.stock_operation_id,
        stock_item_id: amoxItem.stock_item_id,
        stock_batch_id: batch.stock_batch_id,
        quantity: 500,
        creator: 1,
        date_created: new Date(),
        voided: false,
        uuid: generateUuid()
      }
    });
  }

  // Add Ibuprofen
  let ibuConcept = await prisma.concept.findFirst({ where: { concept_id: 2002 } });
  if (!ibuConcept) {
    ibuConcept = await prisma.concept.create({
      data: { concept_id: 2002, class_id: classNumeric.concept_class_id, datatype_id: dtNumeric.concept_datatype_id, creator: 1, date_created: new Date(), retired: false, uuid: generateUuid(), is_set: false }
    });
    await prisma.concept_name.create({
      data: { concept_id: 2002, name: 'Ibuprofen 400mg', locale: 'en', creator: 1, date_created: new Date(), voided: false, uuid: generateUuid(), concept_name_type: 'FULLY_SPECIFIED' }
    });
  }
  
  let ibuItem = await prisma.stockmgmt_stock_item.findFirst({ where: { common_name: 'Ibuprofen 400mg Tablet' } });
  if (!ibuItem) {
    ibuItem = await prisma.stockmgmt_stock_item.create({
      data: {
        concept_id: 2002,
        has_expiration: true,
        purchase_price: 0.50,
        common_name: 'Ibuprofen 400mg Tablet',
        is_drug: true,
        category_id: 2001,
        creator: 1,
        date_created: new Date(),
        voided: false,
        uuid: generateUuid()
      }
    });

    const opIbu = await prisma.stockmgmt_stock_operation.create({
      data: {
        operation_type: 'RECEIPT',
        operation_number: `OP-INITIAL-${Date.now()}-2`,
        operation_date: new Date(),
        destination_id: pharmLoc?.location_id,
        status: 'COMPLETED',
        creator: 1,
        date_created: new Date(),
        voided: false,
        uuid: generateUuid()
      }
    });

    const batchIbu = await prisma.stockmgmt_stock_batch.create({
      data: {
        stock_item_id: ibuItem.stock_item_id,
        batch_no: 'BATCH-002',
        expiration: new Date(new Date().setFullYear(new Date().getFullYear() + 3)),
        quantity: 1000,
        location_id: pharmLoc?.location_id,
        creator: 1,
        date_created: new Date(),
        voided: false,
        uuid: generateUuid()
      }
    });

    await prisma.stockmgmt_stock_operation_item.create({
      data: {
        stock_operation_id: opIbu.stock_operation_id,
        stock_item_id: ibuItem.stock_item_id,
        stock_batch_id: batchIbu.stock_batch_id,
        quantity: 1000,
        creator: 1,
        date_created: new Date(),
        voided: false,
        uuid: generateUuid()
      }
    });
  }

  // 9. Enable PostgreSQL Row-Level Security (RLS)
  console.log('🔒 Enabling Row-Level Security (RLS)...');
  const tenantTables = [
    'users', 'location', 'provider', 'patient', 'visit', 'encounter',
    'obs', 'conditions', 'allergy', 'orders', 'drug_order', 'test_order',
    'referral_order', 'queue', 'queue_entry', 'medication_dispense',
    'cashier_bill', 'stockmgmt_stock_item', 'stockmgmt_stock_batch'
  ];

  for (const table of tenantTables) {
    try {
      await prisma.$executeRawUnsafe(`ALTER TABLE "${table}" ENABLE ROW LEVEL SECURITY;`);
      
      // Drop policy if exists (useful if re-running seed)
      await prisma.$executeRawUnsafe(`DROP POLICY IF EXISTS tenant_isolation_policy ON "${table}";`);
      
      // Create policy: only allow access if tenant_id matches the session variable 'app.current_tenant_id'
      // Or if the session variable is not set (e.g., bypass for super admin / migrations), we could allow it, 
      // but for strict zero-leak, we demand the variable. 
      // We will allow BYPASSRLS for the postgres superuser, but application users must provide the setting.
      await prisma.$executeRawUnsafe(`
        CREATE POLICY tenant_isolation_policy ON "${table}"
        USING (tenant_id = current_setting('app.current_tenant_id', true)::int);
      `);
      
      // Force RLS even for table owners (crucial if the app connects as the owner)
      await prisma.$executeRawUnsafe(`ALTER TABLE "${table}" FORCE ROW LEVEL SECURITY;`);
    } catch (e: any) {
      console.warn(`Warning: Could not enable RLS for ${table}. Error: ${e.message}`);
    }
  }

  console.log('✅ Enterprise Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
