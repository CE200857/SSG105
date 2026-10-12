import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import Login from "../components/DatNT/Login";
import Register from "../components/DatNT/Register";
import CreateProfile from "../components/DatNT/CreateProfile";

// Import Header & Footer mới tạo
import Header from "../components/Header";
import Footer from "../components/Footer";

import Home from "../pages/Home";

// Khung bảo vệ Role
const ProtectedRoute = ({ user, allowedRoles, children }) => {
  if (!user) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(user.roleId)) {
    return user.roleId === 1 ? (
      <Navigate to="/admin" replace />
    ) : (
      <Navigate to="/" replace />
    );
  }
  return children;
};

// Khung Layout chính có Header và Footer bọc lấy nội dung (Outlet)
const MainLayout = ({ user, setUser }) => {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Header user={user} setUser={setUser} />
      {/* Outlet là nơi thay đổi nội dung của các trang con */}
      <main className="flex-grow-1" style={{ backgroundColor: "#f8f9fa" }}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default function AppRoutes({ user, setUser }) {
  return (
    <Routes>
      {/* 1. Các trang KHÔNG CẦN Header/Footer (như Đăng nhập, Đăng ký) */}
      <Route path="/login" element={<Login setUser={setUser} />} />
      <Route path="/forgot-password" element={<div>Trang quên mật khẩu</div>} />
      <Route path="/register" element={<Register />} />
      <Route path="/create-profile" element={<CreateProfile />} />

      {/* 2. Các trang CÓ Header/Footer (bọc trong MainLayout) */}
      <Route element={<MainLayout user={user} setUser={setUser} />}>
        {/* Dành cho Student (Role 2) */}
        <Route
          path="/"
          element={user ? <Home /> : <Navigate to="/login" replace />}
        />

        <Route
          path="/"
          element={user ? <Home /> : <Navigate to="/login" replace />}
        />

        {/* Thêm các trang tạm thời để không bị lỗi 404 khi bấm vào Header */}
        <Route
          path="/lost-found"
          element={<h3 className="text-center p-5">Trang đồ thất lạc</h3>}
        />
        <Route
          path="/forum"
          element={<h3 className="text-center p-5">Trang diễn đàn</h3>}
        />
        <Route
          path="/review"
          element={<h3 className="text-center p-5">Trang đánh giá</h3>}
        />
        <Route
          path="/overview"
          element={<h3 className="text-center p-5">Trang tổng quan</h3>}
        />
        <Route
          path="/profile"
          element={
            <h3 className="text-center p-5">
              Hồ sơ cá nhân của {user?.fullName}
            </h3>
          }
        />

        {/* Dành cho Admin (Role 1) */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute user={user} allowedRoles={[1]}>
              <div className="container py-5 text-center">
                <h3>Trang quản trị Admin</h3>
              </div>
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
}
