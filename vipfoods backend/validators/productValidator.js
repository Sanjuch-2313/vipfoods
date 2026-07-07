import { body } from "express-validator";

export const createProductValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Product name is required")
    .isLength({ max: 200 })
    .withMessage("Product name cannot exceed 200 characters"),

  body("slug")
    .trim()
    .notEmpty()
    .withMessage("Slug is required"),

  body("category")
    .notEmpty()
    .withMessage("Category is required"),

  body("shortDescription")
    .trim()
    .notEmpty()
    .withMessage("Short description is required")
    .isLength({ max: 300 })
    .withMessage("Short description cannot exceed 300 characters"),

  body("description")
    .trim()
    .notEmpty()
    .withMessage("Description is required"),

  body("variants")
    .isArray({ min: 1 })
    .withMessage("At least one product variant is required"),
];

export const updateProductValidator = createProductValidator;