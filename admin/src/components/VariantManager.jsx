import { useMemo, useState } from "react";
import { ChevronDown, Plus, Search, Trash2, X } from "lucide-react";
import "./VariantManager.css";

const WEIGHT_GROUPS = [
  {
    label: "Weight",
    options: ["50 g", "100 g", "200 g", "250 g", "500 g", "750 g", "1 kg", "2 kg", "5 kg"],
  },
  {
    label: "Volume",
    options: ["100 ml", "200 ml", "500 ml", "750 ml", "1 L", "2 L"],
  },
  {
    label: "Pieces",
    options: ["1 Piece", "2 Pieces", "6 Pieces", "12 Pieces", "24 Pieces"],
  },
];

const ALL_PRESET_WEIGHTS = WEIGHT_GROUPS.flatMap((g) => g.options);

const createEmptyVariant = () => ({
  weight: "",
  mrp: "",
  sellingPrice: "",
  stock: "",
  lowStockThreshold: "",
});

function isPresetWeight(weight) {
  return ALL_PRESET_WEIGHTS.includes(weight);
}

function WeightPicker({ value, onChange, hasError }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  // A weight that's set but isn't one of the presets is being edited as custom.
  const [customMode, setCustomMode] = useState(Boolean(value) && !isPresetWeight(value));

  const filteredGroups = useMemo(() => {
    if (!query.trim()) return WEIGHT_GROUPS;

    const q = query.trim().toLowerCase();
    return WEIGHT_GROUPS.map((group) => ({
      ...group,
      options: group.options.filter((opt) => opt.toLowerCase().includes(q)),
    })).filter((group) => group.options.length > 0);
  }, [query]);

  const selectPreset = (weight) => {
    onChange(weight);
    setCustomMode(false);
    setOpen(false);
    setQuery("");
  };

  const enterCustomMode = () => {
    onChange("");
    setCustomMode(true);
    setOpen(false);
    setQuery("");
  };

  const backToList = () => {
    onChange("");
    setCustomMode(false);
  };

  if (customMode) {
    return (
      <div className="weight-picker">
        <div className="weight-picker__custom-row">
          <input
            type="text"
            className={`weight-picker__custom-input ${hasError ? "input-error" : ""}`}
            placeholder="e.g. 35 g, 800 g, 3 kg, 15 Pieces"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            autoFocus
          />
          <button
            type="button"
            className="weight-picker__back-btn"
            onClick={backToList}
            title="Choose from list instead"
          >
            <X size={15} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="weight-picker">
      <button
        type="button"
        className={`weight-picker__trigger ${hasError ? "input-error" : ""}`}
        onClick={() => setOpen((o) => !o)}
      >
        <span className={value ? "" : "weight-picker__placeholder"}>
          {value || "Select weight"}
        </span>
        <ChevronDown size={16} className={open ? "chevron open" : "chevron"} />
      </button>

      {open && (
        <>
          <div className="weight-picker__backdrop" onClick={() => setOpen(false)} />
          <div className="weight-picker__menu">
            <div className="weight-picker__search">
              <Search size={15} />
              <input
                type="text"
                placeholder="Search weight..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
              />
            </div>

            <div className="weight-picker__options">
              {filteredGroups.map((group) => (
                <div key={group.label} className="weight-picker__group">
                  <span className="weight-picker__group-label">{group.label}</span>
                  {group.options.map((option) => (
                    <button
                      type="button"
                      key={option}
                      className={`weight-picker__option ${value === option ? "selected" : ""}`}
                      onClick={() => selectPreset(option)}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              ))}

              {filteredGroups.length === 0 && (
                <p className="weight-picker__empty">No matches found.</p>
              )}
            </div>

            <button
              type="button"
              className="weight-picker__custom-trigger"
              onClick={enterCustomMode}
            >
              <Plus size={15} />
              Custom Weight
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default function VariantManager({ variants, setVariants, errors, setFieldError }) {
  const [deleteConfirmIndex, setDeleteConfirmIndex] = useState(null);

  // Live duplicate + basic validation, computed on every render from current
  // variant values — separate from (and merged with) the parent's on-submit
  // `errors` prop, so the user gets instant feedback while typing.
  const liveErrors = useMemo(() => {
    const seen = new Map();

    return variants.map((variant) => {
      const rowErrors = {};
      const normalizedWeight = variant.weight.trim().toLowerCase();

      if (!variant.weight.trim()) {
        rowErrors.weight = "Weight is required.";
      } else if (normalizedWeight) {
        if (seen.has(normalizedWeight)) {
          rowErrors.weight = "This weight already exists.";
        }
        seen.set(normalizedWeight, true);
      }

      if (
        variant.mrp !== "" &&
        (Number.isNaN(Number(variant.mrp)) || Number(variant.mrp) < 0)
      ) {
        rowErrors.mrp = "Enter a valid MRP.";
      }

      if (variant.sellingPrice !== "") {
        if (Number.isNaN(Number(variant.sellingPrice)) || Number(variant.sellingPrice) < 0) {
          rowErrors.sellingPrice = "Enter a valid selling price.";
        } else if (variant.mrp !== "" && Number(variant.sellingPrice) > Number(variant.mrp)) {
          rowErrors.sellingPrice = "Selling price cannot exceed MRP.";
        }
      }

      if (
        variant.stock !== "" &&
        (!Number.isInteger(Number(variant.stock)) || Number(variant.stock) < 0)
      ) {
        rowErrors.stock = "Stock must be a non-negative whole number.";
      }

      return rowErrors;
    });
  }, [variants]);

  const getError = (index, field) => errors?.[index]?.[field] || liveErrors[index]?.[field];

  const updateVariant = (index, field, value) => {
    setVariants((current) =>
      current.map((variant, i) => (i === index ? { ...variant, [field]: value } : variant))
    );

    if (setFieldError) {
      setFieldError("variants", undefined);
    }
  };

  const addVariant = () => {
    setVariants((current) => [...current, createEmptyVariant()]);
  };

  const requestDelete = (index) => {
    if (variants.length === 1) return; // always keep at least one variant
    setDeleteConfirmIndex(index);
  };

  const confirmDelete = (index) => {
    setVariants((current) => current.filter((_, i) => i !== index));
    setDeleteConfirmIndex(null);
  };

  const cancelDelete = () => setDeleteConfirmIndex(null);

  const getDiscount = (mrp, sellingPrice) => {
    const mrpNum = Number(mrp);
    const sellingNum = Number(sellingPrice);
    if (!mrpNum || !sellingNum || sellingNum >= mrpNum) return null;
    return Math.round(((mrpNum - sellingNum) / mrpNum) * 100);
  };

  return (
    <section className="add-product-section variant-manager">
      <div className="add-product-section__header">
        <div>
          <h2>Weight & Pricing</h2>
          <p>Add one or more variants — each with its own weight, price, and stock.</p>
        </div>
      </div>

      <div className="variant-card-grid">
        {variants.map((variant, index) => {
          const discount = getDiscount(variant.mrp, variant.sellingPrice);

          return (
            <div className="variant-card" key={index}>
              <div className="variant-card__header">
                <span className="variant-card__index">Variant {index + 1}</span>

                {deleteConfirmIndex === index ? (
                  <div className="variant-delete-confirm">
                    <span>Delete this variant?</span>
                    <button type="button" onClick={cancelDelete} className="variant-delete-cancel">
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => confirmDelete(index)}
                      className="variant-delete-confirm-btn"
                    >
                      Delete
                    </button>
                  </div>
                ) : (
                  variants.length > 1 && (
                    <button
                      type="button"
                      className="variant-card__delete"
                      onClick={() => requestDelete(index)}
                      aria-label={`Remove variant ${index + 1}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  )
                )}
              </div>

              <div className="variant-card__body">
                <div className="variant-field variant-field--full">
                  <label>Weight</label>
                  <WeightPicker
                    value={variant.weight}
                    onChange={(value) => updateVariant(index, "weight", value)}
                    hasError={Boolean(getError(index, "weight"))}
                  />
                  {getError(index, "weight") && (
                    <p className="field-error">{getError(index, "weight")}</p>
                  )}
                </div>

                <div className="variant-field">
                  <label>MRP</label>
                  <div className="variant-input-prefix">
                    <span>₹</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={variant.mrp}
                      onChange={(e) => updateVariant(index, "mrp", e.target.value)}
                      placeholder="0.00"
                      className={getError(index, "mrp") ? "input-error" : ""}
                    />
                  </div>
                  {getError(index, "mrp") && (
                    <p className="field-error">{getError(index, "mrp")}</p>
                  )}
                </div>

                <div className="variant-field">
                  <label>Selling Price</label>
                  <div className="variant-input-prefix">
                    <span>₹</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={variant.sellingPrice}
                      onChange={(e) => updateVariant(index, "sellingPrice", e.target.value)}
                      placeholder="0.00"
                      className={getError(index, "sellingPrice") ? "input-error" : ""}
                    />
                  </div>
                  {getError(index, "sellingPrice") && (
                    <p className="field-error">{getError(index, "sellingPrice")}</p>
                  )}
                  {discount !== null && !getError(index, "sellingPrice") && (
                    <span className="variant-discount-badge">{discount}% OFF</span>
                  )}
                </div>

                <div className="variant-field">
                  <label>Stock</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={variant.stock}
                    onChange={(e) => updateVariant(index, "stock", e.target.value)}
                    placeholder="0"
                    className={getError(index, "stock") ? "input-error" : ""}
                  />
                  {getError(index, "stock") && (
                    <p className="field-error">{getError(index, "stock")}</p>
                  )}
                </div>

                <div className="variant-field">
                  <label>Low Stock Alert</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={variant.lowStockThreshold}
                    onChange={(e) => updateVariant(index, "lowStockThreshold", e.target.value)}
                    placeholder="e.g. 10"
                    className={getError(index, "lowStockThreshold") ? "input-error" : ""}
                  />
                  {getError(index, "lowStockThreshold") && (
                    <p className="field-error">{getError(index, "lowStockThreshold")}</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <button type="button" className="variant-add-button" onClick={addVariant}>
        <Plus size={18} />
        Add Another Variant
      </button>
    </section>
  );
}