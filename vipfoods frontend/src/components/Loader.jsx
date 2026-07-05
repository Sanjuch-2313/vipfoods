import "./Loader.css";

export default function Loader({ message = "Loading..." }) {
  return (
    <div className="loader-shell" aria-live="polite">
      <div className="loader-ring">
        <span />
        <span />
        <span />
        <span />
      </div>
      <p>{message}</p>
    </div>
  );
}
