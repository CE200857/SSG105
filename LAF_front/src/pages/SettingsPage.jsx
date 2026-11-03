import { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Image,
  Modal,
  Alert,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getAvatarSrc } from "../utils/avatar";
import { clearAuthStorage } from "../utils/session";
import {
  FONT_SIZES,
  THEME_EVENT,
  getDisplaySettings,
  getNotifPrefs,
  getThemeMode,
  saveDisplaySettings,
  saveNotifPrefs,
  setThemeMode,
} from "../utils/settings";

const SECTIONS = [
  { key: "account", label: "Tài khoản", icon: "bi-person-circle" },
  { key: "appearance", label: "Giao diện & trợ năng", icon: "bi-palette" },
  { key: "notifications", label: "Thông báo", icon: "bi-bell" },
  { key: "security", label: "Bảo mật & đăng nhập", icon: "bi-shield-lock" },
];

const THEME_OPTIONS = [
  { key: "light", label: "Sáng", icon: "bi-sun-fill" },
  { key: "dark", label: "Tối", icon: "bi-moon-stars-fill" },
  { key: "system", label: "Theo thiết bị", icon: "bi-circle-half" },
];

const Row2 = ({ title, desc, children }) => (
  <div className="settings-row">
    <div className="me-3">
      <div className="fw-semibold">{title}</div>
      {desc && (
        <div className="text-muted" style={{ fontSize: "0.85rem" }}>
          {desc}
        </div>
      )}
    </div>
    <div className="flex-shrink-0">{children}</div>
  </div>
);

