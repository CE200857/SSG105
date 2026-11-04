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
import { useI18n } from "../i18n";
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
  { key: "account", labelKey: "settings.section.account", icon: "bi-person-circle" },
  { key: "appearance", labelKey: "settings.section.appearance", icon: "bi-palette" },
  { key: "notifications", labelKey: "settings.section.notifications", icon: "bi-bell" },
  { key: "security", labelKey: "settings.section.security", icon: "bi-shield-lock" },
];

const THEME_OPTIONS = [
  { key: "light", labelKey: "settings.theme.light", icon: "bi-sun-fill" },
  { key: "dark", labelKey: "settings.theme.dark", icon: "bi-moon-stars-fill" },
  { key: "system", labelKey: "settings.theme.system", icon: "bi-circle-half" },
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
  const { t } = useI18n();
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
      setDelError((res.data && res.data.message) || t("settings.delete.failed"));
    } catch (err) {
      setDelError(
        err?.response?.data?.message ||
          t("settings.delete.connectError"),
      );
    } finally {
      setDelBusy(false);
    }
  };

  const canDelete =
    delPassword.length > 0 &&
    delConfirm.trim().toUpperCase() === t("settings.delete.phrase").toUpperCase();

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
        {t("settings.title")}
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
                <span>{t(s.labelKey)}</span>
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
                <Row2 title={t("settings.account.fullName")}>{user.fullName || "—"}</Row2>
                <Row2 title={t("settings.account.email")}>{user.email || "—"}</Row2>
                {user.campus && <Row2 title={t("settings.account.campus")}>{user.campus}</Row2>}
                <div className="d-flex flex-wrap gap-2 mt-4">
                  <Button
                    style={{ backgroundColor: "#1f6dba", borderColor: "#1f6dba" }}
                    onClick={() => navigate("/edit-profile")}
                  >
                    <i className="bi bi-pencil-fill me-2"></i>
                    {t("settings.account.edit")}
                  </Button>
                  <Button
                    variant="outline-secondary"
                    onClick={() => navigate("/profile")}
                  >
                    <i className="bi bi-person me-2"></i>
                    {t("settings.account.viewProfile")}
                  </Button>
                </div>
              </>
            )}

            {section === "appearance" && (
              <>
                <h5 className="fw-bold mb-3">{t("settings.appearance.theme")}</h5>
                <div className="d-flex flex-wrap gap-3 mb-4">
                  {THEME_OPTIONS.map((o) => (
                    <button
                      key={o.key}
                      type="button"
                      className={`settings-option ${themeMode === o.key ? "active" : ""}`}
                      onClick={() => pickTheme(o.key)}
                    >
                      <i className={`bi ${o.icon} d-block fs-3 mb-1`}></i>
                      {t(o.labelKey)}
                    </button>
                  ))}
                </div>

                <h5 className="fw-bold mb-3">{t("settings.appearance.fontSize")}</h5>
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
                        style={{ fontSize: `${f.scale * 1.5}rem` }}
                      >
                        Aa
                      </span>
                      {t(f.labelKey)}
                    </button>
                  ))}
                </div>

                <h5 className="fw-bold mb-1">{t("settings.appearance.accessibility")}</h5>
                <Row2
                  title={t("settings.appearance.reduceMotion")}
                  desc={t("settings.appearance.reduceMotionDesc")}
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
                <h5 className="fw-bold mb-1">{t("settings.notif.title")}</h5>
                <p className="text-muted">
                  {t("settings.notif.desc")}
                </p>
                <Row2
                  title={t("settings.notif.likes")}
                  desc={t("settings.notif.likesDesc")}
                >
                  <Form.Check
                    type="switch"
                    id="sw-likes"
                    checked={notif.likes}
                    onChange={(e) => changeNotif({ likes: e.target.checked })}
                  />
                </Row2>
                <Row2
                  title={t("settings.notif.comments")}
                  desc={t("settings.notif.commentsDesc")}
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
                <Row2
                  title={t("settings.notif.shares")}
                  desc={t("settings.notif.sharesDesc")}
                >
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
                <h5 className="fw-bold mb-1">{t("settings.security.title")}</h5>
                <Row2
                  title={t("settings.security.changePassword")}
                  desc={t("settings.security.changePasswordDesc")}
                >
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => navigate("/change-password")}
                  >
                    {t("settings.security.changePassword")}
                  </Button>
                </Row2>
                <Row2
                  title={t("settings.security.logout")}
                  desc={t("settings.security.logoutDesc")}
                >
                  <Button variant="outline-danger" size="sm" onClick={handleLogout}>
                    <i className="bi bi-box-arrow-right me-1"></i>
                    {t("settings.security.logout")}
                  </Button>
                </Row2>
                <Row2
                  title={<span className="text-danger">
                      {t("settings.security.delete")}
                    </span>}
                  desc={
                    isAdmin
                      ? t("settings.security.deleteDescAdmin")
                      : t("settings.security.deleteDesc")
                  }
                >
                  <Button
                    variant="danger"
                    size="sm"
                    disabled={isAdmin}
                    onClick={openDelete}
                  >
                    <i className="bi bi-trash3-fill me-1"></i>
                    {t("settings.security.delete")}
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
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {t("settings.security.delete")}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-start">
          <Alert variant="danger" className="small">
            {t("settings.delete.warnPre")}
            <strong>{t("settings.delete.warnStrong")}</strong>
            {t("settings.delete.warnPost")}
          </Alert>
          <Form
            onSubmit={(e) => {
              e.preventDefault();
              if (canDelete && !delBusy) handleDeleteAccount();
            }}
          >
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">
                {t("settings.delete.passwordLabel")}
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
                {t("settings.delete.confirmPre")}
                <span className="text-danger">{t("settings.delete.phrase")}</span>
                {t("settings.delete.confirmPost")}
              </Form.Label>
              <Form.Control
                type="text"
                value={delConfirm}
                onChange={(e) => setDelConfirm(e.target.value)}
                disabled={delBusy}
                placeholder={t("settings.delete.phrase")}
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
            {t("settings.delete.cancel")}
          </Button>
          <Button
            variant="danger"
            onClick={handleDeleteAccount}
            disabled={!canDelete || delBusy}
          >
            {delBusy ? t("settings.delete.busy") : t("settings.delete.submit")}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default SettingsPage;
