/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useLayoutEffect, useRef } from "react";
import {
  Navbar,
  Nav,
  Container,
  Dropdown,
  Image,
  Button,
  Badge,
} from "react-bootstrap";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const Header = ({ user, setUser }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const primaryColor = "#1f6dba";

  const [notifications, setNotifications] = useState([]);
  const isAdmin = user && Number(user.roleId || user.RoleID) === 1;

  const fetchNotifications = async () => {
    if (!user) return;
    let localNotifs =
      JSON.parse(localStorage.getItem("laf_notifications")) || [];
    const myLocalNotifs = localNotifs.filter(
      (n) =>
        (n.recipientEmail && n.recipientEmail === user.email) ||
        (n.recipientName && n.recipientName === user.fullName),
    );

    try {
      const res = await axios.get("/api/notifications", {
        params: { email: user.email },
        silent: true, // tự cập nhật nền: không hiện thanh tải
      });
      if (Array.isArray(res.data)) {
        setNotifications(res.data);
        return;
      }
    } catch {
      // Dùng localNotifs
    }
    setNotifications(myLocalNotifs);
  };

  useEffect(() => {
    fetchNotifications();
    const handleNewNotif = () => fetchNotifications();
    window.addEventListener("laf-notifications-updated", handleNewNotif);
    const timer = setInterval(fetchNotifications, 20000); // tự tải lại mỗi 20 giây
    return () => {
      window.removeEventListener("laf-notifications-updated", handleNewNotif);
      clearInterval(timer);
    };
  }, [user, location.pathname]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAllRead = async () => {
    if (!user) return;
    let localNotifs =
      JSON.parse(localStorage.getItem("laf_notifications")) || [];
    localNotifs = localNotifs.map((n) =>
      n.recipientEmail === user.email || n.recipientName === user.fullName
        ? { ...n, isRead: true }
        : n,
    );
    localStorage.setItem("laf_notifications", JSON.stringify(localNotifs));
    setNotifications(notifications.map((n) => ({ ...n, isRead: true })));

    try {
      const params = new URLSearchParams();
      params.append("action", "readAll");
      params.append("email", user.email);
      await axios.post("/api/notifications", params);
    } catch {
      // Bỏ qua
    }
  };

  const handleNotificationClick = async (notif) => {
    let localNotifs =
      JSON.parse(localStorage.getItem("laf_notifications")) || [];
    localNotifs = localNotifs.map((n) =>
      n.id === notif.id ? { ...n, isRead: true } : n,
    );
    localStorage.setItem("laf_notifications", JSON.stringify(localNotifs));
    setNotifications(
      notifications.map((n) =>
        n.id === notif.id ? { ...n, isRead: true } : n,
      ),
    );
    // Lưu trạng thái "đã đọc" lên máy chủ (id từ máy chủ luôn nhỏ, bỏ qua id local dạng Date.now())
    if (!notif.isRead && Number(notif.id) < 2147483647) {
      const params = new URLSearchParams();
      params.append("id", notif.id);
      params.append("email", user.email);
      axios
        .post("/api/notifications", params, { silent: true })
        .catch(() => {});
    }
    if (notif.type === "POST_DELETED") return;

    if (notif.postType === "lost") {
      navigate("/lost-found", { state: { openPostId: notif.postId } });
    } else if (notif.postType === "found") {
      navigate("/found-items", { state: { openPostId: notif.postId } });
    } else if (notif.postType === "forum") {
      navigate("/forum", { state: { openPostId: notif.postId } });
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post("/api/logout");
    } catch (error) {
      console.log("Lỗi đăng xuất backend", error);
    } finally {
      sessionStorage.removeItem("user");
      localStorage.removeItem("user");
      setUser(null);
      navigate("/login");
    }
  };

  const isActive = (path) => location.pathname === path;

  // ===== Đèn trượt theo mục đang chọn =====
  const navRef = useRef(null);
  const lampRef = useRef(null);

  // Trả về true nếu tìm thấy mục đang chọn
  const updateLamp = (animate) => {
    const nav = navRef.current;
    const lampEl = lampRef.current;
    if (!nav || !lampEl) return false;
    const el = nav.querySelector(".lf-tab.active");
    if (!el) {
      lampEl.style.opacity = "0"; // trang không thuộc menu: tắt đèn
      return false;
    }
    if (!animate) lampEl.style.transition = "none";
    lampEl.style.transform = `translateX(${el.offsetLeft + el.offsetWidth / 2 - 20}px)`;
    lampEl.style.opacity = "1";
    if (!animate) {
      void lampEl.offsetWidth; // đặt vị trí ngay, không trượt từ mép trái
      lampEl.style.transition = "";
    }
    return true;
  };

  useLayoutEffect(() => {
    const lampEl = lampRef.current;
    if (!lampEl) return;
    if (updateLamp(lampEl.dataset.ready === "1")) lampEl.dataset.ready = "1";
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  useEffect(() => {
    const relayout = () => updateLamp(false);
    window.addEventListener("resize", relayout);
    if (document.fonts && document.fonts.ready)
      document.fonts.ready.then(relayout);
    return () => window.removeEventListener("resize", relayout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getNotifIcon = (type) => {
    switch (type) {
      case "LIKE_POST":
      case "LIKE_COMMENT":
        return "bi-hand-thumbs-up-fill text-primary";
      case "COMMENT":
      case "REPLY_COMMENT":
        return "bi-chat-dots-fill text-success";
      case "SHARE":
        return "bi-share-fill text-info";
      case "POST_APPROVED":
        return "bi-check-circle-fill text-success";
      case "POST_DELETED":
        return "bi-trash3-fill text-danger";
      case "STATUS_APPROVED":
        return "bi-check-circle-fill text-success";
      case "STATUS_REJECTED":
        return "bi-x-circle-fill text-danger";
      default:
        return "bi-bell-fill text-warning";
    }
  };

  return (
    <Navbar
      bg="white"
      expand="lg"
      className="shadow-sm py-2"
      sticky="top"
      style={{ zIndex: 1040 }}
    >
      <Container fluid className="px-4">
        <Navbar.Brand
          as={Link}
          to="/"
          className="d-flex align-items-center fw-bold"
          style={{ color: "#12345a", fontSize: "1.25rem" }}
        >
          <img
            src="/logo.png"
            alt="Lost&Found"
            className="me-2"
            style={{ width: "44px", height: "44px", objectFit: "contain" }}
          />
          <span className="lf-brand-text">
            <span className="lf-brand-light">Lost</span>
            <span className="lf-brand-amp">&amp;</span>
            <span className="lf-brand-bold">Found</span>
            <small className="lf-brand-tag">FPT CT</small>
          </span>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav
            ref={navRef}
            className="mx-auto align-items-center position-relative"
          >
            <span ref={lampRef} className="lf-lamp" aria-hidden="true"></span>
            {[
              {
                to: "/",
                label: "Trang chủ",
                icon: "bi-house-door",
                activeIcon: "bi-house-door-fill",
              },
              {
                to: "/lost-found",
                label: "Tìm đồ",
                icon: "bi-search",
                activeIcon: "bi-search",
              },
              {
                to: "/found-items",
                label: "Tìm chủ",
                icon: "bi-bag-check",
                activeIcon: "bi-bag-check-fill",
              },
              {
                to: "/forum",
                label: "Diễn đàn",
                icon: "bi-chat-square-text",
                activeIcon: "bi-chat-square-text-fill",
              },
              {
                to: "/review",
                label: "Đánh giá",
                icon: "bi-star",
                activeIcon: "bi-star-fill",
              },
              {
                to: "/overview",
                label: "Tổng quan",
                icon: "bi-bar-chart",
                activeIcon: "bi-bar-chart-fill",
              },
            ].map((item) => {
              const active = isActive(item.to);
              return (
                <Nav.Link
                  key={item.to}
                  as={Link}
                  to={item.to}
                  className={`lf-tab ${active ? "active" : ""}`}
                >
                  <i
                    className={`bi ${active ? item.activeIcon : item.icon}`}
                  ></i>
                  <span>{item.label}</span>
                </Nav.Link>
              );
            })}
          </Nav>

          <Nav className="d-flex align-items-center gap-3">
            {user ? (
              <>
                <Dropdown align="end">
                  <Dropdown.Toggle
                    variant="link"
                    id="dropdown-notifications"
                    className="text-secondary position-relative p-1 text-decoration-none border-0 shadow-none"
                  >
                    <i className="bi bi-bell fs-5 text-dark"></i>
                    {unreadCount > 0 && (
                      <Badge
                        bg="danger"
                        pill
                        className="position-absolute top-0 start-100 translate-middle"
                        style={{ fontSize: "0.65rem" }}
                      >
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </Badge>
                    )}
                  </Dropdown.Toggle>

                  <Dropdown.Menu
                    className="shadow border-0 mt-2 p-0"
                    style={{
                      width: "350px",
                      maxHeight: "420px",
                      overflowY: "auto",
                      borderRadius: "14px",
                    }}
                  >
                    <div className="d-flex justify-content-between align-items-center px-3 py-3 border-bottom bg-light">
                      <h6 className="fw-bold mb-0" style={{ color: "#12345a" }}>
                        Thông báo
                      </h6>
                      {unreadCount > 0 && (
                        <Button
                          variant="link"
                          size="sm"
                          className="p-0 text-decoration-none fw-semibold"
                          style={{ color: primaryColor, fontSize: "0.8rem" }}
                          onClick={handleMarkAllRead}
                        >
                          Đánh dấu đã đọc
                        </Button>
                      )}
                    </div>

                    {notifications.length === 0 ? (
                      <div className="text-center py-4 text-muted">
                        <i className="bi bi-bell-slash fs-2 d-block mb-2 opacity-50"></i>
                        <span style={{ fontSize: "0.9rem" }}>
                          Chưa có thông báo nào.
                        </span>
                      </div>
                    ) : (
                      notifications.map((notif, idx) => (
                        <Dropdown.Item
                          key={notif.id || idx}
                          onClick={() => handleNotificationClick(notif)}
                          className="px-3 py-3 border-bottom text-wrap"
                          style={{
                            backgroundColor: notif.isRead ? "white" : "#eaf3fc",
                            transition: "0.2s",
                          }}
                        >
                          <div className="d-flex align-items-start gap-3">
                            <div
                              className="rounded-circle bg-white shadow-sm d-flex align-items-center justify-content-center flex-shrink-0 mt-1"
                              style={{ width: "36px", height: "36px" }}
                            >
                              <i
                                className={`bi ${getNotifIcon(notif.type)} fs-6`}
                              ></i>
                            </div>
                            <div className="flex-grow-1">
                              <div
                                className="text-dark"
                                style={{
                                  fontSize: "0.85rem",
                                  lineHeight: "1.4",
                                }}
                              >
                                <span className="fw-bold">
                                  {notif.senderName}
                                </span>{" "}
                                {notif.message}
                              </div>
                              <small
                                className="text-muted"
                                style={{ fontSize: "0.75rem" }}
                              >
                                {notif.time || "Vừa xong"}
                              </small>
                            </div>
                          </div>
                        </Dropdown.Item>
                      ))
                    )}
                  </Dropdown.Menu>
                </Dropdown>

                <Dropdown align="end">
                  <Dropdown.Toggle
                    variant="link"
                    id="dropdown-custom-components"
                    className="d-flex align-items-center text-decoration-none text-dark p-0"
                  >
                    <Image
                      src={
                        user.avatar ||
                        "https://ui-avatars.com/api/?name=" +
                          encodeURIComponent(user.fullName) +
                          "&background=0C8B72&color=fff"
                      }
                      roundedCircle
                      width="40"
                      height="40"
                      className="me-2 object-fit-cover border"
                    />
                  </Dropdown.Toggle>

                  <Dropdown.Menu
                    className="shadow border-0 mt-2"
                    style={{ borderRadius: "10px" }}
                  >
                    <Dropdown.ItemText className="fw-bold border-bottom pb-2 mb-2">
                      {user.fullName}
                      <div
                        className="text-muted fw-normal"
                        style={{ fontSize: "0.85rem" }}
                      >
                        {user.email}
                      </div>
                    </Dropdown.ItemText>
                    <Dropdown.Item as={Link} to="/profile" className="py-2">
                      <i className="bi bi-person me-2"></i> Trang cá nhân
                    </Dropdown.Item>
                    <Dropdown.Item
                      onClick={handleLogout}
                      className="py-2 text-danger"
                    >
                      <i className="bi bi-box-arrow-right me-2"></i> Đăng xuất
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </>
            ) : (
              <div className="d-flex gap-3">
                <Button
                  as={Link}
                  to="/login"
                  className="btn-solid-custom shadow-sm"
                  style={{ borderRadius: "10px", padding: "8px 24px" }}
                >
                  Đăng nhập
                </Button>
                <Button
                  as={Link}
                  to="/register"
                  className="btn-outline-custom shadow-sm"
                  style={{ borderRadius: "10px", padding: "8px 24px" }}
                >
                  Đăng ký
                </Button>
              </div>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>

      <style>{`
        .active-link {
          color: ${primaryColor} !important;
          border-bottom: 3px solid ${primaryColor};
          font-weight: 600;
        }
        .dropdown-toggle::after {
          display: none !important;
        }
        .btn-solid-custom {
          background-color: ${primaryColor} !important;
          color: white !important;
          border: 2px solid ${primaryColor} !important;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.2s ease-in-out;
        }
        .btn-solid-custom:hover {
          background-color: #1858a0 !important;
          border-color: #1858a0 !important;
          color: white !important;
        }
        .btn-outline-custom {
          background-color: white !important;
          color: ${primaryColor} !important;
          border: 2px solid ${primaryColor} !important;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.2s ease-in-out;
        }
        .btn-outline-custom:hover {
          background-color: ${primaryColor} !important;
          color: white !important;
        }
        .navbar .nav-link.lf-tab {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
          padding: 8px 20px;
          margin: 0 10px;
          border-radius: 14px;
          color: #6b7280 !important;
          font-size: 0.78rem;
          font-weight: 500;
          line-height: 1.2;
        }
        .navbar .nav-link.lf-tab .bi {
          font-size: 1.35rem;
          line-height: 1;
          transition: transform 0.2s ease;
        }
        .navbar .nav-link.lf-tab:hover {
          background: #eef5fc;
          color: ${primaryColor} !important;
        }
        .navbar .nav-link.lf-tab:hover .bi {
          transform: translateY(-1px);
        }
        .navbar .nav-link.lf-tab.active {
          background: transparent;
          color: ${primaryColor} !important;
          font-weight: 600;
        }
        .navbar .nav-link.lf-tab.active .bi-search {
          -webkit-text-stroke: 0.7px currentColor;
        }
        @media (max-width: 1199.98px) {
          .navbar .nav-link.lf-tab {
            padding: 6px 12px;
            margin: 0 4px;
          }
        }
        @media (max-width: 991.98px) {
          .navbar .nav-link.lf-tab {
            flex-direction: row;
            gap: 12px;
            margin: 0;
            font-size: 0.95rem;
            padding: 10px 14px;
          }
        }
                  .lf-lamp {
          position: absolute;
          top: 0;
          left: 0;
          width: 40px;
          height: 4px;
          border-radius: 0 0 6px 6px;
          background: ${primaryColor};
          box-shadow: 0 3px 14px 3px rgba(31, 109, 186, 0.55);
          opacity: 0;
          pointer-events: none;
          transition: transform 0.45s cubic-bezier(0.34, 1.45, 0.5, 1),
            opacity 0.25s ease;
        }
        .lf-lamp::after {
          content: "";
          position: absolute;
          top: 4px;
          left: 50%;
          width: 76px;
          height: 52px;
          transform: translateX(-50%);
          background: radial-gradient(
            ellipse at 50% 0%,
            rgba(31, 109, 186, 0.26) 0%,
            rgba(31, 109, 186, 0) 72%
          );
        }
        .navbar .nav-link.lf-tab.active .bi {
          filter: drop-shadow(0 0 6px rgba(31, 109, 186, 0.5));
        }
        @media (max-width: 991.98px) {
          .lf-lamp { display: none; }
        }
        @media (prefers-reduced-motion: reduce) {
          .lf-lamp { transition: none; }
        }
      `}</style>
    </Navbar>
  );
};

export default Header;
