import { useEffect, useState, useRef } from "react";
import { Trash2, Plus, Edit } from "lucide-react";
import toast from "react-hot-toast";

import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../../services/categoryService";

import "./Categories.css";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
    subCategories: [""],
  });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const fileInputRef = useRef(null);
  const formRef = useRef(null);

  const loadCategories = async () => {
    try {
      const data = await getCategories(); // returns array directly
      setCategories(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load categories");
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const resetForm = () => {
    setForm({
      name: "",
      description: "",
      subCategories: [""],
    });
    setImage(null);
    setPreview(null);
    setEditingId(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;

    if (!form.name.trim()) {
      return toast.error("Category name is required");
    }

    try {
      setSaving(true);
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("description", form.description);

      const subCategories = form.subCategories
        .filter((item) => item.trim() !== "")
        .map((item) => ({ name: item }));

      formData.append("subCategories", JSON.stringify(subCategories));

      if (image) {
        formData.append("image", image);
      }

      if (editingId) {
        await updateCategory(editingId, formData);
        toast.success("Category updated successfully");
      } else {
        if (!image) {
          return toast.error("Please select a category image");
        }
        await createCategory(formData);
        toast.success("Category created successfully");
      }

      resetForm();
      await loadCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (category) => {
    setEditingId(category._id);
    setForm({
      name: category.name,
      description: category.description,
      subCategories:
        category.subCategories?.length > 0
          ? category.subCategories.map((s) => s.name)
          : [""],
    });
    setPreview(category.image);
    setImage(null);
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this category?");
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

  const addSubCategory = () => {
    setForm({
      ...form,
      subCategories: [...form.subCategories, ""],
    });
  };

  const updateSubCategory = (index, value) => {
    const updated = [...form.subCategories];
    updated[index] = value;
    setForm({ ...form, subCategories: updated });
  };

  const removeSubCategory = (index) => {
    const updated = [...form.subCategories];
    updated.splice(index, 1);
    setForm({
      ...form,
      subCategories: updated.length ? updated : [""],
    });
  };

  return (
    <div className="category-page">
      <div className="category-form" ref={formRef}>
        <h2>{editingId ? "Edit Category" : "Add Category"}</h2>
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

          <div className="subcategory-section">
            <label>Sub Categories</label>
            {form.subCategories.map((sub, index) => (
              <div key={index} className="subcategory-row">
                <input
                  type="text"
                  placeholder={`Sub Category ${index + 1}`}
                  value={sub}
                  onChange={(e) => updateSubCategory(index, e.target.value)}
                />
                <button
                  type="button"
                  className="delete-sub-btn"
                  onClick={() => removeSubCategory(index)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            <button
              type="button"
              className="add-sub-btn"
              onClick={addSubCategory}
            >
              <Plus size={16} />
              Add Sub Category
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files[0];
              setImage(file);
              if (file) setPreview(URL.createObjectURL(file));
            }}
          />

          {preview && (
            <img src={preview} className="preview-image" alt="preview" />
          )}

          <div className="form-buttons">
            <button className="save-btn" disabled={saving}>
              {saving ? "Saving..." : (
                <>
                  <Plus size={18} />
                  {editingId ? "Update Category" : "Save Category"}
                </>
              )}
            </button>
            {editingId && (
              <button
                type="button"
                className="cancel-btn"
                onClick={resetForm}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="category-table">
        <table>
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Description</th>
              <th>Sub Categories</th>
              <th>Edit</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((item) => (
              <tr key={item._id}>
                <td>
                  <img src={item.image || "https://placehold.co/60"} alt="" />
                </td>
                <td>{item.name}</td>
                <td>{item.description}</td>
                <td>
                  {item.subCategories?.length
                    ? item.subCategories.map((s) => s.name).join(", ")
                    : "-"}
                </td>
                <td>
                  <button
                    className="edit-btn"
                    onClick={() => handleEdit(item)}
                  >
                    <Edit size={18} color="green" />
                  </button>
                </td>
                <td>
                  <button
                    className="delete-btn"
                    disabled={deletingId === item._id}
                    onClick={() => handleDelete(item._id)}
                  >
                    {deletingId === item._id ? "Deleting..." : <Trash2 size={18} />}
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
