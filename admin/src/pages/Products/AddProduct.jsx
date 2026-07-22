import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Plus, Save, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

import ImageUploader from "../../components/ImageUploader";
import VariantManager from "../../components/VariantManager";
import CollapsibleSection from "../../components/CollapsibleSection";

import api from "../../services/api";
import { createProduct } from "../../services/productService";

import "../../styles/AddProduct.css";

const DRAFT_KEY = "vipfoods_add_product_draft";

const PREDEFINED_BADGES = [
  "Bestseller",
  "New Arrival",
  "Organic",
  "Premium",
  "Hot Deal",
  "Limited Stock",
  "Seasonal",
];

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
  subCategory: "",

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

const slugify = (text) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const AddProduct = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState(initialFormData);
  const [images, setImages] = useState([]);
  const [variants, setVariants] = useState([createInitialVariant()]);
  const [categories, setCategories] = useState([]);
  const [badges, setBadges] = useState([]);
  const [badgeInput, setBadgeInput] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [draftRestored, setDraftRestored] = useState(false);

  const selectedCategory = useMemo(
    () => categories.find((category) => category._id === formData.category),
    [categories, formData.category]
  );

  // ---------- LOAD CATEGORIES ----------
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

  // ---------- RESTORE DRAFT (once, on mount) ----------
  // Note: only text fields, variants, and badges survive — File objects
  // (images) can't be serialized to localStorage, so images always start
  // empty on a restored draft; the admin re-adds them.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return;

      const draft = JSON.parse(raw);
      if (draft.formData) setFormData((prev) => ({ ...prev, ...draft.formData }));
      if (draft.variants?.length) setVariants(draft.variants);
      if (draft.badges) setBadges(draft.badges);

      setDraftRestored(true);
    } catch (err) {
      console.error("Failed to restore draft:", err);
    }
  }, []);

  // ---------- AUTO-SAVE DRAFT ----------
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(
          DRAFT_KEY,
          JSON.stringify({ formData, variants, badges })
        );
      } catch (err) {
        console.error("Failed to save draft:", err);
      }
    }, 500); // debounce so we're not writing on every keystroke

    return () => clearTimeout(timer);
  }, [formData, variants, badges]);

  const clearDraft = () => {
    localStorage.removeItem(DRAFT_KEY);
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    if (name === "category") {
      setFormData((prev) => ({
        ...prev,
        category: value,
        subCategory: "",
      }));
      setErrors((currentErrors) => ({ ...currentErrors, category: "", subCategory: "" }));
      setSubmitError("");
      return;
    }

    setFormData((currentFormData) => ({
      ...currentFormData,
      [name]: type === "checkbox" ? checked : value,
    }));

    setErrors((currentErrors) => ({ ...currentErrors, [name]: "" }));
    setSubmitError("");
  };

  const setFieldError = (field, value) => {
    setErrors((currentErrors) => ({ ...currentErrors, [field]: value }));
  };

  // ---------- BADGES ----------
  const badgeExists = (badge) =>
    badges.some((b) => b.toLowerCase() === badge.toLowerCase());

  const addBadge = (badge) => {
    const trimmed = badge.trim();
    if (!trimmed) return;

    if (badgeExists(trimmed)) {
      setErrors((currentErrors) => ({
        ...currentErrors,
        badges: "This badge has already been added.",
      }));
      return;
    }

    setBadges((currentBadges) => [...currentBadges, trimmed]);
    setBadgeInput("");
    setErrors((currentErrors) => ({ ...currentErrors, badges: "" }));
  };

  const removeBadge = (index) => {
    setBadges((currentBadges) => currentBadges.filter((_, i) => i !== index));
  };

  // ---------- SECTION COMPLETION (for progress indicator) ----------
  const isProductInfoComplete =
    formData.name.trim() &&
    formData.shortDescription.trim() &&
    formData.description.trim() &&
    formData.brand.trim() &&
    formData.category;

  const isImagesComplete = images.length > 0;

  const isVariantsComplete = variants.every(
    (v) => v.weight.trim() && v.mrp !== "" && v.sellingPrice !== "" && v.stock !== ""
  );

  const isNutritionComplete = ["calories", "protein", "fat", "carbohydrates", "fiber", "sugar"].some(
    (key) => formData[key] !== ""
  );

  const isDeliveryComplete =
    formData.manufacturer.trim() && formData.shelfLife.trim();

  const isSeoComplete = formData.metaTitle.trim() && formData.metaDescription.trim();

  const isPublishComplete = true; // toggles always have a valid default value

  const progressSteps = [
    { label: "Product Information", complete: isProductInfoComplete },
    { label: "Images", complete: isImagesComplete },
    { label: "Variants", complete: isVariantsComplete },
    { label: "Nutrition", complete: isNutritionComplete },
    { label: "Delivery", complete: isDeliveryComplete },
    { label: "SEO", complete: isSeoComplete },
    { label: "Publish", complete: isPublishComplete },
  ];

  // ---------- VALIDATION ----------
  const validateForm = () => {
    const nextErrors = {};

    if (!formData.name.trim()) nextErrors.name = "Product name is required.";
    if (!formData.shortDescription.trim())
      nextErrors.shortDescription = "Short description is required.";
    if (!formData.description.trim()) nextErrors.description = "Description is required.";
    if (!formData.brand.trim()) nextErrors.brand = "Brand is required.";
    if (!formData.category) nextErrors.category = "Category is required.";
    if (!formData.subCategory) nextErrors.subCategory = "Sub Category is required.";
    if (!images.length) nextErrors.images = "At least one product image is required.";

    const variantErrors = variants.map((variant) => {
      const currentErrors = {};

      if (!variant.weight.trim()) currentErrors.weight = "Weight is required.";

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
        currentErrors.sellingPrice = "Enter a valid selling price.";
      } else if (
        variant.mrp !== "" &&
        Number(variant.sellingPrice) > Number(variant.mrp)
      ) {
        currentErrors.sellingPrice = "Selling price cannot exceed MRP.";
      }

      if (
        variant.stock === "" ||
        !Number.isInteger(Number(variant.stock)) ||
        Number(variant.stock) < 0
      ) {
        currentErrors.stock = "Stock must be a non-negative whole number.";
      }

      if (
        variant.lowStockThreshold === "" ||
        !Number.isInteger(Number(variant.lowStockThreshold)) ||
        Number(variant.lowStockThreshold) < 0
      ) {
        currentErrors.lowStockThreshold = "Threshold must be a non-negative whole number.";
      }

      return currentErrors;
    });

    const hasVariantErrors = variantErrors.some(
      (variantError) => Object.keys(variantError).length > 0
    );
    if (hasVariantErrors) nextErrors.variants = variantErrors;

    if (
      !formData.freeDelivery &&
      formData.deliveryCharge !== "" &&
      (Number.isNaN(Number(formData.deliveryCharge)) || Number(formData.deliveryCharge) < 0)
    ) {
      nextErrors.deliveryCharge = "Delivery charge cannot be negative.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const hasErrorInGroup = (keys) => keys.some((key) => Boolean(errors[key]));

  // ---------- BUILD FORMDATA (unchanged from before) ----------
  const appendTextField = (payload, key, value) => {
    payload.append(key, value === null || value === undefined ? "" : value);
  };

  const buildProductFormData = () => {
    const payload = new FormData();

    appendTextField(payload, "name", formData.name.trim());
    appendTextField(payload, "shortDescription", formData.shortDescription.trim());
    appendTextField(payload, "description", formData.description.trim());
    appendTextField(payload, "brand", formData.brand.trim());
    appendTextField(payload, "category", formData.category);
    appendTextField(payload, "subCategory", formData.subCategory);
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
      calories: formData.calories === "" ? 0 : Number(formData.calories),
      protein: formData.protein === "" ? 0 : Number(formData.protein),
      fat: formData.fat === "" ? 0 : Number(formData.fat),
      carbohydrates: formData.carbohydrates === "" ? 0 : Number(formData.carbohydrates),
      fiber: formData.fiber === "" ? 0 : Number(formData.fiber),
      sugar: formData.sugar === "" ? 0 : Number(formData.sugar),
    };
    payload.append("nutrition", JSON.stringify(nutrition));

    appendTextField(payload, "ingredients", formData.ingredients.trim());
    appendTextField(payload, "manufacturer", formData.manufacturer.trim());
    appendTextField(payload, "countryOfOrigin", formData.countryOfOrigin.trim());
    appendTextField(payload, "shelfLife", formData.shelfLife.trim());
    appendTextField(payload, "storageInstructions", formData.storageInstructions.trim());
    appendTextField(payload, "freeDelivery", String(formData.freeDelivery));
    appendTextField(
      payload,
      "deliveryCharge",
      formData.freeDelivery ? "0" : formData.deliveryCharge === "" ? "0" : formData.deliveryCharge
    );
    appendTextField(payload, "estimatedDelivery", formData.estimatedDelivery.trim());
    appendTextField(payload, "metaTitle", formData.metaTitle.trim());
    appendTextField(payload, "metaDescription", formData.metaDescription.trim());

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
        const firstError = document.querySelector(".input-error, .image-uploader--error");
        firstError?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = buildProductFormData();
      const response = await createProduct(payload);
      console.log("Create Product Response:", response);

      clearDraft();
      navigate("/products");
    } catch (error) {
      console.error("Create Product Error:", error, error.response?.data);
      setSubmitError(error?.response?.data?.message || "Unable to create product.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraftClick = () => {
    // Draft is already auto-saving in the background; this button just
    // gives explicit confirmation and takes the admin back to the list.
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ formData, variants, badges }));
    navigate("/products");
  };

  // ---------- LIVE PREVIEW DATA ----------
  const previewImage = images[0] ? URL.createObjectURL(images[0]) : null;
  const lowestPrice = variants.length
    ? Math.min(...variants.map((v) => Number(v.sellingPrice) || Infinity).filter((n) => n !== Infinity))
    : null;
  const highestPrice = variants.length
    ? Math.max(...variants.map((v) => Number(v.sellingPrice) || 0))
    : null;
  const totalStock = variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);
  const previewMrp = variants[0]?.mrp ? Number(variants[0].mrp) : null;
  const previewDiscount =
    previewMrp && lowestPrice && lowestPrice < previewMrp
      ? Math.round(((previewMrp - lowestPrice) / previewMrp) * 100)
      : null;

  const seoSlugPreview = formData.name ? slugify(formData.name) : "product-name";
  const seoCategorySlug = selectedCategory?.slug || "category";

  return (
    <div className="add-product-page">
      <div className="add-product-page__top">
        <button type="button" className="back-button" onClick={() => navigate("/products")}>
          <ArrowLeft size={19} />
          Products
        </button>

        <div className="add-product-page__title-row">
          <div>
            <h1>Add Product</h1>
            <p>Create a new product with images, variants, inventory, delivery, nutrition, and SEO information.</p>
          </div>
        </div>
      </div>

      {draftRestored && (
        <div className="draft-restored-banner">
          Draft restored.
          <button
            type="button"
            onClick={() => {
              clearDraft();
              window.location.reload();
            }}
          >
            <X size={14} /> Discard draft
          </button>
        </div>
      )}

      {submitError && <div className="submit-error-banner">{submitError}</div>}

      {/* ---------- PROGRESS INDICATOR ---------- */}
      <div className="product-progress-bar">
        {progressSteps.map((step) => (
          <div
            key={step.label}
            className={`product-progress-step ${step.complete ? "complete" : ""}`}
          >
            <span className="product-progress-dot" />
            <span className="product-progress-label">{step.label}</span>
          </div>
        ))}
      </div>

      <form id="add-product-form" className="add-product-form" onSubmit={handleSubmit} noValidate>
        <div className="add-product-content">
          <main className="add-product-main">
            <CollapsibleSection
              title="Product Information"
              description="Core details customers and admins use to identify the product."
              complete={isProductInfoComplete}
              defaultOpen
              hasError={hasErrorInGroup(["name", "shortDescription", "description", "brand", "category", "subCategory"])}
            >
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
                    {errors.name ? <p className="field-error">{errors.name}</p> : <span />}
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
                    className={errors.shortDescription ? "input-error" : ""}
                  />
                  <div className="field-meta-row">
                    {errors.shortDescription ? (
                      <p className="field-error">{errors.shortDescription}</p>
                    ) : (
                      <span />
                    )}
                    <small>{formData.shortDescription.length}/300</small>
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
                    className={errors.description ? "input-error" : ""}
                  />
                  {errors.description && <p className="field-error">{errors.description}</p>}
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
                  {errors.brand && <p className="field-error">{errors.brand}</p>}
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
                      {isLoadingCategories ? "Loading categories..." : "Select a category"}
                    </option>
                    {categories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {errors.category && <p className="field-error">{errors.category}</p>}
                </div>

                <div className="form-field">
                  <label htmlFor="subCategory">Sub Category</label>

                  <select
                    id="subCategory"
                    name="subCategory"
                    value={formData.subCategory}
                    onChange={handleChange}
                    disabled={!selectedCategory}
                    className={errors.subCategory ? "input-error" : ""}
                  >
                    <option value="">Select Sub Category</option>

                    {selectedCategory?.subCategories?.map((sub) => (
                      <option key={sub.slug} value={sub.name}>
                        {sub.name}
                      </option>
                    ))}
                  </select>
                  {errors.subCategory && <p className="field-error">{errors.subCategory}</p>}
                </div>
              </div>
            </CollapsibleSection>

            <CollapsibleSection
              title="Images"
              description="Upload clear, high-quality product photos."
              complete={isImagesComplete}
              hasError={Boolean(errors.images)}
            >
              {images.length === 0 && (
                <p className="section-empty-hint">Upload product images to preview your product.</p>
              )}
              <ImageUploader
                images={images}
                setImages={setImages}
                error={errors.images}
                setFieldError={setFieldError}
              />
            </CollapsibleSection>

            <CollapsibleSection
              title="Variants"
              description="Set weight, pricing, and stock for each variant."
              complete={isVariantsComplete}
              hasError={Boolean(errors.variants)}
            >
              {variants.length === 0 && (
                <p className="section-empty-hint">Add your first variant.</p>
              )}
              <VariantManager
                variants={variants}
                setVariants={setVariants}
                errors={errors.variants}
                setFieldError={setFieldError}
              />
            </CollapsibleSection>

            <CollapsibleSection
              title="Nutrition"
              description="Nutritional values shown on the product page."
              complete={isNutritionComplete}
            >
              <div className="nutrition-grid">
                {[
                  ["calories", "Calories"],
                  ["protein", "Protein"],
                  ["fat", "Fat"],
                  ["carbohydrates", "Carbohydrates"],
                  ["fiber", "Fiber"],
                  ["sugar", "Sugar"],
                ].map(([name, label]) => (
                  <div className="nutrition-card" key={name}>
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
            </CollapsibleSection>

            <CollapsibleSection
              title="Delivery & Manufacturing"
              description="Ingredients, manufacturer, storage and shipping details."
              complete={isDeliveryComplete}
              hasError={Boolean(errors.deliveryCharge)}
            >
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
                  <label htmlFor="countryOfOrigin">Country of Origin</label>
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
                  <label htmlFor="estimatedDelivery">Estimated Delivery</label>
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
                  <label htmlFor="storageInstructions">Storage Instructions</label>
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
                  <label htmlFor="deliveryCharge">Delivery Charge</label>
                  <input
                    id="deliveryCharge"
                    name="deliveryCharge"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.freeDelivery ? "0" : formData.deliveryCharge}
                    onChange={handleChange}
                    placeholder="0.00"
                    disabled={formData.freeDelivery}
                    className={errors.deliveryCharge ? "input-error" : ""}
                  />
                  {errors.deliveryCharge && <p className="field-error">{errors.deliveryCharge}</p>}
                </div>

                <div className="form-field">
                  <label>Free Delivery</label>
                  <label className="switch-setting-card">
                    <div>
                      <strong>Enable Free Delivery</strong>
                      <small>Delivery charge will automatically be submitted as zero.</small>
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

              <div className="badges-subsection">
                <h3>Badges</h3>
                <p>Add reusable customer-facing labels.</p>

                <div className="predefined-badge-list">
                  {PREDEFINED_BADGES.map((badge) => (
                    <button
                      type="button"
                      key={badge}
                      className={`predefined-badge-chip ${badgeExists(badge) ? "selected" : ""}`}
                      onClick={() =>
                        badgeExists(badge)
                          ? removeBadge(badges.findIndex((b) => b.toLowerCase() === badge.toLowerCase()))
                          : addBadge(badge)
                      }
                    >
                      {badge}
                    </button>
                  ))}
                </div>

                <div className="badge-input-row">
                  <div className="form-field">
                    <label htmlFor="badgeInput">Custom Badge</label>
                    <input
                      id="badgeInput"
                      type="text"
                      value={badgeInput}
                      onChange={(event) => {
                        setBadgeInput(event.target.value);
                        setErrors((currentErrors) => ({ ...currentErrors, badges: "" }));
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          addBadge(badgeInput);
                        }
                      }}
                      placeholder="e.g. Farm Fresh"
                      maxLength={50}
                    />
                  </div>
                  <button
                    type="button"
                    className="secondary-action-button badge-add-button"
                    onClick={() => addBadge(badgeInput)}
                  >
                    <Plus size={18} />
                    Add Badge
                  </button>
                </div>

                {errors.badges && <p className="field-error">{errors.badges}</p>}

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
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </CollapsibleSection>

            <CollapsibleSection
              title="SEO"
              description="Metadata for search engine listings and sharing previews."
              complete={isSeoComplete}
            >
              <div className="seo-preview">
                <span className="seo-preview__site">vipfoods.in</span>
                <p className="seo-preview__title">
                  {formData.metaTitle || formData.name || "Product Title | VIP Foods"}
                </p>
                <p className="seo-preview__url">
                  vipfoods.in/{seoCategorySlug}/{seoSlugPreview}
                </p>
                <p className="seo-preview__description">
                  {formData.metaDescription ||
                    formData.shortDescription ||
                    "Write a search-friendly description of this product."}
                </p>
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
                  <label htmlFor="metaDescription">Meta Description</label>
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
                    <small>{formData.metaDescription.length}/160</small>
                  </div>
                </div>
              </div>
            </CollapsibleSection>

            <CollapsibleSection
              title="Publish Settings"
              description="Control product visibility and merchandising."
              complete={isPublishComplete}
            >
              <div className="status-setting-list">
                <label className="switch-setting-card">
                  <div>
                    <strong>Active</strong>
                    <small>Product is available for admin and storefront use.</small>
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
                    <small>Product can be displayed to customers.</small>
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
                    <small>Product can appear in featured sections.</small>
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
            </CollapsibleSection>
          </main>

          <aside className="add-product-sidebar">
            <section className="add-product-section live-preview-card">
              <div className="add-product-section__header">
                <div>
                  <h2>Live Preview</h2>
                </div>
              </div>

              <div className="live-preview">
                <div className="live-preview__image">
                  {previewImage ? (
                    <img src={previewImage} alt="Product preview" />
                  ) : (
                    <span>No image yet</span>
                  )}
                </div>

                <p className="live-preview__brand">{formData.brand || "Brand"}</p>
                <h3 className="live-preview__name">{formData.name || "Product name"}</h3>

                <div className="live-preview__price-row">
                  {lowestPrice !== null && (
                    <span className="live-preview__price">₹{lowestPrice}</span>
                  )}
                  {previewMrp && previewDiscount && (
                    <>
                      <span className="live-preview__mrp">₹{previewMrp}</span>
                      <span className="live-preview__discount">{previewDiscount}% OFF</span>
                    </>
                  )}
                </div>

                {badges.length > 0 && (
                  <div className="live-preview__badges">
                    {badges.map((badge, i) => (
                      <span key={i}>{badge}</span>
                    ))}
                  </div>
                )}
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
                  <dt>Product Name</dt>
                  <dd>{formData.name || "Not set"}</dd>
                </div>
                <div>
                  <dt>Category</dt>
                  <dd>{selectedCategory?.name || "Not selected"}</dd>
                </div>
                <div>
                  <dt>Sub Category</dt>
                  <dd>{formData.subCategory || "Not selected"}</dd>
                </div>
                <div>
                  <dt>Variants</dt>
                  <dd>{variants.length}</dd>
                </div>
                <div>
                  <dt>Images</dt>
                  <dd>{images.length}</dd>
                </div>
                <div>
                  <dt>Lowest Price</dt>
                  <dd>{lowestPrice !== null ? `₹${lowestPrice}` : "—"}</dd>
                </div>
                <div>
                  <dt>Highest Price</dt>
                  <dd>{highestPrice !== null && highestPrice > 0 ? `₹${highestPrice}` : "—"}</dd>
                </div>
                <div>
                  <dt>Total Stock</dt>
                  <dd>{totalStock}</dd>
                </div>
                <div>
                  <dt>Status</dt>
                  <dd>{formData.published ? "Published" : "Draft / Unpublished"}</dd>
                </div>
                <div>
                  <dt>Featured</dt>
                  <dd>{formData.featured ? "Yes" : "No"}</dd>
                </div>
              </dl>
            </section>
          </aside>
        </div>
      </form>

      {/* ---------- STICKY BOTTOM ACTION BAR ---------- */}
      <div className="sticky-action-bar">
        <button
          type="button"
          className="cancel-button"
          onClick={() => navigate("/products")}
          disabled={isSubmitting}
        >
          Cancel
        </button>

        <button
          type="button"
          className="secondary-action-button"
          onClick={handleSaveDraftClick}
          disabled={isSubmitting}
        >
          Save Draft
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
  );
};

export default AddProduct;