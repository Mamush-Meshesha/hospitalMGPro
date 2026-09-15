import crypto from 'crypto';

import { prisma } from '../utils/prisma';

const generateUuid = () => crypto.randomUUID();

export interface CreatePatientInput {
  givenName: string;
  familyName: string;
  gender: string;
  birthdate: Date;
  email?: string;
  phone?: string;
  creatorId: number;
}

export class PatientDAL {
  /**
   * Create a complete patient record (Person -> Patient -> PersonName)
   */
  static async createPatient(input: CreatePatientInput) {
    // OpenMRS architecture: A Patient is a Person. 
    // They share the same primary key (person_id = patient_id)
    return await prisma.$transaction(async (tx) => {
      // 1. Create the Person base record
      const person = await tx.person.create({
        data: {
          gender: input.gender,
          birthdate: input.birthdate,
          dead: false,
          creator: input.creatorId,
          date_created: new Date(),
          voided: false,
          uuid: generateUuid(),
          birthdate_estimated: false,
          deathdate_estimated: false,
        }
      });

      // 2. Create the Patient extension record
      const patient = await tx.patient.create({
        data: {
          patient_id: person.person_id,
          creator: input.creatorId,
          date_created: new Date(),
          voided: false,
          allergy_status: 'Unknown'
        }
      });

      // 3. Attach the Person Name
      const personName = await tx.person_name.create({
        data: {
          person_id: person.person_id,
          given_name: input.givenName,
          family_name: input.familyName,
          preferred: true,
          creator: input.creatorId,
          date_created: new Date(),
          voided: false,
          uuid: generateUuid()
        }
      });

      // 4. Attach Contact Attributes
      const attachAttribute = async (name: string, value: string | undefined) => {
        if (!value) return;
        let attrType = await tx.person_attribute_type.findFirst({ where: { name } });
        if (!attrType) {
          attrType = await tx.person_attribute_type.create({
            data: { name, description: name, format: 'java.lang.String', searchable: false, creator: 1, date_created: new Date(), retired: false, uuid: generateUuid() }
          });
        }
        await tx.person_attribute.create({
          data: { person_id: person.person_id, person_attribute_type_id: attrType.person_attribute_type_id, value: value, creator: 1, date_created: new Date(), voided: false, uuid: generateUuid() }
        });
      };

      await attachAttribute('Email', input.email);
      await attachAttribute('Phone', input.phone);

      return {
        uuid: person.uuid,
        personId: person.person_id,
        givenName: personName.given_name,
        familyName: personName.family_name,
        gender: person.gender,
        birthdate: person.birthdate,
        email: input.email || 'N/A',
        phone: input.phone || 'N/A'
      };
    });
  }

  /**
   * Fetch all patients with their preferred name
   */
  static async getAllPatients(providerId?: number) {
    const where: any = { voided: false };
    if (providerId) {
      where.reverse_encounter_encounter_patient = {
        some: {
          reverse_encounter_provider_encounter_id_fk: {
            some: { provider_id: providerId }
          }
        }
      };
    }

    const patients = await prisma.patient.findMany({
      where,
      include: {
        person_person_id_for_patient: {
          include: {
            reverse_person_name_name_for_person: {
              where: { preferred: true, voided: false }
            },
            reverse_person_attribute_identifies_person: {
              where: { voided: false },
              include: { person_attribute_type_defines_attribute_type: true }
            }
          }
        },
        reverse_allergy_allergy_patient_id_fk: {
          where: { voided: false },
          take: 1
        },
        reverse_conditions_condition_patient_fk: {
          where: { voided: false, clinical_status: 'ACTIVE' },
          take: 1
        },
        reverse_patient_identifier_fk_patient_id_patient_identifier: {
          where: { voided: false },
          take: 1
        },
        patientAppointments: {
          where: { voided: false, start_date_time: { gte: new Date() } },
          orderBy: { start_date_time: 'asc' },
          take: 1
        }
      },
      take: 50 // Limit for now
    });

    return patients.map(p => {
      const person = p.person_person_id_for_patient;
      const name = person.reverse_person_name_name_for_person[0];
      const ident = p.reverse_patient_identifier_fk_patient_id_patient_identifier[0];
      
      let email = 'N/A';
      let phone = 'N/A';
      person.reverse_person_attribute_identifies_person?.forEach((attr: any) => {
        const typeName = attr.person_attribute_type_defines_attribute_type?.name;
        if (typeName === 'Email') email = attr.value;
        if (typeName === 'Phone') phone = attr.value;
      });

      let nextAppointment = 'N/A';
      if (p.patientAppointments && p.patientAppointments.length > 0) {
        const apt = p.patientAppointments[0];
        nextAppointment = apt.start_date_time ? apt.start_date_time.toISOString() : 'N/A';
      }

      return {
        uuid: person.uuid,
        personId: person.person_id,
        display: `${name?.given_name || ''} ${name?.family_name || ''}`.trim() || 'Unknown',
        identifier: ident?.identifier || 'No ID assigned',
        givenName: name?.given_name || 'Unknown',
        familyName: name?.family_name || 'Unknown',
        gender: person.gender,
        birthdate: person.birthdate,
        hasFlags: p.reverse_allergy_allergy_patient_id_fk.length > 0 || p.reverse_conditions_condition_patient_fk.length > 0,
        email,
        phone,
        nextAppointment
      };
    });
  }

