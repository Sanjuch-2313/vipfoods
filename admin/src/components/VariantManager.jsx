import { Plus, Trash2 } from "lucide-react";

const createVariant = () => ({
  weight: "",
  mrp: "",
  sellingPrice: "",
  stock: "",
  lowStockThreshold: "",
});

const VariantManager = ({
  variants,
  setVariants,
  errors = [],
  setFieldError,
}) => {
  const addVariant = () => {
    setVariants((currentVariants) => [
      ...currentVariants,
      createVariant(),
    ]);
  };

  const removeVariant = (index) => {
    if (variants.length === 1) {
      return;
    }

    setVariants((currentVariants) =>
      currentVariants.filter(
        (_, variantIndex) => variantIndex !== index
      )
    );

    setFieldError?.("variants", []);
  };

  const updateVariant = (index, field, value) => {
    setVariants((currentVariants) =>
      currentVariants.map((variant, variantIndex) =>
        variantIndex === index
          ? {
              ...variant,
              [field]: value,
            }
          : variant
      )
    );

    setFieldError?.("variants", []);
  };

  return (
    <div className="add-product-section">
      <div className="add-product-section__header variant-section-header">
        <div>
          <h2>Product Variants</h2>

          <p>
            Add pricing and inventory information for each product variant.
            SKU will be generated automatically.
          </p>
        </div>

        <button
          type="button"
          className="secondary-action-button"
          onClick={addVariant}
        >
          <Plus size={18} />
          Add Variant
        </button>
      </div>

      <div className="variant-list">
        {variants.map((variant, index) => {
          const variantErrors = errors[index] || {};

          return (
            <div className="variant-card" key={index}>
              <div className="variant-card__header">
                <div>
                  <span className="variant-number">
                    Variant {index + 1}
                  </span>

                  <h3>
                    {variant.weight.trim() || "New Product Variant"}
                  </h3>
                </div>

                <button
                  type="button"
                  className="icon-danger-button"
                  onClick={() => removeVariant(index)}
                  disabled={variants.length === 1}
                  aria-label={`Remove variant ${index + 1}`}
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <div className="form-grid form-grid--2">
                <div className="form-field">
                  <label htmlFor={`variant-weight-${index}`}>
                    Weight <span>*</span>
                  </label>

                  <input
                    id={`variant-weight-${index}`}
                    type="text"
                    value={variant.weight}
                    placeholder="500g"
                    onChange={(event) =>
                      updateVariant(index, "weight", event.target.value)
                    }
                    className={variantErrors.weight ? "input-error" : ""}
                  />

                  {variantErrors.weight && (
                    <p className="field-error">
                      {variantErrors.weight}
                    </p>
                  )}
                </div>

                <div className="form-field">
                  <label htmlFor={`variant-mrp-${index}`}>
                    MRP <span>*</span>
                  </label>

                  <input
                    id={`variant-mrp-${index}`}
                    type="number"
                    min="0"
                    step="0.01"
                    value={variant.mrp}
                    placeholder="0.00"
                    onChange={(event) =>
                      updateVariant(index, "mrp", event.target.value)
                    }
                    className={variantErrors.mrp ? "input-error" : ""}
                  />

                  {variantErrors.mrp && (
                    <p className="field-error">
                      {variantErrors.mrp}
                    </p>
                  )}
                </div>

                <div className="form-field">
                  <label htmlFor={`variant-selling-price-${index}`}>
                    Selling Price <span>*</span>
                  </label>

                  <input
                    id={`variant-selling-price-${index}`}
                    type="number"
                    min="0"
                    step="0.01"
                    value={variant.sellingPrice}
                    placeholder="0.00"
                    onChange={(event) =>
                      updateVariant(
                        index,
                        "sellingPrice",
                        event.target.value
                      )
                    }
                    className={
                      variantErrors.sellingPrice ? "input-error" : ""
                    }
                  />

                  {variantErrors.sellingPrice && (
                    <p className="field-error">
                      {variantErrors.sellingPrice}
                    </p>
                  )}
                </div>

                <div className="form-field">
                  <label htmlFor={`variant-stock-${index}`}>
                    Stock <span>*</span>
                  </label>

                  <input
                    id={`variant-stock-${index}`}
                    type="number"
                    min="0"
                    step="1"
                    value={variant.stock}
                    placeholder="0"
                    onChange={(event) =>
                      updateVariant(index, "stock", event.target.value)
                    }
                    className={variantErrors.stock ? "input-error" : ""}
                  />

                  {variantErrors.stock && (
                    <p className="field-error">
                      {variantErrors.stock}
                    </p>
                  )}
                </div>

                <div className="form-field">
                  <label htmlFor={`variant-threshold-${index}`}>
                    Low Stock Threshold <span>*</span>
                  </label>

                  <input
                    id={`variant-threshold-${index}`}
                    type="number"
                    min="0"
                    step="1"
                    value={variant.lowStockThreshold}
                    placeholder="5"
                    onChange={(event) =>
                      updateVariant(
                        index,
                        "lowStockThreshold",
                        event.target.value
                      )
                    }
                    className={
                      variantErrors.lowStockThreshold
                        ? "input-error"
                        : ""
                    }
                  />

                  {variantErrors.lowStockThreshold && (
                    <p className="field-error">
                      {variantErrors.lowStockThreshold}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        className="variant-add-bottom"
        onClick={addVariant}
      >
        <Plus size={19} />
        Add Another Variant
      </button>
    </div>
  );
};

export default VariantManager;