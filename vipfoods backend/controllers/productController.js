import slugify from "slugify";
import Product from "../models/Product.js";
import APIFeatures from "../utils/apiFeatures.js";
import { generateSku } from "../utils/generateSku.js";
import Category from "../models/Category.js";

export const createProduct = async (req, res) => {
  try {
    console.log("============== CREATE PRODUCT ==============");
    console.log("BODY", req.body);
    console.log("FILES", req.files);
    console.log("===========================================");

    const {
      name,
      shortDescription,
      description,
      category,
      foodType,
  snackType,
  freshType,
  spiceType,
      brand,
      variants,
      ingredients,
      shelfLife,
      storageInstructions,
      manufacturer,
      countryOfOrigin,
      nutrition,
      badges,
      freeDelivery,
      deliveryCharge,
      estimatedDelivery,
      featured,
      active,
      published,
      metaTitle,
      metaDescription,
    } = req.body;

    const existing = await Product.findOne({ name });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Product already exists",
      });
    }

    const images = req.files?.map((file) => file.path) || [];
    console.log("Uploaded Images:", images);

    // Parse variants
    const parsedVariants =
      typeof variants === "string" ? JSON.parse(variants) : variants || [];

    // Auto Generate SKU
    parsedVariants.forEach((variant) => {
      if (!variant.sku || variant.sku.trim() === "") {
        variant.sku = generateSku(name, variant.weight);
      }
    });

    const product = await Product.create({
      name,
      slug: slugify(name, { lower: true, strict: true }),
      shortDescription,
      description,
      category,
      brand,
      images,
      variants: parsedVariants,
      ingredients,
      shelfLife,
      storageInstructions,
      manufacturer,
      countryOfOrigin,
      nutrition: typeof nutrition === "string" ? JSON.parse(nutrition) : nutrition,
      badges: typeof badges === "string" ? JSON.parse(badges) : badges,
      freeDelivery,
      deliveryCharge,
      estimatedDelivery,
      featured,
      active,
      published,
      metaTitle,
      metaDescription,
    });

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.error("========== PRODUCT CREATE ERROR ==========");
    console.error(error);
    console.error(error.stack);
    console.error("===========================================");
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getProducts = async (req, res) => {
  try {
    const resultPerPage = 12;
    let query = { isDeleted: false };

    // ✅ Keep category slug handling here
    if (req.query.category) {
      const category = await Category.findOne({ slug: req.query.category });
      if (category) {
        query.category = category._id;
      } else {
        return res.status(200).json({
          success: true,
          products: [],
          totalProducts: 0,
          resultPerPage,
          currentPage: 1,
          totalPages: 0,
        });
      }
    }

    const apiFeatures = new APIFeatures(
      Product.find(query).populate("category"),
      req.query
    )
      .search()
      .filter()   // now only featured, active, badge
      .sort()
      .paginate(resultPerPage);

    const products = await apiFeatures.query;
    const totalProducts = products.length;

    return res.status(200).json({
      success: true,
      products,
      totalProducts,
      resultPerPage,
      currentPage: Number(req.query.page) || 1,
      totalPages: Math.ceil(totalProducts / resultPerPage),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getProduct = async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      isDeleted: false,
    }).populate("category");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const data = { ...req.body };

    if (req.files?.length) {
      data.images = req.files.map((file) => file.path);
    }

    if (data.variants) {
      data.variants = JSON.parse(data.variants);
      data.variants = data.variants.map((variant) => ({
        ...variant,
        sku:
          variant.sku && variant.sku.trim() !== ""
            ? variant.sku
            : generateSku(data.name || "", variant.weight),
      }));
    }

    if (data.badges) {
      data.badges = JSON.parse(data.badges);
    }

    if (data.nutrition) {
      data.nutrition = JSON.parse(data.nutrition);
    }

    const product = await Product.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true,
    });

    return res.json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.error("UPDATE ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    product.isDeleted = true;
    product.deletedAt = new Date();
    await product.save();

    return res.json({
      success: true,
      message: "Product archived successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const restoreProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    product.isDeleted = false;
    product.deletedAt = null;
    await product.save();

    return res.json({
      success: true,
      message: "Product restored successfully",
      product,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateVariantStock = async (req, res) => {
  try {
    const { productId, variantId } = req.params;
    const { stock } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const variant = product.variants.id(variantId);
    if (!variant) {
      return res.status(404).json({
        success: false,
        message: "Variant not found",
      });
    }

    variant.stock = stock;
    variant.inStock = stock > 0;

    await product.save();

    res.json({
      success: true,
      message: "Stock updated successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getLowStockProducts = async (req, res) => {
  try {
    const products = await Product.find({ isDeleted: false });
    const lowStockProducts = [];

    products.forEach((product) => {
      product.variants.forEach((variant) => {
        if (variant.stock <= variant.lowStockThreshold) {
          lowStockProducts.push({
            productId: product._id,
            name: product.name,
            variant,
          });
        }
      });
    });

    res.json({
      success: true,
      count: lowStockProducts.length,
      lowStockProducts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
