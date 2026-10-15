import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import Login from "../components/DatNT/Login";
import Register from "../components/DatNT/Register";
import CreateProfile from "../components/DatNT/CreateProfile";

// Import Header & Footer
import Header from "../components/Header";
import Footer from "../components/Footer";

// Import các trang
import Home from "../pages/Home";
import OverviewPage from "../pages/OverviewPage";
import LostFoundPage from "../pages/LostFoundPage";
import ProfilePage from '../pages/ProfilePage';
import ChangePasswordPage from "../pages/ChangePasswordPage";
import EditProfilePage from "../pages/EditProfilePage";
import ReviewPage from "../pages/ReviewPage";

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
      {/* 2. Các trang CÓ Header/Footer (bọc trong MainLayout) */}
      <Route element={<MainLayout user={user} setUser={setUser} />}>
        {/* Trang chủ */}
        {/* Dành cho Student (Role 2) */}
        <Route path="/" element={<Home user={user} />} />

        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route
          path="/forgot-password"
          element={<div>Trang quên mật khẩu</div>}
        />
        <Route path="/register" element={<Register />} />
        <Route path="/create-profile" element={<CreateProfile />} />
          
        <Route path="/lost-found" element={<LostFoundPage user={user} />} />
        <Route path="/overview" element={<OverviewPage />} />

        <Route path="/profile" element={<ProfilePage user={user} />} />
        <Route path="/change-password" element={<ChangePasswordPage user={user} />} />
        <Route path="/edit-profile" element={<EditProfilePage user={user} setUser={setUser} />} />

        {/* Các trang tạm thời khác */}
        <Route
          path="/forum"
          element={<h3 className="text-center p-5">Trang diễn đàn</h3>}
        />
        <Route path="/review" element={<ReviewPage user={user} />} />

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