const SettingsPage = ({ user, setUser }) => {
  const navigate = useNavigate();
  const [section, setSection] = useState("account");
  const [themeMode, setMode] = useState(getThemeMode());
  const [display, setDisplay] = useState(getDisplaySettings());
  const [notif, setNotif] = useState(() => getNotifPrefs(user?.email));
  const [showDelete, setShowDelete] = useState(false);
  const [delPassword, setDelPassword] = useState("");
  const [delConfirm, setDelConfirm] = useState("");
  const [delError, setDelError] = useState("");
  const [delBusy, setDelBusy] = useState(false);

  useEffect(() => {
    if (!user || !user.email) navigate("/login");
  }, [user, navigate]);

  // Đồng bộ khi nút mặt trăng/mặt trời trên Header đổi giao diện
  useEffect(() => {
    const sync = () => setMode(getThemeMode());
    window.addEventListener(THEME_EVENT, sync);
    return () => window.removeEventListener(THEME_EVENT, sync);
  }, []);

  if (!user) return null;

  const pickTheme = (mode) => {
    setThemeMode(mode);
    setMode(mode);
  };
  const changeDisplay = (patch) => setDisplay(saveDisplaySettings(patch));
  const changeNotif = (patch) => setNotif(saveNotifPrefs(user.email, patch));

  const isAdmin = Number(user.roleId || user.RoleID) === 1;

  const openDelete = () => {
    setDelPassword("");
    setDelConfirm("");
    setDelError("");
    setShowDelete(true);
  };

  const handleDeleteAccount = async () => {
    setDelBusy(true);
    setDelError("");
    try {
      const params = new URLSearchParams();
      params.append("password", delPassword);
      const res = await axios.post("/api/delete-account", params);
      if (res.data && res.data.success) {
        clearAuthStorage();
        setShowDelete(false);
        setUser(null);
        navigate("/login");
        return;
      }
      setDelError((res.data && res.data.message) || "Không thể xóa tài khoản.");
    } catch (err) {
      setDelError(
        err?.response?.data?.message ||
          "Không thể kết nối máy chủ, vui lòng thử lại.",
      );
    } finally {
      setDelBusy(false);
    }
  };

  const canDelete =
    delPassword.length > 0 &&
    delConfirm.trim().toUpperCase() === "XÓA TÀI KHOẢN";

  const handleLogout = async () => {
    try {
      await axios.post("/api/logout");
    } catch (error) {
      console.log("Lỗi đăng xuất backend", error);
    } finally {
      clearAuthStorage();
      setUser(null);
      navigate("/login");
    }
  };

  return (
    <Container className="py-4 settings-page text-start" style={{ maxWidth: "1100px" }}>
      <h3 className="fw-bold mb-4">
        <i className="bi bi-gear-fill me-2" style={{ color: "#1f6dba" }}></i>
        Cài đặt
      </h3>

      <Row className="g-4">
        <Col md={4} lg={3}>
          <Card className="border-0 shadow-sm rounded-4 p-2">
            {SECTIONS.map((s) => (
              <button
                key={s.key}
                type="button"
                className={`settings-menu-item ${section === s.key ? "active" : ""}`}
                onClick={() => setSection(s.key)}
              >
                <i className={`bi ${s.icon}`}></i>
                <span>{s.label}</span>
              </button>
            ))}
          </Card>
        </Col>

        <Col md={8} lg={9}>
          <Card className="border-0 shadow-sm rounded-4 p-4">
            {section === "account" && (
              <>
                <div className="d-flex align-items-center gap-3 mb-3">
                  <Image
                    src={getAvatarSrc(user.avatar, user.fullName, 120)}
                    roundedCircle
                    width="72"
                    height="72"
                    className="object-fit-cover border"
                  />
                  <div>
                    <h5 className="fw-bold mb-0">{user.fullName}</h5>
                    <div className="text-muted">{user.email}</div>
                  </div>
                </div>
                <Row2 title="Họ và tên">{user.fullName || "—"}</Row2>
                <Row2 title="Email">{user.email || "—"}</Row2>
                {user.username && (
                  <Row2 title="Tên người dùng">@{user.username}</Row2>
                )}
                {user.campus && <Row2 title="Cơ sở">{user.campus}</Row2>}
                <div className="d-flex flex-wrap gap-2 mt-4">
                  <Button
                    style={{ backgroundColor: "#1f6dba", borderColor: "#1f6dba" }}
                    onClick={() => navigate("/edit-profile")}
                  >
                    <i className="bi bi-pencil-fill me-2"></i>Chỉnh sửa thông tin
                  </Button>
                  <Button
                    variant="outline-secondary"
                    onClick={() => navigate("/profile")}
                  >
                    <i className="bi bi-person me-2"></i>Xem trang cá nhân
                  </Button>
                </div>
              </>
            )}

            {section === "appearance" && (
              <>
                <h5 className="fw-bold mb-3">Giao diện</h5>
                <div className="d-flex flex-wrap gap-3 mb-4">
                  {THEME_OPTIONS.map((o) => (
                    <button
                      key={o.key}
                      type="button"
                      className={`settings-option ${themeMode === o.key ? "active" : ""}`}
                      onClick={() => pickTheme(o.key)}
                    >
                      <i className={`bi ${o.icon} d-block fs-3 mb-1`}></i>
                      {o.label}
                    </button>
                  ))}
                </div>

                <h5 className="fw-bold mb-3">Cỡ chữ</h5>
                <div className="d-flex flex-wrap gap-3 mb-4">
                  {Object.entries(FONT_SIZES).map(([key, f]) => (
                    <button
                      key={key}
                      type="button"
                      className={`settings-option ${display.fontSize === key ? "active" : ""}`}
                      onClick={() => changeDisplay({ fontSize: key })}
                    >
                      <span
                        className="d-block fw-bold mb-1"
                        style={{ fontSize: `${f.px / 16 * 1.5}rem` }}
                      >
                        Aa
                      </span>
                      {f.label}
                    </button>
                  ))}
                </div>

                <h5 className="fw-bold mb-1">Trợ năng</h5>
                <Row2
                  title="Giảm hiệu ứng chuyển động"
                  desc="Tắt các hiệu ứng mờ dần, trượt và hoạt ảnh trên trang."
                >
                  <Form.Check
                    type="switch"
                    id="sw-motion"
                    checked={display.reduceMotion}
                    onChange={(e) =>
                      changeDisplay({ reduceMotion: e.target.checked })
                    }
                  />
                </Row2>
              </>
            )}

            {section === "notifications" && (
              <>
                <h5 className="fw-bold mb-1">Thông báo</h5>
                <p className="text-muted">
                  Chọn loại thông báo hiện trên chuông. Thông báo của hệ thống
                  (duyệt bài, xóa bài, đổi trạng thái) luôn được hiển thị.
                </p>
                <Row2
                  title="Lượt thích"
                  desc="Khi ai đó thích bài viết hoặc bình luận của bạn."
                >
                  <Form.Check
                    type="switch"
                    id="sw-likes"
                    checked={notif.likes}
                    onChange={(e) => changeNotif({ likes: e.target.checked })}
                  />
                </Row2>
                <Row2
                  title="Bình luận & phản hồi"
                  desc="Khi ai đó bình luận hoặc trả lời bình luận của bạn."
                >
                  <Form.Check
                    type="switch"
                    id="sw-comments"
                    checked={notif.comments}
                    onChange={(e) =>
                      changeNotif({ comments: e.target.checked })
                    }
                  />
                </Row2>
                <Row2 title="Chia sẻ" desc="Khi ai đó chia sẻ bài viết của bạn.">
                  <Form.Check
                    type="switch"
                    id="sw-shares"
                    checked={notif.shares}
                    onChange={(e) => changeNotif({ shares: e.target.checked })}
                  />
                </Row2>
              </>
            )}

            {section === "security" && (
              <>
                <h5 className="fw-bold mb-1">Bảo mật & đăng nhập</h5>
                <Row2
                  title="Đổi mật khẩu"
                  desc="Nên dùng mật khẩu mạnh và không trùng với tài khoản khác."
                >
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => navigate("/change-password")}
                  >
                    Đổi mật khẩu
                  </Button>
                </Row2>
                <Row2
                  title="Đăng xuất"
                  desc="Thoát khỏi tài khoản trên thiết bị này."
                >
                  <Button variant="outline-danger" size="sm" onClick={handleLogout}>
                    <i className="bi bi-box-arrow-right me-1"></i>Đăng xuất
                  </Button>
                </Row2>
                <Row2
                  title={<span className="text-danger">Xóa tài khoản</span>}
                  desc={
                    isAdmin
                      ? "Tài khoản Quản trị viên không thể tự xóa."
                      : "Xóa vĩnh viễn tài khoản cùng toàn bộ bài viết, bình luận và dữ liệu liên quan."
                  }
                >
                  <Button
                    variant="danger"
                    size="sm"
                    disabled={isAdmin}
                    onClick={openDelete}
                  >
                    <i className="bi bi-trash3-fill me-1"></i>Xóa tài khoản
                  </Button>
                </Row2>
              </>
            )}
          </Card>
        </Col>
      </Row>

      <Modal
        show={showDelete}
        onHide={() => !delBusy && setShowDelete(false)}
        centered
      >
        <Modal.Header closeButton={!delBusy}>
          <Modal.Title className="fs-5 text-danger fw-bold">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>Xóa tài khoản
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-start">
          <Alert variant="danger" className="small">
            Hành động này <strong>không thể hoàn tác</strong>. Toàn bộ bài đăng,
            bình luận, lượt thích, đánh giá, bài chia sẻ và thông báo của bạn sẽ
            bị xóa vĩnh viễn.
          </Alert>
          <Form
            onSubmit={(e) => {
              e.preventDefault();
              if (canDelete && !delBusy) handleDeleteAccount();
            }}
          >
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">
                Nhập mật khẩu hiện tại
              </Form.Label>
              <Form.Control
                type="password"
                autoComplete="current-password"
                value={delPassword}
                onChange={(e) => setDelPassword(e.target.value)}
                disabled={delBusy}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label className="fw-semibold">
                Gõ <span className="text-danger">XÓA TÀI KHOẢN</span> để xác nhận
              </Form.Label>
              <Form.Control
                type="text"
                value={delConfirm}
                onChange={(e) => setDelConfirm(e.target.value)}
                disabled={delBusy}
                placeholder="XÓA TÀI KHOẢN"
              />
            </Form.Group>
            {delError && (
              <div className="text-danger small mt-2">{delError}</div>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="light"
            onClick={() => setShowDelete(false)}
            disabled={delBusy}
          >
            Hủy
          </Button>
          <Button
            variant="danger"
            onClick={handleDeleteAccount}
            disabled={!canDelete || delBusy}
          >
            {delBusy ? "Đang xóa..." : "Xóa vĩnh viễn"}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default SettingsPage;
