import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import "./CategoryCard.css";

export default function CategoryCard({
  image,
  title,
  eyebrow,
  description,
  link = "/",
  actionLabel = "Explore",
  accent = "pickle"
}) {
  return (
    <article className={`category-card glass-card category-card-${accent}`}>
      <div className="category-card-media">
        <img src={image} alt={title} className="category-card-image" />
      </div>
      <div className="category-card-body">
        <span className="category-card-eyebrow">{eyebrow}</span>
        <h3>{title}</h3>
        <p>{description}</p>
        <Link to={link} className="category-card-cta">
          {actionLabel} <FiArrowRight />
        </Link>
      </div>
    </article>
  );
}
