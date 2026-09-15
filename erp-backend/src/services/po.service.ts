import * as poDal from '../dal/po.dal';

export const listPOs = async () => {
  return await poDal.getAllPOs();
};

export const getPODetails = async (poId: number) => {
  const po = await poDal.getPOById(poId);
  if (!po) throw new Error('Purchase Order not found');
  return po;
};

export const createPurchaseOrder = async (data: any) => {
  if (!data.supplier_id) {
    throw new Error('Supplier is required');
  }
  // Basic generate PO number
  data.po_number = `PO-${Date.now()}`;
  return await poDal.createPO(data);
};

export const updateStatus = async (poId: number, status: string, approvedBy?: number) => {
  return await poDal.updatePOStatus(poId, status, approvedBy);
};

export const updatePO = async (poId: number, data: any) => {
  return await poDal.updatePO(poId, data);
};

export const deletePO = async (poId: number) => {
  return await poDal.deletePO(poId);
};
