import { prisma } from '../db';

export const getAllCategories = async () => {
  return await prisma.erp_uom_category.findMany({
    include: { uoms: true }
  });
};

export const getCategoryById = async (categoryId: number) => {
  return await prisma.erp_uom_category.findUnique({
    where: { category_id: categoryId },
    include: { uoms: true }
  });
};

export const createCategory = async (data: any) => {
  return await prisma.erp_uom_category.create({ data });
};

export const updateCategory = async (categoryId: number, data: any) => {
  return await prisma.erp_uom_category.update({
    where: { category_id: categoryId },
    data
  });
};

export const deleteCategory = async (categoryId: number) => {
  return await prisma.erp_uom_category.delete({
    where: { category_id: categoryId }
  });
};

// UOM Specific DAL
export const createUom = async (data: any) => {
  return await prisma.erp_uom.create({ data });
};

export const updateUom = async (uomId: number, data: any) => {
  return await prisma.erp_uom.update({
    where: { uom_id: uomId },
    data
  });
};

export const deleteUom = async (uomId: number) => {
  return await prisma.erp_uom.delete({
    where: { uom_id: uomId }
  });
};
