import { prisma } from '../db';

export const getAllProducts = async () => {
  return await prisma.erp_product.findMany({
    include: { purchase_uom: true, store_uom: true },
    orderBy: { name: 'asc' }
  });
};

export const getProductById = async (productId: number) => {
  return await prisma.erp_product.findUnique({
    where: { product_id: productId },
    include: { 
      purchase_uom: true, 
      store_uom: true,
      stock_batches: {
        include: {
          bin: {
            include: { zone: { include: { warehouse: true } } }
          }
        }
      }
    }
  });
};

export const createProduct = async (data: any) => {
  return await prisma.erp_product.create({ data });
};

export const updateProduct = async (productId: number, data: any) => {
  return await prisma.erp_product.update({
    where: { product_id: productId },
    data,
  });
};

export const deleteProduct = async (productId: number) => {
  return await prisma.erp_product.delete({
    where: { product_id: productId }
  });
};
