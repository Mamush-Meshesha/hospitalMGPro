import { prisma } from '../utils/prisma';

export class ConceptDAL {
  static async getAll() {
    const rawConcepts = await prisma.concept.findMany({
      where: { retired: false },
      take: 50,
      include: {
        reverse_concept_name_name_for_concept: { take: 1 },
        concept_class_concept_classes: true,
        concept_datatype_concept_datatypes: true,
        reverse_concept_reference_map_map_for_concept: {
          take: 1,
          include: {
            concept_reference_term_mapped_concept_reference_term: {
              include: {
                concept_reference_source_mapped_concept_source: true
              }
            }
          }
        }
      }
    });

    return rawConcepts.map((c: any) => {
      let mapping = '';
      const refMap = c.reverse_concept_reference_map_map_for_concept?.[0];
      if (refMap?.concept_reference_term_mapped_concept_reference_term) {
        const term = refMap.concept_reference_term_mapped_concept_reference_term;
        const sourceName = term.concept_reference_source_mapped_concept_source?.name || 'Unknown';
        mapping = `${sourceName}: ${term.code}`;
      }

      return {
        concept_id: c.concept_id,
        name: c.reverse_concept_name_name_for_concept?.[0]?.name || 'Unknown',
        short_name: c.short_name,
        description: c.description,
        datatype: c.concept_datatype_concept_datatypes?.name || 'Unknown',
        class: c.concept_class_concept_classes?.name || 'Unknown',
        is_set: c.is_set,
        retired: c.retired,
        version: c.version,
        uuid: c.uuid,
        mapping
      };
    });
  }

  static async getById(id: string) {
    return await prisma.concept.findFirst({ where: { uuid: id } });
  }

  static async create(data: any) {
    const { name, short_name, description, mapping, className, datatypeName, ...conceptData } = data;
    
    if (short_name !== undefined) conceptData.short_name = short_name;
    if (description !== undefined) conceptData.description = description;
    
    if (className) {
      let cClass = await prisma.concept_class.findFirst({ where: { name: className } });
      if (!cClass) cClass = await prisma.concept_class.create({ data: { name: className, description: className, creator: 1, date_created: new Date(), retired: false, uuid: require('uuid').v4() } });
      conceptData.class_id = cClass.concept_class_id;
    } else if (!conceptData.class_id) {
      conceptData.class_id = 1;
    }

    if (datatypeName) {
      let dt = await prisma.concept_datatype.findFirst({ where: { name: datatypeName } });
      if (!dt) dt = await prisma.concept_datatype.create({ data: { name: datatypeName, description: datatypeName, creator: 1, date_created: new Date(), retired: false, uuid: require('uuid').v4() } });
      conceptData.datatype_id = dt.concept_datatype_id;
    } else if (!conceptData.datatype_id) {
      conceptData.datatype_id = 1;
    }

    if (conceptData.retired === undefined) conceptData.retired = false;
    if (!conceptData.creator) conceptData.creator = 1;
    if (!conceptData.date_created) conceptData.date_created = new Date();
    if (!conceptData.uuid) conceptData.uuid = require('uuid').v4();
    if (conceptData.is_set !== undefined) conceptData.is_set = Boolean(conceptData.is_set);

    const createdConcept = await prisma.concept.create({ data: conceptData });
    
    if (name) {
      await prisma.concept_name.create({
        data: {
          concept_id: createdConcept.concept_id,
          name: name,
          locale: 'en',
          concept_name_type: 'FULLY_SPECIFIED',
          creator: 1,
          date_created: new Date(),
          voided: false,
          uuid: require('uuid').v4()
        }
      });
    }

    if (mapping && mapping.includes(': ')) {
      const [sourceName, code] = mapping.split(': ');
      
      let source = await prisma.concept_reference_source.findFirst({ where: { name: sourceName } });
      if (!source) {
        source = await prisma.concept_reference_source.create({
          data: { name: sourceName, description: sourceName, creator: 1, date_created: new Date(), retired: false, uuid: require('uuid').v4(), hl7_code: sourceName }
        });
      }
      
      let term = await prisma.concept_reference_term.findFirst({ where: { code: code.trim(), concept_source_id: source.concept_source_id } });
      if (!term) {
        term = await prisma.concept_reference_term.create({
          data: { code: code.trim(), concept_source_id: source.concept_source_id, creator: 1, date_created: new Date(), retired: false, uuid: require('uuid').v4() }
        });
      }
      
      let mapType = await prisma.concept_map_type.findFirst();
      if (!mapType) {
        mapType = await prisma.concept_map_type.create({
          data: { name: "SAME-AS", creator: 1, date_created: new Date(), retired: false, uuid: require('uuid').v4(), is_hidden: false }
        });
      }
      
      await prisma.concept_reference_map.create({
        data: {
          concept_id: createdConcept.concept_id,
          concept_reference_term_id: term.concept_reference_term_id,
          concept_map_type_id: mapType.concept_map_type_id,
          creator: 1,
          date_created: new Date(),
          uuid: require('uuid').v4()
        }
      });
    }

    return createdConcept;
  }

  static async update(id: string, data: any) {
    const { name, short_name, description, mapping, className, datatypeName, ...conceptData } = data;
    if (short_name !== undefined) conceptData.short_name = short_name;
    if (description !== undefined) conceptData.description = description;
    if (conceptData.is_set !== undefined) conceptData.is_set = Boolean(conceptData.is_set);
    
    if (className) {
      let cClass = await prisma.concept_class.findFirst({ where: { name: className } });
      if (!cClass) cClass = await prisma.concept_class.create({ data: { name: className, description: className, creator: 1, date_created: new Date(), retired: false, uuid: require('uuid').v4() } });
      conceptData.class_id = cClass.concept_class_id;
    }

    if (datatypeName) {
      let dt = await prisma.concept_datatype.findFirst({ where: { name: datatypeName } });
      if (!dt) dt = await prisma.concept_datatype.create({ data: { name: datatypeName, description: datatypeName, creator: 1, date_created: new Date(), retired: false, uuid: require('uuid').v4() } });
      conceptData.datatype_id = dt.concept_datatype_id;
    }

    return await prisma.concept.updateMany({ where: { uuid: id }, data: conceptData });
  }

  static async remove(id: string) {
    // Soft Delete (Metadata)
    return await prisma.concept.updateMany({ 
      where: { uuid: id }, 
      data: { retired: true, date_retired: new Date(), retired_by: 1 } 
    });
  }
}
