import { useEffect, useState, useRef } from "react";
import { Trash2, Plus } from "lucide-react";
import toast from "react-hot-toast";

import {
  getCategories,
  createCategory,
  deleteCategory,
} from "../../services/categoryService";

import "./Categories.css";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
    featured: false,
    active: true,
    displayOrder: 0,
  });
  const [image, setImage] = useState(null);

  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const fileInputRef = useRef(null);

  const loadCategories = async () => {
    try {
      const response = await getCategories();
      setCategories(response.categories || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load categories");
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (saving) return; // prevent duplicate submissions

    // Validation
    if (!form.name.trim()) {
      return toast.error("Category name is required");
    }
    if (!image) {
      return toast.error("Please select a category image");
    }

    try {
      setSaving(true);

      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("description", form.description);
      formData.append("featured", form.featured);
      formData.append("active", form.active);
      formData.append("displayOrder", form.displayOrder);

      formData.append("image", image);

      await createCategory(formData);
      toast.success("Category created successfully");

      setForm({
        name: "",
        description: "",
        featured: false,
        active: true,
        displayOrder: 0,
      });
      setImage(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = ""; // reset file input
      }

      await loadCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this category?"
    );
    if (!confirmed) return;

    try {
      setDeletingId(id);
      await deleteCategory(id);
      toast.success("Category deleted");
      await loadCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || "Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="category-page">
      <div className="category-form">
        <h2>Add Category</h2>
        <form onSubmit={handleSubmit}>
          <input
            placeholder="Category Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />

          <input
            type="number"
            placeholder="Display Order"
            value={form.displayOrder}
            onChange={(e) =>
              setForm({ ...form, displayOrder: e.target.value })
            }
          />

          <label>
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) =>
                setForm({ ...form, featured: e.target.checked })
              }
            />
            Featured
          </label>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
          />

          {image && (
            <img
              src={URL.createObjectURL(image)}
              className="preview-image"
              alt="preview"
            />
          )}

          <button className="save-btn" disabled={saving}>
            {saving ? "Saving..." : (
              <>
                <Plus size={18} />
                Save Category
              </>
            )}
          </button>
        </form>
      </div>

      <div className="category-table">
        <table>
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Description</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((item) => (
              <tr key={item._id}>
                <td>
                  <img
                    src={item.image || "https://placehold.co/60"}
                    alt=""
                  />
                </td>
                <td>{item.name}</td>
                <td>{item.description}</td>
                <td>
                  <button
                    className="delete-btn"
                    disabled={deletingId === item._id}
                    onClick={() => handleDelete(item._id)}
                  >
                    {deletingId === item._id
                      ? "Deleting..."
                      : <Trash2 size={18} />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
