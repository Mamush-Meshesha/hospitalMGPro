import { Request, Response } from 'express';
import { BillingService } from '../services/billing.service';

export class BillingController {
  static async getAllBills(req: Request, res: Response) {
    try {
      const userId = Number(req.query.userId || 1); // Mock Auth
      const assignedCashPoint = await BillingService.getCashierAssignment(userId);
      
      let bills = await BillingService.getAllBills();
      
      // RBAC: If cashier is assigned to a specific cash point, ONLY show those bills
      if (assignedCashPoint) {
        bills = bills.filter((b: any) => b.cash_point_id === assignedCashPoint);
      }
      
      res.json({ results: bills, assignedCashPoint });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getBillById(req: Request, res: Response) {
    try {
      const { uuid } = req.params;
      const bill = await BillingService.getBillById(uuid);
      if (!bill) return res.status(404).json({ error: "Bill not found" });
      res.json({ result: bill });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getBillsByPatient(req: Request, res: Response) {
    try {
      const { patientUuid } = req.params;
      const bills = await BillingService.getBillsByPatient(patientUuid);
      res.json({ results: bills });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async generateBill(req: Request, res: Response) {
    try {
      const data = req.body;
      const bill = await BillingService.generateBill({
        patientId: data.patientId,
        providerId: data.providerId || 1, // Defaulting for testing
        cashPointId: data.cashPointId || 1, // Defaulting for testing
        creator: data.creator || 1,
        items: data.items
      });
      res.status(201).json({ result: bill });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async processPayment(req: Request, res: Response) {
    try {
      const { uuid } = req.params;
      const data = req.body;
      
      const bill = await BillingService.getBillById(uuid);
      if (!bill) return res.status(404).json({ error: "Bill not found" });

      const payment = await BillingService.processPayment({
        billId: bill.bill_id,
        paymentModeId: data.paymentModeId || 1, // Default cash
        amount: data.amount,
        amountTendered: data.amountTendered,
        creator: data.creator || 1
      });

      res.status(201).json({ result: payment });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
  static async getConfig(req: Request, res: Response) {
    try {
      const rules = await BillingService.getRoutingRules();
      const cashPoints = await BillingService.getCashPoints();
      // For the demo UI we can just return rules and let the frontend query users
      res.json({ result: { rules, cashPoints } });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async updateRouting(req: Request, res: Response) {
    try {
      const rules = req.body;
      await BillingService.setRoutingRules(rules);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async assignCashier(req: Request, res: Response) {
    try {
      const { userId, cashPointId } = req.body;
      await BillingService.setCashierAssignment(userId, cashPointId || null);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
