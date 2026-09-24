import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiHeart, FiPlus } from "react-icons/fi";
import { getProducts } from "../services/productService";
import { useCart } from "../context/CartContext";

const PLACEHOLDER_IMG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='400'>
      <rect width='100%' height='100%' fill='#f3f4f6'/>
      <text x='50%' y='50%' font-family='sans-serif' font-size='22' fill='#9ca3af' text-anchor='middle' dominant-baseline='middle'>VIP Foods</text>
    </svg>`
  );

const PAGE_SIZE = 8;

export default function Shop() {
  const navigate = useNavigate();
  const { wishlistItems, toggleWishlist, addToCart } = useCart();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    let isMounted = true;

    const fetchShopProducts = async () => {
      try {
        setLoading(true);
        const data = await getProducts();

        if (isMounted) {
          const list = Array.isArray(data) ? data : [];
          setProducts(list.filter((p) => p.active !== false && p.published !== false));
        }
      } catch (err) {
        console.error("Failed to load products:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchShopProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleAddToCart = (e, product) => {
    e.stopPropagation();

    const price =
      product.variants?.[0]?.sellingPrice ||
      product.variants?.[0]?.price ||
      product.offerPrice ||
      product.price ||
      99;

    const weight =
      product.variants?.[0]?.weight ||
      product.variants?.[0]?.unit ||
      product.weight ||
      "1 kg";

    addToCart({
      id: product._id || product.id,
      name: product.name,
      image: product.images?.[0] || product.image || PLACEHOLDER_IMG,
      price: Number(price),
      offerPrice: Number(price),
      weight,
      tag: product.category?.name || "Groceries",
    });

    setToastMsg(`Added ${product.name} to cart!`);
    setTimeout(() => setToastMsg(""), 2000);
  };

  const isWishlisted = (productId) =>
    wishlistItems.some((item) => item.id === productId || item._id === productId);

  const visibleProducts = products.slice(0, visibleCount);
  const hasMore = visibleCount < products.length;

  return (
    <div className="bg-gray-50 min-h-screen pb-24 font-sans">
      {toastMsg && (
        <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-50 bg-gray-900 text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-lg animate-bounce">
          {toastMsg}
        </div>
      )}

      <div className="max-w-6xl mx-auto px-3 sm:px-4 pt-3 sm:pt-4">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-[24px] p-3 shadow-xs animate-pulse flex flex-col justify-between h-64"
              >
                <div className="bg-gray-200 h-36 rounded-2xl w-full mb-3"></div>
                <div className="bg-gray-200 h-4 rounded w-3/4 mb-2"></div>
                <div className="bg-gray-200 h-3 rounded w-1/2 mb-3"></div>
                <div className="flex justify-between items-center">
                  <div className="bg-gray-200 h-5 rounded w-1/3"></div>
                  <div className="bg-gray-200 h-8 w-8 rounded-full"></div>
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 px-4">
            <h3 className="font-bold text-gray-800 text-lg mb-1">No products available</h3>
            <p className="text-gray-500 text-sm mb-4">Check back soon for fresh arrivals!</p>
            <button
              onClick={() => navigate("/")}
              className="bg-purple-600 text-white px-5 py-2.5 rounded-full text-sm font-semibold shadow hover:bg-purple-700 transition-colors"
            >
              Back to Home
            </button>
          </div>
        ) : (
          <>
            <p className="text-xs text-gray-500 font-medium mb-3 px-0.5">
              Showing 1–{visibleProducts.length} of {products.length} results
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
              {visibleProducts.map((product, idx) => {
                const thumbnail =
                  product.images?.[0] || product.image || PLACEHOLDER_IMG;
                const price =
                  product.variants?.[0]?.sellingPrice ||
                  product.variants?.[0]?.price ||
                  product.offerPrice ||
                  product.price ||
                  2.49;
                const originalPrice =
                  product.variants?.[0]?.mrp ||
                  product.mrp ||
                  product.originalPrice ||
                  (price * 1.2).toFixed(2);
                const weight =
                  product.variants?.[0]?.weight ||
                  product.variants?.[0]?.unit ||
                  product.weight ||
                  (idx % 2 === 0 ? "1 kg" : "500 g");

                let badge = null;
                if (idx % 3 === 0) badge = { text: "SALE", bg: "bg-red-500 text-white" };
                else if (idx % 3 === 1) badge = { text: "50% OFF", bg: "bg-red-500 text-white" };
                else if (idx % 4 === 0) badge = { text: "NEW", bg: "bg-amber-400 text-gray-900" };

                const wish = isWishlisted(product._id || product.id);

                return (
                  <div
                    key={product._id || product.id}
                    className="bg-white rounded-[22px] border border-gray-100 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between group"
                  >
                    <div className="relative w-full aspect-square bg-gray-50 overflow-hidden">
                      {badge && (
                        <span
                          className={`absolute top-2.5 left-2.5 z-10 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow-xs uppercase tracking-tight ${badge.bg}`}
                        >
                          {badge.text}
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWishlist(product);
                        }}
                        className="absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center shadow-xs text-gray-400 hover:text-red-500 hover:bg-white active:scale-90 transition-all focus:outline-none"
                        aria-label="Wishlist"
                      >
                        <FiHeart
                          className={wish ? "text-red-500 fill-red-500" : "text-gray-500"}
                          size={16}
                        />
                      </button>

                      <img
                        src={thumbnail}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = PLACEHOLDER_IMG;
                        }}
                      />
                    </div>

                    <div className="p-3.5 flex flex-col justify-between flex-1">
                      <div>
                        <h3 className="font-extrabold text-sm text-gray-900 truncate leading-snug">
                          {product.name}
                        </h3>
                        <p className="text-[11px] text-gray-400 font-medium mt-0.5">
                          {weight}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-3 pt-1">
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-extrabold text-sm sm:text-base text-gray-900">
                            ₹{price}
                          </span>
                          {Number(originalPrice) > Number(price) && (
                            <span className="text-[11px] text-gray-400 line-through">
                              ₹{originalPrice}
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={(e) => handleAddToCart(e, product)}
                          className="w-8 h-8 rounded-full bg-[#f43f5e] hover:bg-[#e11d48] text-white flex items-center justify-center shadow-sm active:scale-90 transition-transform focus:outline-none"
                          title="Add to cart"
                        >
                          <FiPlus size={18} strokeWidth={2.5} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {hasMore && (
              <div className="flex justify-center mt-6 mb-2">
                <button
                  onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
                  className="bg-[#f43f5e] hover:bg-[#e11d48] active:scale-95 text-white font-bold px-8 py-3 rounded-full shadow-md transition-all text-sm tracking-wide"
                >
                  Load More Products
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
