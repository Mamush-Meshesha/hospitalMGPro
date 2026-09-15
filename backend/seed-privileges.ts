import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();
const generateUuid = () => crypto.randomUUID();

const privileges = [
  { privilege: 'VIEW_DASHBOARD', description: 'View the main dashboard' },
  { privilege: 'VIEW_PATIENTS', description: 'View the patients list and hub' },
  { privilege: 'ADD_PATIENT', description: 'Register a new patient' },
  { privilege: 'EDIT_PATIENT', description: 'Edit patient demographics' },
  { privilege: 'DELETE_PATIENT', description: 'Delete or void a patient' },
  { privilege: 'VIEW_VISITS', description: 'View active visits and wards' },
  { privilege: 'VIEW_ENCOUNTERS', description: 'View clinical encounters' },
  { privilege: 'ADD_ENCOUNTER', description: 'Create a new clinical encounter' },
  { privilege: 'VIEW_OBS', description: 'View clinical observations' },
  { privilege: 'ADD_OBS', description: 'Record new clinical observations' },
  { privilege: 'VIEW_PROGRAMS', description: 'View patient programs' },
  { privilege: 'VIEW_COHORTS', description: 'View patient cohorts' },
  { privilege: 'VIEW_QUEUES', description: 'View hospital queues' },
  { privilege: 'VIEW_ORDERS', description: 'View clinical orders (CPOE)' },
  { privilege: 'ADD_ORDER', description: 'Create new clinical orders (prescriptions, labs)' },
  { privilege: 'VIEW_PHARMACY', description: 'View pharmacy queue' },
  { privilege: 'DISPENSE_MEDICATION', description: 'Dispense medication to patients' },
  { privilege: 'VIEW_INVENTORY', description: 'View inventory and product master' },
  { privilege: 'MANAGE_PRODUCT_MASTER', description: 'Create and edit products, categories, UOMs' },
  { privilege: 'MANAGE_SUPPLIERS', description: 'Manage supplier and vendor data' },
  { privilege: 'MANAGE_PURCHASE_ORDERS', description: 'Create and approve purchase orders' },
  { privilege: 'MANAGE_WAREHOUSES', description: 'Create and edit warehouse locations and bins' },
  { privilege: 'MANAGE_STOCK_MOVEMENTS', description: 'Transfer stock between warehouses' },
  { privilege: 'RECEIVE_STOCK', description: 'Process goods receipt notes (GRN)' },
  { privilege: 'VIEW_SYSTEM_RBAC', description: 'View Users and Roles' },
  { privilege: 'MANAGE_SYSTEM_RBAC', description: 'Add, edit, or delete Users and Roles' },
  { privilege: 'VIEW_SYSTEM_CONFIG', description: 'View system configuration' },
  { privilege: 'MANAGE_SYSTEM_CONFIG', description: 'Change system configuration' },
  { privilege: 'MANAGE_BEDS', description: 'Create and manage individual beds in locations' },
  { privilege: 'VIEW_BILLING', description: 'View patient billing and invoices' },
  { privilege: 'MANAGE_BILLING', description: 'Process payments and edit bills' },
  { privilege: 'VIEW_LAB', description: 'View laboratory module' },
  { privilege: 'MANAGE_LAB', description: 'Enter lab results and manage samples' },

  // OpenMRS Atomic Privileges
  { privilege: 'Get Encounters', description: 'Get Encounters' },
  { privilege: 'Add Encounters', description: 'Add Encounters' },
  { privilege: 'Edit Encounters', description: 'Edit Encounters' },
  { privilege: 'Delete Encounters', description: 'Delete Encounters' },
  { privilege: 'View Encounters', description: 'View Encounters' },
  
  { privilege: 'Get Observations', description: 'Get Observations' },
  { privilege: 'Add Observations', description: 'Add Observations' },
  { privilege: 'Edit Observations', description: 'Edit Observations' },
  { privilege: 'Delete Observations', description: 'Delete Observations' },
  { privilege: 'View Observations', description: 'View Observations' },
  
  { privilege: 'Get Orders', description: 'Get Orders' },
  { privilege: 'Add Orders', description: 'Add Orders' },
  { privilege: 'Edit Orders', description: 'Edit Orders' },
  { privilege: 'Delete Orders', description: 'Delete Orders' },
  { privilege: 'View Orders', description: 'View Orders' },

  { privilege: 'Get Allergies', description: 'Get Allergies' },
  { privilege: 'Add Allergies', description: 'Add Allergies' },
  { privilege: 'Edit Allergies', description: 'Edit Allergies' },
  { privilege: 'Remove Allergies', description: 'Remove Allergies' },
  { privilege: 'View Allergies', description: 'View Allergies' },

  { privilege: 'Get Conditions', description: 'Get Conditions' },
  { privilege: 'Edit Conditions', description: 'Edit Conditions' },
  { privilege: 'Delete Conditions', description: 'Delete Conditions' },

  { privilege: 'Get Patients', description: 'Get Patients' },
  { privilege: 'Add Patients', description: 'Add Patients' },
  { privilege: 'Edit Patients', description: 'Edit Patients' },
  { privilege: 'Delete Patients', description: 'Delete Patients' },
  { privilege: 'View Patients', description: 'View Patients' },

  { privilege: 'Get People', description: 'Get People' },
  { privilege: 'Add People', description: 'Add People' },
  { privilege: 'Edit People', description: 'Edit People' },
  { privilege: 'Delete People', description: 'Delete People' },
  { privilege: 'View People', description: 'View People' },

  { privilege: 'Get Patient Cohorts', description: 'Get Patient Cohorts' },
  { privilege: 'Add Cohorts', description: 'Add Cohorts' },
  { privilege: 'Edit Cohorts', description: 'Edit Cohorts' },
  { privilege: 'Delete Cohorts', description: 'Delete Cohorts' },
  { privilege: 'View Patient Cohorts', description: 'View Patient Cohorts' },

  { privilege: 'Get Relationships', description: 'Get Relationships' },
  { privilege: 'Add Relationships', description: 'Add Relationships' },
  { privilege: 'Edit Relationships', description: 'Edit Relationships' },
  { privilege: 'Delete Relationships', description: 'Delete Relationships' },
  { privilege: 'View Relationships', description: 'View Relationships' },

  { privilege: 'Get Visits', description: 'Get Visits' },
  { privilege: 'Add Visits', description: 'Add Visits' },
  { privilege: 'Edit Visits', description: 'Edit Visits' },
  { privilege: 'Delete Visits', description: 'Delete Visits' },
  { privilege: 'Configure Visits', description: 'Configure Visits' },

  { privilege: 'Get Concepts', description: 'Get Concepts' },
  { privilege: 'Manage Concepts', description: 'Manage Concepts' },
  { privilege: 'View Concepts', description: 'View Concepts' },

  { privilege: 'Get Concept Classes', description: 'Get Concept Classes' },
  { privilege: 'Manage Concept Classes', description: 'Manage Concept Classes' },
  
  { privilege: 'Get Concept Datatypes', description: 'Get Concept Datatypes' },
  { privilege: 'Manage Concept Datatypes', description: 'Manage Concept Datatypes' },

  { privilege: 'Add Concept Proposals', description: 'Add Concept Proposals' },
  { privilege: 'Edit Concept Proposals', description: 'Edit Concept Proposals' },
  { privilege: 'Delete Concept Proposals', description: 'Delete Concept Proposals' },
  { privilege: 'View Concept Proposals', description: 'View Concept Proposals' },

  { privilege: 'Get Users', description: 'Get Users' },
  { privilege: 'Add Users', description: 'Add Users' },
  { privilege: 'Edit Users', description: 'Edit Users' },
  { privilege: 'Delete Users', description: 'Delete Users' },
  { privilege: 'View Users', description: 'View Users' },
  { privilege: 'Edit User Passwords', description: 'Edit User Passwords' },

  { privilege: 'Get Roles', description: 'Get Roles' },
  { privilege: 'Manage Roles', description: 'Manage Roles' },
  { privilege: 'View Roles', description: 'View Roles' },

  { privilege: 'Get Privileges', description: 'Get Privileges' },
  { privilege: 'Manage Privileges', description: 'Manage Privileges' },
  { privilege: 'View Privileges', description: 'View Privileges' },

  { privilege: 'Get Locations', description: 'Get Locations' },
  { privilege: 'Manage Locations', description: 'Manage Locations' },
  { privilege: 'View Locations', description: 'View Locations' },

  { privilege: 'Get Forms', description: 'Get Forms' },
  { privilege: 'Manage Forms', description: 'Manage Forms' },
  { privilege: 'View Forms', description: 'View Forms' },
  { privilege: 'Form Entry', description: 'Form Entry' },
  { privilege: 'Upload XSN', description: 'Upload XSN' },

  { privilege: 'Get Medication Dispense', description: 'Get Medication Dispense' },
  { privilege: 'Edit Medication Dispense', description: 'Edit Medication Dispense' },
  { privilege: 'Delete Medication Dispense', description: 'Delete Medication Dispense' },

  { privilege: 'Add Reports', description: 'Add Reports' },
  { privilege: 'Edit Reports', description: 'Edit Reports' },
  { privilege: 'Delete Reports', description: 'Delete Reports' },
  { privilege: 'View Reports', description: 'View Reports' },

  { privilege: 'Add HL7 Inbound Queue', description: 'Add HL7 Inbound Queue' },
  { privilege: 'Get HL7 Inbound Queue', description: 'Get HL7 Inbound Queue' },
  { privilege: 'Update HL7 Inbound Queue', description: 'Update HL7 Inbound Queue' },
  { privilege: 'Delete HL7 Inbound Queue', description: 'Delete HL7 Inbound Queue' }
];

