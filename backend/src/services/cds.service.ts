import crypto from 'crypto';

import { prisma } from '../utils/prisma';
const generateUuid = () => crypto.randomUUID();

export class CdsService {
  /**
   * CDS Engine: Validates an observation against the Concept Dictionary.
   * If valid, it saves the observation.
   * If valid but critically abnormal, it also triggers a clinical alert.
   */
  static async submitObservation(data: any, creatorId: number) {
    return await prisma.$transaction(async (tx) => {
      // 1. Resolve UUIDs
      const person = await tx.person.findFirst({ where: { uuid: data.personUuid } });
      const concept = await tx.concept.findFirst({ where: { uuid: data.conceptUuid } });
      let encounterId = null;

      if (data.encounterUuid) {
        const encounter = await tx.encounter.findFirst({ where: { uuid: data.encounterUuid } });
        encounterId = encounter?.encounter_id;
      }

      if (!person || !concept) {
        throw new Error("Person or Concept not found");
      }

      // 2. CDS Validation for Numeric Concepts
      let isCritical = false;
      let alertMessage = "";

      if (data.valueNumeric !== undefined && data.valueNumeric !== null) {
        const numericLimit = await tx.concept_numeric.findFirst({
          where: { concept_id: concept.concept_id }
        });

        if (numericLimit) {
          const val = parseFloat(data.valueNumeric);

          // Absolute bounds (Impossible values) - Reject immediately
          if (numericLimit.hi_absolute !== null && val > numericLimit.hi_absolute) {
            throw new Error(`CDS Validation Error: Value ${val} exceeds the absolute maximum of ${numericLimit.hi_absolute}`);
          }
          if (numericLimit.low_absolute !== null && val < numericLimit.low_absolute) {
            throw new Error(`CDS Validation Error: Value ${val} is below the absolute minimum of ${numericLimit.low_absolute}`);
          }

          // Critical bounds - Accept, but trigger alert
          if (numericLimit.hi_critical !== null && val > numericLimit.hi_critical) {
            isCritical = true;
            alertMessage = `CRITICAL HIGH: Patient's ${concept.uuid} is ${val} (Critical Max: ${numericLimit.hi_critical})`;
          }
          if (numericLimit.low_critical !== null && val < numericLimit.low_critical) {
            isCritical = true;
            alertMessage = `CRITICAL LOW: Patient's ${concept.uuid} is ${val} (Critical Min: ${numericLimit.low_critical})`;
          }
        }
      }

      // 3. Save the Observation
      const obs = await tx.obs.create({
        data: {
          person_id: person.person_id,
          concept_id: concept.concept_id,
          encounter_id: encounterId,
          obs_datetime: data.obsDatetime ? new Date(data.obsDatetime) : new Date(),
          value_numeric: data.valueNumeric,
          value_text: data.valueText,
          status: data.status || 'FINAL',
          creator: creatorId,
          date_created: new Date(),
          voided: false,
          uuid: generateUuid(),
        }
      });

      // 4. Trigger Clinical Alert (if critical)
      if (isCritical) {
        await tx.notification_alert.create({
          data: {
            text: alertMessage,
            satisfied_by_any: false,
            alert_read: false,
            creator: creatorId,
            date_created: new Date(),
            uuid: generateUuid()
          }
        });
        // Note: In a real system we would bind this to notification_alert_recipient
      }

      return {
        observation: obs,
        cdsAlertTriggered: isCritical,
        alertDetails: isCritical ? alertMessage : null
      };
    });
  }

  /**
   * CDS Engine: Allergy Checker
   * Blocks CPOE prescriptions if the patient has an active severe allergy to the drug.
   */
  static async checkDrugAllergies(patientId: number, drugId: number) {
    const drug = await prisma.drug.findFirst({ where: { drug_id: drugId } });
    if (!drug) return; // Cannot check if drug doesn't exist

    // Find active allergies for this patient where the allergen matches the drug's concept
    const allergies = await prisma.allergy.findMany({
      where: {
        patient_id: patientId,
        coded_allergen: drug.concept_id
      }
    });

    if (allergies.length > 0) {
      throw new Error(`CDS FATAL: Patient has an active allergy to ${drug.name}. Prescription blocked.`);
    }
  }
}
