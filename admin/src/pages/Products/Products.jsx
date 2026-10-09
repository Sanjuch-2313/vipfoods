import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Trash2, Plus, Search } from "lucide-react";

import {
  getProducts,
  deleteProduct,
} from "../../services/productService";

import "./Products.css";
import { getCategories } from "../../services/categoryService";

export default function Products() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [categoryError, setCategoryError] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [status, setStatus] = useState("");
  const [stock, setStock] = useState("");

  const loadProducts = async () => {
    setLoading(true);
    setError("");
    try {
      const allProducts = new Map();
      for (let page = 1; ; page++) {
        const response = await getProducts({ page, sort: "-createdAt -_id" });
        const batch = response.products || [];
        if (batch.length === 0) break;
        const previousCount = allProducts.size;
        batch.forEach(product => allProducts.set(product._id, product));
        if (allProducts.size === previousCount) {
          throw new Error("The product service repeated a page. Please retry loading products.");
        }
      }
      setProducts([...allProducts.values()]);
    } catch (error) {
      setError(error.response?.data?.message || error.message || "Could not load all products. Please retry.");
    } finally {
      setLoading(false);
    }
  };
  const available = product => (product.variants || []).some(variant => variant.inStock !== false && Number(variant.stock) > 0);
  const loadCategories = async () => {
    setCategoryError("");
    try {
      const items = await getCategories();
      setCategories([...items].sort((a, b) => a.name.localeCompare(b.name)));
    } catch {
      setCategoryError("Could not load category filters.");
    }
  };
  const subCategories = categories
    .filter(item => !category || item._id === category)
    .flatMap(item => (item.subCategories || []).map(sub => ({
      value: JSON.stringify([item._id, sub.name]),
      name: sub.name,
      categoryName: item.name,
    })));
  const query = search.trim().toLowerCase();
  const filteredProducts = products.filter(product => {
    const text = [product.name, product.category?.name, product.subCategory, ...(product.variants || []).map(v => v.sku)].filter(Boolean).join(" ").toLowerCase();
    return (!query || text.includes(query)) && (!category || product.category?._id === category) &&
      (!subCategory || JSON.stringify([product.category?._id, product.subCategory]) === subCategory) &&
      (!status || (status === "active" ? product.active !== false : status === "inactive" ? product.active === false : status === "published" ? product.published === true : product.published !== true)) &&
      (!stock || (stock === "in" ? available(product) : !available(product)));
  });
  useEffect(() => {
    loadProducts();
    loadCategories();
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

      <div className="products-toolbar" aria-label="Product filters">
        <label className="search-box-product"><Search size={18} aria-hidden="true" /><input type="search" aria-label="Search products" placeholder="Search name, category or SKU…" value={search} onChange={event => setSearch(event.target.value)} /></label>
        <select aria-label="Filter by category" value={category} onChange={event => { setCategory(event.target.value); setSubCategory(""); }}><option value="">All categories</option>{categories.map(item => <option key={item._id} value={item._id}>{item.name}</option>)}</select>
        <select aria-label="Filter by subcategory" value={subCategory} onChange={event => setSubCategory(event.target.value)}><option value="">All subcategories</option>{subCategories.map(item => <option key={item.value} value={item.value}>{category ? item.name : `${item.categoryName} — ${item.name}`}</option>)}</select>
        <select aria-label="Filter by product status" value={status} onChange={event => setStatus(event.target.value)}><option value="">All statuses</option><option value="active">Active</option><option value="inactive">Inactive</option><option value="published">Published</option><option value="draft">Unpublished</option></select>
        <select aria-label="Filter by stock" value={stock} onChange={event => setStock(event.target.value)}><option value="">All stock</option><option value="in">In stock</option><option value="out">Out of stock</option></select>
        <button type="button" onClick={() => { setSearch(""); setCategory(""); setSubCategory(""); setStatus(""); setStock(""); }}>Clear filters</button>
      </div>
      {categoryError && <p role="alert" className="products-load-error">{categoryError} <button onClick={loadCategories}>Retry</button></p>}
      {error && <p role="alert" className="products-load-error">{error} <button onClick={loadProducts} disabled={loading}>Retry</button></p>}
      <p role="status">{loading ? "Loading all products…" : `${filteredProducts.length} of ${products.length} products`}</p>
      <div className="table-wrapper products-scroll" tabIndex={0} role="region" aria-label="Added products" aria-busy={loading}>
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
            {loading ? <tr><td colSpan="7">Loading products…</td></tr> : filteredProducts.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: "center" }}>
                  No products match your search or filters
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => (
                <tr key={product._id}>
                  <td>
                    <img
                      src={
                        product.images?.[0] ||
                        "https://placehold.co/60x60"
                      }
                      alt={product.name}
                      loading="lazy"
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
                    {(product.variants || []).reduce((sum, variant) => sum + (Number(variant.stock) || 0), 0)}
                  </td>

                  <td>
                    <span
                      className={
                        available(product)
                          ? "status active"
                          : "status out"
                      }
                    >
                      {available(product)
                        ? "In Stock"
                        : "Out Of Stock"}
                    </span>
                  </td>

                  <td>
                    <button
                      aria-label={`Edit ${product.name}`}
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
                      aria-label={`Delete ${product.name}`}
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
