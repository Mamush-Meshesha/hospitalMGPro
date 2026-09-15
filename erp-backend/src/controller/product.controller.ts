import { Request, Response } from 'express';
import * as productService from '../services/product.service';

export const listProducts = async (req: Request, res: Response) => {
  try {
    const products = await productService.listProducts();
    res.json(products);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getProduct = async (req: Request, res: Response) => {
  try {
    const product = await productService.getProductDetails(Number(req.params.id));
    res.json(product);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const newProduct = await productService.addProduct(req.body);
    res.status(201).json(newProduct);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const updatedProduct = await productService.editProduct(Number(req.params.id), req.body);
    res.json(updatedProduct);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    await productService.removeProduct(Number(req.params.id));
    res.status(204).send();
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