  /**
   * Enterprise Global Patient Search (Bypasses Assignment RLS)
   */
  static async globalSearch(query: string) {
    const patients = await prisma.patient.findMany({
      where: {
        voided: false,
        person_person_id_for_patient: {
          reverse_person_name_name_for_person: {
            some: {
              OR: [
                { given_name: { contains: query } },
                { family_name: { contains: query } }
              ]
            }
          }
        }
      },
      include: {
        person_person_id_for_patient: {
          include: {
            reverse_person_name_name_for_person: {
              where: { preferred: true, voided: false }
            },
            reverse_person_attribute_identifies_person: {
              where: { voided: false },
              include: { person_attribute_type_defines_attribute_type: true }
            }
          }
        },
        reverse_allergy_allergy_patient_id_fk: { where: { voided: false }, take: 1 },
        reverse_conditions_condition_patient_fk: { where: { voided: false, clinical_status: 'ACTIVE' }, take: 1 },
        reverse_patient_identifier_fk_patient_id_patient_identifier: { where: { voided: false }, take: 1 },
        patientAppointments: { where: { voided: false, start_date_time: { gte: new Date() } }, orderBy: { start_date_time: 'asc' }, take: 1 }
      },
      take: 20
    });

    return patients.map(p => {
      const person = p.person_person_id_for_patient;
      const name = person.reverse_person_name_name_for_person[0];
      const ident = p.reverse_patient_identifier_fk_patient_id_patient_identifier[0];
      
      let email = 'N/A';
      let phone = 'N/A';
      person.reverse_person_attribute_identifies_person?.forEach((attr: any) => {
        const typeName = attr.person_attribute_type_defines_attribute_type?.name;
        if (typeName === 'Email') email = attr.value;
        if (typeName === 'Phone') phone = attr.value;
      });

      let nextAppointment = 'N/A';
      if (p.patientAppointments && p.patientAppointments.length > 0) {
        const apt = p.patientAppointments[0];
        nextAppointment = apt.start_date_time ? apt.start_date_time.toISOString() : 'N/A';
      }

      return {
        uuid: person.uuid,
        personId: person.person_id,
        display: `${name?.given_name || ''} ${name?.family_name || ''}`.trim() || 'Unknown',
        identifier: ident?.identifier || 'No ID assigned',
        givenName: name?.given_name || 'Unknown',
        familyName: name?.family_name || 'Unknown',
        gender: person.gender,
        birthdate: person.birthdate,
        hasFlags: p.reverse_allergy_allergy_patient_id_fk.length > 0 || p.reverse_conditions_condition_patient_fk.length > 0,
        email,
        phone,
        nextAppointment
      };
    });
  }

  /**
   * Enterprise Patient Merging Engine
   * Securely transfers all clinical data to the preferred patient and voids the duplicate.
   */
  static async mergePatients(preferredUuid: string, nonPreferredUuid: string, userId: number) {
    return await prisma.$transaction(async (tx) => {
      const preferred = await tx.person.findFirst({ where: { uuid: preferredUuid } });
      const nonPreferred = await tx.person.findFirst({ where: { uuid: nonPreferredUuid } });

      if (!preferred || !nonPreferred) {
        throw new Error("One or both patients not found");
      }

      const prefId = preferred.person_id;
      const nonPrefId = nonPreferred.person_id;

      // 1. Transfer Encounters
      await tx.encounter.updateMany({
        where: { patient_id: nonPrefId },
        data: { patient_id: prefId }
      });

      // 2. Transfer Observations
      await tx.obs.updateMany({
        where: { person_id: nonPrefId },
        data: { person_id: prefId }
      });

      // 3. Transfer Orders (Prisma maps the order table to orders)
      await tx.orders.updateMany({
        where: { patient_id: nonPrefId },
        data: { patient_id: prefId }
      });

      // 4. Transfer Patient Programs (Chronic Care)
      await tx.patient_program.updateMany({
        where: { patient_id: nonPrefId },
        data: { patient_id: prefId }
      });

      // 5. Transfer Identifiers
      await tx.patient_identifier.updateMany({
        where: { patient_id: nonPrefId },
        data: { patient_id: prefId }
      });

      // 6. Soft Delete (Void) the duplicate records
      const voidData = {
        voided: true,
        date_voided: new Date(),
        voided_by: userId,
        void_reason: `Merged into patient ${preferredUuid}`
      };

      await tx.patient.update({
        where: { patient_id: nonPrefId },
        data: { voided: true, date_voided: new Date(), voided_by: userId } // patient doesn't have void_reason
      });

      await tx.person.update({
        where: { person_id: nonPrefId },
        data: voidData
      });

      await tx.person_name.updateMany({
        where: { person_id: nonPrefId },
        data: voidData
      });

      return {
        success: true,
        message: "Patients successfully merged",
        preferredPatientUuid: preferredUuid,
        mergedPatientUuid: nonPreferredUuid
      };
    });
  }
}
