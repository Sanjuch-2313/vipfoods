import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Save, ArrowLeft } from "lucide-react";

import ImageUploader from "../../components/ImageUploader";
import { createHomeBanner } from "../../services/homeBannerService";
import "../../styles/HomeBanner.css";

const initialState = {
  title: "",
  subtitle: "",
  couponCode: "",
  discountText: "",
  minimumOrder: "",
  validTill: "",
  buttonText: "Shop Now",
  buttonLink: "/products",
  active: true,
};

export default function HomeBanner() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState(initialState);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!images.length) {
      return alert("Please upload banner image");
    }

    try {
      setLoading(true);

      const payload = new FormData();

      payload.append("title", formData.title);
      payload.append("subtitle", formData.subtitle);
      payload.append("couponCode", formData.couponCode);
      payload.append("discountText", formData.discountText);
      payload.append("minimumOrder", formData.minimumOrder);
      payload.append("validTill", formData.validTill);
      payload.append("buttonText", formData.buttonText);
      payload.append("buttonLink", formData.buttonLink);
      payload.append("active", formData.active);

      images.forEach((image) => {
        payload.append("image", image);
      });

      await createHomeBanner(payload);

      alert("Banner Created Successfully");

      navigate("/home-banner");
    } catch (err) {
      console.error(err);
      alert("Unable to create banner");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-product-page">

      <div className="add-product-page__top">

        <button
          className="back-button"
          onClick={() => navigate("/")}
        >
          <ArrowLeft size={18} />
          Dashboard
        </button>

        <h1>Home Banner</h1>

      </div>

      <form
        className="add-product-form"
        onSubmit={handleSubmit}
      >

        <ImageUploader
          images={images}
          setImages={setImages}
        />

        <div className="form-grid">

          <div className="form-field">
            <label>Title</label>

            <input
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-field">
            <label>Subtitle</label>

            <input
              name="subtitle"
              value={formData.subtitle}
              onChange={handleChange}
            />
          </div>

          <div className="form-field">
            <label>Coupon</label>

            <input
              name="couponCode"
              value={formData.couponCode}
              onChange={handleChange}
            />
          </div>

          <div className="form-field">
            <label>Discount Text</label>

            <input
              name="discountText"
              value={formData.discountText}
              onChange={handleChange}
            />
          </div>

          <div className="form-field">
            <label>Minimum Order</label>

            <input
              type="number"
              name="minimumOrder"
              value={formData.minimumOrder}
              onChange={handleChange}
            />
          </div>

          <div className="form-field">
            <label>Valid Till</label>

            <input
              type="date"
              name="validTill"
              value={formData.validTill}
              onChange={handleChange}
            />
          </div>

          <div className="form-field">
            <label>Button Text</label>

            <input
              name="buttonText"
              value={formData.buttonText}
              onChange={handleChange}
            />
          </div>

          <div className="form-field">
            <label>Button Link</label>

            <input
              name="buttonLink"
              value={formData.buttonLink}
              onChange={handleChange}
            />
          </div>

          <div className="form-field">

            <label>

              <input
                type="checkbox"
                name="active"
                checked={formData.active}
                onChange={handleChange}
              />

              Active Banner

            </label>

          </div>

        </div>

        <button
          className="primary-action-button"
          disabled={loading}
        >
          <Save size={18} />

          {loading ? "Saving..." : "Save Banner"}

        </button>

      </form>

    </div>
  );
}