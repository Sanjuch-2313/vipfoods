import slugify from "slugify";
import Category from "../models/Category.js";

// ==============================
// Create Category
// ==============================
export const createCategory = async (req, res) => {
  try {
    let {
      name,
      description,
      featured,
      active,
      displayOrder,
      subCategories,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Category image is required",
      });
    }

    const slug = slugify(name, { lower: true, strict: true });

    const exists = await Category.findOne({ slug });

    if (exists) {
      return res.status(409).json({
        success: false,
        message: "Category already exists",
      });
    }

    // Parse sub categories
    if (typeof subCategories === "string") {
      subCategories = JSON.parse(subCategories);
    }

    const formattedSubCategories = (subCategories || []).map((sub) => ({
      name: sub.name.trim(),
      slug: slugify(sub.name, {
        lower: true,
        strict: true,
      }),
      active: sub.active ?? true,
    }));

    const category = await Category.create({
      name: name.trim(),
      slug,
      description,
      image: req.file.path,
      subCategories: formattedSubCategories,
      featured: featured ?? false,
      active: active ?? true,
      displayOrder: Number(displayOrder) || 0,
    });

    return res.status(201).json({
      success: true,
      message: "Category created successfully",
      category,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ==============================
// Get Categories
// ==============================
export const getCategories = async (req, res) => {
  try {
    const { active, featured } = req.query;
    const filter = {};

    if (active !== undefined) {
      filter.active = active === "true";
    }
    if (featured !== undefined) {
      filter.featured = featured === "true";
    }

    const categories = await Category.find(filter).sort({ displayOrder: 1 });

    return res.json({
      success: true,
      count: categories.length,
      categories,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
    });
  }
};

// ==============================
// Delete Category
// ==============================
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    return res.json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
// ==============================
// Update Category
// ==============================
export const updateCategory = async (req, res) => {
  try {
    let {
      name,
      description,
      featured,
      active,
      displayOrder,
      subCategories,
    } = req.body;

    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const slug = slugify(name, {
      lower: true,
      strict: true,
    });

    const exists = await Category.findOne({
      slug,
      _id: { $ne: req.params.id },
    });

    if (exists) {
      return res.status(409).json({
        success: false,
        message: "Category already exists",
      });
    }

    if (typeof subCategories === "string") {
      subCategories = JSON.parse(subCategories);
    }

    category.name = name.trim();
    category.slug = slug;
    category.description = description || "";

    category.subCategories = (subCategories || []).map((sub) => ({
      name: sub.name.trim(),
      slug: slugify(sub.name, {
        lower: true,
        strict: true,
      }),
      active: sub.active ?? true,
    }));

    category.featured = featured ?? category.featured;
    category.active = active ?? category.active;
    category.displayOrder =
      Number(displayOrder) || category.displayOrder;

    if (req.file) {
      category.image = req.file.path;
    }

    await category.save();

    return res.json({
      success: true,
      message: "Category updated successfully",
      category,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};