const roleMappings: Record<string, string[]> = {
  'Super Admin': privileges.map(p => p.privilege),
  'Admin': privileges.map(p => p.privilege),
  'System Administrator': privileges.map(p => p.privilege),
  'System Developer': privileges.map(p => p.privilege),
  
  'Doctor': ['VIEW_DASHBOARD', 'VIEW_PATIENTS', 'VIEW_VISITS', 'VIEW_ENCOUNTERS', 'ADD_ENCOUNTER', 'VIEW_OBS', 'ADD_OBS', 'VIEW_ORDERS', 'ADD_ORDER', 'VIEW_LAB', 'VIEW_BILLING', 'VIEW_PROGRAMS', 'VIEW_COHORTS', 'VIEW_QUEUES'],
  'Physician': ['VIEW_DASHBOARD', 'VIEW_PATIENTS', 'VIEW_VISITS', 'VIEW_ENCOUNTERS', 'ADD_ENCOUNTER', 'VIEW_OBS', 'ADD_OBS', 'VIEW_ORDERS', 'ADD_ORDER', 'VIEW_LAB', 'VIEW_BILLING', 'VIEW_PROGRAMS', 'VIEW_COHORTS', 'VIEW_QUEUES'],
  'Senior Doctor': ['VIEW_DASHBOARD', 'VIEW_PATIENTS', 'VIEW_VISITS', 'VIEW_ENCOUNTERS', 'ADD_ENCOUNTER', 'VIEW_OBS', 'ADD_OBS', 'VIEW_ORDERS', 'ADD_ORDER', 'VIEW_LAB', 'VIEW_BILLING', 'VIEW_PROGRAMS', 'VIEW_COHORTS', 'VIEW_QUEUES'],
  'Nurse': ['VIEW_DASHBOARD', 'VIEW_PATIENTS', 'VIEW_VISITS', 'VIEW_ENCOUNTERS', 'ADD_ENCOUNTER', 'VIEW_OBS', 'ADD_OBS', 'VIEW_ORDERS', 'VIEW_BILLING', 'VIEW_PROGRAMS', 'VIEW_COHORTS', 'VIEW_QUEUES'],
  'Head Nurse': ['VIEW_DASHBOARD', 'VIEW_PATIENTS', 'VIEW_VISITS', 'VIEW_ENCOUNTERS', 'ADD_ENCOUNTER', 'VIEW_OBS', 'ADD_OBS', 'VIEW_ORDERS', 'VIEW_BILLING', 'VIEW_PROGRAMS', 'VIEW_COHORTS', 'VIEW_QUEUES'],
  
  'Pharmacist': ['VIEW_DASHBOARD', 'VIEW_PHARMACY', 'DISPENSE_MEDICATION', 'VIEW_INVENTORY'],
  'Pharmacy Assistant': ['VIEW_DASHBOARD', 'VIEW_PHARMACY', 'DISPENSE_MEDICATION', 'VIEW_INVENTORY'],
  'Pharmacy Admin': ['VIEW_DASHBOARD', 'VIEW_PHARMACY', 'DISPENSE_MEDICATION', 'VIEW_INVENTORY', 'MANAGE_PRODUCT_MASTER', 'MANAGE_SUPPLIERS', 'MANAGE_PURCHASE_ORDERS', 'MANAGE_WAREHOUSES', 'MANAGE_STOCK_MOVEMENTS', 'RECEIVE_STOCK'],
  'Storekeeper': ['VIEW_DASHBOARD', 'VIEW_INVENTORY', 'RECEIVE_STOCK', 'MANAGE_STOCK_MOVEMENTS'],
  'Procurement Officer': ['VIEW_DASHBOARD', 'VIEW_INVENTORY', 'MANAGE_SUPPLIERS', 'MANAGE_PURCHASE_ORDERS'],
  
  'Clerk': ['VIEW_DASHBOARD', 'VIEW_PATIENTS', 'ADD_PATIENT', 'EDIT_PATIENT', 'VIEW_VISITS', 'VIEW_ENCOUNTERS', 'VIEW_BILLING', 'MANAGE_BILLING', 'VIEW_QUEUES'],
  'Receptionist': ['VIEW_DASHBOARD', 'VIEW_PATIENTS', 'ADD_PATIENT', 'EDIT_PATIENT', 'VIEW_VISITS', 'VIEW_ENCOUNTERS', 'VIEW_BILLING', 'MANAGE_BILLING', 'VIEW_QUEUES'],
  'Lab Technician': ['VIEW_DASHBOARD', 'VIEW_LAB', 'MANAGE_LAB', 'VIEW_PATIENTS']
};

