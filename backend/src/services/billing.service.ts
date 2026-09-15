import { BillingDAL } from '../dal/billing.dal';
import { OrderDAL } from '../dal/order.dal';
import { prisma } from '../utils/prisma';

export class BillingService {
  static async getAllBills() {
    return await BillingDAL.getAllBills();
  }

  static async getBillById(uuid: string) {
    return await BillingDAL.getBillById(uuid);
  }

  static async getBillsByPatient(patientUuid: string) {
    return await BillingDAL.getBillsByPatient(patientUuid);
  }

  static async generateBill(data: { patientId: number, providerId: number, cashPointId: number, creator: number, items: Array<{serviceId: number, quantity: number, price: number}> }) {
    // 1. Create the bill
    const bill = await BillingDAL.createBill(data.patientId, data.providerId, data.cashPointId, data.creator);

    // 2. Add line items
    if (data.items && data.items.length > 0) {
      for (const item of data.items) {
        await BillingDAL.addLineItem(bill.bill_id, item.serviceId, item.quantity, item.price, data.creator);
      }
    }

    return await BillingDAL.getBillById(bill.uuid);
  }

  static async addAutomatedCharge(patientId: number, orderId: number, serviceId: number, price: number, cashPointId: number, creator: number) {
    let bill = await BillingDAL.getUnpaidBill(patientId, cashPointId);
    
    if (!bill) {
      bill = await BillingDAL.createBill(patientId, 1, cashPointId, creator);
    }
    
    await BillingDAL.addLineItem(bill.bill_id, serviceId, 1, price, creator, orderId);
  }

  static async processPayment(data: { billId: number, paymentModeId: number, amount: number, amountTendered: number, creator: number }) {
    if (data.amountTendered < data.amount) {
      throw new Error("Amount tendered is less than payment amount");
    }

    const payment = await BillingDAL.addPayment(data.billId, data.paymentModeId, data.amount, data.amountTendered, data.creator);
    
    // Find if this bill has any associated orders and mark them PAID
    try {
      const lineItems = await prisma.cashier_bill_line_item.findMany({
        where: { bill_id: data.billId, order_id: { not: null } }
      });
      
      for (const item of lineItems) {
        if (item.order_id) {
          await prisma.orders.updateMany({
            where: { order_id: item.order_id },
            data: { fulfiller_status: 'PAID' }
          });
        }
      }
    } catch (e) {
      console.error("Failed to update order status upon payment:", e);
    }
    
    return payment;
  }

  static async getRoutingRules() {
    return await BillingDAL.getBillingRoutingRules();
  }

  static async setRoutingRules(rules: any) {
    return await BillingDAL.setBillingRoutingRules(rules);
  }

  static async getCashierAssignment(userId: number) {
    return await BillingDAL.getCashierAssignment(userId);
  }

  static async setCashierAssignment(userId: number, cashPointId: number | null) {
    return await BillingDAL.setCashierAssignment(userId, cashPointId);
  }

  static async getCashPoints() {
    return await BillingDAL.getCashPoints();
  }
}
