import * as inventoryDal from '../dal/inventory.dal';

export const listBatches = async () => {
  return await inventoryDal.getAllBatches();
};

export const getBatch = async (id: number) => {
  const batch = await inventoryDal.getBatchById(id);
  if (!batch) throw new Error('Batch not found');
  return batch;
};

export const addBatch = async (data: any) => {
  if (!data.product_id || !data.batch_number) throw new Error('Product ID and batch number are required');
  return await inventoryDal.createBatch(data);
};

export const editBatch = async (id: number, data: any) => {
  return await inventoryDal.updateBatch(id, data);
};

export const removeBatch = async (id: number) => {
  return await inventoryDal.deleteBatch(id);
};
