import * as warehouseDal from '../dal/warehouse.dal';

export const listWarehouses = async () => {
  return await warehouseDal.getAllWarehouses();
};

export const getWarehouse = async (id: number) => {
  const warehouse = await warehouseDal.getWarehouseById(id);
  if (!warehouse) throw new Error('Warehouse not found');
  return warehouse;
};

export const addWarehouse = async (data: any) => {
  if (!data.name || !data.branch_id) throw new Error('Warehouse name and branch are required');
  return await warehouseDal.createWarehouse(data);
};

export const editWarehouse = async (id: number, data: any) => {
  return await warehouseDal.updateWarehouse(id, data);
};

export const removeWarehouse = async (id: number) => {
  return await warehouseDal.deleteWarehouse(id);
};

export const listBranches = async () => {
  return await warehouseDal.getAllBranches();
};

export const addBranch = async (data: any) => {
  if (!data.name) throw new Error('Branch name is required');
  return await warehouseDal.createBranch(data);
};
