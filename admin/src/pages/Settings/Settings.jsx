import { useEffect, useState } from "react";
import { getSettings, updateSettings } from "../../services/settingsService.js";
import "../../styles/Settings.css";

export default function Settings() {
  const [form, setForm] = useState({
    storeName: "",
    contactEmail: "",
    contactPhone: "",
    address: "",
    currency: "INR",
    taxRate: 0,
    shippingFlatRate: 0,
    freeShippingThreshold: 0,
    seoMetaTitle: "",
    seoMetaDescription: "",
    themeColor: "#2563eb"
  });

  useEffect(() => {
    const fetchSettings = async () => {
      const data = await getSettings();
      if (data.settings) setForm(data.settings);
    };
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await updateSettings(form);
    alert("Settings updated successfully!");
  };

  return (
    <div className="settings-page">
      <h2>Store Settings</h2>
      <form className="settings-form" onSubmit={handleSubmit}>
        <input name="storeName" value={form.storeName} onChange={handleChange} placeholder="Store Name" />
        <input name="contactEmail" value={form.contactEmail} onChange={handleChange} placeholder="Contact Email" />
        <input name="contactPhone" value={form.contactPhone} onChange={handleChange} placeholder="Contact Phone" />
        <input name="address" value={form.address} onChange={handleChange} placeholder="Address" />
        <input name="currency" value={form.currency} onChange={handleChange} placeholder="Currency" />
        <input name="taxRate" type="number" value={form.taxRate} onChange={handleChange} placeholder="Tax Rate (%)" />
        <input name="shippingFlatRate" type="number" value={form.shippingFlatRate} onChange={handleChange} placeholder="Shipping Flat Rate" />
        <input name="freeShippingThreshold" type="number" value={form.freeShippingThreshold} onChange={handleChange} placeholder="Free Shipping Threshold" />
        <input name="seoMetaTitle" value={form.seoMetaTitle} onChange={handleChange} placeholder="SEO Meta Title" />
        <input name="seoMetaDescription" value={form.seoMetaDescription} onChange={handleChange} placeholder="SEO Meta Description" />
        <input name="themeColor" value={form.themeColor} onChange={handleChange} placeholder="Theme Color" />
        <button type="submit">Save Settings</button>
      </form>
    </div>
  );
}
