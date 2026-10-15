/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from "react";
import { Container, Row, Col, Card, Form, Button, Badge, Image, Modal } from "react-bootstrap";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const LostFoundPage = ({ user }) => {
  const primaryColor = "#0C8B72";
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Lấy dữ liệu được truyền từ trang Home sang
  const locationData = useLocation();
  const navState = locationData.state || {};

  // States cho bộ lọc API (Khởi tạo bằng dữ liệu từ Home nếu có)
  const [keyword, setKeyword] = useState(navState.keyword || "");
  const [categoryFilter, setCategoryFilter] = useState("Tất cả danh mục");
  const [locationFilter, setLocationFilter] = useState(navState.location || "Toàn campus");

  // State MỚI: Dành cho 3 nút tab Trạng thái ở trên cùng danh sách bài đăng
  const [activeTab, setActiveTab] = useState("Tất cả");

  // Hàm gọi API lấy dữ liệu bài đăng mất đồ
  const fetchPosts = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/lost-posts", {
        params: {
          keyword: keyword,
          category: categoryFilter === "Tất cả danh mục" ? "" : categoryFilter,
          location: locationFilter === "Toàn campus" ? "" : locationFilter
        }
      });
      setPosts(response.data);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu bài đăng mất đồ:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // Xử lý khi bấm Tìm kiếm (Sidebar)
  const handleSearch = (e) => {
    e.preventDefault();
    fetchPosts();
  };

  // Xử lý khi Đặt lại bộ lọc (Sidebar)
  const handleReset = async () => {
    // Cập nhật lại giao diện bộ lọc về mặc định
    setKeyword("");
    setCategoryFilter("Tất cả danh mục");
    setLocationFilter("Toàn campus");
    setActiveTab("Tất cả"); 
    
    // Ép gọi API tìm kiếm với tham số rỗng NGAY LẬP TỨC
    setLoading(true);
    try {
      const response = await axios.get("/api/lost-posts", {
        params: {
          keyword: "",
          category: "",
          location: ""
        }
      });
      setPosts(response.data);
    } catch (error) {
      console.error("Lỗi khi tải lại dữ liệu:", error);
    } finally {
      setLoading(false);
    }
  };

  // State xử lý form đăng bài mới
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState("Ví & giấy tờ");
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
      location: newLocation || "Chưa xác định",
      date: newTime || "Mới đây",
      category: newCategory,
      likes: 0,
      commentsCount: 0,
      image: imagePreview || null,
      comments: [],
    };

    setPosts([newPostObj, ...posts]);
    setNewTitle("");
    setNewContent("");
    setNewCategory("Ví & giấy tờ");
    setNewLocation("");
    setNewTime("");
    setSelectedImage(null);
    setImagePreview(null);
  };

  // ===== THÊM STATE CHO MODAL =====
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState(null);

  // Hàm xử lý Xóa bài
  const handleDeleteConfirm = () => {
    setPosts(posts.filter(post => post.id !== selectedPostId));
    setShowDeleteModal(false);
  };

  // Hàm xử lý Cập nhật trạng thái "Đã tìm được"
  const handleStatusConfirm = () => {
    setPosts(posts.map(post => 
      post.id === selectedPostId ? { ...post, status: "Đã tìm được", statusVariant: "success" } : post
    ));
    setShowStatusModal(false);
  };

  // BIẾN MỚI: Lọc các bài đăng dựa trên Tab đang chọn (Thêm "Bài của tôi")
  const displayedPosts = posts.filter((post) => {
    if (activeTab === "Tất cả") return true;
    // Giả định "Bạn (Sinh viên)" là dấu hiệu nhận biết bài của chính mình (từ form đăng bài giả lập)
    if (activeTab === "Bài của tôi") return post.author === "Bạn (Sinh viên)"; 
    return post.status === activeTab;
  });

  return (
    <div className="text-start" style={{ backgroundColor: "#F4F7F6", minHeight: "100vh", paddingBottom: "40px" }}>
      
      <style>{`
        .text-primary-custom { color: ${primaryColor}; }
        .bg-primary-custom { background-color: ${primaryColor}; }
        .filter-sidebar .form-label { font-size: 0.85rem; font-weight: 600; color: #495057; }
        .filter-sidebar .form-control, .filter-sidebar .form-select { font-size: 0.9rem; padding: 10px 15px; border-radius: 8px; }
      `}</style>

      <Container className="py-4">
        {/* Breadcrumb & Subtitle */}
        <div className="mb-4">
          <span className="text-muted" style={{ fontSize: "0.85rem" }}>
            Trang chủ &gt; Diễn đàn
          </span>
          <p className="fw-bold mb-1 mt-1" style={{ color: primaryColor, fontSize: "0.85rem" }}>
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
          </div>
        </div>

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

              {/* KIỂM TRA ĐĂNG NHẬP */}
              {!user ? (
                <div className="text-center py-5 bg-light rounded-3 mt-3">
                  <i className="bi bi-lock-fill fs-1 text-secondary opacity-50 mb-3 d-block"></i>
                  <h6 className="fw-bold text-dark mb-2">Vui lòng đăng nhập để đăng tin</h6>
                  <p className="text-secondary mb-4" style={{ fontSize: "0.9rem" }}>
                    Chỉ sinh viên FPT Cần Thơ đã xác thực mới có thể đăng bài tìm đồ.
                  </p>
                  <Button 
                    variant="outline-primary" 
                    className="fw-semibold px-4 rounded-pill"
                    style={{ borderColor: primaryColor, color: primaryColor }} 
                    onClick={() => navigate("/login")} // Đảm bảo bạn đã import useNavigate
                  >
                    <i className="bi bi-box-arrow-in-right me-2"></i> Đăng nhập ngay
                  </Button>
                </div>
              ) : (
                // Nếu đã đăng nhập thì hiện form
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
                      className="shadow-none border-secondary-subtle"
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold text-secondary" style={{ fontSize: "0.85rem" }}>
                      Danh mục món đồ
                    </Form.Label>
                    <Form.Select 
                      value={newCategory} 
                      onChange={(e) => setNewCategory(e.target.value)} 
                      className="shadow-none border-secondary-subtle"
                    >
                      <option value="Ví & giấy tờ">Ví & giấy tờ</option>
                      <option value="Đồ điện tử">Đồ điện tử</option>
                      <option value="Chìa khóa">Chìa khóa</option>
                      <option value="Túi & balo">Túi & balo</option>
                      <option value="Đồ dùng cá nhân">Đồ dùng cá nhân</option>
                    </Form.Select>
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
                      className="shadow-none border-secondary-subtle"
                    />
                  </Form.Group>

                  <Row className="g-3 mb-3">
                    <Col md={6}>
                      <Form.Label className="fw-semibold text-secondary" style={{ fontSize: "0.85rem" }}>
                        Địa điểm mất
                      </Form.Label>
                      <Form.Select value={newLocation} onChange={(e) => setNewLocation(e.target.value)} className="shadow-none border-secondary-subtle">
                        <option value="">Chọn khu vực trong campus</option>
                        <option value="Tòa Alpha">Tòa Alpha</option>
                        <option value="Tòa Beta">Tòa Beta</option>
                        <option value="Tòa Gamma">Tòa Gamma</option>
                        <option value="Giảng đường">Giảng đường</option>
                        <option value="Thư viện">Thư viện</option>
                        <option value="Căn tin">Căn tin</option>
                        <option value="Hầm gửi xe">Hầm gửi xe</option>
                        <option value="Bãi đổ xe ngoài trời">Bãi đổ xe ngoài trời</option>
                        <option value="Sân trường">Sân trường</option>
                        <option value="Sân bóng">Sân bóng</option>
                        <option value="Sân pickleball">Sân pickleball</option>
                        <option value="Nhà võ">Nhà võ</option>
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
                        className="shadow-none border-secondary-subtle"
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
                      className="bg-primary-custom fw-semibold px-4"
                      style={{ borderColor: primaryColor }}
                    >
                      Đăng bài tìm đồ
                    </Button>
                  </div>
                </Form>
              )}
            </Card>

            {/* DANH SÁCH BÀI ĐĂNG CỘNG ĐỒNG */}
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold mb-0" style={{ color: "#10393B" }}>
                Bài đăng từ cộng đồng
              </h5>
              
              {/* ĐÃ CẬP NHẬT: 3 Nút Tab Trạng Thái */}
              <div className="d-flex gap-2">
                <Button 
                  size="sm" 
                  className={`rounded-pill px-3 ${activeTab === "Tất cả" ? "bg-primary-custom text-white" : "bg-light text-dark border"}`} 
                  style={{ borderColor: activeTab === "Tất cả" ? primaryColor : "#dee2e6" }}
                  onClick={() => setActiveTab("Tất cả")}
                >
                  Tất cả
                </Button>
                <Button 
                  size="sm" 
                  className={`rounded-pill px-3 ${activeTab === "Đang tìm đồ" ? "bg-primary-custom text-white" : "bg-light text-dark border"}`} 
                  style={{ borderColor: activeTab === "Đang tìm đồ" ? primaryColor : "#dee2e6" }}
                  onClick={() => setActiveTab("Đang tìm đồ")}
                >
                  Đang tìm đồ
                </Button>
                <Button 
                  size="sm" 
                  className={`rounded-pill px-3 ${activeTab === "Đã tìm được" ? "bg-primary-custom text-white" : "bg-light text-dark border"}`} 
                  style={{ borderColor: activeTab === "Đã tìm được" ? primaryColor : "#dee2e6" }}
                  onClick={() => setActiveTab("Đã tìm được")}
                >
                  Đã tìm được
                </Button>

                <Button 
                  size="sm" 
                  className={`rounded-pill px-3 ${activeTab === "Bài của tôi" ? "bg-primary-custom text-white" : "bg-light text-dark border"}`} 
                  style={{ borderColor: activeTab === "Bài của tôi" ? primaryColor : "#dee2e6" }}
                  onClick={() => setActiveTab("Bài của tôi")}
                >
                  Bài của tôi
                </Button>
              </div>
            </div>

            {/* HIỂN THỊ DANH SÁCH TỪ BIẾN displayedPosts */}
            {loading ? (
               <div className="text-center py-5">Đang tải dữ liệu...</div>
            ) : displayedPosts.length === 0 ? (
               <div className="text-center py-5 text-secondary">
                 <h5>Không tìm thấy bài đăng nào.</h5>
               </div>
            ) : (
              displayedPosts.map((post) => (
                <Card key={post.id} className="shadow-sm p-4 mb-3" style={{ borderRadius: "12px", border: "1px solid #E2E8F0" }}>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div className="d-flex align-items-center gap-2">
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold bg-primary-custom"
                        style={{ width: "40px", height: "40px" }}
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
                    
                    {/* KHU VỰC NÚT TRẠNG THÁI VÀ NÚT XÓA */}
                    <div className="d-flex align-items-center gap-2">
                      <span 
                        onClick={() => {
                          // Chỉ cho phép bấm đổi trạng thái nếu là bài của mình VÀ đang ở trạng thái "Đang tìm đồ"
                          if (post.author === "Bạn (Sinh viên)" && post.status === "Đang tìm đồ") {
                            setSelectedPostId(post.id);
                            setShowStatusModal(true);
                          }
                        }}
                        className={`fw-bold px-2 py-1 rounded ${post.author === "Bạn (Sinh viên)" && post.status === "Đang tìm đồ" ? "shadow-sm" : ""}`} 
                        style={{ 
                          fontSize: "0.8rem", 
                          border: "1px solid",
                          borderColor: post.status === "Đang tìm đồ" ? "#ffc107" : "#198754",
                          color: post.status === "Đang tìm đồ" ? "#b38600" : "#198754",
                          backgroundColor: post.status === "Đang tìm đồ" ? "#fff9e6" : "#e8f5e9",
                          cursor: (post.author === "Bạn (Sinh viên)" && post.status === "Đang tìm đồ") ? "pointer" : "default"
                        }}
                        title={post.author === "Bạn (Sinh viên)" && post.status === "Đang tìm đồ" ? "Bấm để xác nhận đã tìm được" : ""}
                      >
                        {post.status}
                      </span>

                      {/* Hiển thị nút Xóa nếu là bài của mình */}
                      {post.author === "Bạn (Sinh viên)" && (
                        <Button 
                          variant="link" 
                          className="p-0 text-danger ms-2"
                          onClick={() => {
                            setSelectedPostId(post.id);
                            setShowDeleteModal(true);
                          }}
                        >
                          <i className="bi bi-trash3-fill fs-6"></i>
                        </Button>
                      )}
                    </div>
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
                        <span className="bg-white px-2 py-1 rounded" style={{ border: "1px solid #ced4da", color: "#495057" }}>
                          <i className="bi bi-geo-alt me-1"></i> {post.location}
                        </span>
                        <span className="bg-white px-2 py-1 rounded" style={{ border: "1px solid #ced4da", color: "#495057" }}>
                          <i className="bi bi-clock me-1"></i> {post.date}
                        </span>
                        <span className="bg-white px-2 py-1 rounded" style={{ border: "1px solid #ced4da", color: "#495057" }}>
                          <i className="bi bi-tag me-1"></i> {post.category} 
                        </span>
                      </div>
                    </Col>

                    {post.image && (
                      <Col md={4} className="d-flex align-items-center justify-content-end">
                        <Image
                          src={post.image}
                          alt={post.title}
                          rounded
                          className="object-fit-cover"
                          style={{ width: "160px", height: "100px", border: "1px solid #ced4da" }}
                        />
                      </Col>
                    )}
                  </Row>

                  <div className="d-flex gap-4 pt-3 mt-2 border-top text-secondary" style={{ fontSize: "0.85rem" }}>
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

          {/* CỘT PHẢI: BỘ LỌC TÌM KIẾM */}
          <Col lg={4}>
            <Card className="border-0 shadow-sm rounded-4 filter-sidebar sticky-top" style={{ top: "80px" }}>
              <Card.Body className="p-4">
                <h5 className="fw-bold mb-4" style={{ color: "#10393B" }}>Tìm món đồ của bạn</h5>
                <Form onSubmit={handleSearch}>
                  
                  <Form.Group className="mb-4">
                    <Form.Label>Từ khóa</Form.Label>
                    <div className="position-relative">
                      <i className="bi bi-search position-absolute top-50 translate-middle-y text-secondary" style={{ left: "15px" }}></i>
                      <Form.Control 
                        type="text" 
                        placeholder="Tên, màu sắc món đồ..." 
                        style={{ paddingLeft: "40px" }}
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        className="shadow-none border-secondary-subtle"
                      />
                    </div>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Danh mục</Form.Label>
                    <Form.Select 
                      value={categoryFilter} 
                      onChange={(e) => setCategoryFilter(e.target.value)} 
                      className="text-secondary shadow-none border-secondary-subtle"
                    >
                      <option value="Tất cả danh mục">Tất cả danh mục</option>
                      <option value="Ví & giấy tờ">Ví & giấy tờ</option>
                      <option value="Đồ điện tử">Đồ điện tử</option>
                      <option value="Chìa khóa">Chìa khóa</option>
                      <option value="Túi & balo">Túi & balo</option>
                      <option value="Đồ dùng cá nhân">Đồ dùng cá nhân</option>
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Địa điểm bị mất</Form.Label>
                    <Form.Select 
                      value={locationFilter} 
                      onChange={(e) => setLocationFilter(e.target.value)} 
                      className="text-secondary shadow-none border-secondary-subtle"
                    >
                      <option value="Toàn campus">Toàn campus</option>
                      <option value="Tòa Alpha">Tòa Alpha</option>
                      <option value="Tòa Beta">Tòa Beta</option>
                      <option value="Tòa Gamma">Tòa Gamma</option>
                      <option value="Giảng đường">Giảng đường</option>
                      <option value="Thư viện">Thư viện</option>
                      <option value="Căn tin">Căn tin</option>
                      <option value="Hầm gửi xe">Hầm gửi xe</option>
                      <option value="Bãi đổ xe ngoài trời">Bãi đổ xe ngoài trời</option>
                      <option value="Sân trường">Sân trường</option>
                      <option value="Sân bóng">Sân bóng</option>
                      <option value="Sân pickleball">Sân pickleball</option>
                      <option value="Nhà võ">Nhà võ</option>
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label>Thời gian bị mất</Form.Label>
                    <Form.Select className="text-secondary shadow-none border-secondary-subtle">
                      <option>Tất cả thời gian</option>
                      <option>Hôm nay</option>
                      <option>Tuần này</option>
                      <option>Tháng này</option>
                    </Form.Select>
                  </Form.Group>

                  <Button type="submit" className="w-100 fw-bold mb-3 bg-primary-custom" style={{ borderColor: primaryColor, borderRadius: "8px", padding: "10px" }}>
                    <i className="bi bi-search me-2"></i> Tìm kiếm
                  </Button>
                  
                  <div className="text-center">
                    <Button variant="link" onClick={handleReset} className="text-decoration-none text-secondary" style={{ fontSize: "0.9rem" }}>
                      Đặt lại bộ lọc
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>

        </Row>

        {/* ================= MODAL XÓA BÀI ================= */}
      <Modal 
        show={showDeleteModal} 
        onHide={() => setShowDeleteModal(false)} 
        centered 
        contentClassName="border-0 shadow-lg" 
        style={{ borderRadius: "20px", overflow: "hidden" }}
      >
        <Modal.Header closeButton className="border-0 pb-0 mt-3 mx-3">
          <Modal.Title className="fw-bold d-flex align-items-center" style={{ color: "#212529", fontSize: "1.4rem" }}>
            <i className="bi bi-exclamation-triangle-fill me-3" style={{ color: "#212529", fontSize: "1.5rem" }}></i>
            Xóa bài đăng
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-secondary mx-3 pt-3 pb-4" style={{ fontSize: "1.05rem", lineHeight: "1.6" }}>
          Bạn có chắc chắn muốn xóa bài đăng này không? Hành động này không thể hoàn tác.
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0 mb-3 mx-3 d-flex justify-content-end gap-2">
          <Button 
            className="fw-semibold border-0 text-dark" 
            style={{ backgroundColor: "#F4F4F5", borderRadius: "12px", padding: "10px 20px" }}
            onClick={() => setShowDeleteModal(false)}
          >
            Hủy bỏ
          </Button>
          <Button 
            className="fw-semibold text-white border-0" 
            style={{ backgroundColor: "#ae1111", borderRadius: "12px", padding: "10px 20px" }}
            onClick={handleDeleteConfirm}
          >
            Xác nhận xóa
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ================= MODAL XÁC NHẬN TÌM ĐƯỢC ĐỒ ================= */}
      <Modal 
        show={showStatusModal} 
        onHide={() => setShowStatusModal(false)} 
        centered 
        contentClassName="border-0 shadow-lg"
        style={{ borderRadius: "20px", overflow: "hidden" }}
      >
        <Modal.Header closeButton className="border-0 pb-0 mt-3 mx-3">
          <Modal.Title className="fw-bold d-flex align-items-center" style={{ color: "#212529", fontSize: "1.4rem" }}>
            <i className="bi bi-check-circle-fill me-3" style={{ color: "#212529", fontSize: "1.5rem" }}></i>
            Đã tìm được đồ?
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-secondary mx-3 pt-3 pb-4" style={{ fontSize: "1.05rem", lineHeight: "1.6" }}>
          Chúc mừng bạn đã tìm lại được món đồ! Bạn có muốn cập nhật trạng thái bài đăng thành <strong style={{ color: "#212529" }}>"Đã tìm được"</strong> để thông báo cho mọi người không?
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0 mb-3 mx-3 d-flex justify-content-end gap-2">
          <Button 
            className="fw-semibold border-0 text-dark" 
            style={{ backgroundColor: "#F4F4F5", borderRadius: "12px", padding: "10px 20px" }}
            onClick={() => setShowStatusModal(false)}
          >
            Chưa, tôi bấm nhầm
          </Button>
          <Button 
            className="fw-semibold text-white border-0" 
            style={{ backgroundColor: "#0C8B72", borderRadius: "12px", padding: "10px 20px" }}
            onClick={handleStatusConfirm}
          >
            Đã tìm được
          </Button>
        </Modal.Footer>
      </Modal>
      </Container>
    </div>
  );
};

export default LostFoundPage;