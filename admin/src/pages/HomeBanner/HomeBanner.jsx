import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Save, ArrowLeft, Trash2 } from "lucide-react";

import ImageUploader from "../../components/ImageUploader";
import {
  getHomeBanner,
  createHomeBanner,
  updateHomeBanner,
  deleteHomeBanner,
  getActiveCoupons,
} from "../../services/homeBannerService";
import "../../styles/HomeBanner.css";

const initialState = {
  title: "",
  subtitle: "",
  coupon: "",
  buttonText: "Shop Now",
  buttonLink: "/products",
  active: true,
};

function formatCouponLabel(coupon) {
  if (coupon.discountText) {
    return `${coupon.code} • ${coupon.discountText}`;
  }

  if (coupon.discountType === "percentage" && coupon.discountValue != null) {
    return `${coupon.code} • ${coupon.discountValue}% OFF`;
  }

  if (coupon.discountType === "flat" && coupon.discountValue != null) {
    return `${coupon.code} • ₹${coupon.discountValue} OFF`;
  }

  return coupon.code;
}

export default function HomeBanner() {
  const navigate = useNavigate();

  const [bannerId, setBannerId] = useState(null);
  const [existingImageUrl, setExistingImageUrl] = useState(null);
  const [formData, setFormData] = useState(initialState);
  const [images, setImages] = useState([]);
  const [coupons, setCoupons] = useState([]);

  const [pageLoading, setPageLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isEditMode = Boolean(bannerId);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const [bannerRes, couponsRes] = await Promise.all([
          getHomeBanner(),
          getActiveCoupons(),
        ]);

        if (!isMounted) return;

        setCoupons(couponsRes?.coupons || []);

        const banner = bannerRes?.banner;

        if (banner) {
          setBannerId(banner._id);
          setExistingImageUrl(banner.image || null);
          setFormData({
            title: banner.title || "",
            subtitle: banner.subtitle || "",
            coupon: banner.coupon?._id || banner.coupon || "",
            buttonText: banner.buttonText || "Shop Now",
            buttonLink: banner.buttonLink || "/products",
            active: banner.active ?? true,
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setPageLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!images.length && !existingImageUrl) {
      return alert("Please upload banner image");
    }

    try {
      setSaving(true);

      const payload = new FormData();

      payload.append("title", formData.title);
      payload.append("subtitle", formData.subtitle);
      payload.append("coupon", formData.coupon);
      payload.append("buttonText", formData.buttonText);
      payload.append("buttonLink", formData.buttonLink);
      payload.append("active", formData.active);

      images.forEach((image) => {
        payload.append("image", image);
      });

      if (isEditMode) {
        await updateHomeBanner(bannerId, payload);
        alert("Banner Updated Successfully");
      } else {
        const res = await createHomeBanner(payload);
        setBannerId(res?.banner?._id || res?._id || null);
        alert("Banner Created Successfully");
      }

      navigate("/home-banner");
    } catch (err) {
      console.error(err);
      alert(isEditMode ? "Unable to update banner" : "Unable to create banner");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!bannerId) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this banner? This cannot be undone."
    );

    if (!confirmed) return;

    try {
      setDeleting(true);
      await deleteHomeBanner(bannerId);
      alert("Banner Deleted Successfully");

      setBannerId(null);
      setExistingImageUrl(null);
      setFormData(initialState);
      setImages([]);
    } catch (err) {
      console.error(err);
      alert("Unable to delete banner");
    } finally {
      setDeleting(false);
    }
  };

  const previewImageUrl =
    images.length > 0
      ? typeof images[0] === "string"
        ? images[0]
        : URL.createObjectURL(images[0])
      : existingImageUrl;

  if (pageLoading) {
    return (
      <div className="add-product-page">
        <div className="add-product-page__top">
          <button className="back-button" onClick={() => navigate("/")}>
            <ArrowLeft size={18} />
            Dashboard
          </button>
          <h1>Home Banner</h1>
        </div>
        <p>Loading banner...</p>
      </div>
    );
  }

  return (
    <div className="add-product-page">
      <div className="add-product-page__top">
        <button className="back-button" onClick={() => navigate("/")}>
          <ArrowLeft size={18} />
          Dashboard
        </button>

        <h1>{isEditMode ? "Edit Home Banner" : "Create Home Banner"}</h1>

        {isEditMode && (
          <button
            type="button"
            className="danger-action-button"
            onClick={handleDelete}
            disabled={deleting}
          >
            <Trash2 size={18} />
            {deleting ? "Deleting..." : "Delete Banner"}
          </button>
        )}
      </div>

      <form className="add-product-form" onSubmit={handleSubmit}>
        <div className="home-banner-uploader">
          <ImageUploader images={images} setImages={setImages} />

          {previewImageUrl && (
            <div className="home-banner-preview">
              <img
                src={previewImageUrl}
                alt="Banner preview"
                className="home-banner-preview__image"
              />

              <div className="home-banner-preview__overlay">
                <h2>{formData.title || "Your Banner Title"}</h2>
                {formData.subtitle && <p>{formData.subtitle}</p>}
                <span className="home-banner-preview__button">
                  {formData.buttonText || "Shop Now"}
                </span>
              </div>
            </div>
          )}
        </div>

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
            <label>Select Coupon</label>

            <select
              name="coupon"
              value={formData.coupon}
              onChange={handleChange}
              required
            >
              <option value="">Choose Coupon</option>

              {coupons.map((coupon) => (
                <option key={coupon._id} value={coupon._id}>
                  {formatCouponLabel(coupon)}
                </option>
              ))}
            </select>
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

        <button className="primary-action-button" disabled={saving}>
          <Save size={18} />
          {saving ? "Saving..." : isEditMode ? "Update Banner" : "Save Banner"}
        </button>
      </form>
    </div>
  );
}