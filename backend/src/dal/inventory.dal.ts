import { v4 as uuidv4 } from 'uuid';

import { prisma } from '../utils/prisma';

export class InventoryDAL {
  static async getAllStockItems(locationId?: number) {
    return await prisma.stockmgmt_stock_item.findMany({
      include: {
        concept: {
          include: {
            reverse_concept_name_name_for_concept: true
          }
        },
        category: {
          include: {
            reverse_concept_name_name_for_concept: true
          }
        },
        stock_batches: locationId ? {
          where: {
            location_id: locationId
          }
        } : true
      },
      take: 100
    });
  }

  static async getStockItemById(id: number) {
    return await prisma.stockmgmt_stock_item.findUnique({
      where: { stock_item_id: id },
      include: {
        stock_batches: true
      }
    });
  }

  static async createStockItem(data: { commonName: string, categoryId: number, isDrug: boolean, purchasePrice: number, creator: number }) {
    return await prisma.stockmgmt_stock_item.create({
      data: {
        uuid: uuidv4(),
        common_name: data.commonName,
        category_id: data.categoryId,
        is_drug: data.isDrug,
        purchase_price: data.purchasePrice,
        creator: data.creator,
        date_created: new Date(),
        has_expiration: true
      }
    });
  }

  static async recordStockOperation(data: { operationType: string, sourceId: number, destinationId: number, creator: number, items: Array<{stockItemId: number, quantity: number, batchNo: string, expiration?: Date}> }) {
    // 1. Create Operation
    const operation = await prisma.stockmgmt_stock_operation.create({
      data: {
        uuid: uuidv4(),
        operation_type: data.operationType,
        operation_number: `OP-${Date.now()}`,
        operation_date: new Date(),
        source_id: data.sourceId,
        destination_id: data.destinationId,
        status: 'COMPLETED',
        creator: data.creator,
        date_created: new Date()
      }
    });

    // 2. Process Items
    for (const item of data.items) {
      let batchId = null;

      if (data.operationType === 'RECEIPT') {
        // Create or update batch
        const batch = await prisma.stockmgmt_stock_batch.create({
          data: {
            uuid: uuidv4(),
            stock_item_id: item.stockItemId,
            batch_no: item.batchNo,
            expiration: item.expiration,
            quantity: item.quantity,
            location_id: data.destinationId,
            creator: data.creator,
            date_created: new Date()
          }
        });
        batchId = batch.stock_batch_id;
      } else if (data.operationType === 'DISPATCH') {
        // Find batch to dispatch from
        const batch = await prisma.stockmgmt_stock_batch.findFirst({
          where: { 
            stock_item_id: item.stockItemId,
            quantity: { gte: item.quantity }
          }
        });

        if (!batch) throw new Error(`Insufficient stock for item ${item.stockItemId}`);
        
        // Deduct stock
        await prisma.stockmgmt_stock_batch.update({
          where: { stock_batch_id: batch.stock_batch_id },
          data: {
            quantity: { decrement: item.quantity }
          }
        });
        batchId = batch.stock_batch_id;
      }

      // Record Operation Item
      await prisma.stockmgmt_stock_operation_item.create({
        data: {
          uuid: uuidv4(),
          stock_operation_id: operation.stock_operation_id,
          stock_item_id: item.stockItemId,
          stock_batch_id: batchId,
          quantity: item.quantity,
          creator: data.creator,
          date_created: new Date()
        }
      });
    }

    return operation;
  }
}
