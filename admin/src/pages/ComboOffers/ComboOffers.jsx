import { useEffect, useRef, useState } from "react";
import api from "../../services/api";
import "./ComboOffers.css";

const emptyForm = { name: "", price: "", size: "", itemCount: 3, active: true, selectionRules: [] };
export default function ComboOffers() {
  const fileRef = useRef(null);
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [removeImage, setRemoveImage] = useState(false);
  useEffect(() => {
    if (!imageFile) { setPreview(""); return; }
    const url = URL.createObjectURL(imageFile); setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);
  const resetImage = () => { setImageFile(null); setRemoveImage(false); if (fileRef.current) fileRef.current.value = ""; };
  const [offers, setOffers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [saveError, setSaveError] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/combo-offers/admin");
      setOffers(data.offers || []);
      const categoryResponse = await api.get("/categories");
      setCategories(categoryResponse.data.categories || []);
      const products = [];
      for (let page = 1; ; page++) {
        const { data } = await api.get("/products", { params: { page } });
        products.push(...(data.products || []));
        if ((data.products || []).length < (data.resultPerPage || 12)) break;
      }
      setSizes([...new Set(products.flatMap((product) => (product.variants || []).map((variant) =>
        /^\d+(\.\d+)?$/.test(String(variant.weight)) ? `${variant.weight} g` : String(variant.weight)
      )))].sort());
    } catch (err) { setError(err.response?.data?.message || "Could not load combo offers."); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);
  const change = (event) => setForm((previous) => ({ ...previous, [event.target.name]: event.target.type === "checkbox" ? event.target.checked : event.target.value }));
  const updateRule = (index, changes) => setForm(previous => ({ ...previous, selectionRules: previous.selectionRules.map((rule, i) => i === index ? { ...rule, ...changes } : rule) }));
  const submit = async (event) => {
    event.preventDefault();
    if (saving) return;
    setSaveError(""); setMessage("");
    const rules = form.selectionRules || [];
    if (rules.length && (rules.some(rule => !rule.category || !Number.isInteger(Number(rule.quantity)) || Number(rule.quantity) < 1) ||
        rules.reduce((sum, rule) => sum + Number(rule.quantity), 0) !== Number(form.itemCount))) {
      setSaveError(`Required category quantities must total ${form.itemCount} items. Currently allocated: ${rules.reduce((sum, rule) => sum + Number(rule.quantity || 0), 0)}.`);
      return;
    }
    if (rules.some((rule, i) => rules.slice(0, i).some(other => other.category === rule.category && (!other.subCategory || !rule.subCategory || other.subCategory === rule.subCategory)))) {
      setSaveError("Groups overlap. Select separate subcategories (for example Veg and Non Veg), not All subcategories together with a subgroup.");
      return;
    }
    setSaving(true); setError("");
    try {
      const payload = new FormData();
      for (const key of ["name", "price", "size", "itemCount", "active"]) payload.append(key, form[key]);
      payload.append("selectionRules", JSON.stringify(form.selectionRules));
      if (imageFile) payload.append("image", imageFile);
      if (removeImage) payload.append("removeImage", "true");
      if (editing) await api.put(`/combo-offers/${editing}`, payload, { timeout: 60000 });
      else await api.post("/combo-offers", payload, { timeout: 60000 });
      setForm(emptyForm); setEditing(null); resetImage();
      await load(); setMessage("Combo offer saved.");
    } catch (err) { setSaveError(err.response?.data?.message || (err.code === "ECONNABORTED" ? "The save request timed out. Refresh the offers to check whether it saved before retrying." : "Could not save combo offer. Please check your connection and try again.")); }
    finally { setSaving(false); }
  };
  const deleteOffer = async (offer) => {
    if (deleting || !window.confirm(`Delete "${offer.name}"? It will no longer be available to customers. Existing orders will be kept.`)) return;
    setDeleting(offer._id); setError(""); setMessage("");
    try {
      await api.delete(`/combo-offers/${offer._id}`);
      if (editing === offer._id) { setEditing(null); setForm(emptyForm); resetImage(); setSaveError(""); }
      setOffers(previous => previous.filter(item => item._id !== offer._id));
      setMessage("Combo offer deleted.");
    } catch (err) { setError(err.response?.data?.message || "Could not delete combo offer."); }
    finally { setDeleting(null); }
  };
  return (
    <div className="combo-admin">
      <h1>Combo Packs Offers</h1>
      <p>Set the offer price, size per item and number of items. Customers choose from all available products in that size.</p>
      {error && <p role="alert" className="combo-error">{error} <button onClick={load}>Retry loading</button></p>}
      {message && <p role="status">{message}</p>}
      <div className="combo-admin-grid">
        <form onSubmit={submit} className="combo-admin-card">
          <h2>{editing ? "Edit combo offer" : "Add combo offer"}</h2>
          <label>Offer name<input name="name" value={form.name} onChange={change} required maxLength={150} placeholder="Family favourites combo" /></label>

          {/* ── Image Upload Section ── */}
          <div className="combo-image-section">
            <span className="combo-image-label">Combo Image</span>
            <div
              className="combo-image-dropzone"
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files?.[0];
                if (!file) return;
                if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 5 * 1024 * 1024) {
                  setError("Choose a JPG, PNG or WEBP image up to 5 MB."); return;
                }
                setError(""); setImageFile(file); setRemoveImage(false);
              }}
            >
              {(preview || (!removeImage && form.image)) ? (
                <div className="combo-image-preview-wrap">
                  <img className="combo-image-large-preview" src={preview || form.image} alt="Combo preview" />
                  <button
                    type="button"
                    className="combo-image-remove-btn"
                    onClick={(e) => { e.stopPropagation(); setImageFile(null); setRemoveImage(true); if (fileRef.current) fileRef.current.value = ""; }}
                  >
                    ✕ Remove
                  </button>
                </div>
              ) : (
                <div className="combo-image-placeholder">
                  <span className="combo-image-icon">🖼️</span>
                  <p className="combo-image-hint">Click or drag &amp; drop to upload</p>
                  <p className="combo-image-sub">JPG, PNG or WEBP · max 5 MB</p>
                </div>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              style={{ display: "none" }}
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 5 * 1024 * 1024) {
                  setError("Choose a JPG, PNG or WEBP image up to 5 MB."); event.target.value = ""; return;
                }
                setError(""); setImageFile(file); setRemoveImage(false);
              }}
            />
          </div>

          <label>Fixed price (₹)<input name="price" type="number" min="1" step="0.01" value={form.price} onChange={change} required /></label>
          <label>Size of each item<input name="size" list="combo-sizes" value={form.size} onChange={change} required placeholder="250 g, 500 ml, 1 kg…" /></label>
          <datalist id="combo-sizes">{sizes.map((size) => <option key={size} value={size} />)}</datalist>
          <label>Items per combo<input name="itemCount" type="number" min="1" max="100" step="1" value={form.itemCount} onChange={change} required /></label>
          <fieldset>
            <legend>Category / subcategory quantities (optional)</legend>
            <p>For example: 3 Non Veg Pickles + 2 Veg Pickles. Quantities must total {form.itemCount}. Leave empty for unrestricted choices.</p>
            {form.selectionRules.map((rule, index) => (
              <div key={index} className="combo-rule-row">
                <label>Category<select required value={rule.category} onChange={e => updateRule(index, { category: e.target.value, subCategory: "" })}>
                  <option value="">Select category</option>
                  {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                </select></label>
                <label>Subcategory<select value={rule.subCategory} onChange={e => updateRule(index, { subCategory: e.target.value })}>
                  <option value="">All subcategories</option>
                  {(categories.find(cat => cat._id === rule.category)?.subCategories || []).map(sub => <option key={sub.name} value={sub.name}>{sub.name}</option>)}
                </select></label>
                <label>Required items<input type="number" min="1" max={form.itemCount} step="1" required value={rule.quantity} onChange={e => updateRule(index, { quantity: Number(e.target.value) })} /></label>
                <button type="button" onClick={() => setForm(previous => ({ ...previous, selectionRules: previous.selectionRules.filter((_, i) => i !== index) }))}>Remove group</button>
              </div>
            ))}
            <p>Allocated: {form.selectionRules.reduce((sum, rule) => sum + Number(rule.quantity || 0), 0)} / {form.itemCount}</p>
            <button type="button" onClick={() => setForm(previous => ({ ...previous, selectionRules: [...previous.selectionRules, { category: "", subCategory: "", quantity: 1 }] }))}>Add category requirement</button>
          </fieldset>
          <label className="combo-checkbox"><input type="checkbox" name="active" checked={form.active} onChange={change} />Show this offer to customers</label>
          {saveError && <p role="alert" className="combo-error">{saveError}</p>}
          {message && <p role="status">{message}</p>}
          <button type="submit" disabled={saving} className="combo-save">{saving ? "Saving…" : "Save combo offer"}</button>
          {editing && <button type="button" onClick={() => { setEditing(null); setForm(emptyForm); resetImage(); }}>Cancel edit</button>}
        </form>
        <section className="combo-admin-card">
          <h2>Current offers</h2>
          {loading ? <p>Loading…</p> : !offers.length ? <p>No combo offers yet.</p> : offers.map((offer) => (
            <article className="combo-offer-row" key={offer._id}>
              {offer.image && <img className="combo-image-preview" src={offer.image} alt={offer.name} />}
              <h3>{offer.name}</h3>
              <p>₹{Number(offer.price).toFixed(2)} · Choose {offer.itemCount} items · {offer.size} each</p>
              {(offer.selectionRules || []).map((rule, i) => <p key={i}>{rule.quantity} × {rule.categoryName}{rule.subCategory ? ` / ${rule.subCategory}` : ""}</p>)}
              <p>{offer.active ? "Active" : "Hidden"} · {offer.options?.length || 0} available product choices</p>
              {!offer.options?.length && <p className="combo-error">No available products match this size. Add a matching product variant or change the size.</p>}
              <button type="button" onClick={() => { resetImage(); setEditing(offer._id); setForm({ image: offer.image || "", name: offer.name, price: offer.price, size: offer.size, itemCount: offer.itemCount, active: offer.active, selectionRules: offer.selectionRules || [] }); setMessage(""); }}>Edit offer</button>
              <button type="button" disabled={Boolean(deleting) || saving} onClick={() => deleteOffer(offer)}>{deleting === offer._id ? "Deleting…" : "Delete offer"}</button>
            </article>
          ))}
        </section>
      </div>
    </div>
  );
}
