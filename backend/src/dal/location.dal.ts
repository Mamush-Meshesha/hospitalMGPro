import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../utils/prisma';

export class LocationDAL {
  static async getAll() {
    return await prisma.location.findMany({ 
      take: 50,
      include: {
        reverse_location_attribute_location_attribute_location_fk: {
          include: {
            location_attribute_type_location_attribute_attribute_type_id_fk: true
          },
          where: { voided: false }
        }
      }
    });
  }

  static async getById(id: string) {
    const numericId = Number(id);
    const whereClause = isNaN(numericId) ? { uuid: id } : { location_id: numericId };
    
    return await prisma.location.findFirst({ 
      where: whereClause,
      include: {
        reverse_location_attribute_location_attribute_location_fk: {
          include: {
            location_attribute_type_location_attribute_attribute_type_id_fk: true
          },
          where: { voided: false }
        }
      }
    });
  }

  static async create(data: any) {
    // Note: UUID resolution logic for nested entities (like patient_uuid -> patient_id) 
    // will be injected at the service level. This handles raw inserts.
    if (!data.uuid) data.uuid = uuidv4();
    if (!data.date_created) data.date_created = new Date();
    if (data.retired === undefined) data.retired = false;
    return await prisma.location.create({ data });
  }

  static async update(id: string, data: any) {
    const numericId = Number(id);
    const whereClause = isNaN(numericId) ? { uuid: id } : { location_id: numericId };
    return await prisma.location.updateMany({ where: whereClause, data });
  }

  static async remove(id: string) {
    const numericId = Number(id);
    const whereClause = isNaN(numericId) ? { uuid: id } : { location_id: numericId };
    // Soft Delete (Metadata)
    return await prisma.location.updateMany({ 
      where: whereClause, 
      data: { retired: true, date_retired: new Date(), retired_by: 1 } 
    });
  }

  static async setTotalCapacity(locationId: number, capacity: number) {
    // 1. Get the attribute type for Total Capacity
    const attrType = await prisma.location_attribute_type.findFirst({
      where: { name: 'Total Capacity', retired: false }
    });
    if (!attrType) throw new Error("Total Capacity location attribute type not found in database.");

    // 2. Check if this location already has a capacity attribute
    const existingAttr = await prisma.location_attribute.findFirst({
      where: {
        location_id: locationId,
        attribute_type_id: attrType.location_attribute_type_id,
        voided: false
      }
    });

    if (existingAttr) {
      // Update
      return await prisma.location_attribute.update({
        where: { location_attribute_id: existingAttr.location_attribute_id },
        data: {
          value_reference: capacity.toString(),
          changed_by: 1,
          date_changed: new Date()
        }
      });
    } else {
      // Create
      return await prisma.location_attribute.create({
        data: {
          location_id: locationId,
          attribute_type_id: attrType.location_attribute_type_id,
          value_reference: capacity.toString(),
          creator: 1,
          date_created: new Date(),
          uuid: uuidv4(),
          voided: false
        }
      });
    }
  }

  static async getActiveAdmissionsCounts() {
    // A visit is active if date_stopped is null and it's not voided.
    // Group by location_id and count.
    const activeVisits = await prisma.visit.groupBy({
      by: ['location_id'],
      where: {
        date_stopped: null,
        voided: false,
        location_id: { not: null }
      },
      _count: {
        visit_id: true
      }
    });

    const countMap: Record<number, number> = {};
    activeVisits.forEach(item => {
      if (item.location_id) {
        countMap[item.location_id] = item._count.visit_id;
      }
    });
    return countMap;
  }
}
