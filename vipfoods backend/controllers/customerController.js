import User from "../models/User.js";
import Order from "../models/Order.js";

// GET all customers (registered users)
export const getCustomers = async (req, res) => {
  try {
    const { search = "" } = req.query;

    const query = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { mobile: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const customers = await User.find(query)
      .select("-password -otp -otpExpires")
      .sort({ createdAt: -1 });

    const formattedCustomers = await Promise.all(
      customers.map(async (customer) => {
        const ordersCount = await Order.countDocuments({
          customer: customer._id,
        });

        return {
          ...customer.toObject(),
          ordersCount,
        };
      })
    );

    res.json({
      success: true,
      customers: formattedCustomers,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

// GET single customer
export const getCustomerById = async (req, res) => {
  try {
    const customer = await User.findById(req.params.id).select(
      "-password -otp -otpExpires"
    );

    if (!customer) {
      return res.status(404).json({
        success: false,
        error: "Customer not found",
      });
    }

    const orders = await Order.find({
      customer: customer._id,
    })
      .sort({ createdAt: -1 })
      .select(
        "orderNumber grandTotal paymentMethod paymentStatus orderStatus createdAt"
      );

    res.json({
      success: true,
      customer: {
        ...customer.toObject(),
        ordersCount: orders.length,
        orders,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

// CREATE customer (Customers register through website)
export const createCustomer = async (req, res) => {
  res.status(405).json({
    success: false,
    message: "Customers can only register through the website.",
  });
};

// UPDATE customer
export const updateCustomer = async (req, res) => {
  try {
    const customer = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).select("-password -otp -otpExpires");

    if (!customer) {
      return res.status(404).json({
        success: false,
        error: "Customer not found",
      });
    }

    res.json({
      success: true,
      customer,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message,
    });
  }
};

// DELETE customer
export const deleteCustomer = async (req, res) => {
  try {
    const customer = await User.findByIdAndDelete(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        error: "Customer not found",
      });
    }

    await Order.deleteMany({
      customer: req.params.id,
    });

    res.json({
      success: true,
      message: "Customer and associated orders deleted successfully.",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};