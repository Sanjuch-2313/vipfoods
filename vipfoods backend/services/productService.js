import Product from "../models/Product.js";

export const createProduct = async (data) => {
  return await Product.create(data);
};

export const getAllProducts = async () => {
  return await Product.find()
    .populate("category")
    .sort({ createdAt: -1 });
};

export const getProductById = async (id) => {
  return await Product.findById(id).populate("category");
};

export const updateProduct = async (id, data) => {
  return await Product.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
};

export const deleteProduct = async (id) => {
  return await Product.findByIdAndDelete(id);
};