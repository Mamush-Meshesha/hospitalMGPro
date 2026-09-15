import { v4 as uuidv4 } from 'uuid';

import { prisma } from '../utils/prisma';

export class BillingDAL {
  static async getAllBills() {
    return await prisma.cashier_bill.findMany({
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
        cashier_bill_line_item: {
          include: {
            cashier_billable_service: true,
            orders: true
          }
        },
        cashier_bill_payment: {
          include: {
            cashier_payment_mode: true
          }
        },
        provider: true
      },
      orderBy: { date_created: 'desc' },
      take: 50 // Limit for UI performance
    });
  }

  static async getBillById(uuid: string) {
    return await prisma.cashier_bill.findUnique({
      where: { uuid },
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
        cashier_bill_line_item: {
          include: {
            cashier_billable_service: true
          }
        },
        cashier_bill_payment: {
          include: {
            cashier_payment_mode: true
          }
        }
      }
    });
  }

  static async getBillsByPatient(patientUuid: string) {
    // We need to look up the internal patient_id first
    const patient = await prisma.patient.findFirst({
      where: {
        person_person_id_for_patient: {
          uuid: patientUuid
        }
      }
    });

    if (!patient) throw new Error("Patient not found");

    return await prisma.cashier_bill.findMany({
      where: { patient_id: patient.patient_id },
      include: {
        cashier_bill_line_item: {
          include: {
            cashier_billable_service: true
          }
        },
        cashier_bill_payment: {
          include: {
            cashier_payment_mode: true
          }
        }
      },
      orderBy: { date_created: 'desc' }
    });
  }

  static async createBill(patientId: number, providerId: number, cashPointId: number, creator: number) {
    return await prisma.cashier_bill.create({
      data: {
        uuid: uuidv4(),
        patient_id: patientId,
        provider_id: providerId,
        cash_point_id: cashPointId,
        creator: creator,
        date_created: new Date(),
        status: 'PENDING',
        receipt_number: `REC-${Date.now()}` // Generate unique receipt number
      }
    });
  }

  static async getUnpaidBill(patientId: number, cashPointId: number) {
    return await prisma.cashier_bill.findFirst({
      where: {
        patient_id: patientId,
        cash_point_id: cashPointId,
        status: 'PENDING',
        voided: false
      }
    });
  }

  static async addLineItem(billId: number, serviceId: number, quantity: number, price: number, creator: number, orderId?: number) {
    return await prisma.cashier_bill_line_item.create({
      data: {
        uuid: uuidv4(),
        bill_id: billId,
        service_id: serviceId,
        quantity: quantity,
        price: price,
        status: 'PENDING',
        creator: creator,
        date_created: new Date(),
        order_id: orderId || null
      }
    });
  }

  static async addPayment(billId: number, paymentModeId: number, amount: number, amountTendered: number, creator: number) {
    return await prisma.cashier_bill_payment.create({
      data: {
        uuid: uuidv4(),
        bill_id: billId,
        payment_mode_id: paymentModeId,
        amount: amount,
        amount_tendered: amountTendered,
        creator: creator,
        date_created: new Date()
      }
    });
  }

  static async getBillingRoutingRules() {
    const prop = await prisma.global_property.findUnique({
      where: { property: 'billing.routing.rules' }
    });
    if (!prop || !prop.property_value) {
      return { defaultCashPointId: 1, rules: { "1": 2, "2": 3, "3": 3 } }; 
    }
    return JSON.parse(prop.property_value);
  }

  static async setBillingRoutingRules(rules: any) {
    const jsonString = JSON.stringify(rules);
    return await prisma.global_property.upsert({
      where: { property: 'billing.routing.rules' },
      update: { property_value: jsonString },
      create: { 
        property: 'billing.routing.rules', 
        property_value: jsonString, 
        uuid: require('crypto').randomUUID() 
      }
    });
  }

  static async getCashierAssignment(userId: number) {
    const prop = await prisma.user_property.findFirst({
      where: { user_id: userId, property: 'assigned_cash_point' }
    });
    return prop?.property_value ? Number(prop.property_value) : null;
  }

  static async setCashierAssignment(userId: number, cashPointId: number | null) {
    if (cashPointId === null) {
      return await prisma.user_property.deleteMany({
        where: { user_id: userId, property: 'assigned_cash_point' }
      });
    }

    // Check if property exists for user
    const existing = await prisma.user_property.findFirst({
      where: { user_id: userId, property: 'assigned_cash_point' }
    });

    if (existing) {
      return await prisma.user_property.updateMany({
        where: { user_id: userId, property: 'assigned_cash_point' },
        data: { property_value: cashPointId.toString() }
      });
    } else {
      return await prisma.user_property.create({
        data: {
          user_id: userId,
          property: 'assigned_cash_point',
          property_value: cashPointId.toString()
        }
      });
    }
  }

  static async getCashPoints() {
    return await prisma.cashier_cash_point.findMany({
      where: { retired: false },
      select: { cash_point_id: true, name: true }
    });
  }
}
