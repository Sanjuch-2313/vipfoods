export default function ComboOrderDetails({ order }) {
  const combos = (order?.items || []).filter((item) => item.comboSelections?.length);
  if (!combos.length) return null;
  return <div className="mt-3 space-y-2 text-xs text-gray-600">{combos.map((item, index) => (
    <div key={`${item.comboOffer}-${index}`}>
      <p className="font-bold text-gray-900">{item.quantity} × {item.productName}</p>
      <p>Each pack: {item.comboSelections.map((selection) => `${selection.quantity} × ${selection.productName} (${selection.size})`).join(", ")}</p>
    </div>
  ))}</div>;
}
