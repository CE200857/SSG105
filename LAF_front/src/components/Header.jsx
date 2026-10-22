/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
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
  const primaryColor = "#0C8B72";

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
      });
      if (Array.isArray(res.data)) {
        const merged = [...res.data, ...myLocalNotifs];
        setNotifications(merged);
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
    return () =>
      window.removeEventListener("laf-notifications-updated", handleNewNotif);
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
          style={{ color: "#10393B", fontSize: "1.25rem" }}
        >
          <div
            className="d-flex align-items-center justify-content-center me-2 text-white rounded-3"
            style={{
              width: "40px",
              height: "40px",
              backgroundColor: primaryColor,
            }}
          >
            <i className="bi bi-box-seam fs-5"></i>
          </div>
          FPT CT Lost & Found
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mx-auto" style={{ fontWeight: "500" }}>
            <Nav.Link
              as={Link}
              to="/"
              className={`px-3 ${
                isActive("/") ? "active-link" : "text-secondary"
              }`}
            >
              Trang chủ
            </Nav.Link>
            <Nav.Link
              as={Link}
              to="/lost-found"
              className={`px-3 ${
                isActive("/lost-found") ? "active-link" : "text-secondary"
              }`}
            >
              Đồ mất (Tìm đồ)
            </Nav.Link>
            <Nav.Link
              as={Link}
              to="/found-items"
              className={`px-3 ${
                isActive("/found-items") ? "active-link" : "text-secondary"
              }`}
            >
              Đồ nhặt (Tìm chủ)
            </Nav.Link>
            <Nav.Link
              as={Link}
              to="/forum"
              className={`px-3 ${
                isActive("/forum") ? "active-link" : "text-secondary"
              }`}
            >
              Diễn đàn
            </Nav.Link>
            <Nav.Link
              as={Link}
              to="/review"
              className={`px-3 ${
                isActive("/review") ? "active-link" : "text-secondary"
              }`}
            >
              Đánh giá
            </Nav.Link>
            <Nav.Link
              as={Link}
              to="/overview"
              className={`px-3 ${
                isActive("/overview") ? "active-link" : "text-secondary"
              }`}
            >
              Tổng quan
            </Nav.Link>
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
                      <h6 className="fw-bold mb-0" style={{ color: "#10393B" }}>
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
                            backgroundColor: notif.isRead ? "white" : "#EAF5F3",
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
                    {isAdmin && (
                      <Dropdown.Item
                        as={Link}
                        to="/admin?tab=lost"
                        className="py-2 fw-semibold text-success"
                      >
                        <i className="bi bi-speedometer2 me-2"></i> Quản trị hệ
                        thống
                      </Dropdown.Item>
                    )}
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
          background-color: #0a735e !important;
          border-color: #0a735e !important;
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
      `}</style>
    </Navbar>
  );
};

export default Header;
