export class IntegrationService {
  /**
   * Outbound Webhook Engine
   * Mocks a webhook payload being sent to an external ERP system.
   */
  private static async dispatchWebhook(endpoint: string, payload: any) {
    console.log(`\n[WEBHOOK DISPATCH] 🚀 Firing Event to ERP: ${endpoint}`);
    console.log(`Payload: ${JSON.stringify(payload, null, 2)}`);
    
    // In a real production system, this would be:
    // await fetch(`https://erp.hospital.internal${endpoint}`, { method: 'POST', body: JSON.stringify(payload) })
    
    console.log(`[WEBHOOK SUCCESS] ✅ ERP acknowledged receipt.\n`);
    return true;
  }

  /**
   * Triggered by ADT Engine when a patient is discharged.
   */
  static async triggerBilling(visitUuid: string, patientId: number, locationId: number | null) {
    const payload = {
      event: 'PATIENT_DISCHARGED',
      timestamp: new Date().toISOString(),
      data: {
        visit_uuid: visitUuid,
        patient_internal_id: patientId,
        ward_location_id: locationId
      }
    };
    
    // Fire and forget (don't block the clinical transaction)
    this.dispatchWebhook('/api/billing/invoice/generate', payload).catch(err => console.error(err));
  }

  /**
   * Triggered by Pharmacy Queue when a drug is dispensed.
   */
  static async triggerStockDeduction(orderUuid: string, drugInventoryId: number, quantityDispensed: number) {
    const payload = {
      event: 'PHARMACY_DISPENSE',
      timestamp: new Date().toISOString(),
      data: {
        order_uuid: orderUuid,
        drug_inventory_id: drugInventoryId,
        quantity_deducted: quantityDispensed
      }
    };

    // Fire and forget
    this.dispatchWebhook('/api/inventory/stock/deduct', payload).catch(err => console.error(err));
  }
}
