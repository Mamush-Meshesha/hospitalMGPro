import * as supplierDal from '../dal/supplier.dal';

export const listSuppliers = async () => {
  return await supplierDal.getAllSuppliers();
};

export const getSupplierDetails = async (supplierId: number) => {
  const supplier = await supplierDal.getSupplierById(supplierId);
  if (!supplier) throw new Error('Supplier not found');
  return supplier;
};

export const addSupplier = async (data: any) => {
  if (!data.name) throw new Error('Supplier name is required');
  return await supplierDal.createSupplier(data);
};

export const updateSupplier = async (id: number, data: any) => {
  return await supplierDal.updateSupplier(id, data);
};

export const deleteSupplier = async (id: number) => {
  return await supplierDal.deleteSupplier(id);
};
