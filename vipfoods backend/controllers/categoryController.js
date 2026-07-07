import slugify from "slugify";

import Category from "../models/Category.js";

export const createCategory = async (req, res) => {
  try {

    const {
      name,
      description,
      featured,
      active,
      displayOrder,
    } = req.body;

    const exists = await Category.findOne({
      name,
    });

    if (exists) {
      return res.status(409).json({
        success: false,
        message: "Category already exists",
      });
    }

    const category = await Category.create({
      name,

      slug: slugify(name, {
        lower: true,
        strict: true,
      }),

      description,

      image:
        req.file?.path || "",

      featured,

      active,

      displayOrder,
    });

    return res.status(201).json({
      success: true,

      message:
        "Category created successfully",

      category,
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      success: false,

      message:
        "Server Error",
    });

  }
};

export const getCategories = async (
  req,
  res
) => {

  const categories =
    await Category.find().sort({
      displayOrder: 1,
    });

  return res.json({
    success: true,

    categories,
  });

};

export const deleteCategory =
async (req, res) => {

  await Category.findByIdAndDelete(
    req.params.id
  );

  return res.json({
    success: true,

    message:
      "Category deleted",
  });

};