import * as productService from '../services/productService.js';
import { successResponse } from '../utils/helpers.js';

export async function getProducts(req, res, next) {
  try {
    const result = await productService.getProducts(req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function getProductBySlug(req, res, next) {
  try {
    const product = await productService.getProductBySlug(req.params.slug);
    res.json(successResponse(product));
  } catch (error) {
    next(error);
  }
}

export async function createProduct(req, res, next) {
  try {
    req.uploadType = 'products';
    const product = await productService.createProduct(req.user.id, req.body, req.files);
    res.status(201).json(successResponse(product, 'Produk berhasil dibuat'));
  } catch (error) {
    next(error);
  }
}

export async function updateProduct(req, res, next) {
  try {
    const product = await productService.updateProduct(req.params.id, req.user.id, req.user.role, req.body);
    res.json(successResponse(product, 'Produk berhasil diperbarui'));
  } catch (error) {
    next(error);
  }
}

export async function deleteProduct(req, res, next) {
  try {
    await productService.deleteProduct(req.params.id, req.user.id, req.user.role);
    res.json(successResponse(null, 'Produk berhasil dihapus'));
  } catch (error) {
    next(error);
  }
}

export async function uploadImages(req, res, next) {
  try {
    req.uploadType = 'products';
    const images = await productService.uploadProductImages(req.params.id, req.user.id, req.files);
    res.status(201).json(successResponse(images, 'Gambar berhasil diupload'));
  } catch (error) {
    next(error);
  }
}

export async function getMapProducts(req, res, next) {
  try {
    const products = await productService.getMapProducts(req.query);
    res.json(successResponse(products));
  } catch (error) {
    next(error);
  }
}

export async function getCategories(req, res, next) {
  try {
    const categories = await productService.getCategories();
    res.json(successResponse(categories));
  } catch (error) {
    next(error);
  }
}
