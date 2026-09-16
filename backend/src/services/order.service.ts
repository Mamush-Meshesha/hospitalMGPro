import { OrderDAL } from '../dal/order.dal';
import { BillingService } from './billing.service';
import { prisma } from '../utils/prisma';

export class OrderService {
  static async getAll(patientUuid?: string, privileges?: string[], locationId?: number) {
    return await OrderDAL.getAll(patientUuid, privileges, locationId);
  }

  static async getById(id: string) {
    return await OrderDAL.getById(id);
  }


  static async update(id: string, data: any) {
    return await OrderDAL.update(id, data);
  }

  static async remove(id: string) {
    return await OrderDAL.remove(id);
  }

  static async placeOrder(data: any, creatorId: number) {
    const order = await OrderDAL.placeOrder(data, creatorId);
    
    try {
      // Fetch Dynamic Routing Rules
      const routingConfig = await BillingService.getRoutingRules();
      
      let cashPointId = routingConfig.defaultCashPointId || 1;
      const typeStr = order.order_type_id.toString();
      
      if (routingConfig.rules && routingConfig.rules[typeStr]) {
         cashPointId = Number(routingConfig.rules[typeStr]);
      }

      // Dynamic Price Lookup from DB
      const billableService = await prisma.cashier_billable_service.findFirst({
        where: { concept_id: order.concept_id },
        include: { cashier_item_price: true }
      });

      if (!billableService) {
        throw new Error(`CRITICAL: No billable service mapped for clinical concept ID ${order.concept_id}`);
      }

      if (!billableService.cashier_item_price || billableService.cashier_item_price.length === 0) {
        throw new Error(`CRITICAL: No active price found for billable service ID ${billableService.service_id}`);
      }

      const serviceId = billableService.service_id;
      const price = Number(billableService.cashier_item_price[0].price);
      
      await BillingService.addAutomatedCharge(
        order.patient_id, 
        order.order_id, 
        serviceId, 
        price, 
        cashPointId, 
        creatorId
      );
    } catch (e) {
      console.error("Failed to generate automated bill for order:", e);
    }
    
    return order;
  }

  static async getPharmacyQueue(privileges?: string[], locationId?: number) {
    return await OrderDAL.getPharmacyQueue(privileges, locationId);
  }

  static async dispense(orderUuid: string, quantity: number) {
    return await OrderDAL.dispense(orderUuid, quantity);
  }

  static async enterLabResult(orderUuid: string, data: any, userId: number) {
    return await OrderDAL.enterLabResult(orderUuid, data, userId);
  }

  static async uploadRadiologyImage(orderUuid: string, fileUrl: string, userId: number) {
    return await OrderDAL.uploadRadiologyImage(orderUuid, fileUrl, userId);
  }
}
