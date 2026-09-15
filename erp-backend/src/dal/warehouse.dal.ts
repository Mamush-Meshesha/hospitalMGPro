import { prisma } from '../db';

export const getAllWarehouses = async () => {
  return await prisma.erp_warehouse.findMany({
    include: { branch: true }
  });
};

export const getWarehouseById = async (warehouseId: number) => {
  return await prisma.erp_warehouse.findUnique({
    where: { warehouse_id: warehouseId },
    include: { branch: true }
  });
};

export const createWarehouse = async (data: any) => {
  return await prisma.erp_warehouse.create({ data });
};

export const updateWarehouse = async (warehouseId: number, data: any) => {
  return await prisma.erp_warehouse.update({
    where: { warehouse_id: warehouseId },
    data
  });
};

export const deleteWarehouse = async (warehouseId: number) => {
  return await prisma.erp_warehouse.delete({
    where: { warehouse_id: warehouseId }
  });
};

// Branches
export const getAllBranches = async () => {
  return await prisma.erp_branch.findMany();
};

export const createBranch = async (data: any) => {
  return await prisma.erp_branch.create({ data });
};
