import { Container, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer style={{ backgroundColor: '#F4F7F6', color: '#4A5568', padding: '40px 0 15px 0' }}>
      <Container className="text-start"> {/* Thêm text-start để ép canh trái toàn bộ chữ */}
        <Row className="mb-4">
          {/* Cột 1: Thông tin Logo & Mô tả */}
          <Col lg={4} md={12} className="mb-4 mb-lg-0">
            <h5 className="fw-bold mb-3" style={{ color: '#1A3636' }}>Lost & Found</h5>
            <p className="mb-2" style={{ fontSize: '0.9rem', lineHeight: '1.5' }}>
              Không gian kết nối sinh viên trong campus FPT Cần Thơ khi cần tìm lại đồ thất lạc hoặc chia sẻ món đồ nhặt được.
            </p>
            <p style={{ fontSize: '0.85rem', lineHeight: '1.5', color: '#718096' }}>
              Trang này được xây dựng để hỗ trợ cộng đồng sinh viên. Hãy trao đổi an toàn, xác minh thông tin trước khi gặp gỡ và giữ campus tử tế hơn.
            </p>
          </Col>

          {/* Cột 2: Khám phá */}
          <Col lg={2} md={4} sm={6} className="mb-3 mb-md-0">
            <h6 className="fw-bold mb-3" style={{ color: '#1A3636' }}>Khám phá</h6>
            <ul className="list-unstyled d-flex flex-column gap-2" style={{ fontSize: '0.9rem' }}>
              <li><Link to="/" className="text-decoration-none text-secondary custom-link">Trang chủ</Link></li>
              <li><Link to="/lost-found" className="text-decoration-none text-secondary custom-link">Trang đồ thất lạc</Link></li>
              <li><Link to="/forum" className="text-decoration-none text-secondary custom-link">Diễn đàn</Link></li>
              <li><Link to="/review" className="text-decoration-none text-secondary custom-link">Đánh giá</Link></li>
            </ul>
          </Col>

          {/* Cột 3: Hỗ trợ cộng đồng */}
          <Col lg={3} md={4} sm={6} className="mb-3 mb-md-0">
            <h6 className="fw-bold mb-3" style={{ color: '#1A3636' }}>Hỗ trợ cộng đồng</h6>
            <ul className="list-unstyled d-flex flex-column gap-2" style={{ fontSize: '0.9rem' }}>
              <li><Link to="/post-lost" className="text-decoration-none text-secondary custom-link">Đăng tin mất đồ</Link></li>
              <li><Link to="/post-found" className="text-decoration-none text-secondary custom-link">Đăng đồ nhặt được</Link></li>
              <li><Link to="/guidelines" className="text-decoration-none text-secondary custom-link">Góc nhắc nhở</Link></li>
            </ul>
          </Col>

          {/* Cột 4: Cộng đồng */}
          <Col lg={3} md={4} sm={12}>
            <h6 className="fw-bold mb-3" style={{ color: '#1A3636' }}>Cộng đồng</h6>
            <ul className="list-unstyled d-flex flex-column gap-2" style={{ fontSize: '0.9rem' }}>
              <li><Link to="/student-forum" className="text-decoration-none text-secondary custom-link">Diễn đàn sinh viên</Link></li>
              <li><Link to="/stories" className="text-decoration-none text-secondary custom-link">Câu chuyện tìm lại</Link></li>
              <li><Link to="/how-to-connect" className="text-decoration-none text-secondary custom-link">Hướng dẫn kết nối</Link></li>
            </ul>
          </Col>
        </Row>

        {/* Dòng bản quyền & Mạng xã hội */}
        <div 
          className="d-flex flex-column flex-md-row justify-content-between pt-3" 
          style={{ borderTop: '1px solid #E2E8F0', fontSize: '0.85rem' }}
        >
          <div className="mb-2 mb-md-0">
            © 2026 Lost & Found · Cộng đồng FPT Cần Thơ
          </div>
          <div className="d-flex gap-3">
            <a href="#" className="text-secondary text-decoration-none custom-link">Facebook</a>
            <a href="#" className="text-secondary text-decoration-none custom-link">Instagram</a>
          </div>
        </div>
      </Container>

      {/* CSS Hover */}
      <style>{`
        .custom-link:hover {
          color: #0C8B72 !important;
        }
      `}</style>
    </footer>
  );
};

export default Footer;