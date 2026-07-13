export default function Loader({ label = "Loading..." }) {
  return (
    <div className="vip-loader">
      <div className="vip-loader-jar">
        <span className="vip-loader-jar-body">🫙</span>
        <span className="vip-loader-leaf">🌿</span>
        <span className="vip-loader-spice">🌶️</span>
      </div>
      <p className="vip-loader-text">{label}</p>
    </div>
  );
}