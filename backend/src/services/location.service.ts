import { LocationDAL } from '../dal/location.dal';

export class LocationService {
  static async getAll() {
    const locations = await LocationDAL.getAll();
    const activeCounts = await LocationDAL.getActiveAdmissionsCounts();

    return locations.map(loc => {
      let totalCapacity = 0;
      // Extract capacity from location attributes
      if (loc.reverse_location_attribute_location_attribute_location_fk) {
        const capacityAttr = loc.reverse_location_attribute_location_attribute_location_fk.find(
          attr => attr.location_attribute_type_location_attribute_attribute_type_id_fk?.name === 'Total Capacity'
        );
        if (capacityAttr && capacityAttr.value_reference) {
          totalCapacity = parseInt(capacityAttr.value_reference, 10) || 0;
        }
      }

      const activeAdmissions = activeCounts[loc.location_id] || 0;
      const availableBeds = Math.max(0, totalCapacity - activeAdmissions);

      return {
        ...loc,
        total_capacity: totalCapacity,
        available_beds: availableBeds,
        active_admissions: activeAdmissions
      };
    });
  }

  static async getById(id: string) {
    const loc = await LocationDAL.getById(id);
    if (!loc) return null;

    const activeCounts = await LocationDAL.getActiveAdmissionsCounts();
    let totalCapacity = 0;
    if (loc.reverse_location_attribute_location_attribute_location_fk) {
      const capacityAttr = loc.reverse_location_attribute_location_attribute_location_fk.find(
        attr => attr.location_attribute_type_location_attribute_attribute_type_id_fk?.name === 'Total Capacity'
      );
      if (capacityAttr && capacityAttr.value_reference) {
        totalCapacity = parseInt(capacityAttr.value_reference, 10) || 0;
      }
    }

    const activeAdmissions = activeCounts[loc.location_id] || 0;
    const availableBeds = Math.max(0, totalCapacity - activeAdmissions);

    return {
      ...loc,
      total_capacity: totalCapacity,
      available_beds: availableBeds,
      active_admissions: activeAdmissions
    };
  }

  static async create(data: any) {
    return await LocationDAL.create(data);
  }

  static async update(id: string, data: any) {
    return await LocationDAL.update(id, data);
  }

  static async remove(id: string) {
    return await LocationDAL.remove(id);
  }

  static async setTotalCapacity(id: string, capacity: number) {
    const loc = await LocationDAL.getById(id);
    if (!loc) throw new Error("Location not found");
    return await LocationDAL.setTotalCapacity(loc.location_id, capacity);
  }
}
