import { Navbar, Nav, Container, Dropdown, Image } from "react-bootstrap";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const Header = ({ user, setUser }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Hàm xử lý Đăng xuất
  const handleLogout = async () => {
    try {
      // Gọi API xóa Session ở Backend (Nếu có)
      await axios.post("/api/logout");
    } catch (error) {
      console.log("Lỗi đăng xuất backend", error);
    } finally {
      // Xóa dữ liệu Frontend
      sessionStorage.removeItem("user");
      setUser(null);
      navigate("/login");
    }
  };

  // Hàm kiểm tra link đang active để hiện gạch dưới màu xanh
  const isActive = (path) => location.pathname === path;

  return (
    <Navbar bg="white" expand="lg" className="shadow-sm py-2" sticky="top">
      <Container>
        {/* LOGO BÊN TRÁI */}
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center fw-bold" style={{ color: '#10393B', fontSize: '1.25rem' }}>
          <div 
            className="d-flex align-items-center justify-content-center me-2 text-white rounded-3" 
            style={{ width: '40px', height: '40px', backgroundColor: '#0C8B72' }}
          >
            <i className="bi bi-box-seam fs-5"></i> {/* Icon thay thế cho hình hộp/scan */}
          </div>
          FPT CT Lost & Found
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          
          {/* MENU CHÍNH Ở GIỮA */}
          <Nav className="mx-auto" style={{ fontWeight: '500' }}>
            <Nav.Link 
              as={Link} to="/" 
              className={`px-3 ${isActive('/') ? 'active-link' : 'text-secondary'}`}
            >
              Trang chủ
            </Nav.Link>
            <Nav.Link 
              as={Link} to="/lost-found" 
              className={`px-3 ${isActive('/lost-found') ? 'active-link' : 'text-secondary'}`}
            >
              Trang đồ thất lạc
            </Nav.Link>
            <Nav.Link 
              as={Link} to="/forum" 
              className={`px-3 ${isActive('/forum') ? 'active-link' : 'text-secondary'}`}
            >
              Diễn đàn
            </Nav.Link>
            <Nav.Link 
              as={Link} to="/review" 
              className={`px-3 ${isActive('/review') ? 'active-link' : 'text-secondary'}`}
            >
              Đánh giá
            </Nav.Link>
            <Nav.Link 
              as={Link} to="/overview" 
              className={`px-3 ${isActive('/overview') ? 'active-link' : 'text-secondary'}`}
            >
              Tổng quan
            </Nav.Link>
          </Nav>

          {/* ICON THÔNG BÁO VÀ AVATAR USER BÊN PHẢI */}
          <Nav className="d-flex align-items-center gap-3">
            <Nav.Link href="#notifications" className="text-secondary position-relative">
              <i className="bi bi-bell fs-5"></i>
              <span className="position-absolute top-25 start-75 translate-middle p-1 bg-success border border-light rounded-circle">
                <span className="visually-hidden">New alerts</span>
              </span>
            </Nav.Link>

            {user && (
              <Dropdown align="end">
                <Dropdown.Toggle 
                  variant="link" 
                  id="dropdown-custom-components" 
                  className="d-flex align-items-center text-decoration-none text-dark p-0"
                >
                  <Image 
                    src={user.avatar || "https://ui-avatars.com/api/?name=" + user.fullName + "&background=random"} 
                    roundedCircle 
                    width="40" 
                    height="40" 
                    className="me-2 object-fit-cover border" 
                  />
                </Dropdown.Toggle>

                <Dropdown.Menu className="shadow border-0 mt-2" style={{ borderRadius: '10px' }}>
                  <Dropdown.ItemText className="fw-bold border-bottom pb-2 mb-2">
                    {user.fullName}
                    <div className="text-muted fw-normal" style={{ fontSize: '0.85rem' }}>
                      {user.email}
                    </div>
                  </Dropdown.ItemText>
                  <Dropdown.Item as={Link} to="/profile" className="py-2">
                    <i className="bi bi-person me-2"></i> Hồ sơ cá nhân
                  </Dropdown.Item>
                  <Dropdown.Item onClick={handleLogout} className="py-2 text-danger">
                    <i className="bi bi-box-arrow-right me-2"></i> Đăng xuất
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>

      {/* CSS Nhúng cho đường kẻ active dưới text */}
      <style>{`
        .active-link {
          color: #0C8B72 !important;
          border-bottom: 3px solid #0C8B72;
          font-weight: 600;
        }
      `}</style>
    </Navbar>
  );
};

export default Header;