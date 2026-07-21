import { useState, useEffect } from "react";
import { getCoupons, deleteCoupon } from "../../services/couponService.js";
import "../../styles/Coupons.css";
import { Link } from "react-router-dom";

export default function Coupons() {
  const [coupons, setCoupons] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchCoupons();
  }, [search]);

  const fetchCoupons = async () => {
    const data = await getCoupons({ search });
    setCoupons(data.coupons);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this coupon?")) {
      await deleteCoupon(id);
      fetchCoupons();
    }
  };

  return (
    <div className="coupons-page">
      <h2>Coupons</h2>

      <Link to="/coupons/new" className="add-btn">
        + Add Coupon
      </Link>

      <div className="coupons-filters">
        <input
          type="text"
          placeholder="Search by code"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <table className="coupons-table">
        <thead>
          <tr>
            <th>Code</th>
            <th>Discount</th>
            <th>Expiry</th>
            <th>Min Order</th>
            <th>Usage Limit</th>
            <th>Valid For</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {coupons.map((c) => (
            <tr key={c._id}>
              <td>{c.code}</td>
              <td>{c.discount}%</td>
              <td>{new Date(c.expiry).toLocaleDateString()}</td>
              <td>₹{c.minOrder}</td>
              <td>{c.usageLimit}</td>
              <td style={{ textTransform: "capitalize" }}>
                {c.categoryScope}
              </td>
              <td>
                <Link to={`/coupons/${c._id}`} className="edit-btn">
                  Edit
                </Link>

                <button
                  className="delete-btn"
                  onClick={() => handleDelete(c._id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}