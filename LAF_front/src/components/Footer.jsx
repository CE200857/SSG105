import { Container, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";

// Chỉ liệt kê những trang thật sự có trong AppRoutes
const EXPLORE_LINKS = [
  { to: "/", label: "Trang chủ", icon: "bi-house-door" },
  { to: "/lost-found", label: "Tìm đồ (Đồ mất)", icon: "bi-search" },
  { to: "/found-items", label: "Tìm chủ (Đồ nhặt)", icon: "bi-bag-check" },
  { to: "/forum", label: "Diễn đàn", icon: "bi-chat-square-text" },
  { to: "/review", label: "Đánh giá", icon: "bi-star" },
  { to: "/overview", label: "Tổng quan", icon: "bi-bar-chart" },
];

const MEMBER_LINKS = [
  { to: "/profile", label: "Trang cá nhân", icon: "bi-person" },
  { to: "/edit-profile", label: "Chỉnh sửa hồ sơ", icon: "bi-pencil-square" },
  { to: "/change-password", label: "Đổi mật khẩu", icon: "bi-shield-lock" },
];

const GUEST_LINKS = [
  { to: "/login", label: "Đăng nhập", icon: "bi-box-arrow-in-right" },
  { to: "/register", label: "Đăng ký tài khoản", icon: "bi-person-plus" },
  { to: "/forgot-password", label: "Quên mật khẩu", icon: "bi-key" },
];

const SAFETY_TIPS = [
  "Xác minh đặc điểm riêng của món đồ trước khi trao trả.",
  "Hẹn nhận lại ở nơi công cộng trong campus.",
  "Không chia sẻ số thẻ, CMND/CCCD.",
];

const FooterLinks = ({ title, links }) => (
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
            {item.label}
          </Link>
        </li>
      ))}
    </ul>
  </>
);

const Footer = ({ user }) => {
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
              Không gian kết nối sinh viên trong campus FPT Cần Thơ khi cần tìm
              lại đồ thất lạc hoặc chia sẻ món đồ nhặt được.
            </p>
            <ul
              className="list-unstyled d-flex flex-column gap-2 mb-0 lf-footer-muted"
              style={{ fontSize: "0.85rem", lineHeight: "1.5" }}
            >
              {SAFETY_TIPS.map((tip) => (
                <li key={tip} className="d-flex gap-2">
                  <i
                    className="bi bi-check-circle-fill flex-shrink-0"
                    style={{ color: "#8fc4f5" }}
                  ></i>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </Col>

          {/* Cột 2: Khám phá */}
          <Col lg={4} md={6} sm={6}>
            <FooterLinks title="Khám phá" links={EXPLORE_LINKS} />
          </Col>

          {/* Cột 3: Tài khoản (đổi theo trạng thái đăng nhập) */}
          <Col lg={3} md={6} sm={6}>
            <FooterLinks
              title="Tài khoản"
              links={user ? MEMBER_LINKS : GUEST_LINKS}
            />
          </Col>
        </Row>

        {/* Bản quyền */}
        <div
          className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 pt-3 lf-footer-bottom"
          style={{ fontSize: "0.85rem" }}
        >
          <div>
            © 2026 Lost&amp;Found · Đồ thất lạc luôn có đường về · FPT Cần Thơ
          </div>
          <button
            type="button"
            className="lf-footer-top"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <i className="bi bi-arrow-up-short"></i> Lên đầu trang
          </button>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;