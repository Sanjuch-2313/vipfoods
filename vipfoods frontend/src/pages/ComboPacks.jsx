import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FiMinus, FiPlus } from "react-icons/fi";
import api from "../services/api";
import { useCart } from "../context/CartContext";

const PLACEHOLDER_IMAGE =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='400'>
      <rect width='100%' height='100%' fill='#f0fdf4'/>
      <text x='50%' y='50%' font-family='sans-serif' font-size='18' fill='#16a34a' text-anchor='middle' dominant-baseline='middle'>VIP Combo</text>
    </svg>`
  );

function ComboCard({ offer }) {
  const dialogRef = useRef(null);
  const image = offer.image || offer.options?.[0]?.product?.images?.[0] || PLACEHOLDER_IMAGE;
  const { addToCart } = useCart();
  const [selected, setSelected] = useState({});
  const [message, setMessage] = useState("");
  const options = offer.options || [];
  const rules = offer.selectionRules || [];
  const matchesRule = (product, rule) => String(product.category?._id || product.category) === String(rule.category) && (!rule.subCategory || product.subCategory === rule.subCategory);
  const ruleTotals = rules.map(rule => options.reduce((sum, option) => sum + (matchesRule(option.product, rule) ? (selected[`${option.product._id}:${option.variantId}`] || 0) : 0), 0));
  const requirementsMet = rules.every((rule, index) => ruleTotals[index] === rule.quantity);
  const total = Object.values(selected).reduce((sum, quantity) => sum + quantity, 0);

  const update = (key, value) => {
    setSelected((previous) => ({ ...previous, [key]: value }));
    setMessage("");
  };

  const add = () => {
    if (total !== offer.itemCount || !requirementsMet) return;
    const selections = options.flatMap((option) => {
      const key = `${option.product._id}:${option.variantId}`;
      const quantity = selected[key] || 0;
      const variant = option.product.variants.find((item) => item._id === option.variantId);
      return quantity
        ? [{ product: option.product._id, variantId: option.variantId, productName: option.product.name, size: variant.weight, quantity }]
        : [];
    });
    const configuration = selections
      .map((s) => `${s.product}:${s.variantId}:${s.quantity}`)
      .sort()
      .join("|");
    const first = options.find((o) => o.product._id === selections[0].product)?.product;
    addToCart({
      id: `combo:${offer._id}:${configuration}`,
      comboOffer: offer._id,
      comboSelections: selections,
      comboSummary: selections
        .map((s) => `${s.quantity} × ${s.productName} (${offer.size})`)
        .join(", "),
      name: offer.name,
      weight: offer.size,
      price: offer.price,
      offerPrice: offer.price,
      image: offer.image || first?.images?.[0] || "",
    });
    setMessage("Your customized combo has been added to the cart.");
  };

  return (
    <>
      {/* ── Card (matches Best Deals DealCard size exactly) ── */}
      <div className="w-40 sm:w-48 md:w-52 shrink-0 snap-start bg-white rounded-[22px] border border-gray-100 p-2.5 sm:p-3 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
        {/* Image */}
        <button
          type="button"
          onClick={() => dialogRef.current.showModal()}
          className="relative w-full aspect-square rounded-2xl bg-gray-50 overflow-hidden mb-2 block p-0 border-0 cursor-pointer"
          aria-label={`Customize ${offer.name}`}
        >
          <span className="absolute top-2 left-2 z-10 bg-green-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-xs">
            Combo
          </span>
          <img
            src={image}
            alt={offer.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = PLACEHOLDER_IMAGE; }}
          />
        </button>

        {/* Name + size */}
        <div>
          <h2 className="font-extrabold text-sm sm:text-base text-gray-900 truncate">{offer.name}</h2>
          <p className="text-[11px] sm:text-xs text-gray-400 font-medium mt-0.5">
            {offer.size} · {offer.itemCount} items
          </p>
        </div>

        {/* Price + Customize button */}
        <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-gray-50">
          <span className="font-extrabold text-sm sm:text-base text-gray-900">
            ₹{Number(offer.price).toFixed(2)}
          </span>
          <button
            type="button"
            onClick={() => dialogRef.current.showModal()}
            className="w-8 h-8 rounded-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center shadow-xs active:scale-90 transition-transform"
            title="Customize combo"
          >
            <FiPlus size={18} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* ── Customise dialog (unchanged) ── */}
      <dialog
        ref={dialogRef}
        aria-label={`Customize ${offer.name}`}
        className="m-auto w-[calc(100%_-_24px)] max-w-3xl max-h-[85dvh] overflow-y-auto rounded-3xl p-0 backdrop:bg-black/50"
      >
        <section className="rounded-3xl border border-green-100 bg-white p-4 sm:p-6 shadow-sm">
          <button
            type="button"
            onClick={() => dialogRef.current.close()}
            className="block ml-auto mb-3 text-sm font-bold text-gray-600"
          >
            Close ✕
          </button>
          <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
            <div>
              <h2 className="font-extrabold text-xl text-gray-900">{offer.name}</h2>
              <p className="mt-1 text-sm text-gray-600">
                Choose {offer.itemCount} items · {offer.size} each
              </p>
            </div>
            <p className="text-2xl font-black text-green-700">₹{Number(offer.price).toFixed(2)}</p>
          </div>
          {rules.length > 0 && <div className="mb-4 rounded-xl bg-green-50 p-3 text-sm" aria-live="polite">
            {rules.map((rule, index) => <p key={index}>{rule.categoryName}{rule.subCategory ? ` / ${rule.subCategory}` : ""}: {ruleTotals[index]} / {rule.quantity} selected</p>)}
          </div>}
          {!options.length ? (
            <p className="text-sm text-gray-500">
              No products are currently available in this size.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {options.map((option) => {
                const product = option.product;
                const key = `${product._id}:${option.variantId}`;
                const quantity = selected[key] || 0;
                return (
                  <div key={key} className="flex items-center gap-3 rounded-2xl border border-gray-100 p-3">
                    {product.images?.[0] && (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="h-16 w-16 rounded-xl object-cover"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-bold text-gray-900">{product.name}</h3>
                      <p className="text-xs text-gray-500">{offer.size}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        aria-label={`Remove one ${product.name}`}
                        disabled={!quantity}
                        onClick={() => update(key, quantity - 1)}
                        className="p-2 rounded-full bg-green-50 text-green-700 disabled:opacity-30"
                      >
                        <FiMinus />
                      </button>
                      <span className="text-sm font-bold">{quantity}</span>
                      <button
                        aria-label={`Add one ${product.name}`}
                        disabled={total >= offer.itemCount || rules.some((rule, index) => matchesRule(product, rule) && ruleTotals[index] >= rule.quantity)}
                        onClick={() => update(key, quantity + 1)}
                        className="p-2 rounded-full bg-green-600 text-white disabled:opacity-30"
                      >
                        <FiPlus />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <p aria-live="polite" className="text-sm font-semibold text-gray-700">
              {total} / {offer.itemCount} items selected
            </p>
            <button
              disabled={total !== offer.itemCount || !requirementsMet}
              onClick={add}
              className="rounded-full bg-green-600 px-6 py-3 text-sm font-bold text-white disabled:opacity-40"
            >
              Add combo to cart · ₹{Number(offer.price).toFixed(2)}
            </button>
          </div>
          {message && (
            <p role="status" className="mt-3 text-sm text-green-700">
              {message}{" "}
              <Link className="font-bold underline" to="/cart">
                View cart
              </Link>
            </p>
          )}
        </section>
      </dialog>
    </>
  );
}

export default function ComboPacks() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    api
      .get("/combo-offers")
      .then(({ data }) => { if (active) setOffers(data.offers || []); })
      .catch(() => { if (active) setError("Could not load combo packs. Please try again."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [reload]);

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-6 pb-28">
      <div className="mx-auto max-w-7xl space-y-5">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black text-gray-900">VIP Combo Packs</h1>
            <p className="mt-1 text-sm text-gray-600">
              One fixed price. Choose your favourite products in the size shown.
            </p>
          </div>
        </div>

        {/* Cards — horizontal scroll, same layout as Best Deals */}
        {loading ? (
          <div className="flex gap-3.5 overflow-x-auto pb-4 pt-1 scrollbar-hide">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-40 sm:w-48 shrink-0 bg-white rounded-[22px] p-3 shadow-xs animate-pulse space-y-3"
              >
                <div className="w-full aspect-square bg-gray-200 rounded-2xl" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : error ? (
          <p role="alert">
            {error}{" "}
            <button
              className="font-bold underline"
              onClick={() => setReload((v) => v + 1)}
            >
              Retry
            </button>
          </p>
        ) : !offers.length ? (
          <p className="rounded-2xl bg-white p-6 text-gray-500">Combo offers are coming soon.</p>
        ) : (
          <div className="flex gap-3.5 overflow-x-auto pb-4 pt-1 scrollbar-hide snap-x">
            {offers.map((offer) => (
              <ComboCard key={offer._id} offer={offer} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
