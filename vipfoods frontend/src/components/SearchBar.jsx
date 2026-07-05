import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiSearch } from "react-icons/fi";
import "./SearchBar.css";

export default function SearchBar({ initialQuery = "" }) {
  const [query, setQuery] = useState(initialQuery);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      navigate(`/products?search=${encodeURIComponent(trimmed)}`);
    } else {
      navigate("/products");
    }
  };

  return (
    <div className={`searchbar ${open ? "open" : ""}`}>
      <form className="searchbar-form" onSubmit={handleSubmit}>
        <input
          id="product-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search for VIP products..."
          className="search-input"
        />
        <button
          type="button"
          className="search-icon"
          onClick={() => setOpen((prev) => !prev)}
          aria-label="Toggle search bar"
        >
          <FiSearch />
        </button>
      </form>
    </div>
  );
}
