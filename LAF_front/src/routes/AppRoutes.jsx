import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../components/DatNT/Login";
import Register from "../components/DatNT/Register";
import CreateProfile from "../components/DatNT/CreateProfile";

const ProtectedRoute = ({ user, allowedRoles, children }) => {
  if (!user) return <Navigate to="/login" replace />;
  // RoleID: 1 (Admin), 2 (Student)[cite: 1]
  if (!allowedRoles.includes(user.roleId)) {
    return user.roleId === 1 ? (
      <Navigate to="/admin" replace />
    ) : (
      <Navigate to="/" replace />
    );
  }
  return children;
};

export default function AppRoutes({ user, setUser }) {
  return (
    <Routes>
      {/* Các route không cần đăng nhập */}
      <Route path="/login" element={<Login setUser={setUser} />} />
      <Route path="/forgot-password" element={<div>Trang quên mật khẩu</div>} />
      <Route path="/register" element={<Register />} />
      <Route path="/create-profile" element={<CreateProfile />} />

      {/* Dành cho Student (Role 2) */}
      <Route
        path="/"
        element={
          user ? (
            <div>Xin chào {user.fullName} - Vai trò: Sinh viên</div>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Dành cho Admin (Role 1) */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute user={user} allowedRoles={[1]}>
            <div>Trang quản trị Admin</div>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
