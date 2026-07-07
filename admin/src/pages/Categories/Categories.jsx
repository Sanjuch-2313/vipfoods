import { useEffect, useState } from "react";
import { Trash2, Plus } from "lucide-react";

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

  const loadCategories = async () => {
  try {
    const response = await getCategories();
    setCategories(response.categories || []);
  } catch (err) {
    console.error(err);
  }
};

  useEffect(() => {
    loadCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();

    formData.append("name", form.name);
    formData.append("description", form.description);
    formData.append("featured", form.featured);
    formData.append("active", form.active);
    formData.append("displayOrder", form.displayOrder);

    if (image) {
      formData.append("image", image);
    }

    await createCategory(formData);

    setForm({
      name: "",
      description: "",
      featured: false,
      active: true,
      displayOrder: 0,
    });

    setImage(null);

    loadCategories();
  };

  return (
    <div className="category-page">

      <div className="category-form">

        <h2>Add Category</h2>

        <form onSubmit={handleSubmit}>

          <input
            placeholder="Category Name"
            value={form.name}
            onChange={(e) =>
              setForm({
                ...form,
                name: e.target.value,
              })
            }
          />

          <textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) =>
              setForm({
                ...form,
                description: e.target.value,
              })
            }
          />

          <input
            type="number"
            placeholder="Display Order"
            value={form.displayOrder}
            onChange={(e) =>
              setForm({
                ...form,
                displayOrder: e.target.value,
              })
            }
          />

          <label>
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) =>
                setForm({
                  ...form,
                  featured: e.target.checked,
                })
              }
            />
            Featured
          </label>

          <input
            type="file"
            onChange={(e) =>
              setImage(e.target.files[0])
            }
          />

          <button className="save-btn">
            <Plus size={18} />
            Save Category
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
                    src={
                      item.image ||
                      "https://placehold.co/60"
                    }
                    alt=""
                  />

                </td>

                <td>{item.name}</td>

                <td>{item.description}</td>

                <td>

                  <button
                    className="delete-btn"
                    onClick={() => {
                      deleteCategory(item._id);
                      loadCategories();
                    }}
                  >
                    <Trash2 size={18} />
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