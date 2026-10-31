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
    {
      key: "pending",
      label: "Bài đăng chờ duyệt",
      icon: "bi-hourglass-split",
    },  
    {
      key: "lost",
      label: "Quản lý bài đăng Lost",
      icon: "bi-search",
    },
    {
      key: "found",
      label: "Quản lý bài đăng Found",
      icon: "bi-bag-check-fill",
    },
    {
      key: "forum",
      label: "Quản lý bài đăng Forum",
      icon: "bi-chat-square-quote-fill",
    },
    {
      key: "reviews",
      label: "Quản lý bài đăng Review",
      icon: "bi-star-fill",
    },
    {
      key: "users",
      label: "Quản lý Account Student",
      icon: "bi-people-fill",
    },
  ];

  return (
    <aside
      className="bg-white border-end shadow-sm flex-shrink-0 text-start d-none d-lg-block"
      style={{ width: "270px", minHeight: "calc(100vh - 70px)" }}
    >
      <div className="p-3 sticky-top" style={{ top: "80px", zIndex: 1000 }}>
        <div className="px-2 mb-2">
          <small
            className="fw-bold text-uppercase text-secondary"
            style={{ fontSize: "0.72rem", letterSpacing: "0.5px" }}
          >
            Trang Quản Lý (Full CRUD)
          </small>
        </div>

        <div className="d-flex flex-column gap-2">
          {adminMenus.map((item) => {
            const isAct = currentTab === item.key;
            return (
              <div
                key={item.key}
                onClick={() => navigate(`/admin?tab=${item.key}`)}
                className="d-flex align-items-center gap-3 px-3 py-2 rounded-3 fw-semibold"
                style={{
                  cursor: "pointer",
                  transition: "all 0.2s",
                  backgroundColor: isAct ? primaryColor : "transparent",
                  color: isAct ? "white" : "#334155",
                  fontSize: "0.9rem",
                }}
              >
                <i className={`bi ${item.icon} fs-5`}></i>
                <span>{item.label}</span>
              </div>
            );
          })}
        </div>

        <hr className="my-3 opacity-25" />

        <div
          className="p-3 rounded-3"
          style={{
            backgroundColor: "#f8fafc",
            border: "1px solid #e2e8f0",
            fontSize: "0.8rem",
          }}
        >
          <div className="fw-bold text-dark mb-1">
            <i
              className="bi bi-shield-check me-2"
              style={{ color: primaryColor }}
            ></i>
            Chế độ Quản trị viên
          </div>
          <p className="text-secondary mb-0">
            Bạn có thể xem mọi trang trên thanh menu như sinh viên, hoặc chọn
            các mục bên trên để thực hiện quyền CRUD tuyệt đối.
          </p>
        </div>
      </div>
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
        <Route
          path="/forgot-password"
          element={<div>Trang quên mật khẩu</div>}
        />
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
