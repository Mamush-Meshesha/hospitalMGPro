import { prisma } from '../db';

export const getAllMovements = async () => {
  return await prisma.erp_stock_movement.findMany({
    include: { product: true, source_warehouse: true, dest_warehouse: true },
    orderBy: { date_moved: 'desc' }
  });
};

export const getMovementById = async (movementId: number) => {
  return await prisma.erp_stock_movement.findUnique({
    where: { movement_id: movementId },
    include: { product: true, source_warehouse: true, dest_warehouse: true }
  });
};

export const createMovement = async (data: any) => {
  return await prisma.erp_stock_movement.create({ data });
};

export const updateMovement = async (movementId: number, data: any) => {
  return await prisma.erp_stock_movement.update({
    where: { movement_id: movementId },
    data
  });
};

export const deleteMovement = async (movementId: number) => {
  return await prisma.erp_stock_movement.delete({
    where: { movement_id: movementId }
  });
};
