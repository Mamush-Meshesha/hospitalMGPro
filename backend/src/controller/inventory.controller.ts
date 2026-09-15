import { Request, Response } from 'express';
import { InventoryService } from '../services/inventory.service';

export class InventoryController {
  static async getAllStockItems(req: Request, res: Response) {
    try {
      const items = await InventoryService.getAllStockItems(req.locationId);
      res.json({ results: items });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async createStockItem(req: Request, res: Response) {
    try {
      const data = req.body;
      const item = await InventoryService.createStockItem({
        commonName: data.commonName,
        categoryId: data.categoryId || 1, // Defaulting for testing
        isDrug: data.isDrug || false,
        purchasePrice: data.purchasePrice,
        creator: data.creator || 1
      });
      res.status(201).json({ result: item });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async receiveStock(req: Request, res: Response) {
    try {
      const data = req.body;
      const operation = await InventoryService.receiveStock({
        sourceId: data.sourceId || 1, // Default vendor
        destinationId: data.destinationId || 1, // Default main pharmacy
        creator: data.creator || 1,
        items: data.items
      });
      res.status(201).json({ result: operation });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async dispatchStock(req: Request, res: Response) {
    try {
      const data = req.body;
      const operation = await InventoryService.dispatchStock({
        sourceId: data.sourceId || 1, // Default main pharmacy
        destinationId: data.destinationId || 2, // Default ward
        creator: data.creator || 1,
        items: data.items
      });
      res.status(201).json({ result: operation });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
