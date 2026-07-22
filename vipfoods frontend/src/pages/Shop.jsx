import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCategories } from "../services/categoryService";

export default function Shop() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      console.error("Failed to load categories:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: "40px" }}>
        <h2>Loading Categories...</h2>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: "40px" }}>
      <h1 style={{ marginBottom: "30px" }}>Shop Categories</h1>

      {categories.length === 0 ? (
        <h3>No Categories Found</h3>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))",
            gap: "20px",
          }}
        >
          {categories.map((category) => (
            <div
              key={category._id}
              onClick={() => navigate(`/shop/${category.slug}`)}
              style={{
                border: "1px solid #ddd",
                borderRadius: "12px",
                overflow: "hidden",
                cursor: "pointer",
                background: "#fff",
                transition: "0.3s",
              }}
            >
              <img
                src={
                  category.image ||
                  "https://via.placeholder.com/500x300?text=Category"
                }
                alt={category.name}
                style={{
                  width: "100%",
                  height: "200px",
                  objectFit: "cover",
                }}
              />

              <div style={{ padding: "16px" }}>
                <h2>{category.name}</h2>

                <p style={{ color: "#666", marginTop: "10px" }}>
                  {category.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}