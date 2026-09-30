import { dashboardAnalytics } from "../utils/orderBill.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";

export const getDashboardStats = async (req, res) => {
  try {
    // ---------- REVENUE + ORDER COUNT ----------
    const orders = await Order.find().select("grandTotal paymentStatus paymentMethod walletAmountUsed onlinePaidAmount codChargePaid codCharge orderStatus createdAt").lean();
    const analytics = dashboardAnalytics(orders);
    const totalRevenue = analytics.collected;
    const totalOrders = await Order.countDocuments();

    // ---------- CUSTOMERS ----------
   const totalCustomers = await User.countDocuments({});

    // ---------- PRODUCTS ----------
    const totalProducts = await Product.countDocuments({ isDeleted: false });

    // ---------- RECENT ORDERS (latest 5) ----------
    const recentOrders = await Order.find()
      .populate("customer", "name email")
      .sort("-createdAt")
      .limit(5)
      .select("orderNumber grandTotal orderStatus paymentMethod createdAt customer");

    // ---------- LOW STOCK PRODUCTS ----------
    const lowStockAgg = await Product.aggregate([
      { $match: { isDeleted: false } },
      { $unwind: "$variants" },
      {
        $match: {
          $expr: { $lte: ["$variants.stock", "$variants.lowStockThreshold"] },
        },
      },
      {
        $project: {
          name: 1,
          image: { $arrayElemAt: ["$images", 0] },
          weight: "$variants.weight",
          stock: "$variants.stock",
          lowStockThreshold: "$variants.lowStockThreshold",
        },
      },
      { $sort: { stock: 1 } },
      { $limit: 5 },
    ]);

    return res.json({
      success: true,
      stats: {
        totalRevenue,
        totalOrders,
        totalCustomers,
        totalProducts,
      },
      analytics,
      recentOrders,
      lowStockProducts: lowStockAgg,
    });
  } catch (error) {
    console.error("========== DASHBOARD STATS ERROR ==========");
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};