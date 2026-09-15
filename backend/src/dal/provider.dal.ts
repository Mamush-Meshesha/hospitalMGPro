import crypto from 'crypto';

import { prisma } from '../utils/prisma';
const generateUuid = () => crypto.randomUUID();

export class ProviderDAL {
  static async getAll() {
    const providers = await prisma.provider.findMany({
      take: 50,
      include: {
        concept_provider_speciality_id_fk: {
          include: {
            reverse_concept_name_name_for_concept: { where: { voided: false } }
          }
        },
        concept_provider_role_id_fk: {
          include: {
            reverse_concept_name_name_for_concept: { where: { voided: false } }
          }
        },
        reverse_provider_attribute_provider_attribute_provider_fk: true
      }
    });

    return providers.map(p => {
      // Find email/phone from attributes (assuming attribute_type_id mapping, or just scanning values for now)
      let email = 'N/A';
      let phone = 'N/A';
      for (const attr of p.reverse_provider_attribute_provider_attribute_provider_fk) {
        const val = attr.value_reference?.toLowerCase() || '';
        if (val.includes('@')) email = attr.value_reference || 'N/A';
        else if (/^[\d\+\-\s\(\)]+$/.test(val)) phone = attr.value_reference || 'N/A';
      }

      return {
        ...p,
        specialty: p.concept_provider_speciality_id_fk?.reverse_concept_name_name_for_concept[0]?.name || 'General',
        department: p.concept_provider_role_id_fk?.reverse_concept_name_name_for_concept[0]?.name || 'N/A',
        email,
        phone
      };
    });
  }

  static async getById(id: string) {
    return await prisma.provider.findFirst({ where: { uuid: id } });
  }

  static async create(data: any) {
    const { specialty, department, email, phone, ...providerData } = data;
    
    if (providerData.retired === undefined) providerData.retired = false;
    providerData.uuid = generateUuid();
    providerData.date_created = new Date();

    return await prisma.$transaction(async (tx) => {
      // 1. Resolve Specialty Concept
      if (specialty) {
        let specConcept = await tx.concept_name.findFirst({ where: { name: specialty } });
        if (!specConcept) {
          const newConcept = await tx.concept.create({ data: { datatype_id: 1, class_id: 1, is_set: false, creator: 1, date_created: new Date(), retired: false, uuid: generateUuid() } });
          specConcept = await tx.concept_name.create({ data: { concept_id: newConcept.concept_id, name: specialty, locale: 'en', creator: 1, date_created: new Date(), voided: false, uuid: generateUuid() } });
        }
        providerData.speciality_id = specConcept.concept_id;
      } else if (!providerData.speciality_id) providerData.speciality_id = 1;

      // 2. Resolve Department (Role) Concept
      if (department) {
        let deptConcept = await tx.concept_name.findFirst({ where: { name: department } });
        if (!deptConcept) {
          const newConcept = await tx.concept.create({ data: { datatype_id: 1, class_id: 1, is_set: false, creator: 1, date_created: new Date(), retired: false, uuid: generateUuid() } });
          deptConcept = await tx.concept_name.create({ data: { concept_id: newConcept.concept_id, name: department, locale: 'en', creator: 1, date_created: new Date(), voided: false, uuid: generateUuid() } });
        }
        providerData.role_id = deptConcept.concept_id;
      } else if (!providerData.role_id) providerData.role_id = 1;

      // 3. Create the Provider
      const provider = await tx.provider.create({ data: providerData });

      // 4. Create Attributes for Email and Phone
      const attachAttribute = async (name: string, value: string) => {
        if (!value || value === 'N/A') return;
        let attrType = await tx.provider_attribute_type.findFirst({ where: { name } });
        if (!attrType) {
          attrType = await tx.provider_attribute_type.create({ data: { name, description: name, datatype: 'string', min_occurs: 0, creator: 1, date_created: new Date(), retired: false, uuid: generateUuid() } });
        }
        await tx.provider_attribute.create({ data: { provider_id: provider.provider_id, attribute_type_id: attrType.provider_attribute_type_id, value_reference: value, creator: 1, date_created: new Date(), voided: false, uuid: generateUuid() } });
      };

      await attachAttribute('Email', email);
      await attachAttribute('Phone', phone);

      return provider;
    });
  }

  static async assignWard(providerUuid: string, locationUuid: string, creatorId: number) {
    return await prisma.$transaction(async (tx) => {
      const provider = await tx.provider.findFirst({ where: { uuid: providerUuid } });
      const location = await tx.location.findFirst({ where: { uuid: locationUuid } });

      if (!provider || !location) throw new Error("Provider or Location not found");

      // Find or create 'Ward Assignment' attribute type
      let attrType = await tx.provider_attribute_type.findFirst({ where: { name: 'Ward Assignment' } });
      if (!attrType) {
        attrType = await tx.provider_attribute_type.create({
          data: {
            name: 'Ward Assignment',
            description: 'The location/ward where the provider is currently assigned',
            datatype: 'org.openmrs.Location',
            min_occurs: 0,
            creator: creatorId,
            date_created: new Date(),
            retired: false,
            uuid: generateUuid()
          }
        });
      }

      // Invalidate old assignments
      await tx.provider_attribute.updateMany({
        where: { provider_id: provider.provider_id, attribute_type_id: attrType.provider_attribute_type_id, voided: false },
        data: { voided: true, date_voided: new Date(), voided_by: creatorId }
      });

      // Create new assignment
      return await tx.provider_attribute.create({
        data: {
          provider_id: provider.provider_id,
          attribute_type_id: attrType.provider_attribute_type_id,
          value_reference: location.location_id.toString(),
          creator: creatorId,
          date_created: new Date(),
          voided: false,
          uuid: generateUuid()
        }
      });
    });
  }

  static async update(id: string, data: any) {
    return await prisma.provider.updateMany({ where: { uuid: id }, data });
  }

  static async remove(id: string) {
    return await prisma.provider.updateMany({ 
      where: { uuid: id }, 
      data: { retired: true, date_retired: new Date(), retired_by: 1 } 
    });
  }
}
