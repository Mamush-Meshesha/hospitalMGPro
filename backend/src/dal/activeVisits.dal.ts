
import { prisma } from '../utils/prisma';

export class ActiveVisitsDAL {
  static async getActiveVisits(locationId?: number) {
    const whereClause: any = {
      date_stopped: null,
      voided: false
    };
    if (locationId) {
      whereClause.location_id = locationId;
    }

    const visits = await prisma.visit.findMany({
      where: whereClause,
      include: {
        patient_visit_patient_fk: {
          include: {
            person_person_id_for_patient: {
              include: {
                reverse_person_name_name_for_person: {
                  where: { preferred: true, voided: false },
                  take: 1
                }
              }
            },
            bedPatientAssignmentMaps: {
              where: { date_stopped: null, voided: false },
              include: { bed: true },
              take: 1
            }
          }
        },
        location_visit_location_fk: true,
        visit_type_visit_type_fk: true,
        reverse_encounter_encounter_visit_id_fk: {
          orderBy: { encounter_datetime: 'desc' },
          include: {
            reverse_encounter_provider_encounter_id_fk: {
              where: { voided: false },
              include: {
                provider_provider_id_fk: {
                  include: {
                    person_provider_person_id_fk: {
                      include: {
                        reverse_person_name_name_for_person: {
                          where: { preferred: true },
                          take: 1
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          take: 1
        }
      },
      orderBy: { date_started: 'asc' }
    });

    return visits.map(v => {
      const person = v.patient_visit_patient_fk.person_person_id_for_patient;
      const name = person.reverse_person_name_name_for_person[0];
      const bedAssign = v.patient_visit_patient_fk.bedPatientAssignmentMaps[0];
      const lastEncounter = v.reverse_encounter_encounter_visit_id_fk[0];
      const provider = lastEncounter?.reverse_encounter_provider_encounter_id_fk?.[0]?.provider_provider_id_fk;
      const providerPerson = provider?.person_provider_person_id_fk;
      const providerName = providerPerson?.reverse_person_name_name_for_person[0];

      const hoursAdmitted = Math.floor(
        (Date.now() - new Date(v.date_started).getTime()) / (1000 * 60 * 60)
      );

      return {
        visitId: v.visit_id,
        visitUuid: v.uuid,
        patientId: v.patient_id,
        mrn: `MRN-${String(v.patient_id).padStart(5, '0')}`,
        patientName: name ? `${name.given_name} ${name.family_name}` : 'Unknown',
        gender: person.gender,
        location: v.location_visit_location_fk?.name || 'Unknown',
        visitType: v.visit_type_visit_type_fk?.name || 'Unknown',
        bedNumber: bedAssign?.bed?.bed_number || null,
        dateStarted: v.date_started,
        hoursAdmitted,
        attendingProvider: providerName
          ? `${providerName.given_name} ${providerName.family_name}`
          : provider?.name || 'Unassigned'
      };
    });
  }

  static async getActiveVisitCount(locationId?: number) {
    const whereClause: any = {
      date_stopped: null,
      voided: false
    };
    if (locationId) {
      whereClause.location_id = locationId;
    }
    return await prisma.visit.count({
      where: whereClause
    });
  }
}
