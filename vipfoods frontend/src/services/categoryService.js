import slugify from "slugify";

// ==============================
// Create Category
// ==============================
export const createCategory = async (req, res) => {
  try {
    console.log("========== CATEGORY CREATE ==========");
    console.log("Content-Type:", req.headers["content-type"]);
    console.log("Body:", req.body);
    console.log("File:", req.file);

    const { name, description, featured, active, displayOrder } = req.body;

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

    const slug = slugify(name, {
      lower: true,
      strict: true,
    });

    const exists = await Category.findOne({ slug });

    if (exists) {
      return res.status(409).json({
        success: false,
        message: "Category already exists",
      });
    }

    const category = await Category.create({
      name: name.trim(),
      slug,
      description: description || "",
      image: req.file.path,
      featured: featured === "true",
      active: active !== "false",
      displayOrder: Number(displayOrder) || 0,
    });

    return res.status(201).json({
      success: true,
      message: "Category created successfully",
      category,
    });
  } catch (error) {
    console.error("CATEGORY ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
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

    const categories = await Category.find(filter).sort({
      displayOrder: 1,
    });

    return res.json({
      success: true,
      count: categories.length,
      categories,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
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
      message: error.message,
    });
  }
};