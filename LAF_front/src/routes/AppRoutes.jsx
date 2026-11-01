import {
  Routes,
  Route,
  Navigate,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import Login from "../components/DatNT/Login";
import Register from "../components/DatNT/Register";
import CreateProfile from "../components/DatNT/CreateProfile";
import ForgotPassword from "../components/DatNT/ForgotPassword";

// Import Header & Footer
import Header from "../components/Header";
import Footer from "../components/Footer";

// Import các trang
import Home from "../pages/Home";
import OverviewPage from "../pages/OverviewPage";
import LostFoundPage from "../pages/LostFoundPage";
import ProfilePage from "../pages/ProfilePage";
import ChangePasswordPage from "../pages/ChangePasswordPage";
import EditProfilePage from "../pages/EditProfilePage";
import ReviewPage from "../pages/ReviewPage";
import ForumPage from "../pages/ForumPage";
import FoundItemsPage from "../pages/FoundItemsPage";
import AdminPage from "../pages/AdminPage";

// Helper lấy chuẩn RoleID (1 = Admin, 2 = Student)
const getUserRole = (user) => {
  if (!user) return null;
  return Number(user.roleId || user.RoleID || 2);
};

// Bảo vệ các trang yêu cầu đăng nhập theo Role
const ProtectedRoute = ({ user, allowedRoles, children }) => {
  if (!user) return <Navigate to="/login" replace />;
  const roleId = getUserRole(user);
  if (!allowedRoles.includes(roleId)) {
    return <Navigate to="/" replace />;
  }
  return children;
};

// Sidebar bên trái chỉ xuất hiện khi tài khoản đăng nhập là Admin (Role 1)
const AdminGlobalSidebar = () => {
  const primaryColor = "#1f6dba";
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const currentTab =
    location.pathname === "/admin" ? searchParams.get("tab") || "lost" : "";

  const adminMenus = [
    { key: "pending", label: "Chờ duyệt", full: "Bài đăng chờ duyệt", icon: "bi-clipboard-check", activeIcon: "bi-clipboard-check-fill" },
    { key: "statusReq", label: "Trạng thái", full: "Yêu cầu đổi trạng thái", icon: "bi-toggle-off", activeIcon: "bi-toggle-on" },
    { key: "lost", label: "Lost", full: "Quản lý bài đăng Lost", icon: "bi-search", activeIcon: "bi-search" },
    { key: "found", label: "Found", full: "Quản lý bài đăng Found", icon: "bi-bag-check", activeIcon: "bi-bag-check-fill" },
    { key: "forum", label: "Forum", full: "Quản lý bài đăng Forum", icon: "bi-chat-square-quote", activeIcon: "bi-chat-square-quote-fill" },
    { key: "reviews", label: "Review", full: "Quản lý bài đăng Review", icon: "bi-star", activeIcon: "bi-star-fill" },
    { key: "users", label: "Tài khoản", full: "Quản lý Account Student", icon: "bi-people", activeIcon: "bi-people-fill" },
  ];

  return (
    <aside
      className="bg-white border-end flex-shrink-0 d-none d-lg-block"
      style={{ width: "92px", minHeight: "calc(100vh - 70px)" }}
    >
      <div
        className="sticky-top d-flex flex-column align-items-center gap-1 py-3"
        style={{ top: "80px", zIndex: 1000 }}
      >
        {adminMenus.map((item) => {
          const isAct = currentTab === item.key;
          return (
            <button
              key={item.key}
              type="button"
              title={item.full}
              onClick={() => navigate(`/admin?tab=${item.key}`)}
              className={`admin-rail-item ${isAct ? "active" : ""}`}
            >
              <i className={`bi ${isAct ? item.activeIcon : item.icon}`}></i>
              <span>{item.label}</span>
            </button>
          );
        })}

        <hr className="w-50 my-2 opacity-25" />

        <div
          className="text-center"
          title="Chế độ Quản trị viên: bạn có thể xem mọi trang như sinh viên, hoặc dùng các mục bên trên để quản lý."
        >
          <i className="bi bi-shield-check fs-5" style={{ color: primaryColor }}></i>
          <div className="text-secondary" style={{ fontSize: "0.65rem" }}>
            Admin
          </div>
        </div>
      </div>

      <style>{`
        .admin-rail-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          width: 72px;
          padding: 10px 4px;
          border: 0;
          background: transparent;
          border-radius: 16px;
          color: #6b7280;
          font-size: 0.72rem;
          font-weight: 500;
          line-height: 1.2;
          cursor: pointer;
          transition: background-color 0.2s, color 0.2s;
        }
        .admin-rail-item .bi { font-size: 1.4rem; line-height: 1; }
        .admin-rail-item:hover { background: #eef5fc; color: ${primaryColor}; }
        .admin-rail-item.active {
          background: #e3eefa;
          color: ${primaryColor};
          font-weight: 600;
        }
        .admin-rail-item.active .bi-search { -webkit-text-stroke: 0.7px currentColor; }
        .admin-rail-item:focus-visible { outline: 2px solid ${primaryColor}; outline-offset: 2px; }
      `}</style>
    </aside>
  );
};

// Khung Layout chính: Nếu là Admin sẽ có thêm Sidebar bên trái
const MainLayout = ({ user, setUser }) => {
  const isAdmin = getUserRole(user) === 1;

  return (
    <div className="d-flex flex-column min-vh-100">
      <Header user={user} setUser={setUser} />
      <div
        className="d-flex flex-grow-1"
        style={{ backgroundColor: "#f8f9fa" }}
      >
        {isAdmin && <AdminGlobalSidebar user={user} />}
        <main className="flex-grow-1" style={{ minWidth: 0 }}>
          <Outlet />
        </main>
      </div>
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
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/register" element={<Register />} />
        <Route path="/create-profile" element={<CreateProfile />} />

        {/* Các trang chung: Cả Student và Admin đều xem được bình thường */}
        <Route path="/" element={<Home user={user} />} />
        <Route path="/lost-found" element={<LostFoundPage user={user} />} />
        <Route path="/found-items" element={<FoundItemsPage user={user} />} />
        <Route path="/forum" element={<ForumPage user={user} />} />
        <Route path="/review" element={<ReviewPage user={user} />} />
        <Route path="/overview" element={<OverviewPage />} />
        <Route path="/profile" element={<ProfilePage user={user} />} />

        {/* Đổi mật khẩu & Sửa hồ sơ cho phép cả Role 1 (Admin) và Role 2 (Student) */}
        <Route
          path="/change-password"
          element={
            <ProtectedRoute user={user} allowedRoles={[1, 2]}>
              <ChangePasswordPage user={user} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/edit-profile"
          element={
            <ProtectedRoute user={user} allowedRoles={[1, 2]}>
              <EditProfilePage user={user} setUser={setUser} />
            </ProtectedRoute>
          }
        />

        {/* Trang Quản lý CRUD dành riêng cho Admin (Role 1) */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute user={user} allowedRoles={[1]}>
              <AdminPage user={user} />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
}
