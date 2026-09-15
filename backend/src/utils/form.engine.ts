
import { prisma } from './prisma';

export class FormEngine {
  /**
   * Validates that an encounter submission contains all required Concepts 
   * defined by its parent Form.
   */
  static async validateEncounterForm(formUuid: string, submittedConceptUuids: string[]) {
    const form = await prisma.form.findFirst({ 
      where: { uuid: formUuid, retired: false },
      include: { reverse_form_field_form_containing_field: { include: { field_field_within_form: { include: { concept_concept_for_field: true } } } } }
    });

    if (!form) throw new Error("Form not found or retired");

    const requiredConceptUuids = form.reverse_form_field_form_containing_field
      .filter((ff: any) => ff.required)
      .map((ff: any) => ff.field_field_within_form?.concept_concept_for_field?.uuid)
      .filter((uuid: any) => uuid); // remove nulls

    const missingConcepts = requiredConceptUuids.filter((uuid: any) => !submittedConceptUuids.includes(uuid as string));

    if (missingConcepts.length > 0) {
      throw new Error(`Form Validation Error: Missing required observations for concepts: ${missingConcepts.join(', ')}`);
    }

    return true;
  }
}
