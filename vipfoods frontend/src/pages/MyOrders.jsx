import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyOrders } from "../services/orderService";

// Truck icon matching Image 3
function DeliveryTruckIcon({ className = "w-6 h-6" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="1" y="3" width="15" height="13" rx="2" />
      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  );
}

export default function MyOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Ongoing"); // Ongoing | Completed | Cancelled

  useEffect(() => {
    let isMounted = true;
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await getMyOrders();
        if (isMounted) {
          setOrders(res.orders || []);
        }
      } catch (err) {
        console.error("Failed to fetch orders:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchOrders();
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter orders based on active tab
  const filteredOrders = orders.filter((order) => {
    const status = (order.orderStatus || "").toLowerCase();
    if (activeTab === "Ongoing") {
      return status !== "delivered" && status !== "cancelled";
    }
    if (activeTab === "Completed") {
      return status === "delivered";
    }
    if (activeTab === "Cancelled") {
      return status === "cancelled";
    }
    return true;
  });

  return (
    <div className="bg-gray-50 min-h-screen pb-24 font-sans">
      <div className="max-w-2xl mx-auto px-4 pt-4">
        {/* Status Filter Tabs (Matching Image 3) */}
        <div className="bg-gray-200/70 p-1 rounded-2xl flex max-w-sm mx-auto mb-4">
          {["Ongoing", "Completed", "Cancelled"].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all ${
                activeTab === tab
                  ? "bg-white text-green-600 shadow-xs"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="bg-white rounded-[24px] p-4 border border-gray-100 shadow-xs animate-pulse space-y-3"
              >
                <div className="flex gap-3 items-center">
                  <div className="w-11 h-11 rounded-full bg-gray-200"></div>
                  <div className="space-y-1 flex-1">
                    <div className="w-1/3 h-4 bg-gray-200 rounded"></div>
                    <div className="w-1/4 h-3 bg-gray-200 rounded"></div>
                  </div>
                </div>
                <div className="h-10 bg-gray-200 rounded-xl"></div>
              </div>
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-[24px] p-8 text-center border border-gray-100 shadow-xs mt-2">
            <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-green-50 flex items-center justify-center text-green-600">
              <DeliveryTruckIcon className="w-7 h-7" />
            </div>
            <h4 className="font-extrabold text-gray-900 text-base mb-1">
              No {activeTab.toLowerCase()} orders
            </h4>
            <p className="text-gray-500 text-xs mb-4">
              When you place an order, it will appear here.
            </p>
            <button
              type="button"
              onClick={() => navigate("/shop")}
              className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-full text-xs font-bold shadow"
            >
              Explore Products
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredOrders.map((order) => {
              const status = order.orderStatus || "Processing";
              const isDelivered = status.toLowerCase() === "delivered";
              const isCancelled = status.toLowerCase() === "cancelled";

              let statusBadgeClass = "bg-amber-100 text-amber-800";
              let statusText = "On its way";
              if (isDelivered) {
                statusBadgeClass = "bg-emerald-100 text-emerald-800";
                statusText = "Delivered";
              } else if (isCancelled) {
                statusBadgeClass = "bg-red-100 text-red-800";
                statusText = "Cancelled";
              }

              const formattedDate = order.createdAt
                ? new Date(order.createdAt).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })
                : "20 Oct 2023";

              return (
                <div
                  key={order._id || order.orderNumber}
                  className="bg-white rounded-[24px] p-4 sm:p-5 border border-gray-100 shadow-xs space-y-3"
                >
                  {/* Top Row: Icon, Order #, Status */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
                        <DeliveryTruckIcon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-extrabold text-sm sm:text-base text-gray-900 truncate">
                          Order #{order.orderNumber || "12345"}
                        </h4>
                        <p className="text-[11px] text-gray-400 font-medium">
                          Placed on: {formattedDate}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`text-[11px] font-bold px-3 py-1 rounded-full shrink-0 ${statusBadgeClass}`}
                    >
                      {statusText}
                    </span>
                  </div>

                  {/* Middle Row: Items Thumbnails & Total */}
                  <div className="flex items-center justify-between border-t border-b border-gray-50 py-3">
                    {/* Overlapping Thumbnails */}
                    <div className="flex -space-x-3 items-center overflow-hidden">
                      {(order.items || []).slice(0, 4).map((item, idx) => (
                        <img
                          key={idx}
                          src={item.image}
                          alt={item.productName || "Product"}
                          className="w-10 h-10 rounded-full border-2 border-white object-cover bg-gray-50 shadow-xs"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      ))}
                    </div>

                    {/* Total Amount */}
                    <div className="text-right">
                      <span className="text-[11px] text-gray-400 block font-medium">Total</span>
                      <span className="font-extrabold text-base text-gray-900">
                        ₹{order.grandTotal || "10.47"}
                      </span>
                    </div>
                  </div>

                  {/* Bottom Row: View Details & Track Order Buttons (Matching Image 3) */}
                  <div className="flex items-center gap-2.5 pt-1">
                    <button
                      type="button"
                      onClick={() => navigate(`/order-success/${order.orderNumber}`)}
                      className="flex-1 py-2.5 px-3 rounded-xl border border-pink-200 bg-pink-50/50 hover:bg-pink-100 text-[#f43f5e] font-extrabold text-xs sm:text-sm text-center transition-colors focus:outline-none"
                    >
                      View Details
                    </button>

                    <button
                      type="button"
                      onClick={() => alert(`Tracking updates for Order #${order.orderNumber}`)}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-[#f43f5e] hover:bg-[#e11d48] text-white font-extrabold text-xs sm:text-sm text-center shadow-xs transition-colors focus:outline-none"
                    >
                      Track Order
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}