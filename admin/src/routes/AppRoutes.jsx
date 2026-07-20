import { Routes, Route } from "react-router-dom";

import Login from "../pages/Auth/Login";

import Dashboard from "../pages/Dashboard/Dashboard";

import Products from "../pages/Products/Products";
import AddProduct from "../pages/Products/AddProduct";
import EditProduct from "../pages/Products/EditProduct";

import Categories from "../pages/Categories/Categories";

import Orders from "../pages/Orders/Orders";

import Customers from "../pages/Customers/Customers";

import Coupons from "../pages/Coupons/Coupons";
import CouponForm from "../pages/Coupons/CouponForm";

import Reviews from "../pages/Reviews/Reviews";

import Settings from "../pages/Settings/Settings";

import HomeBanner from "../pages/HomeBanner/HomeBanner";

import NotFound from "../pages/NotFound";

import AdminLayout from "../layouts/AdminLayout";
import ProtectedRoute from "../components/ProtectedRoute";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Login */}
      <Route path="/login" element={<Login />} />

      {/* Protected Admin Routes */}
      <Route
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        {/* Dashboard */}
        <Route path="/" element={<Dashboard />} />

        {/* Products */}
        <Route path="/products" element={<Products />} />
        <Route path="/products/add" element={<AddProduct />} />
        <Route path="/products/edit/:id" element={<EditProduct />} />

        {/* Categories */}
        <Route path="/categories" element={<Categories />} />

        {/* Orders */}
        <Route path="/orders" element={<Orders />} />

        {/* Customers */}
        <Route path="/customers" element={<Customers />} />

        {/* Coupons */}
        <Route path="/coupons" element={<Coupons />} />
        <Route path="/coupons/new" element={<CouponForm />} />

        {/* Reviews */}
        <Route path="/reviews" element={<Reviews />} />

        {/* Home Banner */}
        <Route path="/home-banner" element={<HomeBanner />} />

        {/* Settings */}
        <Route path="/settings" element={<Settings />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}