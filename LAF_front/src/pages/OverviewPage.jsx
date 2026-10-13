import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Alert, ProgressBar, Badge } from 'react-bootstrap';

const OverviewPage = () => {
  // State lưu trữ dữ liệu tổng quan
  const [stats, setStats] = useState({
    avgRating: 3.3,
    totalPosts: 120,
    foundPosts: 72,
    waitingPosts: 48,
  });

  const [statusStats, setStatusStats] = useState({
    lost: 70,
    found: 50,
  });

  // Giả lập gọi API lấy dữ liệu từ Back-end
  useEffect(() => {
    // const fetchData = async () => {
    //   const response = await fetch('/api/overview/stats');
    //   const data = await response.json();
    //   setStats(data.stats);
    //   setStatusStats(data.statusStats);
    // };
    // fetchData();
  }, []);

  return (
    <div style={{ backgroundColor: '#F4F7F6', minHeight: '100vh', padding: '40px 0' }}>
      <Container>
        
        {/* Header trang */}
        <div className="mb-4">
          <p className="fw-semibold mb-1" style={{ color: '#0C8B72', fontSize: '0.9rem' }}>
            CAMPUS FPT CẦN THƠ - TỔNG QUAN CỘNG ĐỒNG
          </p>
          <h2 className="fw-bold mb-2" style={{ color: '#10393B' }}>
            Hiểu hoạt động, an tâm kết nối.
          </h2>
          <p className="text-secondary mb-0">
            Xem các bài đăng tìm đồ, kết quả trao trả và góp ý từ cộng đồng. Mỗi chỉ số đều có cách tính rõ ràng để bạn hiểu đúng trước khi tham gia.
          </p>
        </div>

        {/* Thông báo minh họa */}
        <Alert 
          variant="info" 
          className="d-flex align-items-start border-0 shadow-sm mb-4" 
          style={{ backgroundColor: '#E6F4F1', color: '#10393B' }}
        >
          <i className="bi bi-info-circle-fill me-2 mt-1 fs-5" style={{ color: '#0C8B72' }}></i>
          <div>
            <strong>Dữ liệu minh họa - Chưa có số liệu hoạt động thực tế</strong>
            <p className="mb-0 text-secondary" style={{ fontSize: '0.875rem' }}>
              Các số liệu dưới đây dùng để minh họa cách thống kê, không phải kết quả thực tế. Điểm đánh giá lấy từ ý kiến thực tế của một số bạn Đánh giá.
            </p>
          </div>
        </Alert>

        {/* Thống kê 4 thẻ con số */}
        <h5 className="fw-bold mb-3" style={{ color: '#10393B' }}>Cộng đồng qua những con số</h5>
        <Row className="g-3 mb-4">
          
          {/* Card 1 */}
          <Col lg={3} md={6}>
            <Card className="border-0 shadow-sm h-100 p-3">
              <Card.Body className="d-flex flex-column justify-content-between p-0">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="fw-semibold text-secondary" style={{ fontSize: '0.85rem' }}>Điểm đánh giá trung bình</span>
                  <i className="bi bi-star-fill text-warning fs-5"></i>
                </div>
                <div className="d-flex align-items-baseline gap-1 my-2">
                  <span className="display-6 fw-bold" style={{ color: '#10393B' }}>{stats.avgRating}</span>
                  <span className="text-muted">/ 5</span>
                </div>
                <p className="text-muted mb-2" style={{ fontSize: '0.75rem' }}>Từ 6 đánh giá mẫu. Làm tròn đến 1 chữ số thập phân.</p>
                <div>
                  <Badge bg="light" style={{ color: '#0C8B72', border: '1px solid #0C8B72' }}>Dữ liệu minh họa</Badge>
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Card 2 */}
          <Col lg={3} md={6}>
            <Card className="border-0 shadow-sm h-100 p-3">
              <Card.Body className="d-flex flex-column justify-content-between p-0">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="fw-semibold text-secondary" style={{ fontSize: '0.85rem' }}>Tổng bài đăng đồ vật</span>
                  <i className="bi bi-card-checklist text-secondary fs-5"></i>
                </div>
                <div className="d-flex align-items-baseline gap-1 my-2">
                  <span className="display-6 fw-bold" style={{ color: '#10393B' }}>{stats.totalPosts}</span>
                  <span className="text-muted">bài</span>
                </div>
                <p className="text-muted mb-2" style={{ fontSize: '0.75rem' }}>70 bài tìm đồ bị mất và 50 bài đăng nhặt được.</p>
                <div>
                  <Badge bg="light" style={{ color: '#0C8B72', border: '1px solid #0C8B72' }}>Dữ liệu minh họa</Badge>
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Card 3 */}
          <Col lg={3} md={6}>
            <Card className="border-0 shadow-sm h-100 p-3">
              <Card.Body className="d-flex flex-column justify-content-between p-0">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="fw-semibold text-secondary" style={{ fontSize: '0.85rem' }}>Đã tìm được / đã trao trả</span>
                  <i className="bi bi-check-circle-fill text-success fs-5"></i>
                </div>
                <div className="d-flex align-items-baseline gap-1 my-2">
                  <span className="display-6 fw-bold" style={{ color: '#10393B' }}>{stats.foundPosts}</span>
                  <span className="text-muted">bài</span>
                </div>
                <p className="text-muted mb-2" style={{ fontSize: '0.75rem' }}>40 bài đã tìm được + 32 bài đã trao trả. Chiếm 60%.</p>
                <div>
                  <Badge bg="light" style={{ color: '#0C8B72', border: '1px solid #0C8B72' }}>Dữ liệu minh họa</Badge>
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Card 4 */}
          <Col lg={3} md={6}>
            <Card className="border-0 shadow-sm h-100 p-3">
              <Card.Body className="d-flex flex-column justify-content-between p-0">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="fw-semibold text-secondary" style={{ fontSize: '0.85rem' }}>Bài đăng cần kết nối</span>
                  <i className="bi bi-hourglass-split text-primary fs-5"></i>
                </div>
                <div className="d-flex align-items-baseline gap-1 my-2">
                  <span className="display-6 fw-bold" style={{ color: '#10393B' }}>{stats.waitingPosts}</span>
                  <span className="text-muted">bài</span>
                </div>
                <p className="text-muted mb-2" style={{ fontSize: '0.75rem' }}>30 bài đang tìm đồ và 18 bài đồ nhặt đang chờ.</p>
                <div>
                  <Badge bg="light" style={{ color: '#0C8B72', border: '1px solid #0C8B72' }}>Dữ liệu minh họa</Badge>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Khối Biểu đồ trạng thái & Đánh giá */}
        <Row className="g-4">
          
          {/* Cột Trạng thái bài đăng */}
          <Col md={6}>
            <Card className="border-0 shadow-sm h-100 p-4">
              <h5 className="fw-bold mb-4" style={{ color: '#10393B' }}>Bài đăng đang ở trạng thái nào?</h5>
              
              <div className="mb-4">
                <div className="d-flex justify-content-between fw-semibold text-dark mb-1" style={{ fontSize: '0.9rem' }}>
                  <span>Bài đăng tìm đồ bị mất</span>
                  <span>{statusStats.lost} bài</span>
                </div>
                <ProgressBar className="mb-1" style={{ height: '10px' }}>
                  <ProgressBar now={57} style={{ backgroundColor: '#0C8B72' }} key={1} />
                  <ProgressBar now={43} style={{ backgroundColor: '#E2E8F0' }} key={2} />
                </ProgressBar>
                <div className="d-flex justify-content-between text-muted" style={{ fontSize: '0.75rem' }}>
                  <span>40 đã tìm được</span>
                  <span>30 đang tìm đồ</span>
                </div>
              </div>

              <div>
                <div className="d-flex justify-content-between fw-semibold text-dark mb-1" style={{ fontSize: '0.9rem' }}>
                  <span>Bài đăng đồ nhặt được</span>
                  <span>{statusStats.found} bài</span>
                </div>
                <ProgressBar className="mb-1" style={{ height: '10px' }}>
                  <ProgressBar now={64} style={{ backgroundColor: '#0C8B72' }} key={1} />
                  <ProgressBar now={36} style={{ backgroundColor: '#E2E8F0' }} key={2} />
                </ProgressBar>
                <div className="d-flex justify-content-between text-muted" style={{ fontSize: '0.75rem' }}>
                  <span>32 đã trao trả</span>
                  <span>18 đang chờ chủ</span>
                </div>
              </div>
            </Card>
          </Col>

          {/* Cột Chi tiết Rating */}
          <Col md={6}>
            <Card className="border-0 shadow-sm h-100 p-4">
              <h5 className="fw-bold mb-3" style={{ color: '#10393B' }}>Góc nhìn cộng đồng</h5>
              
              <div className="d-flex align-items-end gap-3 mb-4">
                <span className="display-4 fw-bold" style={{ color: '#10393B', lineHeight: 1 }}>3,3</span>
                <div>
                  <div className="fw-semibold" style={{ color: '#0C8B72' }}>6 đánh giá mẫu</div>
                  <div className="text-muted" style={{ fontSize: '0.85rem' }}>/ 5 sao</div>
                </div>
              </div>

              {/* Danh sách thanh sao */}
              <div className="d-flex flex-column gap-2">
                {[
                  { star: 5, count: 1, percent: 16 },
                  { star: 4, count: 2, percent: 33 },
                  { star: 3, count: 1, percent: 16 },
                  { star: 2, count: 1, percent: 16 },
                  { star: 1, count: 1, percent: 16 },
                ].map((item) => (
                  <div key={item.star} className="d-flex align-items-center" style={{ fontSize: '0.85rem' }}>
                    <span className="text-muted" style={{ width: '45px' }}>{item.star} sao</span>
                    <div className="flex-grow-1 mx-2">
                      <div className="w-100 bg-light rounded" style={{ height: '8px', overflow: 'hidden' }}>
                        <div 
                          className="h-100 rounded" 
                          style={{ width: `${item.percent}%`, backgroundColor: '#0C8B72' }}
                        ></div>
                      </div>
                    </div>
                    <span className="text-muted text-end" style={{ width: '20px' }}>{item.count}</span>
                  </div>
                ))}
              </div>
            </Card>
          </Col>
        </Row>

      </Container>
    </div>
  );
};

export default OverviewPage;