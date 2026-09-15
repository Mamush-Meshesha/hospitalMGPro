import { InventoryDAL } from '../dal/inventory.dal';

export class InventoryService {
  static async getAllStockItems(locationId?: number) {
    return await InventoryDAL.getAllStockItems(locationId);
  }

  static async createStockItem(data: { commonName: string, categoryId: number, isDrug: boolean, purchasePrice: number, creator: number }) {
    return await InventoryDAL.createStockItem(data);
  }

  static async receiveStock(data: { sourceId: number, destinationId: number, creator: number, items: Array<{stockItemId: number, quantity: number, batchNo: string, expiration?: Date}> }) {
    return await InventoryDAL.recordStockOperation({
      operationType: 'RECEIPT',
      sourceId: data.sourceId,
      destinationId: data.destinationId,
      creator: data.creator,
      items: data.items
    });
  }

  static async dispatchStock(data: { sourceId: number, destinationId: number, creator: number, items: Array<{stockItemId: number, quantity: number, batchNo: string}> }) {
    return await InventoryDAL.recordStockOperation({
      operationType: 'DISPATCH',
      sourceId: data.sourceId,
      destinationId: data.destinationId,
      creator: data.creator,
      items: data.items
    });
  }
}
