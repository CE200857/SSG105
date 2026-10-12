import { Container, Row, Col, Button, Form, InputGroup, Card, Badge } from "react-bootstrap";
import { Link } from "react-router-dom";

const Home = () => {
  // Màu chủ đạo của FPT CT Lost & Found
  const primaryColor = "#0C8B72";

  // Dữ liệu mẫu cho phần "Tin mới từ sinh viên"
  const recentPosts = [
    {
      id: 1,
      type: "lost",
      tag: "Đang tìm",
      tagColor: "#dc3545", // Đỏ
      category: "Ví & thẻ sinh viên",
      title: "Ví da nâu và thẻ sinh viên",
      location: "Thư viện, Campus FPT Cần Thơ",
      user: "Minh Anh",
      time: "30 phút trước",
      img: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=400&q=80"
    },
    {
      id: 2,
      type: "found",
      tag: "Nhặt được",
      tagColor: primaryColor, // Xanh
      category: "Chìa khóa phòng",
      title: "Chùm chìa khóa phòng ký túc xá",
      location: "Ký túc xá, Campus FPT Cần Thơ",
      user: "Quang Huy",
      time: "1 giờ trước",
      img: "https://images.unsplash.com/photo-1582139329536-e7284fece509?w=400&q=80"
    },
    {
      id: 3,
      type: "found",
      tag: "Nhặt được",
      tagColor: primaryColor,
      category: "Balo & laptop",
      title: "Balo đen tại cổng ra vào campus",
      location: "Cổng chính, Campus FPT Cần Thơ",
      user: "Thu Hà",
      time: "2 giờ trước",
      img: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80"
    },
    {
      id: 4,
      type: "lost",
      tag: "Đang tìm",
      tagColor: "#dc3545",
      category: "Thú cưng",
      title: "Tìm mèo cưng đi lạc trong campus",
      location: "Khu vực sân trường, Campus FPT Cần Thơ",
      user: "Phương Linh",
      time: "3 giờ trước",
      img: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&q=80"
    }
  ];

  return (
    <div style={{ backgroundColor: "#F9FAFB", minHeight: "100vh", paddingBottom: "50px" }}>
      
      {/* ================= HERO SECTION ================= */}
      <section style={{ backgroundColor: "#EAF5F3", paddingTop: "60px", paddingBottom: "100px" }}>
        <Container>
          <Row className="align-items-center">
            {/* Cột Trái: Text & Nút */}
            <Col lg={6} className="mb-5 mb-lg-0">
              <p className="fw-bold mb-3" style={{ color: primaryColor, fontSize: "0.9rem", letterSpacing: "1px" }}>
                <i className="bi bi-circle-fill me-2" style={{ fontSize: "8px" }}></i>
                CAMPUS FPT CẦN THƠ
              </p>
              <h1 className="fw-bold mb-4" style={{ color: "#10393B", fontSize: "3.2rem", lineHeight: "1.2" }}>
                Mất đồ trong campus? <br />
                <span style={{ color: primaryColor }}>Cộng đồng FPT CT</span> giúp bạn tìm lại.
              </h1>
              <p className="text-secondary mb-4" style={{ fontSize: "1.1rem", lineHeight: "1.6", maxWidth: "90%" }}>
                Tìm đồ thất lạc trong lớp, ký túc xá, thư viện hay sân trường. Đăng tin mất đồ hoặc chia sẻ món đồ bạn nhặt được để kết nối nhanh với sinh viên khác trong campus.
              </p>
              
              <div className="d-flex gap-3 mb-4">
                <Button style={{ backgroundColor: primaryColor, borderColor: primaryColor, borderRadius: "10px", padding: "12px 24px", fontWeight: "600" }}>
                  <i className="bi bi-search me-2"></i> Đăng tin mất đồ
                </Button>
                <Button variant="light" style={{ borderRadius: "10px", padding: "12px 24px", fontWeight: "600", color: "#10393B", border: "1px solid #dee2e6" }}>
                  <i className="bi bi-plus-lg me-2"></i> Đăng đồ nhặt được
                </Button>
              </div>

              <div className="d-flex align-items-center text-secondary" style={{ fontSize: "0.9rem" }}>
                <i className="bi bi-shield-check me-2 text-success fs-5"></i>
                Miễn phí đăng tin - Kết nối trong campus - Trao đổi an toàn
              </div>
            </Col>

            {/* Cột Phải: Hình ảnh với Floating Badges */}
            <Col lg={6} className="position-relative text-center">
              <div className="position-relative d-inline-block">
                <img 
                  src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&q=80" 
                  alt="Campus FPT" 
                  className="img-fluid"
                  style={{ borderRadius: "20px", maxHeight: "450px", objectFit: "cover", boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
                />
                
                {/* Floating Badge 1 */}
                <div className="position-absolute bg-white px-3 py-2 shadow-sm d-flex align-items-center gap-2" style={{ top: "20px", right: "20px", borderRadius: "30px", fontSize: "0.85rem", fontWeight: "600", color: "#10393B" }}>
                  <i className="bi bi-geo-alt text-danger"></i> Campus FPT Cần Thơ
                </div>

                {/* Floating Badge 2 */}
                <div className="position-absolute bg-white p-3 shadow text-start" style={{ bottom: "30px", left: "-30px", borderRadius: "15px", maxWidth: "250px" }}>
                  <div className="d-flex align-items-start gap-3">
                    <div className="bg-success bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center text-success" style={{ width: "40px", height: "40px" }}>
                      <i className="bi bi-check2"></i>
                    </div>
                    <div>
                      <h6 className="mb-1 fw-bold" style={{ fontSize: "0.95rem", color: "#10393B" }}>Tìm lại đồ, kết nối bạn bè</h6>
                      <p className="mb-0 text-secondary" style={{ fontSize: "0.8rem" }}>Cùng giúp nhau trong campus FPT Cần Thơ.</p>
                    </div>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* ================= SEARCH SECTION ================= */}
      <Container style={{ marginTop: "-50px", position: "relative", zIndex: 10 }}>
        <Card className="border-0 shadow-lg p-3" style={{ borderRadius: "20px" }}>
          <Card.Body>
            <Row className="align-items-center g-3">
              <Col md={5}>
                <div className="d-flex align-items-center">
                  <i className="bi bi-search text-secondary fs-5 me-3"></i>
                  <div className="flex-grow-1">
                    <label className="fw-bold mb-0" style={{ fontSize: "0.85rem", color: "#10393B" }}>TÌM ĐỒ TRONG CAMPUS</label>
                    <Form.Control type="text" placeholder="Ví, laptop, balo, chìa khóa..." className="border-0 shadow-none px-0" style={{ fontSize: "1rem" }} />
                  </div>
                </div>
              </Col>
              
              {/* Divider */}
              <Col md={1} className="d-none d-md-flex justify-content-center">
                <div style={{ height: "40px", width: "1px", backgroundColor: "#E2E8F0" }}></div>
              </Col>

              <Col md={4}>
                <div className="d-flex align-items-center">
                  <i className="bi bi-geo-alt text-secondary fs-5 me-3"></i>
                  <div className="flex-grow-1">
                    <label className="fw-bold mb-0" style={{ fontSize: "0.85rem", color: "#10393B" }}>ĐỊA ĐIỂM</label>
                    <Form.Control type="text" placeholder="Toà nhà, ký túc xá, sân trường..." className="border-0 shadow-none px-0" style={{ fontSize: "1rem" }} />
                  </div>
                </div>
              </Col>

              <Col md={2} className="text-end">
                <Button className="w-100" style={{ backgroundColor: primaryColor, borderColor: primaryColor, borderRadius: "10px", padding: "12px", fontWeight: "600" }}>
                  <i className="bi bi-search me-2"></i> Tìm
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Quick Tags & Features */}
        <div className="d-flex flex-wrap justify-content-between align-items-center mt-4">
          <div className="d-flex align-items-center gap-2 mb-3 mb-md-0">
            <span className="text-secondary" style={{ fontSize: "0.9rem" }}>Tìm kiếm nhanh:</span>
            <Badge bg="light" text="dark" className="border px-3 py-2 fw-normal rounded-pill">Ví & thẻ sinh viên</Badge>
            <Badge bg="light" text="dark" className="border px-3 py-2 fw-normal rounded-pill">Laptop</Badge>
            <Badge bg="light" text="dark" className="border px-3 py-2 fw-normal rounded-pill">Balo</Badge>
            <Badge bg="light" text="dark" className="border px-3 py-2 fw-normal rounded-pill">Ký túc xá</Badge>
          </div>
          
          <div className="d-flex gap-4 fw-medium text-dark">
            <div><i className="bi bi-box-seam text-success me-2"></i> <span className="fw-bold">Tìm đồ</span> <span className="text-secondary fw-normal">theo địa điểm</span></div>
            <div><i className="bi bi-people text-success me-2"></i> <span className="fw-bold">Kết nối</span> <span className="text-secondary fw-normal">sinh viên giúp đỡ</span></div>
            <div><i className="bi bi-shield-check text-success me-2"></i> <span className="fw-bold">An toàn</span> <span className="text-secondary fw-normal">xác minh trước khi trao</span></div>
          </div>
        </div>
      </Container>

      {/* ================= RECENT POSTS SECTION ================= */}
      <Container className="py-5 mt-4">
        <div className="d-flex justify-content-between align-items-end mb-4">
          <div>
            <h3 className="fw-bold mb-1" style={{ color: "#10393B" }}>Tin mới từ sinh viên trong campus</h3>
            <p className="text-secondary mb-0">Các tin mất đồ và nhặt được mới nhất trong campus.</p>
          </div>
          <Link to="/lost-found" className="text-decoration-none fw-bold" style={{ color: primaryColor }}>Xem tất cả tin <i className="bi bi-arrow-right"></i></Link>
        </div>

        {/* Tabs */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div className="d-flex gap-2">
            <Button style={{ backgroundColor: primaryColor, borderColor: primaryColor, borderRadius: "20px", padding: "6px 20px" }}>Mới nhất</Button>
            <Button variant="light" className="border text-secondary" style={{ borderRadius: "20px", padding: "6px 20px" }}>Đang tìm đồ</Button>
            <Button variant="light" className="border text-secondary" style={{ borderRadius: "20px", padding: "6px 20px" }}>Đã tìm được</Button>
          </div>
          <div className="text-secondary">Sắp xếp <i className="bi bi-chevron-down"></i></div>
        </div>

        {/* Cột Card Tin tức */}
        <Row>
          {recentPosts.map((post) => (
            <Col lg={3} md={6} className="mb-4" key={post.id}>
              <Card className="h-100 border-0 shadow-sm overflow-hidden" style={{ borderRadius: "15px", cursor: "pointer", transition: "transform 0.2s" }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                <div className="position-relative">
                  <Card.Img variant="top" src={post.img} style={{ height: "180px", objectFit: "cover" }} />
                  <Badge className="position-absolute top-0 start-0 m-3 px-3 py-2 rounded-pill shadow-sm" style={{ backgroundColor: "rgba(255,255,255,0.9)", color: post.tagColor }}>
                    {post.type === 'lost' ? <i className="bi bi-search me-1"></i> : <i className="bi bi-check-circle me-1"></i>} {post.tag}
                  </Badge>
                  <Button variant="light" className="position-absolute top-0 end-0 m-3 rounded-circle p-1 shadow-sm d-flex align-items-center justify-content-center" style={{ width: "35px", height: "35px" }}>
                    <i className="bi bi-bookmark text-secondary"></i>
                  </Button>
                </div>
                <Card.Body className="d-flex flex-column">
                  <p className="text-secondary mb-1" style={{ fontSize: "0.8rem" }}>{post.category}</p>
                  <Card.Title className="fw-bold fs-6 mb-3" style={{ color: "#10393B" }}>{post.title}</Card.Title>
                  <div className="mt-auto">
                    <p className="text-secondary mb-3" style={{ fontSize: "0.85rem" }}><i className="bi bi-geo-alt me-2"></i>{post.location}</p>
                    <div className="d-flex justify-content-between align-items-center pt-3 border-top" style={{ fontSize: "0.85rem" }}>
                      <div className="d-flex align-items-center gap-2 fw-medium text-dark">
                        <div className="bg-light text-secondary rounded-circle d-flex justify-content-center align-items-center" style={{ width: "25px", height: "25px", fontSize: "10px" }}>{post.user.charAt(0)}</div>
                        {post.user}
                      </div>
                      <span className="text-muted">{post.time}</span>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>

      {/* ================= HOW IT WORKS ================= */}
      <section style={{ backgroundColor: "#FFFFFF", padding: "80px 0" }}>
        <Container>
          <div className="d-flex justify-content-between align-items-end mb-5">
            <div>
              <h3 className="fw-bold mb-2" style={{ color: "#10393B" }}>Tìm đồ trong campus, chỉ 3 bước</h3>
              <p className="text-secondary mb-0">Dù bạn mất đồ hay nhặt được đồ, hệ thống đều hỗ trợ kết nối nhanh chóng.</p>
            </div>
            <Link to="/guidelines" className="text-decoration-none fw-bold" style={{ color: primaryColor }}>Hướng dẫn chi tiết <i className="bi bi-arrow-right"></i></Link>
          </div>

          <Row className="g-4">
            <Col md={4}>
              <div className="p-4 bg-light rounded-4 h-100 position-relative">
                <div className="position-absolute top-0 end-0 p-4 fw-bold" style={{ fontSize: "3rem", color: "#E2E8F0", lineHeight: "1" }}>01</div>
                <div className="mb-4 bg-white rounded-circle d-flex align-items-center justify-content-center shadow-sm" style={{ width: "60px", height: "60px", color: primaryColor }}>
                  <i className="bi bi-journal-plus fs-3"></i>
                </div>
                <h5 className="fw-bold mb-3">Đăng tin mất đồ/nhặt được</h5>
                <p className="text-secondary">Đăng ảnh, mô tả món đồ và địa điểm trong campus để nhiều sinh viên biết nhanh hơn.</p>
              </div>
            </Col>
            <Col md={4}>
              <div className="p-4 bg-light rounded-4 h-100 position-relative">
                <div className="position-absolute top-0 end-0 p-4 fw-bold" style={{ fontSize: "3rem", color: "#E2E8F0", lineHeight: "1" }}>02</div>
                <div className="mb-4 bg-white rounded-circle d-flex align-items-center justify-content-center shadow-sm" style={{ width: "60px", height: "60px", color: primaryColor }}>
                  <i className="bi bi-chat-dots fs-3"></i>
                </div>
                <h5 className="fw-bold mb-3">Tìm tin phù hợp & Kết nối</h5>
                <p className="text-secondary">Hệ thống gợi ý tin phù hợp, trao đổi qua tin nhắn và xác minh thông tin món đồ trước khi gặp.</p>
              </div>
            </Col>
            <Col md={4}>
              <div className="p-4 bg-light rounded-4 h-100 position-relative">
                <div className="position-absolute top-0 end-0 p-4 fw-bold" style={{ fontSize: "3rem", color: "#E2E8F0", lineHeight: "1" }}>03</div>
                <div className="mb-4 bg-white rounded-circle d-flex align-items-center justify-content-center shadow-sm" style={{ width: "60px", height: "60px", color: primaryColor }}>
                  <i className="bi bi-bag-check fs-3"></i>
                </div>
                <h5 className="fw-bold mb-3">Trao trả đồ an toàn</h5>
                <p className="text-secondary">Hẹn gặp ở nơi an toàn trong campus, trao trả đồ và cập nhật trạng thái kết thúc tin.</p>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* ================= COMMUNITY SECTION ================= */}
      <Container className="py-5">
        <div className="d-flex justify-content-between align-items-end mb-4">
          <div>
            <h3 className="fw-bold mb-1" style={{ color: "#10393B" }}>Cộng đồng FPT Cần Thơ cùng kết nối</h3>
            <p className="text-secondary mb-0">Cùng nhau chia sẻ kinh nghiệm, trao đổi thông tin và giữ campus trở nên tử tế hơn.</p>
          </div>
          <Link to="/forum" className="text-decoration-none fw-bold" style={{ color: primaryColor }}>Xem diễn đàn <i className="bi bi-arrow-right"></i></Link>
        </div>

        <Row className="g-4">
          {/* Box Trái */}
          <Col lg={7}>
            <Card className="border-0 shadow-sm overflow-hidden rounded-4 h-100">
              <Row className="g-0 h-100">
                <Col md={5}>
                  <Card.Img src="https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=400&q=80" style={{ height: "100%", objectFit: "cover" }} />
                </Col>
                <Col md={7} style={{ backgroundColor: "#EAF5F3" }}>
                  <Card.Body className="d-flex flex-column justify-content-center h-100 p-4 p-lg-5">
                    <p className="fw-bold mb-3" style={{ color: primaryColor, fontSize: "0.85rem", letterSpacing: "1px" }}>GÓC NHẮC NHỞ</p>
                    <h4 className="fw-bold mb-4" style={{ color: "#10393B", lineHeight: "1.4" }}>
                      Nhặt được đồ? Hãy đăng tin và giữ kín một vài đặc điểm để xác minh đúng chủ trước khi trao trả.
                    </h4>
                    <div className="mt-auto">
                      <p className="mb-0 fw-bold" style={{ color: "#10393B" }}>Cùng xây dựng campus tử tế</p>
                      <p className="text-secondary mb-0" style={{ fontSize: "0.9rem" }}>Trao trả tại nơi công cộng - Bảo vệ thông tin cá nhân</p>
                    </div>
                  </Card.Body>
                </Col>
              </Row>
            </Card>
          </Col>

          {/* Box Phải */}
          <Col lg={5}>
            <Card className="border shadow-sm rounded-4 h-100 p-4">
              <div className="d-flex align-items-center mb-4">
                <div className="bg-light rounded d-flex align-items-center justify-content-center me-3" style={{ width: "40px", height: "40px" }}>
                  <i className="bi bi-chat-square-text text-secondary fs-5"></i>
                </div>
                <h5 className="fw-bold mb-0" style={{ color: "#10393B" }}>Diễn đàn sinh viên</h5>
              </div>

              <div className="mb-4">
                <h6 className="fw-bold text-dark">Nhặt được đồ trong campus, nên làm gì đầu tiên?</h6>
                <div className="d-flex gap-3 text-muted" style={{ fontSize: "0.85rem" }}>
                  <span style={{ color: primaryColor }}>Kinh nghiệm campus</span>
                  <span>• Chờ đợi gợi ý</span>
                </div>
              </div>

              <div className="mb-4 border-top pt-4">
                <h6 className="fw-bold text-dark">5 lưu ý khi trao trả đồ trong campus</h6>
                <div className="d-flex gap-3 text-muted" style={{ fontSize: "0.85rem" }}>
                  <span style={{ color: primaryColor }}>Mẹo campus</span>
                  <span>• Chờ đợi gợi ý</span>
                </div>
              </div>

              <div className="mt-auto border-top pt-4">
                <Link to="/forum" className="text-decoration-none fw-bold" style={{ color: primaryColor }}>Xem thêm chủ đề <i className="bi bi-arrow-right"></i></Link>
              </div>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Home;