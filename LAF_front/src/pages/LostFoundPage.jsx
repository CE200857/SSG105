import { useState, useEffect } from "react";
import { Container, Row, Col, Card, Form, Button, Badge, Image, InputGroup } from "react-bootstrap";
import axios from "axios";

const LostFoundPage = () => {
  // Chuyển sang mảng rỗng để hứng dữ liệu từ Backend
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch dữ liệu từ API
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get("/api/lost-posts");
        setPosts(response.data);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu bài đăng mất đồ:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  // State xử lý form đăng bài
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newTime, setNewTime] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Mock submit: Hiển thị tạm thời bài mới lên đầu danh sách (chưa gọi API POST)
  const handleSubmitPost = (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const newPostObj = {
      id: Date.now(),
      author: "Bạn (Sinh viên)",
      time: "Vừa xong",
      status: "Đang tìm đồ",
      statusVariant: "warning",
      title: newTitle,
      content: newContent,
      location: newLocation || "Campus FPT Cần Thơ",
      date: newTime || "Mới đây",
      category: "Đồ dùng cá nhân",
      likes: 0,
      commentsCount: 0,
      image: imagePreview || null,
      comments: [],
    };

    setPosts([newPostObj, ...posts]);
    setNewTitle("");
    setNewContent("");
    setNewLocation("");
    setNewTime("");
    setSelectedImage(null);
    setImagePreview(null);
  };

  return (
    <div className="text-start" style={{ backgroundColor: "#F4F7F6", minHeight: "100vh", paddingBottom: "40px" }}>
      <Container className="py-4">
        {/* Breadcrumb & Subtitle */}
        <div className="mb-3">
          <span className="text-muted" style={{ fontSize: "0.85rem" }}>
            Trang chủ &gt; Diễn đàn
          </span>
          <p className="fw-bold mb-1 mt-1" style={{ color: "#0C8B72", fontSize: "0.85rem" }}>
            CAMPUS FPT CẦN THƠ - TÌM ĐỒ BỊ MẤT
          </p>
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
            <div>
              <h2 className="fw-bold mb-1" style={{ color: "#10393B" }}>
                Bạn đang tìm đồ? Cùng lên tiếng.
              </h2>
              <p className="text-secondary mb-0" style={{ fontSize: "0.9rem" }}>
                Đăng bài tìm món đồ bị mất, chia sẻ manh mối và giúp nhau tìm lại.
              </p>
            </div>
            <Button style={{ backgroundColor: "#0C8B72", borderColor: "#0C8B72" }} className="fw-semibold">
              <i className="bi bi-pencil-square me-2"></i>Đăng bài tìm đồ
            </Button>
          </div>
        </div>

        {/* Thanh tìm kiếm */}
        <Card className="border-0 shadow-sm p-2 mb-4">
          <InputGroup>
            <Form.Control
              placeholder="Tìm bài đăng theo từ khóa: ví nâu, tai nghe, chìa khóa..."
              className="border-0 shadow-none"
            />
            <Button style={{ backgroundColor: "#0C8B72", borderColor: "#0C8B72" }}>
              <i className="bi bi-search me-1"></i> Tìm kiếm
            </Button>
          </InputGroup>
        </Card>

        <Row className="g-4">
          {/* CỘT TRÁI: FORM ĐĂNG & DANH SÁCH BÀI ĐĂNG */}
          <Col lg={8}>
            {/* Form đăng bài */}
            <Card className="border-0 shadow-sm p-4 mb-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold mb-0" style={{ color: "#10393B" }}>
                  <i className="bi bi-person-circle me-2 text-secondary"></i>Bạn bị mất món đồ gì?
                </h5>
                <Badge bg="light" className="text-muted border">
                  Tin tìm đồ bị mất
                </Badge>
              </div>

              <Form onSubmit={handleSubmitPost}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold text-secondary" style={{ fontSize: "0.85rem" }}>
                    Tiêu đề bài đăng
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Ví dụ: Tìm ví da màu nâu bị mất ở thư viện"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    required
                    className="shadow-none"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold text-secondary" style={{ fontSize: "0.85rem" }}>
                    Mô tả & thông tin cần tìm
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Màu sắc, đặc điểm nhận biết, nơi bạn nhìn thấy lần cuối..."
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    required
                    className="shadow-none"
                  />
                </Form.Group>

                <Row className="g-3 mb-3">
                  <Col md={6}>
                    <Form.Label className="fw-semibold text-secondary" style={{ fontSize: "0.85rem" }}>
                      Địa điểm mất
                    </Form.Label>
                    <Form.Select value={newLocation} onChange={(e) => setNewLocation(e.target.value)} className="shadow-none">
                      <option value="">Chọn khu vực trong campus</option>
                      <option value="Thư viện - Khu tự học">Thư viện</option>
                      <option value="Giảng đường A/B">Giảng đường</option>
                      <option value="Căn tin">Căn tin</option>
                      <option value="Sân bóng / Bãi xe">Sân bóng / Bãi xe</option>
                    </Form.Select>
                  </Col>
                  <Col md={6}>
                    <Form.Label className="fw-semibold text-secondary" style={{ fontSize: "0.85rem" }}>
                      Thời gian mất
                    </Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Ngày / tháng - Khoảng thời gian"
                      value={newTime}
                      onChange={(e) => setNewTime(e.target.value)}
                      className="shadow-none"
                    />
                  </Col>
                </Row>

                {/* Upload Ảnh */}
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold text-secondary d-block" style={{ fontSize: "0.85rem" }}>
                    Thêm ảnh món đồ (nếu có)
                  </Form.Label>
                  <div className="d-flex align-items-center gap-3">
                    <Form.Control
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      id="upload-photo"
                      className="d-none"
                    />
                    <label
                      htmlFor="upload-photo"
                      className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2"
                    >
                      <i className="bi bi-image"></i> Chọn ảnh đính kèm
                    </label>
                    {selectedImage && (
                      <span className="text-success text-truncate" style={{ fontSize: "0.85rem" }}>
                        <i className="bi bi-check-circle-fill me-1"></i> {selectedImage.name}
                      </span>
                    )}
                  </div>

                  {/* Preivew ảnh vừa chọn */}
                  {imagePreview && (
                    <div className="mt-2 position-relative d-inline-block">
                      <Image
                        src={imagePreview}
                        alt="Preview"
                        rounded
                        style={{ width: "120px", height: "120px", objectFit: "cover" }}
                        className="border"
                      />
                      <Button
                        variant="danger"
                        size="sm"
                        className="position-absolute top-0 end-0 rounded-circle p-0"
                        style={{ width: "22px", height: "22px", lineHeight: 1 }}
                        onClick={() => {
                          setSelectedImage(null);
                          setImagePreview(null);
                        }}
                      >
                        &times;
                      </Button>
                    </div>
                  )}
                </Form.Group>

                <div className="d-flex justify-content-between align-items-center pt-2 border-top">
                  <span className="text-muted" style={{ fontSize: "0.75rem" }}>
                    Không đăng thông tin nhạy cảm (CMND/STK...)
                  </span>
                  <Button
                    type="submit"
                    className="fw-semibold px-4"
                    style={{ backgroundColor: "#0C8B72", borderColor: "#0C8B72" }}
                  >
                    Đăng bài tìm đồ
                  </Button>
                </div>
              </Form>
            </Card>

            {/* DANH SÁCH BÀI ĐĂNG CỘNG ĐỒNG */}
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold mb-0" style={{ color: "#10393B" }}>
                Bài đăng từ cộng đồng
              </h5>
              <div className="d-flex gap-2">
                <Button variant="success" size="sm" className="rounded-pill px-3" style={{ backgroundColor: "#0C8B72", borderColor: "#0C8B72" }}>
                  Tất cả
                </Button>
                <Button variant="light" size="sm" className="rounded-pill px-3 border">
                  Đang tìm đồ
                </Button>
                <Button variant="light" size="sm" className="rounded-pill px-3 border">
                  Đã tìm được
                </Button>
              </div>
            </div>

            {loading ? (
               <div className="text-center py-5">Đang tải dữ liệu...</div>
            ) : posts.length === 0 ? (
               <div className="text-center py-5 text-secondary">Chưa có bài đăng nào.</div>
            ) : (
              posts.map((post) => (
                <Card key={post.id} className="border-0 shadow-sm p-4 mb-3">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div className="d-flex align-items-center gap-2">
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                        style={{ width: "40px", height: "40px", backgroundColor: "#0C8B72" }}
                      >
                        {post.author.charAt(0)}
                      </div>
                      <div>
                        <h6 className="fw-bold mb-0" style={{ color: "#10393B" }}>
                          {post.author}
                        </h6>
                        <span className="text-muted" style={{ fontSize: "0.75rem" }}>
                          Sinh viên FPT CT · {post.time}
                        </span>
                      </div>
                    </div>
                    <Badge bg={post.statusVariant}>{post.status}</Badge>
                  </div>

                  <Row className="g-3 my-1">
                    <Col md={post.image ? 8 : 12}>
                      <h5 className="fw-bold mb-2" style={{ color: "#10393B" }}>
                        {post.title}
                      </h5>
                      <p className="text-secondary mb-3" style={{ fontSize: "0.9rem", lineHeight: "1.5" }}>
                        {post.content}
                      </p>

                      <div className="d-flex flex-wrap gap-2 text-muted mb-2" style={{ fontSize: "0.8rem" }}>
                        <span className="bg-light px-2 py-1 rounded border">
                          <i className="bi bi-geo-alt me-1"></i> {post.location}
                        </span>
                        <span className="bg-light px-2 py-1 rounded border">
                          <i className="bi bi-clock me-1"></i> {post.date}
                        </span>
                        <span className="bg-light px-2 py-1 rounded border">
                          <i className="bi bi-tag me-1"></i> {post.category}
                        </span>
                      </div>
                    </Col>

                    {post.image && (
                      <Col md={4} className="d-flex align-items-center justify-content-center">
                        <Image
                          src={post.image}
                          alt={post.title}
                          rounded
                          className="w-100 object-fit-cover border"
                          style={{ maxHeight: "160px" }}
                        />
                      </Col>
                    )}
                  </Row>

                  <div className="d-flex gap-4 pt-2 border-top text-secondary" style={{ fontSize: "0.85rem" }}>
                    <span style={{ cursor: "pointer" }}>
                      <i className="bi bi-hand-thumbs-up me-1"></i> Đã thích ({post.likes})
                    </span>
                    <span style={{ cursor: "pointer" }}>
                      <i className="bi bi-chat me-1"></i> Bình luận ({post.commentsCount})
                    </span>
                    <span className="ms-auto" style={{ cursor: "pointer" }}>
                      <i className="bi bi-share me-1"></i> Chia sẻ
                    </span>
                  </div>

                  {post.comments && post.comments.length > 0 && (
                    <div className="mt-3 pt-2 bg-light p-3 rounded">
                      {post.comments.map((comment, index) => (
                        <div key={index} className="mb-1" style={{ fontSize: "0.85rem" }}>
                          <span className="fw-bold text-dark">{comment.author}: </span>
                          <span className="text-secondary">{comment.text}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              ))
            )}
          </Col>

          {/* CỘT PHẢI: WIDGET PHỤ & HƯỚNG DẪN */}
          <Col lg={4}>
            <Card className="border-0 shadow-sm p-3 mb-3 bg-white">
              <h6 className="fw-bold" style={{ color: "#10393B" }}>
                <i className="bi bi-box-seam me-2" style={{ color: "#0C8B72" }}></i> Cùng tìm lại, cùng sẻ chia
              </h6>
              <p className="text-muted" style={{ fontSize: "0.85rem" }}>
                Nơi sinh viên FPT Cần Thơ đăng bài tìm đồ bị mất và trao đổi thông tin trong campus.
              </p>
              <div className="p-2 bg-light rounded text-center">
                <span className="fw-semibold" style={{ fontSize: "0.85rem", color: "#0C8B72" }}>
                  Bạn nhặt được đồ của ai đó?
                </span>
                <Button size="sm" className="w-100 mt-2 fw-semibold" style={{ backgroundColor: "#0C8B72", borderColor: "#0C8B72" }}>
                  Xem đồ nhặt được &rarr;
                </Button>
              </div>
            </Card>

            <Card className="border-0 shadow-sm p-3 mb-3">
              <h6 className="fw-bold mb-3" style={{ color: "#10393B" }}>
                Bạn đang tìm gì?
              </h6>
              <ul className="list-unstyled mb-0 d-flex flex-column gap-2" style={{ fontSize: "0.875rem" }}>
                <li className="d-flex justify-content-between text-secondary" style={{ cursor: "pointer" }}>
                  <span><i className="bi bi-wallet2 me-2"></i>Ví & giấy tờ</span>
                  <i className="bi bi-chevron-right"></i>
                </li>
                <li className="d-flex justify-content-between text-secondary" style={{ cursor: "pointer" }}>
                  <span><i className="bi bi-laptop me-2"></i>Đồ điện tử</span>
                  <i className="bi bi-chevron-right"></i>
                </li>
                <li className="d-flex justify-content-between text-secondary" style={{ cursor: "pointer" }}>
                  <span><i className="bi bi-key me-2"></i>Chìa khóa</span>
                  <i className="bi bi-chevron-right"></i>
                </li>
                <li className="d-flex justify-content-between text-secondary" style={{ cursor: "pointer" }}>
                  <span><i className="bi bi-backpack me-2"></i>Túi & balo</span>
                  <i className="bi bi-chevron-right"></i>
                </li>
              </ul>
            </Card>

            <Card className="border-0 shadow-sm p-3 mb-3">
              <h6 className="fw-bold mb-2" style={{ color: "#10393B" }}>
                ĐỊA ĐIỂM TRONG CAMPUS
              </h6>
              <div className="d-flex flex-wrap gap-2" style={{ fontSize: "0.8rem" }}>
                <span className="bg-light px-2 py-1 rounded border text-secondary cursor-pointer">Thư viện</span>
                <span className="bg-light px-2 py-1 rounded border text-secondary cursor-pointer">Giảng đường</span>
                <span className="bg-light px-2 py-1 rounded border text-secondary cursor-pointer">Căn tin</span>
                <span className="bg-light px-2 py-1 rounded border text-secondary cursor-pointer">Ký túc xá</span>
                <span className="bg-light px-2 py-1 rounded border text-secondary cursor-pointer">Sân bóng</span>
              </div>
            </Card>

            <Card className="border-0 shadow-sm p-3 bg-light border-start border-4 border-success">
              <h6 className="fw-bold" style={{ color: "#10393B" }}>
                <i className="bi bi-shield-check me-2 text-success"></i>Đăng tin rõ, trao đổi an toàn
              </h6>
              <ul className="text-muted ps-3 mb-0" style={{ fontSize: "0.8rem" }}>
                <li>Mô tả rõ đặc điểm, địa điểm và thời gian mất.</li>
                <li>Che số thẻ, giấy tờ cá nhân trong ảnh.</li>
                <li>Xác minh thông tin kỹ trước khi nhận lại đồ.</li>
              </ul>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default LostFoundPage;