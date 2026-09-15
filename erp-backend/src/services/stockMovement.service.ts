import * as stockMovementDal from '../dal/stockMovement.dal';

export const listMovements = async () => {
  return await stockMovementDal.getAllMovements();
};

export const getMovement = async (id: number) => {
  const movement = await stockMovementDal.getMovementById(id);
  if (!movement) throw new Error('Movement not found');
  return movement;
};

export const addMovement = async (data: any) => {
  if (!data.product_id || !data.quantity) throw new Error('Product ID and quantity are required');
  return await stockMovementDal.createMovement(data);
};

export const editMovement = async (id: number, data: any) => {
  return await stockMovementDal.updateMovement(id, data);
};

export const removeMovement = async (id: number) => {
  return await stockMovementDal.deleteMovement(id);
};
