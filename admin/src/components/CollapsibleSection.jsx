import { useState } from "react";
import { ChevronDown, CheckCircle2 } from "lucide-react";
import "./CollapsibleSection.css";

export default function CollapsibleSection({
  title,
  description,
  complete,
  defaultOpen = false,
  hasError = false,
  children,
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className={`collapsible-section ${hasError ? "has-error" : ""}`}>
      <button
        type="button"
        className="collapsible-section__header"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <div className="collapsible-section__title-group">
          <span className="collapsible-section__status">
            {complete ? (
              <CheckCircle2 size={20} className="status-icon status-icon--complete" />
            ) : (
              <span className="status-icon status-icon--empty" />
            )}
          </span>
          <div>
            <h2>{title}</h2>
            {description && <p>{description}</p>}
          </div>
        </div>
        <ChevronDown size={20} className={`collapsible-section__chevron ${open ? "open" : ""}`} />
      </button>

      <div className={`collapsible-section__body ${open ? "open" : ""}`}>
        <div className="collapsible-section__body-inner">{children}</div>
      </div>
    </section>
  );
}