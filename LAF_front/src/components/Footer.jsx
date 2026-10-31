import { Container, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="lf-footer">
      <Container className="text-start">
        <Row className="mb-4">
          {/* Cột 1: Logo & mô tả */}
          <Col lg={4} md={12} className="mb-4 mb-lg-0">
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
            <p className="mb-2" style={{ fontSize: "0.9rem", lineHeight: "1.6" }}>
              Không gian kết nối sinh viên trong campus FPT Cần Thơ khi cần tìm
              lại đồ thất lạc hoặc chia sẻ món đồ nhặt được.
            </p>
            <p className="lf-footer-muted" style={{ fontSize: "0.85rem", lineHeight: "1.6" }}>
              Hãy trao đổi an toàn, xác minh thông tin trước khi gặp gỡ và giữ
              campus tử tế hơn.
            </p>
          </Col>

          {/* Cột 2: Khám phá */}
          <Col lg={2} md={4} sm={6} className="mb-3 mb-md-0">
            <h6 className="fw-bold mb-3 text-white">Khám phá</h6>
            <ul className="list-unstyled d-flex flex-column gap-2" style={{ fontSize: "0.9rem" }}>
              <li><Link to="/" className="text-decoration-none lf-footer-link">Trang chủ</Link></li>
              <li><Link to="/lost-found" className="text-decoration-none lf-footer-link">Trang đồ thất lạc</Link></li>
              <li><Link to="/forum" className="text-decoration-none lf-footer-link">Diễn đàn</Link></li>
              <li><Link to="/review" className="text-decoration-none lf-footer-link">Đánh giá</Link></li>
            </ul>
          </Col>

          {/* Cột 3: Hỗ trợ cộng đồng */}
          <Col lg={3} md={4} sm={6} className="mb-3 mb-md-0">
            <h6 className="fw-bold mb-3 text-white">Hỗ trợ cộng đồng</h6>
            <ul className="list-unstyled d-flex flex-column gap-2" style={{ fontSize: "0.9rem" }}>
              <li><Link to="/post-lost" className="text-decoration-none lf-footer-link">Đăng tin mất đồ</Link></li>
              <li><Link to="/post-found" className="text-decoration-none lf-footer-link">Đăng đồ nhặt được</Link></li>
              <li><Link to="/guidelines" className="text-decoration-none lf-footer-link">Góc nhắc nhở</Link></li>
            </ul>
          </Col>

          {/* Cột 4: Cộng đồng */}
          <Col lg={3} md={4} sm={12}>
            <h6 className="fw-bold mb-3 text-white">Cộng đồng</h6>
            <ul className="list-unstyled d-flex flex-column gap-2" style={{ fontSize: "0.9rem" }}>
              <li><Link to="/student-forum" className="text-decoration-none lf-footer-link">Diễn đàn sinh viên</Link></li>
              <li><Link to="/stories" className="text-decoration-none lf-footer-link">Câu chuyện tìm lại</Link></li>
              <li><Link to="/how-to-connect" className="text-decoration-none lf-footer-link">Hướng dẫn kết nối</Link></li>
            </ul>
          </Col>
        </Row>

        {/* Bản quyền & mạng xã hội */}
        <div
          className="d-flex flex-column flex-md-row justify-content-between pt-3 lf-footer-bottom"
          style={{ fontSize: "0.85rem" }}
        >
          <div className="mb-2 mb-md-0">
            © 2026 Lost&amp;Found · Đồ thất lạc luôn có đường về · FPT Cần Thơ
          </div>
          <div className="d-flex gap-3">
            <a href="#" className="text-decoration-none lf-footer-link">Facebook</a>
            <a href="#" className="text-decoration-none lf-footer-link">Instagram</a>
          </div>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
