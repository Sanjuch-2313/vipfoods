import { useEffect, useRef, useState } from "react";
import api from "../../services/api";
import "./ComboOffers.css";

const emptyForm = { name: "", price: "", size: "", itemCount: 3, active: true };
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
  const [sizes, setSizes] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/combo-offers/admin");
      setOffers(data.offers || []);
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
  const submit = async (event) => {
    event.preventDefault();
    setSaving(true); setError(""); setMessage("");
    try {
      const payload = new FormData();
      for (const key of ["name", "price", "size", "itemCount", "active"]) payload.append(key, form[key]);
      if (imageFile) payload.append("image", imageFile);
      if (removeImage) payload.append("removeImage", "true");
      if (editing) await api.put(`/combo-offers/${editing}`, payload);
      else await api.post("/combo-offers", payload);
      setForm(emptyForm); setEditing(null); resetImage();
      await load(); setMessage("Combo offer saved.");
    } catch (err) { setError(err.response?.data?.message || "Could not save combo offer."); }
    finally { setSaving(false); }
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
          <label className="combo-checkbox"><input type="checkbox" name="active" checked={form.active} onChange={change} />Show this offer to customers</label>
          <button disabled={saving} className="combo-save">{saving ? "Saving…" : "Save combo offer"}</button>
          {editing && <button type="button" onClick={() => { setEditing(null); setForm(emptyForm); resetImage(); }}>Cancel edit</button>}
        </form>
        <section className="combo-admin-card">
          <h2>Current offers</h2>
          {loading ? <p>Loading…</p> : !offers.length ? <p>No combo offers yet.</p> : offers.map((offer) => (
            <article className="combo-offer-row" key={offer._id}>
              {offer.image && <img className="combo-image-preview" src={offer.image} alt={offer.name} />}
              <h3>{offer.name}</h3>
              <p>₹{Number(offer.price).toFixed(2)} · Choose {offer.itemCount} items · {offer.size} each</p>
              <p>{offer.active ? "Active" : "Hidden"} · {offer.options?.length || 0} available product choices</p>
              {!offer.options?.length && <p className="combo-error">No available products match this size. Add a matching product variant or change the size.</p>}
              <button type="button" onClick={() => { resetImage(); setEditing(offer._id); setForm({ image: offer.image || "", name: offer.name, price: offer.price, size: offer.size, itemCount: offer.itemCount, active: offer.active }); setMessage(""); }}>Edit offer</button>
            </article>
          ))}
        </section>
      </div>
    </div>
  );
}
