import API from './api.js';
import imageCompression from 'browser-image-compression';

// Client-side Image Compression Utility (<800KB target)
export const compressProductImage = async (file) => {
  if (!file || !file.type.startsWith('image/')) return file;
  const options = {
    maxSizeMB: 0.8,
    maxWidthOrHeight: 1200,
    useWebWorker: true,
  };
  try {
    const compressedFile = await imageCompression(file, options);
    return compressedFile;
  } catch (err) {
    console.warn('Image compression fallback:', err);
    return file;
  }
};

export const productService = {
  // Get all products (with filters)
  getProducts: async (params = {}) => {
    const response = await API.get('/products', { params });
    return response.data;
  },

  // Get single product by ID or slug
  getProduct: async (idOrSlug) => {
    const response = await API.get(`/products/${idOrSlug}`);
    return response.data;
  },

  // Get my products (farmer)
  getMyProducts: async () => {
    const response = await API.get('/products/my-products');
    return response.data;
  },

  // Create product (farmer) with auto-compressed image
  createProduct: async (formData) => {
    const isForm = formData instanceof FormData;
    if (isForm && formData.has('image')) {
      const img = formData.get('image');
      if (img && img instanceof File) {
        const compressed = await compressProductImage(img);
        formData.set('image', compressed, compressed.name || 'produce.jpg');
      }
    }
    const response = await API.post('/products', formData, {
      headers: isForm ? { 'Content-Type': 'multipart/form-data' } : {},
    });
    return response.data;
  },

  // Update product with auto-compressed image
  updateProduct: async (id, formData) => {
    const isForm = formData instanceof FormData;
    if (isForm && formData.has('image')) {
      const img = formData.get('image');
      if (img && img instanceof File) {
        const compressed = await compressProductImage(img);
        formData.set('image', compressed, compressed.name || 'produce.jpg');
      }
    }
    const response = await API.put(`/products/${id}`, formData, {
      headers: isForm ? { 'Content-Type': 'multipart/form-data' } : {},
    });
    return response.data;
  },

  // Delete product
  deleteProduct: async (id) => {
    const response = await API.delete(`/products/${id}`);
    return response.data;
  },
};

export default productService;
