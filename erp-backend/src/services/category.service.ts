import * as categoryDal from '../dal/category.dal';

export const listCategories = async () => {
  return await categoryDal.getAllCategories();
};

export const getCategory = async (id: number) => {
  const category = await categoryDal.getCategoryById(id);
  if (!category) throw new Error('Category not found');
  return category;
};

export const addCategory = async (data: any) => {
  if (!data.name) throw new Error('Category name is required');
  return await categoryDal.createCategory(data);
};

export const editCategory = async (id: number, data: any) => {
  return await categoryDal.updateCategory(id, data);
};

export const removeCategory = async (id: number) => {
  return await categoryDal.deleteCategory(id);
};

export const addUom = async (data: any) => {
  if (!data.name || !data.category_id) throw new Error('UOM name and category are required');
  return await categoryDal.createUom(data);
};

export const editUom = async (id: number, data: any) => {
  return await categoryDal.updateUom(id, data);
};

export const removeUom = async (id: number) => {
  return await categoryDal.deleteUom(id);
};
