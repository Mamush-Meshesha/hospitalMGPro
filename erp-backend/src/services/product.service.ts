import * as productDal from '../dal/product.dal';

export const listProducts = async () => {
  return await productDal.getAllProducts();
};

export const getProductDetails = async (productId: number) => {
  const product = await productDal.getProductById(productId);
  if (!product) throw new Error('Product not found');
  return product;
};

export const addProduct = async (data: any) => {
  if (!data.name) throw new Error('Product name is required');
  return await productDal.createProduct(data);
};

export const editProduct = async (productId: number, data: any) => {
  return await productDal.updateProduct(productId, data);
};

export const removeProduct = async (productId: number) => {
  return await productDal.deleteProduct(productId);
};
