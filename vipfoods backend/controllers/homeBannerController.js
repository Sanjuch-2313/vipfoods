import HomeBanner from "../models/HomeBanner.js";

export const createBanner = async (req, res) => {
  try {
    const {
      title,
      subtitle,
      coupon,
      buttonText,
      buttonLink,
      active,
    } = req.body;

    const image = req.files?.length ? req.files[0].path : "";

    if (!image) {
      return res.status(400).json({
        success: false,
        message: "Banner image is required",
      });
    }

    const banner = await HomeBanner.create({
      title,
      subtitle,
      coupon,
      buttonText,
      buttonLink,
      active,
      image,
    });

    res.status(201).json({
      success: true,
      message: "Banner created successfully",
      banner,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getBanner = async (req, res) => {
  try {
    const banner = await HomeBanner.findOne({
      active: true,
    })
      .populate("coupon")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      banner,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllBanners = async (req, res) => {
  try {
    const banners = await HomeBanner.find()
      .populate("coupon")
      .sort({
        createdAt: -1,
      });

    res.json({
      success: true,
      banners,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateBanner = async (req, res) => {
  try {
    const data = { ...req.body };

    if (req.files?.length) {
      data.image = req.files[0].path;
    }

    const banner = await HomeBanner.findByIdAndUpdate(
      req.params.id,
      data,
      {
        new: true,
        runValidators: true,
      }
    ).populate("coupon");

    res.json({
      success: true,
      message: "Banner updated successfully",
      banner,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteBanner = async (req, res) => {
  try {
    await HomeBanner.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Banner deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};