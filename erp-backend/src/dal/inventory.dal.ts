import { prisma } from '../db';

export const getAllBatches = async () => {
  return await prisma.erp_stock_batch.findMany({
    include: { product: true, bin: { include: { zone: { include: { warehouse: true } } } } }
  });
};

export const getBatchById = async (batchId: number) => {
  return await prisma.erp_stock_batch.findUnique({
    where: { batch_id: batchId },
    include: { product: true, bin: { include: { zone: { include: { warehouse: true } } } } }
  });
};

export const createBatch = async (data: any) => {
  return await prisma.erp_stock_batch.create({ data });
};

export const updateBatch = async (batchId: number, data: any) => {
  return await prisma.erp_stock_batch.update({
    where: { batch_id: batchId },
    data
  });
};

export const deleteBatch = async (batchId: number) => {
  return await prisma.erp_stock_batch.delete({
    where: { batch_id: batchId }
  });
};
