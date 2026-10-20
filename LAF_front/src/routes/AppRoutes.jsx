import { Routes, Route, Navigate, Outlet, useNavigate } from "react-router-dom";
import { Container, Card, Button, Badge } from "react-bootstrap";
import Login from "../components/DatNT/Login";
import Register from "../components/DatNT/Register";
import CreateProfile from "../components/DatNT/CreateProfile";

// Import Header & Footer
import Header from "../components/Header";
import Footer from "../components/Footer";

// Import các trang của Student
import Home from "../pages/Home";
import OverviewPage from "../pages/OverviewPage";
import LostFoundPage from "../pages/LostFoundPage";
import ProfilePage from "../pages/ProfilePage";
import ChangePasswordPage from "../pages/ChangePasswordPage";
import EditProfilePage from "../pages/EditProfilePage";
import ReviewPage from "../pages/ReviewPage";
import ForumPage from "../pages/ForumPage";
import FoundItemsPage from "../pages/FoundItemsPage";

// Helper lấy chuẩn RoleID (1 = Admin, 2 = Student)
const getUserRole = (user) => {
  if (!user) return null;
  return Number(user.roleId || user.RoleID || 2);
};

// Bảo vệ các trang chỉ dành cho Role cụ thể (VD: Admin RoleID = 1)
const ProtectedRoute = ({ user, allowedRoles, children }) => {
  if (!user) return <Navigate to="/login" replace />;
  const roleId = getUserRole(user);
  if (!allowedRoles.includes(roleId)) {
    return roleId === 1 ? (
      <Navigate to="/admin" replace />
    ) : (
      <Navigate to="/" replace />
    );
  }
  return children;
};

// Bảo vệ các trang Student: Nếu Admin (RoleID = 1) đang đăng nhập thì tự chuyển sang trang /admin
const StudentAreaRoute = ({ user, children }) => {
  const roleId = getUserRole(user);
  if (user && roleId === 1) {
    return <Navigate to="/admin" replace />;
  }
  return children;
};

// Trang Admin tạm thời (sẽ thiết kế chi tiết sau)
const AdminPlaceholder = ({ user, setUser }) => {
  const navigate = useNavigate();
  const handleLogout = () => {
    sessionStorage.removeItem("user");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  return (
    <Container fluid className="py-5 px-4">
      <Card className="border-0 shadow-sm rounded-4 p-5 text-center bg-white">
        <div className="mb-3">
          <Badge bg="success" className="px-3 py-2 rounded-pill">
            RoleID: 1 (Admin)
          </Badge>
        </div>
        <h2 className="fw-bold mb-2" style={{ color: "#10393B" }}>
          Bảng điều khiển Quản trị viên (Admin)
        </h2>
        <p className="text-secondary mb-4">
          Xin chào <strong>{user?.fullName}</strong> ({user?.email}). Giao diện
          quản trị dành cho Admin sẽ được thiết kế tại đây.
        </p>
        <div>
          <Button variant="danger" className="px-4" onClick={handleLogout}>
            <i className="bi bi-box-arrow-right me-2"></i> Đăng xuất
          </Button>
        </div>
      </Card>
    </Container>
  );
};

// Khung Layout chính có Header và Footer bọc lấy nội dung (Outlet)
const MainLayout = ({ user, setUser }) => {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Header user={user} setUser={setUser} />
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
      <Route element={<MainLayout user={user} setUser={setUser} />}>
        {/* Auth Routes */}
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route
          path="/forgot-password"
          element={<div>Trang quên mật khẩu</div>}
        />
        <Route path="/register" element={<Register />} />
        <Route path="/create-profile" element={<CreateProfile />} />

        {/* ===== KHU VỰC DÀNH CHO STUDENT (RoleID = 2) ===== */}
        <Route
          path="/"
          element={
            <StudentAreaRoute user={user}>
              <Home user={user} />
            </StudentAreaRoute>
          }
        />
        <Route
          path="/lost-found"
          element={
            <StudentAreaRoute user={user}>
              <LostFoundPage user={user} />
            </StudentAreaRoute>
          }
        />
        <Route
          path="/found-items"
          element={
            <StudentAreaRoute user={user}>
              <FoundItemsPage user={user} />
            </StudentAreaRoute>
          }
        />
        <Route
          path="/forum"
          element={
            <StudentAreaRoute user={user}>
              <ForumPage user={user} />
            </StudentAreaRoute>
          }
        />
        <Route
          path="/review"
          element={
            <StudentAreaRoute user={user}>
              <ReviewPage user={user} />
            </StudentAreaRoute>
          }
        />
        <Route
          path="/overview"
          element={
            <StudentAreaRoute user={user}>
              <OverviewPage />
            </StudentAreaRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <StudentAreaRoute user={user}>
              <ProfilePage user={user} />
            </StudentAreaRoute>
          }
        />
        <Route
          path="/change-password"
          element={
            <ProtectedRoute user={user} allowedRoles={[2]}>
              <ChangePasswordPage user={user} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/edit-profile"
          element={
            <ProtectedRoute user={user} allowedRoles={[2]}>
              <EditProfilePage user={user} setUser={setUser} />
            </ProtectedRoute>
          }
        />

        {/* ===== KHU VỰC DÀNH CHO ADMIN (RoleID = 1) ===== */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute user={user} allowedRoles={[1]}>
              <AdminPlaceholder user={user} setUser={setUser} />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
}