async function run() {
  console.log("Starting privilege seeding...");
  try {
    // 1. Seed Privileges
    for (const privObj of privileges) {
      const existing = await prisma.privilege.findUnique({ where: { privilege: privObj.privilege } });
      if (!existing) {
        await prisma.privilege.create({
          data: {
            privilege: privObj.privilege,
            description: privObj.description,
            uuid: generateUuid()
          }
        });
        console.log(`Created privilege: ${privObj.privilege}`);
      }
    }

    // 2. Assign Privileges to Roles
    for (const [roleName, privs] of Object.entries(roleMappings)) {
      const role = await prisma.role.findUnique({ where: { role: roleName } });
      if (role) {
        for (const priv of privs) {
          const mapping = await prisma.role_privilege.findUnique({
            where: {
              role_privilege: {
                role: roleName,
                privilege: priv
              }
            }
          });
          if (!mapping) {
            await prisma.role_privilege.create({
              data: {
                role: roleName,
                privilege: priv
              }
            });
            console.log(`Assigned ${priv} to ${roleName}`);
          }
        }
      } else {
        console.log(`Warning: Role ${roleName} not found, skipping privilege assignment.`);
      }
    }

    console.log("Privilege seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding privileges:", error);
  } finally {
    await prisma.$disconnect();
  }
}

run();
