import { v4 as uuidv4 } from 'uuid';

import { prisma } from '../utils/prisma';

export class QueueDAL {
  static async getAllQueues() {
    return await prisma.queue.findMany({
      include: {
        location: true,
        service_concept: {
          include: {
            reverse_concept_name_name_for_concept: true
          }
        },
        _count: {
          select: { queue_entries: { where: { status: 1 } } } // 1 = WAITING, 2 = IN CONSULTATION, etc
        }
      }
    });
  }

  static async createQueue(data: { name: string, description?: string, locationId: number, serviceConceptId: number, creator: number }) {
    if (!data.locationId) throw new Error("locationId is required");
    if (!data.serviceConceptId) throw new Error("serviceConceptId is required");
    
    return await prisma.queue.create({
      data: {
        uuid: uuidv4(),
        name: data.name,
        description: data.description,
        location: { connect: { location_id: data.locationId } },
        service_concept: { connect: { concept_id: data.serviceConceptId } },
        users_queue_creator: { connect: { user_id: data.creator } },
        date_created: new Date(),
        retired: false
      }
    });
  }

  static async getQueueEntries(queueId: number) {
    return await prisma.queue_entry.findMany({
      where: { 
        queue_id: queueId,
        ended_at: null // Active entries only
      },
      include: {
        patient: {
          include: {
            person_person_id_for_patient: {
              include: {
                reverse_person_name_name_for_person: true
              }
            }
          }
        },
        status_concept: {
          include: {
            reverse_concept_name_name_for_concept: true
          }
        },
        priority_concept: {
          include: {
            reverse_concept_name_name_for_concept: true
          }
        }
      },
      orderBy: [
        { priority: 'desc' }, // Higher priority first
        { started_at: 'asc' } // Then FIFO
      ]
    });
  }

  static async addPatientToQueue(data: { queueId: number, patientId: number, priority: number, creator: number }) {
    return await prisma.queue_entry.create({
      data: {
        uuid: uuidv4(),
        queue_id: data.queueId,
        patient_id: data.patientId,
        priority: data.priority,
        status: 2001, // Mock valid concept ID
        started_at: new Date(),
        creator: data.creator,
        date_created: new Date()
      }
    });
  }

  static async updateEntryStatus(entryId: number, newStatus: number, creator: number) {
    const data: import('@prisma/client').Prisma.queue_entryUpdateInput = {
      status_concept: { connect: { concept_id: newStatus } },
      users_queue_entry_changed_by: { connect: { user_id: creator } },
      date_changed: new Date()
    };

    // If status is completed (e.g. concept ID 5085) or cancelled (concept ID 5086), end it
    if (newStatus === 5085 || newStatus === 5086) {
      data.ended_at = new Date();
    }

    return await prisma.queue_entry.update({
      where: { queue_entry_id: entryId },
      data: data
    });
  }
}
