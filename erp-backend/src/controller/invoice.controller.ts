import { Request, Response } from 'express';
import * as invoiceService from '../services/invoice.service';

export const listInvoices = async (req: Request, res: Response) => {
  try {
    const invoices = await invoiceService.listInvoices();
    res.json(invoices);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getInvoice = async (req: Request, res: Response) => {
  try {
    const invoice = await invoiceService.getInvoice(Number(req.params.id));
    res.json(invoice);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
};

export const createInvoice = async (req: Request, res: Response) => {
  try {
    const newInvoice = await invoiceService.addInvoice(req.body);
    res.status(201).json(newInvoice);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const updateInvoice = async (req: Request, res: Response) => {
  try {
    const updated = await invoiceService.editInvoice(Number(req.params.id), req.body);
    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteInvoice = async (req: Request, res: Response) => {
  try {
    await invoiceService.removeInvoice(Number(req.params.id));
    res.status(204).send();
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
