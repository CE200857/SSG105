import { Container, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useI18n } from "../i18n";

// Chỉ liệt kê những trang thật sự có trong AppRoutes
const EXPLORE_LINKS = [
  { to: "/", labelKey: "nav.home", icon: "bi-house-door" },
  { to: "/lost-found", labelKey: "footer.link.lost", icon: "bi-search" },
  { to: "/found-items", labelKey: "footer.link.found", icon: "bi-bag-check" },
  { to: "/forum", labelKey: "nav.forum", icon: "bi-chat-square-text" },
  { to: "/review", labelKey: "nav.review", icon: "bi-star" },
  { to: "/overview", labelKey: "nav.overview", icon: "bi-bar-chart" },
];

const MEMBER_LINKS = [
  { to: "/profile", labelKey: "header.profile", icon: "bi-person" },
  { to: "/edit-profile", labelKey: "footer.link.editProfile", icon: "bi-pencil-square" },
  { to: "/change-password", labelKey: "footer.link.changePassword", icon: "bi-shield-lock" },
];

const GUEST_LINKS = [
  { to: "/login", labelKey: "header.login", icon: "bi-box-arrow-in-right" },
  { to: "/register", labelKey: "footer.link.register", icon: "bi-person-plus" },
  { to: "/forgot-password", labelKey: "footer.link.forgot", icon: "bi-key" },
];

const SAFETY_TIPS = ["footer.tip1", "footer.tip2", "footer.tip3"];

// Thông tin liên hệ quản trị viên
const ADMIN_PHONE = "0328223449";
const ADMIN_EMAIL = "datntce200858@gmail.com";

const FooterLinks = ({ title, links, t }) => (
  <>
    <h6 className="fw-bold mb-3 text-white">{title}</h6>
    <ul
      className="list-unstyled d-flex flex-column gap-2 mb-0"
      style={{ fontSize: "0.9rem" }}
    >
      {links.map((item) => (
        <li key={item.to}>
          <Link
            to={item.to}
            className="text-decoration-none lf-footer-link d-inline-flex align-items-center gap-2"
          >
            <i className={`bi ${item.icon}`}></i>
            {t(item.labelKey)}
          </Link>
        </li>
      ))}
    </ul>
  </>
);

const Footer = ({ user }) => {
  const { t } = useI18n();
  return (
    <footer className="lf-footer">
      <Container className="text-start">
        <Row className="mb-4 gy-4">
          {/* Cột 1: Logo, mô tả, lưu ý an toàn */}
          <Col lg={5} md={12}>
            <div className="d-flex align-items-center mb-3">
              <span className="lf-footer-logo">
                <img src="/logo.png" alt="Lost&Found" />
              </span>
              <span className="lf-brand-text lf-brand-on-dark ms-2">
                <span className="lf-brand-light">Lost</span>
                <span className="lf-brand-amp">&amp;</span>
                <span className="lf-brand-bold">Found</span>
              </span>
            </div>
            <p
              className="mb-3"
              style={{ fontSize: "0.9rem", lineHeight: "1.6" }}
            >
              {t("footer.description")}
            </p>
            <ul
              className="list-unstyled d-flex flex-column gap-2 mb-0 lf-footer-muted"
              style={{ fontSize: "0.85rem", lineHeight: "1.5" }}
            >
              {SAFETY_TIPS.map((tipKey) => (
                <li key={tipKey} className="d-flex gap-2">
                  <i
                    className="bi bi-check-circle-fill flex-shrink-0"
                    style={{ color: "#8fc4f5" }}
                  ></i>
                  <span>{t(tipKey)}</span>
                </li>
              ))}
            </ul>

            {/* Liên hệ quản trị viên */}
            <h6 className="fw-bold mt-4 mb-2 text-white">
              {t("footer.adminContact")}
            </h6>
            <ul
              className="list-unstyled d-flex flex-column gap-2 mb-0"
              style={{ fontSize: "0.9rem" }}
            >
              <li>
                <a
                  href={`tel:${ADMIN_PHONE}`}
                  className="text-decoration-none lf-footer-link d-inline-flex align-items-center gap-2"
                >
                  <i className="bi bi-telephone-fill"></i>
                  {ADMIN_PHONE}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${ADMIN_EMAIL}`}
                  className="text-decoration-none lf-footer-link d-inline-flex align-items-center gap-2"
                >
                  <i className="bi bi-envelope-fill"></i>
                  {ADMIN_EMAIL}
                </a>
              </li>
            </ul>
          </Col>

          {/* Cột 2: Khám phá */}
          <Col lg={4} md={6} sm={6}>
            <FooterLinks
              title={t("footer.explore")}
              links={EXPLORE_LINKS}
              t={t}
            />
          </Col>

          {/* Cột 3: Tài khoản (đổi theo trạng thái đăng nhập) */}
          <Col lg={3} md={6} sm={6}>
            <FooterLinks
              title={t("footer.account")}
              links={user ? MEMBER_LINKS : GUEST_LINKS}
              t={t}
            />
          </Col>
        </Row>

        {/* Bản quyền */}
        <div
          className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 pt-3 lf-footer-bottom"
          style={{ fontSize: "0.85rem" }}
        >
          <div>{t("footer.copyright")}</div>
          <button
            type="button"
            className="lf-footer-top"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <i className="bi bi-arrow-up-short"></i> {t("footer.backToTop")}
          </button>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;