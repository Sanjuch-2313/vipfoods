import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Trash2, Plus } from "lucide-react";

import {
  getProducts,
  deleteProduct,
} from "../../services/productService";

import "./Products.css";

export default function Products() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadProducts = async () => {
  try {
    setLoading(true);

    const response = await getProducts();

    console.log("Products API:", response);

    setProducts(response.products || []);
  } catch (error) {
    console.error("Failed to load products:", error);
    setProducts([]);
  } finally {
    setLoading(false);
  }
};
  useEffect(() => {
    loadProducts();
  }, []);

  const handleDelete = async (id) => {
    const ok = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!ok) return;

    try {
      await deleteProduct(id);
      loadProducts();
    } catch (error) {
      console.error(error);
      alert("Unable to delete product");
    }
  };

  if (loading) {
    return <h2>Loading...</h2>;
  }

  return (
    <div className="products-page">
      <div className="products-header">
        <h1>Products</h1>

        <button
          className="add-btn"
          onClick={() => navigate("/products/add")}
        >
          <Plus size={18} />
          Add Product
        </button>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: "center" }}>
                  No Products Found
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product._id}>
                  <td>
                    <img
                      src={
                        product.images?.[0] ||
                        "https://placehold.co/60x60"
                      }
                      alt={product.name}
                    />
                  </td>

                  <td>{product.name}</td>

                  <td>
                    {product.category?.name || "-"}
                  </td>

                  <td>
                    ₹
                    {product.variants?.[0]?.sellingPrice ??
                      0}
                  </td>

                  <td>
                    {product.variants?.[0]?.stock ??
                      0}
                  </td>

                  <td>
                    <span
                      className={
                        (product.variants?.[0]?.stock ?? 0) >
                        0
                          ? "status active"
                          : "status out"
                      }
                    >
                      {(product.variants?.[0]?.stock ?? 0) >
                      0
                        ? "In Stock"
                        : "Out Of Stock"}
                    </span>
                  </td>

                  <td>
                    <button
                      className="icon-btn"
                      onClick={() =>
                        navigate(
                          `/products/edit/${product._id}`
                        )
                      }
                    >
                      <Pencil size={18} />
                    </button>

                    <button
                      className="icon-btn delete"
                      onClick={() =>
                        handleDelete(product._id)
                      }
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}