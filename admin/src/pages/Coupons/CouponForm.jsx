import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createCoupon } from "../../services/couponService.js";
import "../../styles/Coupons.css";

export default function CouponForm() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    code: "",
    discount: "",
    expiry: "",
    minOrder: "",
    usageLimit: "",
    categoryScope: "all",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createCoupon(form);
    navigate("/coupons");
  };

  return (
    <form className="coupon-form" onSubmit={handleSubmit}>
      <h2>Create Coupon</h2>

      <input
        name="code"
        placeholder="Coupon Code"
        value={form.code}
        onChange={handleChange}
        required
      />

      <input
        name="discount"
        type="number"
        placeholder="Discount %"
        value={form.discount}
        onChange={handleChange}
        required
      />

      <input
        name="expiry"
        type="date"
        value={form.expiry}
        onChange={handleChange}
        required
      />

      <input
        name="minOrder"
        type="number"
        placeholder="Minimum Order Amount"
        value={form.minOrder}
        onChange={handleChange}
      />

      <input
        name="usageLimit"
        type="number"
        placeholder="Usage Limit"
        value={form.usageLimit}
        onChange={handleChange}
      />

      <select
        name="categoryScope"
        value={form.categoryScope}
        onChange={handleChange}
      >
        <option value="all">All Products</option>
        <option value="pickles">Pickles</option>
        <option value="dairy">Dairy</option>
        <option value="fresh">Fresh</option>
      </select>

      <button type="submit" className="submit-btn">
        Create
      </button>
    </form>
  );
}