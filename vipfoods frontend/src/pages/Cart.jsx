import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FiMinus, FiPlus, FiShoppingBag } from "react-icons/fi";
import { useCart } from "../context/CartContext";

export default function Cart() {
  const navigate = useNavigate();
  const { cartItems, updateCartQuantity, removeFromCart } = useCart();

  const subtotal = useMemo(
    () =>
      cartItems.reduce(
        (sum, item) => sum + (item.offerPrice || item.price || 0) * item.quantity,
        0
      ),
    [cartItems]
  );

  const grandTotal = subtotal;

  return (
    <div className="bg-gray-50 min-h-screen pb-44 font-sans">
      <div className="max-w-2xl mx-auto px-4 pt-4">
        {cartItems.length === 0 ? (
          <div className="text-center py-20 px-4">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-pink-50 flex items-center justify-center text-pink-500">
              <FiShoppingBag size={32} />
            </div>
            <h3 className="font-extrabold text-gray-900 text-lg mb-1">Your cart is empty</h3>
            <p className="text-gray-500 text-sm mb-6">Looks like you haven't added anything to your cart yet.</p>
            <button
              type="button"
              onClick={() => navigate("/shop")}
              className="bg-[#f43f5e] hover:bg-[#e11d48] text-white px-6 py-3 rounded-full text-sm font-bold shadow transition-colors"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          /* Cart Items List */
          <div className="space-y-3">
            {cartItems.map((item) => (
              <div
                key={`${item.id}-${item.weight}`}
                className="bg-white rounded-[22px] p-3.5 border border-gray-100 shadow-xs flex items-center justify-between gap-3"
              >
                {/* Image & Details */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-14 h-14 rounded-2xl object-cover bg-gray-50 border border-gray-100 shrink-0"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                  <div className="min-w-0">
                    <h4 className="font-extrabold text-sm text-gray-900 truncate">
                      {item.name} {item.weight && <span className="font-semibold text-gray-400">• {item.weight}</span>}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-bold text-sm text-gray-900">
                        ₹{item.offerPrice || item.price}
                      </span>
                      <span className="text-gray-300">•</span>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id, item.weight)}
                        className="text-xs text-gray-400 hover:text-red-500 font-medium transition-colors"
                      >
                        ✕ Remove
                      </button>
                    </div>
                  </div>
                </div>

                {/* Quantity Stepper (Pill with - Qty +) */}
                <div className="bg-gray-100 rounded-full px-2.5 py-1 flex items-center gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() =>
                      updateCartQuantity(item.id, item.weight, Math.max(1, item.quantity - 1))
                    }
                    className="w-6 h-6 flex items-center justify-center text-gray-700 hover:text-gray-900 active:scale-90 font-bold"
                  >
                    <FiMinus size={13} strokeWidth={2.5} />
                  </button>

                  <span className="text-sm font-extrabold text-gray-900 min-w-[14px] text-center">
                    {item.quantity}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      updateCartQuantity(item.id, item.weight, item.quantity + 1)
                    }
                    className="w-6 h-6 flex items-center justify-center text-gray-700 hover:text-gray-900 active:scale-90 font-bold"
                  >
                    <FiPlus size={13} strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sticky Bottom Order Summary & Proceed to Checkout Bar (Matching Image 2) */}
      {cartItems.length > 0 && (
        <div className="fixed bottom-14 left-0 right-0 z-30 bg-white border-t border-gray-100 p-4 shadow-[0_-8px_30px_rgba(0,0,0,0.06)]">
          <div className="max-w-2xl mx-auto">
            {/* Subtotal & Delivery Fee */}
            <div className="space-y-1.5 mb-3 text-sm">
              <div className="flex justify-between text-gray-500 font-medium">
                <span>Subtotal</span>
                <span className="font-extrabold text-gray-900">₹{subtotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Pink Full-width Checkout Button */}
            <button
              type="button"
              onClick={() => navigate("/checkout")}
              className="w-full bg-[#f43f5e] hover:bg-[#e11d48] text-white rounded-[20px] py-3.5 px-6 flex justify-between items-center font-extrabold text-base shadow-md active:scale-[0.99] transition-transform"
            >
              <span>Proceed to Checkout</span>
              <span>₹{grandTotal.toFixed(2)}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
