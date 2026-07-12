import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Plus, Save, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

import ImageUploader from "../../components/ImageUploader";
import VariantManager from "../../components/VariantManager";

import api from "../../services/api";
import { createProduct } from "../../services/productService";

import "../../styles/AddProduct.css";

const createInitialVariant = () => ({
  weight: "",
  mrp: "",
  sellingPrice: "",
  stock: "",
  lowStockThreshold: "",
});

const initialFormData = {
  name: "",
  shortDescription: "",
  description: "",
  brand: "",
  category: "",
  foodType: "",
snackType: "",
freshType: "",
spiceType: "",

  featured: false,
  published: true,
  active: true,

  calories: "",
  protein: "",
  fat: "",
  carbohydrates: "",
  fiber: "",
  sugar: "",

  ingredients: "",
  manufacturer: "",
  countryOfOrigin: "",
  shelfLife: "",
  storageInstructions: "",

  deliveryCharge: "",
  estimatedDelivery: "",
  freeDelivery: false,

  metaTitle: "",
  metaDescription: "",
};

const AddProduct = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState(initialFormData);

  const [images, setImages] = useState([]);

  const [variants, setVariants] = useState([
    createInitialVariant(),
  ]);

  const [categories, setCategories] = useState([]);

  const [badges, setBadges] = useState([]);

  const [badgeInput, setBadgeInput] = useState("");

  const [errors, setErrors] = useState({});

  const [isLoadingCategories, setIsLoadingCategories] =
    useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [submitError, setSubmitError] = useState("");

  const selectedCategory = useMemo(
    () =>
      categories.find(
        (category) => category._id === formData.category
      ),
    [categories, formData.category]
  );

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setIsLoadingCategories(true);

        const response = await api.get("/categories");

        const responseData = response.data;

        const categoryList = Array.isArray(responseData)
          ? responseData
          : responseData?.categories ||
            responseData?.data ||
            responseData?.data?.categories ||
            [];

        setCategories(categoryList);
      } catch (error) {
        console.error("Failed to load categories:", error);

        setSubmitError(
          error?.response?.data?.message ||
            "Unable to load categories. Please refresh the page."
        );
      } finally {
        setIsLoadingCategories(false);
      }
    };

    loadCategories();
  }, []);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData((currentFormData) => ({
      ...currentFormData,
      [name]: type === "checkbox" ? checked : value,
    }));

    setErrors((currentErrors) => ({
      ...currentErrors,
      [name]: "",
    }));

    setSubmitError("");
  };

  const setFieldError = (field, value) => {
    setErrors((currentErrors) => ({
      ...currentErrors,
      [field]: value,
    }));
  };

  const addBadge = () => {
    const badge = badgeInput.trim();

    if (!badge) return;

    const alreadyExists = badges.some(
      (currentBadge) =>
        currentBadge.toLowerCase() === badge.toLowerCase()
    );

    if (alreadyExists) {
      setErrors((currentErrors) => ({
        ...currentErrors,
        badges: "This badge has already been added.",
      }));

      return;
    }

    setBadges((currentBadges) => [...currentBadges, badge]);

    setBadgeInput("");

    setErrors((currentErrors) => ({
      ...currentErrors,
      badges: "",
    }));
  };

  const removeBadge = (index) => {
    setBadges((currentBadges) =>
      currentBadges.filter(
        (_, badgeIndex) => badgeIndex !== index
      )
    );
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!formData.name.trim()) {
      nextErrors.name = "Product name is required.";
    }

    if (!formData.shortDescription.trim()) {
      nextErrors.shortDescription =
        "Short description is required.";
    }

    if (!formData.description.trim()) {
      nextErrors.description = "Description is required.";
    }

    if (!formData.brand.trim()) {
      nextErrors.brand = "Brand is required.";
    }

    if (!formData.category) {
      nextErrors.category = "Category is required.";
    }

    if (!images.length) {
      nextErrors.images = "At least one product image is required.";
    }

    const variantErrors = variants.map((variant) => {
      const currentErrors = {};

      if (!variant.weight.trim()) {
        currentErrors.weight = "Weight is required.";
      }

      

      if (
        variant.mrp === "" ||
        Number.isNaN(Number(variant.mrp)) ||
        Number(variant.mrp) < 0
      ) {
        currentErrors.mrp = "Enter a valid MRP.";
      }

      if (
        variant.sellingPrice === "" ||
        Number.isNaN(Number(variant.sellingPrice)) ||
        Number(variant.sellingPrice) < 0
      ) {
        currentErrors.sellingPrice =
          "Enter a valid selling price.";
      } else if (
        variant.mrp !== "" &&
        Number(variant.sellingPrice) > Number(variant.mrp)
      ) {
        currentErrors.sellingPrice =
          "Selling price cannot exceed MRP.";
      }

      if (
        variant.stock === "" ||
        !Number.isInteger(Number(variant.stock)) ||
        Number(variant.stock) < 0
      ) {
        currentErrors.stock =
          "Stock must be a non-negative whole number.";
      }

      if (
        variant.lowStockThreshold === "" ||
        !Number.isInteger(Number(variant.lowStockThreshold)) ||
        Number(variant.lowStockThreshold) < 0
      ) {
        currentErrors.lowStockThreshold =
          "Threshold must be a non-negative whole number.";
      }

      return currentErrors;
    });

    const hasVariantErrors = variantErrors.some(
      (variantError) => Object.keys(variantError).length > 0
    );

    if (hasVariantErrors) {
      nextErrors.variants = variantErrors;
    }

    

    if (
      !formData.freeDelivery &&
      formData.deliveryCharge !== "" &&
      (Number.isNaN(Number(formData.deliveryCharge)) ||
        Number(formData.deliveryCharge) < 0)
    ) {
      nextErrors.deliveryCharge =
        "Delivery charge cannot be negative.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const appendTextField = (payload, key, value) => {
    payload.append(key, value === null || value === undefined ? "" : value);
  };

  const buildProductFormData = () => {
    const payload = new FormData();

    appendTextField(payload, "name", formData.name.trim());

    appendTextField(
      payload,
      "shortDescription",
      formData.shortDescription.trim()
    );

    appendTextField(
      payload,
      "description",
      formData.description.trim()
    );

    appendTextField(payload, "brand", formData.brand.trim());

    appendTextField(payload, "category", formData.category);
    appendTextField(payload, "foodType", formData.foodType);

appendTextField(payload, "snackType", formData.snackType);

appendTextField(payload, "freshType", formData.freshType);

appendTextField(payload, "spiceType", formData.spiceType);

    appendTextField(payload, "featured", String(formData.featured));

    appendTextField(payload, "published", String(formData.published));

    appendTextField(payload, "active", String(formData.active));

    const normalizedVariants = variants.map((variant) => ({
  weight: variant.weight.trim(),
  mrp: Number(variant.mrp),
  sellingPrice: Number(variant.sellingPrice),
  stock: Number(variant.stock),
  lowStockThreshold: Number(variant.lowStockThreshold),
}));

    payload.append("variants", JSON.stringify(normalizedVariants));

    const nutrition = {
      calories:
        formData.calories === "" ? 0 : Number(formData.calories),

      protein:
        formData.protein === "" ? 0 : Number(formData.protein),

      fat: formData.fat === "" ? 0 : Number(formData.fat),

      carbohydrates:
        formData.carbohydrates === ""
          ? 0
          : Number(formData.carbohydrates),

      fiber:
        formData.fiber === "" ? 0 : Number(formData.fiber),

      sugar:
        formData.sugar === "" ? 0 : Number(formData.sugar),
    };

    payload.append("nutrition", JSON.stringify(nutrition));

    appendTextField(
      payload,
      "ingredients",
      formData.ingredients.trim()
    );

    appendTextField(
      payload,
      "manufacturer",
      formData.manufacturer.trim()
    );

    appendTextField(
      payload,
      "countryOfOrigin",
      formData.countryOfOrigin.trim()
    );

    appendTextField(
      payload,
      "shelfLife",
      formData.shelfLife.trim()
    );

    appendTextField(
      payload,
      "storageInstructions",
      formData.storageInstructions.trim()
    );

    appendTextField(
      payload,
      "freeDelivery",
      String(formData.freeDelivery)
    );

    appendTextField(
      payload,
      "deliveryCharge",
      formData.freeDelivery
        ? "0"
        : formData.deliveryCharge === ""
          ? "0"
          : formData.deliveryCharge
    );

    appendTextField(
      payload,
      "estimatedDelivery",
      formData.estimatedDelivery.trim()
    );

    appendTextField(
      payload,
      "metaTitle",
      formData.metaTitle.trim()
    );

    appendTextField(
      payload,
      "metaDescription",
      formData.metaDescription.trim()
    );

    payload.append("badges", JSON.stringify(badges));

    images.forEach((image) => {
      payload.append("images", image);
    });

    return payload;
  };

  const handleSubmit = async (event) => {
  event.preventDefault();

  setSubmitError("");

  if (!validateForm()) {
    requestAnimationFrame(() => {
      const firstError = document.querySelector(
        ".input-error, .image-uploader--error"
      );

      firstError?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    });

    return;
  }

  try {
    setIsSubmitting(true);

    const payload = buildProductFormData();

    console.log("========== FORMDATA ==========");

    for (const pair of payload.entries()) {
      console.log(pair[0], pair[1]);
    }

    console.log("==============================");

    const response = await createProduct(payload);

    console.log("Create Product Response:", response);

    navigate("/products");
  } catch (error) {
    console.error("Create Product Error:");

    console.error(error);

    console.error(error.response);

    console.error(error.response?.data);

    setSubmitError(
      error?.response?.data?.message ||
        "Unable to create product."
    );
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <div className="add-product-page">
      <div className="add-product-page__top">
        <button
          type="button"
          className="back-button"
          onClick={() => navigate("/products")}
        >
          <ArrowLeft size={19} />

          Products
        </button>

        <div className="add-product-page__title-row">
          <div>
            <h1>Add Product</h1>

            <p>
              Create a new product with images, variants, inventory,
              delivery, nutrition, and SEO information.
            </p>
          </div>

          <div className="add-product-page__top-actions">
            <button
              type="button"
              className="cancel-button"
              onClick={() => navigate("/products")}
              disabled={isSubmitting}
            >
              Cancel
            </button>

            <button
              type="submit"
              form="add-product-form"
              className="primary-action-button"
              disabled={isSubmitting}
            >
              <Save size={18} />

              {isSubmitting ? "Creating Product..." : "Create Product"}
            </button>
          </div>
        </div>
      </div>

      {submitError && (
        <div className="submit-error-banner">
          {submitError}
        </div>
      )}

      <form
        id="add-product-form"
        className="add-product-form"
        onSubmit={handleSubmit}
        noValidate
      >
        <div className="add-product-content">
          <main className="add-product-main">
            <section className="add-product-section">
              <div className="add-product-section__header">
                <div>
                  <h2>Product Information</h2>

                  <p>
                    Enter the main information customers and administrators
                    will use to identify the product.
                  </p>
                </div>
              </div>

              <div className="form-grid form-grid--2">
                <div className="form-field form-field--full">
                  <label htmlFor="name">
                    Product Name <span>*</span>
                  </label>

                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Premium Basmati Rice"
                    maxLength={150}
                    className={errors.name ? "input-error" : ""}
                  />

                  <div className="field-meta-row">
                    {errors.name ? (
                      <p className="field-error">{errors.name}</p>
                    ) : (
                      <span />
                    )}

                    <small>{formData.name.length}/150</small>
                  </div>
                </div>

                <div className="form-field form-field--full">
                  <label htmlFor="shortDescription">
                    Short Description <span>*</span>
                  </label>

                  <textarea
                    id="shortDescription"
                    name="shortDescription"
                    value={formData.shortDescription}
                    onChange={handleChange}
                    placeholder="A concise product summary displayed on product cards and listings."
                    rows={3}
                    maxLength={300}
                    className={
                      errors.shortDescription ? "input-error" : ""
                    }
                  />

                  <div className="field-meta-row">
                    {errors.shortDescription ? (
                      <p className="field-error">
                        {errors.shortDescription}
                      </p>
                    ) : (
                      <span />
                    )}

                    <small>
                      {formData.shortDescription.length}/300
                    </small>
                  </div>
                </div>

                <div className="form-field form-field--full">
                  <label htmlFor="description">
                    Description <span>*</span>
                  </label>

                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Enter complete product information, quality details, usage information, and customer-facing description."
                    rows={7}
                    className={
                      errors.description ? "input-error" : ""
                    }
                  />

                  {errors.description && (
                    <p className="field-error">
                      {errors.description}
                    </p>
                  )}
                </div>

                <div className="form-field">
                  <label htmlFor="brand">
                    Brand <span>*</span>
                  </label>

                  <input
                    id="brand"
                    name="brand"
                    type="text"
                    value={formData.brand}
                    onChange={handleChange}
                    placeholder="VIP Foods"
                    className={errors.brand ? "input-error" : ""}
                  />

                  {errors.brand && (
                    <p className="field-error">{errors.brand}</p>
                  )}
                </div>

                <div className="form-field">
  <label htmlFor="category">
    Category <span>*</span>
  </label>

  <select
    id="category"
    name="category"
    value={formData.category}
    onChange={handleChange}
    disabled={isLoadingCategories}
    className={errors.category ? "input-error" : ""}
  >
    <option value="">
      {isLoadingCategories
        ? "Loading categories..."
        : "Select a category"}
    </option>

    {categories.map((category) => (
      <option
        key={category._id}
        value={category._id}
      >
        {category.name}
      </option>
    ))}
  </select>

  {errors.category && (
    <p className="field-error">
      {errors.category}
    </p>
  )}
</div>

{/* PICKLES */}
{selectedCategory?.slug === "pickles" && (
  <div className="form-field">
    <label>Food Type</label>

    <select
      name="foodType"
      value={formData.foodType}
      onChange={handleChange}
    >
      <option value="">Select Food Type</option>
      <option value="veg">Veg</option>
      <option value="non-veg">Non-Veg</option>
    </select>
  </div>
)}

{/* SNACKS */}
{selectedCategory?.slug === "snacks" && (
  <div className="form-field">
    <label>Snack Type</label>

    <select
      name="snackType"
      value={formData.snackType}
      onChange={handleChange}
    >
      <option value="">Select Snack Type</option>
      <option value="sweet">Sweet</option>
      <option value="hot">Hot</option>
    </select>
  </div>
)}

{/* FRESH */}
{selectedCategory?.slug === "fresh" && (
  <div className="form-field">
    <label>Fresh Type</label>

    <select
      name="freshType"
      value={formData.freshType}
      onChange={handleChange}
    >
      <option value="">Select Fresh Type</option>
      <option value="fruits">Fruits</option>
      <option value="vegetables">Vegetables</option>
    </select>
  </div>
)}

{/* SPICES */}
{selectedCategory?.slug === "spices" && (
  <div className="form-field">
    <label>Spice Type</label>

    <select
      name="spiceType"
      value={formData.spiceType}
      onChange={handleChange}
    >
      <option value="">Select Spice Type</option>
      <option value="grinded">Grinded</option>
      <option value="normal">Normal</option>
    </select>
  </div>
)}
              </div>
            </section>

            <ImageUploader
              images={images}
              setImages={setImages}
              error={errors.images}
              setFieldError={setFieldError}
            />

            <VariantManager
              variants={variants}
              setVariants={setVariants}
              errors={errors.variants}
              setFieldError={setFieldError}
            />

            <section className="add-product-section">
              <div className="add-product-section__header">
                <div>
                  <h2>Nutrition Information</h2>

                  <p>
                    Add nutritional values displayed in the product
                    information section.
                  </p>
                </div>
              </div>

              <div className="form-grid form-grid--3">
                {[
                  ["calories", "Calories"],
                  ["protein", "Protein"],
                  ["fat", "Fat"],
                  ["carbohydrates", "Carbohydrates"],
                  ["fiber", "Fiber"],
                  ["sugar", "Sugar"],
                ].map(([name, label]) => (
                  <div className="form-field" key={name}>
                    <label htmlFor={name}>{label}</label>

                    <input
                      id={name}
                      name={name}
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData[name]}
                      onChange={handleChange}
                      placeholder="0"
                    />
                  </div>
                ))}
              </div>
            </section>

            <section className="add-product-section">
              <div className="add-product-section__header">
                <div>
                  <h2>Other Details</h2>

                  <p>
                    Add manufacturing, storage, shelf-life, and delivery
                    information.
                  </p>
                </div>
              </div>

              <div className="form-grid form-grid--2">
                <div className="form-field form-field--full">
                  <label htmlFor="ingredients">Ingredients</label>

                  <textarea
                    id="ingredients"
                    name="ingredients"
                    value={formData.ingredients}
                    onChange={handleChange}
                    placeholder="Enter ingredients separated by commas."
                    rows={4}
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="manufacturer">Manufacturer</label>

                  <input
                    id="manufacturer"
                    name="manufacturer"
                    type="text"
                    value={formData.manufacturer}
                    onChange={handleChange}
                    placeholder="Manufacturer name"
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="countryOfOrigin">
                    Country of Origin
                  </label>

                  <input
                    id="countryOfOrigin"
                    name="countryOfOrigin"
                    type="text"
                    value={formData.countryOfOrigin}
                    onChange={handleChange}
                    placeholder="India"
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="shelfLife">Shelf Life</label>

                  <input
                    id="shelfLife"
                    name="shelfLife"
                    type="text"
                    value={formData.shelfLife}
                    onChange={handleChange}
                    placeholder="12 months"
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="estimatedDelivery">
                    Estimated Delivery
                  </label>

                  <input
                    id="estimatedDelivery"
                    name="estimatedDelivery"
                    type="text"
                    value={formData.estimatedDelivery}
                    onChange={handleChange}
                    placeholder="3-5 business days"
                  />
                </div>

                <div className="form-field form-field--full">
                  <label htmlFor="storageInstructions">
                    Storage Instructions
                  </label>

                  <textarea
                    id="storageInstructions"
                    name="storageInstructions"
                    value={formData.storageInstructions}
                    onChange={handleChange}
                    placeholder="Store in a cool and dry place away from direct sunlight."
                    rows={4}
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="deliveryCharge">
                    Delivery Charge
                  </label>

                  <input
                    id="deliveryCharge"
                    name="deliveryCharge"
                    type="number"
                    min="0"
                    step="0.01"
                    value={
                      formData.freeDelivery
                        ? "0"
                        : formData.deliveryCharge
                    }
                    onChange={handleChange}
                    placeholder="0.00"
                    disabled={formData.freeDelivery}
                    className={
                      errors.deliveryCharge ? "input-error" : ""
                    }
                  />

                  {errors.deliveryCharge && (
                    <p className="field-error">
                      {errors.deliveryCharge}
                    </p>
                  )}
                </div>

                <div className="form-field">
                  <label>Free Delivery</label>

                  <label className="switch-setting-card">
                    <div>
                      <strong>Enable Free Delivery</strong>

                      <small>
                        Delivery charge will automatically be submitted as
                        zero.
                      </small>
                    </div>

                    <span className="toggle-switch">
                      <input
                        type="checkbox"
                        name="freeDelivery"
                        checked={formData.freeDelivery}
                        onChange={handleChange}
                      />

                      <span className="toggle-switch__slider" />
                    </span>
                  </label>
                </div>
              </div>
            </section>

            <section className="add-product-section">
              <div className="add-product-section__header">
                <div>
                  <h2>Badges</h2>

                  <p>
                    Add reusable customer-facing labels such as Bestseller,
                    Organic, Premium, or New Arrival.
                  </p>
                </div>
              </div>

              <div className="badge-input-row">
                <div className="form-field">
                  <label htmlFor="badgeInput">Badge Name</label>

                  <input
                    id="badgeInput"
                    type="text"
                    value={badgeInput}
                    onChange={(event) => {
                      setBadgeInput(event.target.value);

                      setErrors((currentErrors) => ({
                        ...currentErrors,
                        badges: "",
                      }));
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        addBadge();
                      }
                    }}
                    placeholder="Bestseller"
                    maxLength={50}
                  />
                </div>

                <button
                  type="button"
                  className="secondary-action-button badge-add-button"
                  onClick={addBadge}
                >
                  <Plus size={18} />

                  Add Badge
                </button>
              </div>

              {errors.badges && (
                <p className="field-error">{errors.badges}</p>
              )}

              {badges.length > 0 && (
                <div className="badge-list">
                  {badges.map((badge, index) => (
                    <span className="badge-chip" key={`${badge}-${index}`}>
                      {badge}

                      <button
                        type="button"
                        onClick={() => removeBadge(index)}
                        aria-label={`Remove ${badge} badge`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </section>

            <section className="add-product-section">
              <div className="add-product-section__header">
                <div>
                  <h2>Search Engine Optimization</h2>

                  <p>
                    Add metadata used for search engine listings and product
                    sharing previews.
                  </p>
                </div>
              </div>

              <div className="form-grid">
                <div className="form-field">
                  <label htmlFor="metaTitle">Meta Title</label>

                  <input
                    id="metaTitle"
                    name="metaTitle"
                    type="text"
                    value={formData.metaTitle}
                    onChange={handleChange}
                    placeholder="Premium Basmati Rice | VIP Foods"
                    maxLength={70}
                  />

                  <div className="field-meta-row">
                    <span />

                    <small>{formData.metaTitle.length}/70</small>
                  </div>
                </div>

                <div className="form-field">
                  <label htmlFor="metaDescription">
                    Meta Description
                  </label>

                  <textarea
                    id="metaDescription"
                    name="metaDescription"
                    value={formData.metaDescription}
                    onChange={handleChange}
                    placeholder="Write a concise search-friendly description of this product."
                    rows={4}
                    maxLength={160}
                  />

                  <div className="field-meta-row">
                    <span />

                    <small>
                      {formData.metaDescription.length}/160
                    </small>
                  </div>
                </div>
              </div>
            </section>
          </main>

          <aside className="add-product-sidebar">
            <section className="add-product-section add-product-status-card">
              <div className="add-product-section__header">
                <div>
                  <h2>Product Status</h2>

                  <p>Control product visibility and merchandising.</p>
                </div>
              </div>

              <div className="status-setting-list">
                <label className="switch-setting-card">
                  <div>
                    <strong>Active</strong>

                    <small>
                      Product is available for admin and storefront use.
                    </small>
                  </div>

                  <span className="toggle-switch">
                    <input
                      type="checkbox"
                      name="active"
                      checked={formData.active}
                      onChange={handleChange}
                    />

                    <span className="toggle-switch__slider" />
                  </span>
                </label>

                <label className="switch-setting-card">
                  <div>
                    <strong>Published</strong>

                    <small>
                      Product can be displayed to customers.
                    </small>
                  </div>

                  <span className="toggle-switch">
                    <input
                      type="checkbox"
                      name="published"
                      checked={formData.published}
                      onChange={handleChange}
                    />

                    <span className="toggle-switch__slider" />
                  </span>
                </label>

                <label className="switch-setting-card">
                  <div>
                    <strong>Featured</strong>

                    <small>
                      Product can appear in featured sections.
                    </small>
                  </div>

                  <span className="toggle-switch">
                    <input
                      type="checkbox"
                      name="featured"
                      checked={formData.featured}
                      onChange={handleChange}
                    />

                    <span className="toggle-switch__slider" />
                  </span>
                </label>
              </div>
            </section>

            <section className="add-product-section product-summary-card">
              <div className="add-product-section__header">
                <div>
                  <h2>Product Summary</h2>
                </div>
              </div>

              <dl>
                <div>
                  <dt>Category</dt>

                  <dd>
                    {selectedCategory?.name || "Not selected"}
                  </dd>
                </div>

                <div>
                  <dt>Images</dt>

                  <dd>{images.length}</dd>
                </div>

                <div>
                  <dt>Variants</dt>

                  <dd>{variants.length}</dd>
                </div>

                <div>
                  <dt>Badges</dt>

                  <dd>{badges.length}</dd>
                </div>

                <div>
                  <dt>Status</dt>

                  <dd>
                    {formData.published
                      ? "Published"
                      : "Draft / Unpublished"}
                  </dd>
                </div>
              </dl>
            </section>
          </aside>
        </div>

        <div className="add-product-footer-actions">
          <button
            type="button"
            className="cancel-button"
            onClick={() => navigate("/products")}
            disabled={isSubmitting}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="primary-action-button"
            disabled={isSubmitting}
          >
            <Save size={18} />

            {isSubmitting ? "Creating Product..." : "Create Product"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;