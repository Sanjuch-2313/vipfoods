import Order from "../models/Order.js";

const generateOrderNumber = () => {
  return (
    "VIP" +
    Date.now() +
    Math.floor(Math.random() * 1000)
  );
};

export const createOrder = async (req, res) => {
  try {
    const order = await Order.create({
      ...req.body,
      orderNumber: generateOrderNumber(),
    });

    res.status(201).json({
      success: true,
      order,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

export const getOrders = async (req, res) => {

  try {

    const orders = await Order.find()

      .populate("customer")

      .populate("items.product")

      .sort("-createdAt");

    res.json({
      success: true,
      orders,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }

};

export const getOrder = async (req, res) => {

  try {

    const order = await Order.findById(req.params.id)

      .populate("customer")

      .populate("items.product");

    if (!order) {

      return res.status(404).json({
        success: false,
        message: "Order not found",
      });

    }

    res.json({
      success: true,
      order,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }

};

export const updateOrderStatus = async (
  req,
  res
) => {

  try {

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        orderStatus: req.body.orderStatus,
      },
      {
        new: true,
      }
    );

    res.json({
      success: true,
      order,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }

};

export const deleteOrder = async (
  req,
  res
) => {

  try {

    await Order.findByIdAndDelete(
      req.params.id
    );

    res.json({
      success: true,
      message: "Order Deleted",
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }

};