import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Button,
  Form,
  Card,
  Badge,
} from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { postImgProps } from "../utils/postImage";

const Home = ({ user }) => {
  const primaryColor = "#1f6dba";
  const navigate = useNavigate();

  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [forumPosts, setForumPosts] = useState([]);

  // ===== STATE CHO TÌM KIẾM TRANG CHỦ =====
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchLocation, setSearchLocation] = useState("");

  // ===== STATE & REF CHO TÍNH NĂNG CUỘN NGANG =====
  const scrollRef = React.useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Gọi API lấy bài diễn đàn (Đồng bộ lọc bỏ các bài đã xóa & cập nhật bài đã sửa)
  useEffect(() => {
    const fetchForumPosts = async () => {
      try {
        const response = await axios.get("/api/home/forum-posts");
        const deletedForumIds =
          JSON.parse(localStorage.getItem("laf_deleted_forum_posts")) || [];
        const editedForumMap =
          JSON.parse(localStorage.getItem("laf_edited_forum_posts")) || {};

        const filteredForum = (response.data || [])
          .filter((p) => !deletedForumIds.includes(p.id))
          .map((p) =>
            editedForumMap[p.id] ? { ...p, ...editedForumMap[p.id] } : p,
          );

        setForumPosts(filteredForum);
      } catch (error) {
        console.error("Lỗi lấy dữ liệu diễn đàn:", error);
      }
    };
    fetchForumPosts();
  }, []);

  // Gọi API lấy tin mới nhất (Đồng bộ lọc bỏ các bài Lost & Found đã xóa)
  useEffect(() => {
    const fetchRecentPosts = async () => {
      try {
        const response = await axios.get("/api/home/recent-posts");
        const deletedLostIds =
          JSON.parse(localStorage.getItem("laf_deleted_lost_ids")) || [];
        const deletedFoundIds =
          JSON.parse(localStorage.getItem("laf_deleted_found_ids")) || [];
        const editedLostMap =
          JSON.parse(localStorage.getItem("laf_edited_lost_posts")) || {};
        const editedFoundMap =
          JSON.parse(localStorage.getItem("laf_edited_found_posts")) || {};

        const filteredRecent = (response.data || [])
          .filter((p) => {
            if (p.type === "lost") return !deletedLostIds.includes(p.id);
            if (p.type === "found") return !deletedFoundIds.includes(p.id);
            return true;
          })
          .map((p) => {
            if (p.type === "lost" && editedLostMap[p.id]) {
              return {
                ...p,
                title: editedLostMap[p.id].title || p.title,
                location: editedLostMap[p.id].location || p.location,
                category: editedLostMap[p.id].category || p.category,
              };
            }
            if (p.type === "found" && editedFoundMap[p.id]) {
              return {
                ...p,
                title: editedFoundMap[p.id].itemName || p.title,
                location: editedFoundMap[p.id].location || p.location,
                category: editedFoundMap[p.id].category || p.category,
              };
            }
            return p;
          });

        setRecentPosts(filteredRecent);
      } catch (error) {
        console.error("Lỗi lấy dữ liệu trang chủ:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRecentPosts();
  }, []);

  const checkScrollPosition = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth - 2);
    }
  };

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    if (!loading && recentPosts.length > 0) {
      checkScrollPosition();
    }
  }, [loading, recentPosts]);

  // ===== HÀM XỬ LÝ TÌM KIẾM =====
  const handleSearchSubmit = () => {
    if (!user) {
      // Nếu chưa đăng nhập thì đá qua login
      navigate("/login");
      return;
    }
    navigate("/lost-found", {
      state: {
        keyword: searchKeyword,
        location: searchLocation || "Toàn campus",
      },
    });
  };

  const handleQuickSearch = (keyword) => {
    if (!user) {
      navigate("/login");
      return;
    }
    navigate("/lost-found", {
      state: {
        keyword: keyword,
        location: "Toàn campus",
      },
    });
  };

  return (
    <div
      style={{
        backgroundColor: "#F9FAFB",
        minHeight: "100vh",
        paddingBottom: "50px",
        textAlign: "left",
      }}
    >
      <style>{`
        .horizontal-scroll-container::-webkit-scrollbar {
          display: none;
        }
        .horizontal-scroll-container {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .text-primary-custom {
            color: ${primaryColor};
        }
        .bg-primary-custom {
            background-color: ${primaryColor};
        }
        .quick-search-badge {
            cursor: pointer;
            transition: all 0.2s;
        }
        .quick-search-badge:hover {
            background-color: ${primaryColor} !important;
            color: white !important;
            border-color: ${primaryColor} !important;
        }
      `}</style>

      <section
        style={{
          backgroundColor: "#eaf3fc",
          paddingTop: "60px",
          paddingBottom: "60px",
        }}
      >
        <Container className="text-start">
          <Row className="align-items-center mb-5">
            {/* Cột Trái: Text & Nút */}
            <Col lg={6} className="mb-5 mb-lg-0">
              <p
                className="fw-bold mb-3 text-primary-custom"
                style={{ fontSize: "0.9rem", letterSpacing: "1px" }}
              >
                <i
                  className="bi bi-circle-fill me-2"
                  style={{ fontSize: "8px" }}
                ></i>
                CAMPUS FPT CẦN THƠ
              </p>
              <h1
                className="fw-bold mb-4"
                style={{
                  color: "#12345a",
                  fontSize: "3.2rem",
                  lineHeight: "1.2",
                }}
              >
                Mất đồ trong campus? <br />
                <span className="text-primary-custom">
                  Cộng đồng FPT CT
                </span>{" "}
                giúp bạn tìm lại.
              </h1>
              <p
                className="text-secondary mb-4"
                style={{
                  fontSize: "1.1rem",
                  lineHeight: "1.6",
                  maxWidth: "90%",
                }}
              >
                Tìm đồ thất lạc trong lớp, ký túc xá, thư viện hay sân trường.
                Đăng tin mất đồ hoặc chia sẻ món đồ bạn nhặt được để kết nối
                nhanh với sinh viên khác trong campus.
              </p>

              <div className="d-flex gap-3 mb-4">
                <Button
                  onClick={() => navigate("/lost-found")}
                  className="border-0 shadow-sm"
                  style={{
                    backgroundColor: primaryColor, // Set trực tiếp màu nền
                    color: "white",
                    borderRadius: "10px",
                    padding: "12px 24px",
                    fontWeight: "600",
                  }}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.backgroundColor = "#1858a0")
                  } // Đổi màu xanh đậm hơn khi hover
                  onMouseOut={(e) =>
                    (e.currentTarget.style.backgroundColor = primaryColor)
                  } // Trả lại màu cũ khi bỏ chuột
                >
                  <i className="bi bi-search me-2"></i> Đăng tin mất đồ
                </Button>
                <Button
                  variant="light"
                  onClick={() => navigate("/found-items")} // Sửa từ /lost-found thành /found-items
                  className="shadow-sm"
                  style={{
                    borderRadius: "10px",
                    padding: "12px 24px",
                    fontWeight: "600",
                    color: "#12345a",
                    border: "1px solid #dee2e6",
                  }}
                >
                  <i className="bi bi-plus-lg me-2"></i> Đăng đồ nhặt được
                </Button>
              </div>

              <div
                className="d-flex align-items-center text-secondary"
                style={{ fontSize: "0.9rem" }}
              >
                <i className="bi bi-shield-check me-2 text-success fs-5"></i>
                Miễn phí đăng tin - Kết nối trong campus - Trao đổi an toàn
              </div>
            </Col>

            {/* Cột Phải: Hình ảnh với Floating Badges */}
            <Col lg={6} className="position-relative text-center text-start">
              <div className="position-relative d-inline-block">
                <img
                  src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&q=80"
                  alt="Campus FPT"
                  className="img-fluid"
                  style={{
                    borderRadius: "20px",
                    maxHeight: "450px",
                    objectFit: "cover",
                    boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                  }}
                />

                <div
                  className="position-absolute bg-white px-3 py-2 shadow-sm d-flex align-items-center gap-2"
                  style={{
                    top: "20px",
                    right: "20px",
                    borderRadius: "30px",
                    fontSize: "0.85rem",
                    fontWeight: "600",
                    color: "#12345a",
                  }}
                >
                  <i className="bi bi-geo-alt text-danger"></i> Campus FPT Cần
                  Thơ
                </div>

                <div
                  className="position-absolute bg-white shadow text-start"
                  style={{
                    bottom: "30px",
                    left: "-30px",
                    borderRadius: "16px",
                    width: "300px",
                    padding: "16px 20px",
                  }}
                >
                  <div className="d-flex align-items-center gap-3">
                    <div
                      className="bg-success bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center text-success flex-shrink-0"
                      style={{ width: "44px", height: "44px" }}
                    >
                      <i className="bi bi-check-lg fs-4"></i>
                    </div>
                    <div className="flex-grow-1" style={{ minWidth: 0 }}>
                      <h6
                        className="mb-1 fw-bold"
                        style={{
                          fontSize: "0.95rem",
                          color: "#12345a",
                          lineHeight: 1.3,
                        }}
                      >
                        Tìm lại đồ, kết nối bạn bè
                      </h6>
                      <p
                        className="mb-0 text-secondary"
                        style={{ fontSize: "0.8rem", lineHeight: 1.4 }}
                      >
                        Cùng giúp nhau trong campus FPT Cần Thơ.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Col>
          </Row>

          {/* SEARCH SECTION */}
          <Card
            className="border-0 shadow-sm p-3"
            style={{ borderRadius: "20px" }}
          >
            <Card.Body>
              <Row className="align-items-center g-3">
                <Col md={5}>
                  <div className="d-flex align-items-center">
                    <i className="bi bi-search text-secondary fs-5 me-3"></i>
                    <div className="flex-grow-1">
                      <label
                        className="fw-bold mb-0"
                        style={{ fontSize: "0.85rem", color: "#12345a" }}
                      >
                        TÌM ĐỒ TRONG CAMPUS
                      </label>
                      <Form.Control
                        type="text"
                        placeholder="Ví, laptop, balo, chìa khóa..."
                        value={searchKeyword}
                        onChange={(e) => setSearchKeyword(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === "Enter" && handleSearchSubmit()
                        }
                        className="border-0 shadow-none px-0"
                        style={{ fontSize: "1rem" }}
                      />
                    </div>
                  </div>
                </Col>

                <Col
                  md={1}
                  className="d-none d-md-flex justify-content-center align-items-center"
                >
                  <div
                    style={{
                      height: "40px",
                      width: "1px",
                      backgroundColor: "#E2E8F0",
                    }}
                  ></div>
                </Col>

                <Col md={4}>
                  <div className="d-flex align-items-center">
                    <i className="bi bi-geo-alt text-secondary fs-5 me-3"></i>
                    <div className="flex-grow-1">
                      <label
                        className="fw-bold mb-0"
                        style={{ fontSize: "0.85rem", color: "#12345a" }}
                      >
                        ĐỊA ĐIỂM
                      </label>
                      <Form.Select
                        value={searchLocation}
                        onChange={(e) => setSearchLocation(e.target.value)}
                        className="border-0 shadow-none px-0 text-secondary"
                        style={{ fontSize: "1rem", cursor: "pointer" }}
                      >
                        <option value="">Toàn campus</option>
                        <option value="Tòa Alpha">Tòa Alpha</option>
                        <option value="Tòa Beta">Tòa Beta</option>
                        <option value="Tòa Gamma">Tòa Gamma</option>
                        <option value="Giảng đường">Giảng đường</option>
                        <option value="Thư viện">Thư viện</option>
                        <option value="Căn tin">Căn tin</option>
                        <option value="Hầm gửi xe">Hầm gửi xe</option>
                        <option value="Bãi đổ xe ngoài trời">
                          Bãi đổ xe ngoài trời
                        </option>
                        <option value="Sân trường">Sân trường</option>
                        <option value="Sân bóng">Sân bóng</option>
                        <option value="Sân pickleball">Sân pickleball</option>
                        <option value="Nhà võ">Nhà võ</option>
                      </Form.Select>
                    </div>
                  </div>
                </Col>

                <Col md={2} className="text-end">
                  <Button
                    onClick={handleSearchSubmit}
                    className="w-100 bg-primary-custom"
                    style={{
                      borderColor: primaryColor,
                      borderRadius: "10px",
                      padding: "12px",
                      fontWeight: "600",
                    }}
                  >
                    <i className="bi bi-search me-2"></i> Tìm
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          <div className="mt-4">
            {/* Hàng trên: Tags tìm kiếm nhanh */}
            <div className="d-flex align-items-center gap-3 mb-4">
              <span style={{ color: "#6c757d", fontSize: "0.95rem" }}>
                Tìm kiếm nhanh:
              </span>
              <div className="d-flex gap-2">
                <Badge
                  pill
                  bg="transparent"
                  text="dark"
                  className="border fw-normal px-3 py-2 quick-search-badge"
                  style={{ borderColor: "#ced4da", fontSize: "0.9rem" }}
                  onClick={() => handleQuickSearch("Ví")}
                >
                  Ví
                </Badge>
                <Badge
                  pill
                  bg="transparent"
                  text="dark"
                  className="border fw-normal px-3 py-2 quick-search-badge"
                  style={{ borderColor: "#ced4da", fontSize: "0.9rem" }}
                  onClick={() => handleQuickSearch("Chìa khóa")}
                >
                  Chìa khóa
                </Badge>
                <Badge
                  pill
                  bg="transparent"
                  text="dark"
                  className="border fw-normal px-3 py-2 quick-search-badge"
                  style={{ borderColor: "#ced4da", fontSize: "0.9rem" }}
                  onClick={() => handleQuickSearch("Thẻ")}
                >
                  Thẻ
                </Badge>
                <Badge
                  pill
                  bg="transparent"
                  text="dark"
                  className="border fw-normal px-3 py-2 quick-search-badge"
                  style={{ borderColor: "#ced4da", fontSize: "0.9rem" }}
                  onClick={() => handleQuickSearch("Balo")}
                >
                  Balo
                </Badge>
                <Badge
                  pill
                  bg="transparent"
                  text="dark"
                  className="border fw-normal px-3 py-2 quick-search-badge"
                  style={{ borderColor: "#ced4da", fontSize: "0.9rem" }}
                  onClick={() => handleQuickSearch("Laptop")}
                >
                  Laptop
                </Badge>
              </div>
            </div>

            <hr
              style={{
                borderTop: "1px solid rgba(0, 0, 0, 0.08)",
                margin: "0 0 25px 0",
              }}
            />

            <Row className="text-dark">
              <Col md={4} className="d-flex align-items-center">
                <i className="bi bi-box-seam fs-4 me-3 text-primary-custom"></i>
                <div>
                  <span className="fw-bold fs-5 me-2">Tìm đồ</span>
                  <span
                    className="text-secondary fw-normal"
                    style={{ fontSize: "0.95rem" }}
                  >
                    theo địa điểm trong campus
                  </span>
                </div>
              </Col>

              <Col
                md={4}
                className="d-flex align-items-center justify-content-center"
              >
                <i className="bi bi-people fs-4 me-3 text-primary-custom"></i>
                <div>
                  <span className="fw-bold fs-5 me-2">Kết nối</span>
                  <span
                    className="text-secondary fw-normal"
                    style={{ fontSize: "0.95rem" }}
                  >
                    sinh viên cùng giúp đỡ
                  </span>
                </div>
              </Col>

              <Col
                md={4}
                className="d-flex align-items-center justify-content-end"
              >
                <i className="bi bi-shield-check fs-4 me-3 text-primary-custom"></i>
                <div>
                  <span className="fw-bold fs-5 me-2">An toàn</span>
                  <span
                    className="text-secondary fw-normal"
                    style={{ fontSize: "0.95rem" }}
                  >
                    xác minh trước khi trao trả
                  </span>
                </div>
              </Col>
            </Row>
          </div>
        </Container>
      </section>

      {/* ================= RECENT POSTS SECTION ================= */}
      <Container className="py-5 mt-4 text-start">
        <div className="d-flex justify-content-between align-items-end mb-4">
          <div>
            <h3 className="fw-bold mb-1" style={{ color: "#12345a" }}>
              Tin mới từ sinh viên trong campus
            </h3>
            <p className="text-secondary mb-0">
              Các tin mất đồ và nhặt được mới nhất trong campus.
            </p>
          </div>
          <Link
            to="/lost-found"
            className="text-decoration-none fw-bold text-primary-custom"
          >
            Xem tất cả tin <i className="bi bi-arrow-right"></i>
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-5">Đang tải tin tức...</div>
        ) : recentPosts.length === 0 ? (
          <div className="text-center py-5">Chưa có tin tức nào.</div>
        ) : (
          <div className="position-relative">
            {canScrollLeft && (
              <Button
                variant="light"
                className="position-absolute top-50 start-0 translate-middle-y rounded-circle shadow d-flex align-items-center justify-content-center p-0 z-1"
                style={{
                  width: "45px",
                  height: "45px",
                  marginLeft: "-15px",
                  backgroundColor: "rgba(255,255,255,0.9)",
                  border: "1px solid #dee2e6",
                }}
                onClick={() => scroll("left")}
              >
                <i className="bi bi-chevron-left text-dark fs-5"></i>
              </Button>
            )}

            <div
              ref={scrollRef}
              onScroll={checkScrollPosition}
              className="d-flex gap-4 pb-3 horizontal-scroll-container"
              style={{
                overflowX: "auto",
                scrollSnapType: "x mandatory",
                scrollBehavior: "smooth",
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
            >
              {recentPosts.map((post) => (
                <div
                  key={`${post.type}-${post.id}`}
                  style={{
                    minWidth: "280px",
                    maxWidth: "280px",
                    scrollSnapAlign: "start",
                  }}
                >
                  <Card
                    onClick={() =>
                      navigate(
                        post.type === "found" ? "/found-items" : "/lost-found",
                        { state: { openPostId: post.id } },
                      )
                    }
                    className="h-100 border-0 shadow-sm overflow-hidden"
                    style={{
                      borderRadius: "15px",
                      cursor: "pointer",
                      transition: "transform 0.2s",
                    }}
                    onMouseOver={(e) =>
                      (e.currentTarget.style.transform = "translateY(-5px)")
                    }
                    onMouseOut={(e) =>
                      (e.currentTarget.style.transform = "translateY(0)")
                    }
                  >
                    <div className="position-relative">
                      <Card.Img
                        variant="top"
                        {...postImgProps({
                          image: post.img,
                          category: post.itemCategory,
                          title: post.title,
                        })}
                        style={{ height: "180px", objectFit: "cover" }}
                      />
                      <Badge
                        bg="light"
                        className="position-absolute top-0 start-0 m-3 px-3 py-2 rounded-pill shadow-sm"
                        style={{
                          color: post.type === "lost" ? "#B42318" : "#0A6B57",
                          fontWeight: 700,
                        }}
                      >
                        {post.type === "lost" ? (
                          <i className="bi bi-search me-1"></i>
                        ) : (
                          <i className="bi bi-check-circle me-1"></i>
                        )}{" "}
                        {post.tag}
                      </Badge>
                    </div>
                    <Card.Body className="d-flex flex-column text-start">
                      <p
                        className="text-secondary mb-1"
                        style={{ fontSize: "0.8rem" }}
                      >
                        {post.category}
                      </p>
                      <Card.Title
                        className="fw-bold fs-6 mb-3 text-truncate"
                        style={{ color: "#12345a" }}
                      >
                        {post.title}
                      </Card.Title>
                      <div className="mt-auto">
                        <p
                          className="text-secondary mb-3 text-truncate"
                          style={{ fontSize: "0.85rem" }}
                        >
                          <i className="bi bi-geo-alt me-2"></i>
                          {post.location}
                        </p>
                        <div
                          className="d-flex justify-content-between align-items-center pt-3 border-top"
                          style={{ fontSize: "0.85rem" }}
                        >
                          <div
                            className="d-flex align-items-center gap-2 fw-medium text-dark text-truncate"
                            style={{ maxWidth: "120px" }}
                          >
                            <div
                              className="bg-light text-secondary rounded-circle d-flex justify-content-center align-items-center flex-shrink-0"
                              style={{
                                width: "25px",
                                height: "25px",
                                fontSize: "10px",
                              }}
                            >
                              {post.user ? post.user.charAt(0) : "?"}
                            </div>
                            <span className="text-truncate">{post.user}</span>
                          </div>
                          <span className="text-muted flex-shrink-0 ms-2">
                            {post.time ? post.time.split(" ")[0] : ""}
                          </span>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </div>
              ))}
            </div>

            {canScrollRight && recentPosts.length > 4 && (
              <Button
                variant="light"
                className="position-absolute top-50 end-0 translate-middle-y rounded-circle shadow d-flex align-items-center justify-content-center p-0 z-1"
                style={{
                  width: "45px",
                  height: "45px",
                  marginRight: "-15px",
                  backgroundColor: "rgba(255,255,255,0.9)",
                  border: "1px solid #dee2e6",
                }}
                onClick={() => scroll("right")}
              >
                <i className="bi bi-chevron-right text-dark fs-5"></i>
              </Button>
            )}
          </div>
        )}
      </Container>

      {/* ================= HOW IT WORKS ================= */}
      <section style={{ backgroundColor: "#FFFFFF", padding: "80px 0" }}>
        <Container className="text-start">
          <div className="d-flex justify-content-between align-items-end mb-5">
            <div>
              <h3 className="fw-bold mb-2" style={{ color: "#12345a" }}>
                Tìm đồ trong campus, chỉ 3 bước
              </h3>
              <p className="text-secondary mb-0">
                Dù bạn mất đồ hay nhặt được đồ, hệ thống đều hỗ trợ kết nối
                nhanh chóng.
              </p>
            </div>
            <Link
              to="/lost-found"
              className="text-decoration-none fw-bold text-primary-custom"
            >
              Bắt đầu tìm đồ <i className="bi bi-arrow-right"></i>
            </Link>
          </div>

          <Row className="g-4">
            <Col md={4}>
              <div className="p-4 bg-light rounded-4 h-100 position-relative">
                <div
                  className="position-absolute top-0 end-0 p-4 fw-bold"
                  style={{
                    fontSize: "3rem",
                    color: "#E2E8F0",
                    lineHeight: "1",
                  }}
                >
                  01
                </div>
                <div
                  className="mb-4 bg-white rounded-circle d-flex align-items-center justify-content-center shadow-sm text-primary-custom"
                  style={{ width: "60px", height: "60px" }}
                >
                  <i className="bi bi-journal-plus fs-3"></i>
                </div>
                <h5 className="fw-bold mb-3">Đăng tin mất đồ/nhặt được</h5>
                <p className="text-secondary">
                  Đăng ảnh, mô tả món đồ và địa điểm trong campus để nhiều sinh
                  viên biết nhanh hơn.
                </p>
              </div>
            </Col>
            <Col md={4}>
              <div className="p-4 bg-light rounded-4 h-100 position-relative">
                <div
                  className="position-absolute top-0 end-0 p-4 fw-bold"
                  style={{
                    fontSize: "3rem",
                    color: "#E2E8F0",
                    lineHeight: "1",
                  }}
                >
                  02
                </div>
                <div
                  className="mb-4 bg-white rounded-circle d-flex align-items-center justify-content-center shadow-sm text-primary-custom"
                  style={{ width: "60px", height: "60px" }}
                >
                  <i className="bi bi-chat-dots fs-3"></i>
                </div>
                <h5 className="fw-bold mb-3">Tìm tin phù hợp & Kết nối</h5>
                <p className="text-secondary">
                  Hệ thống gợi ý tin phù hợp, trao đổi qua tin nhắn và xác minh
                  thông tin món đồ trước khi gặp.
                </p>
              </div>
            </Col>
            <Col md={4}>
              <div className="p-4 bg-light rounded-4 h-100 position-relative">
                <div
                  className="position-absolute top-0 end-0 p-4 fw-bold"
                  style={{
                    fontSize: "3rem",
                    color: "#E2E8F0",
                    lineHeight: "1",
                  }}
                >
                  03
                </div>
                <div
                  className="mb-4 bg-white rounded-circle d-flex align-items-center justify-content-center shadow-sm text-primary-custom"
                  style={{ width: "60px", height: "60px" }}
                >
                  <i className="bi bi-bag-check fs-3"></i>
                </div>
                <h5 className="fw-bold mb-3">Trao trả đồ an toàn</h5>
                <p className="text-secondary">
                  Hẹn gặp ở nơi an toàn trong campus, trao trả đồ và cập nhật
                  trạng thái kết thúc tin.
                </p>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* ================= COMMUNITY SECTION ================= */}
      <Container className="py-5 text-start">
        <div className="d-flex justify-content-between align-items-end mb-4">
          <div>
            <h3 className="fw-bold mb-1" style={{ color: "#12345a" }}>
              Cộng đồng FPT Cần Thơ cùng kết nối
            </h3>
            <p className="text-secondary mb-0">
              Cùng nhau chia sẻ kinh nghiệm, trao đổi thông tin và giữ campus
              trở nên tử tế hơn.
            </p>
          </div>
          <Link
            to="/forum"
            className="text-decoration-none fw-bold text-primary-custom"
          >
            Xem diễn đàn <i className="bi bi-arrow-right"></i>
          </Link>
        </div>

        <Row className="g-4">
          <Col lg={7}>
            <Card className="border-0 shadow-sm overflow-hidden rounded-4 h-100">
              <Row className="g-0 h-100">
                <Col md={5}>
                  <Card.Img
                    src="https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=400&q=80"
                    style={{ height: "100%", objectFit: "cover" }}
                  />
                </Col>
                <Col md={7} style={{ backgroundColor: "#eaf3fc" }}>
                  <Card.Body className="d-flex flex-column justify-content-center h-100 p-4 p-lg-5 text-start">
                    <p
                      className="fw-bold mb-3 text-primary-custom"
                      style={{ fontSize: "0.85rem", letterSpacing: "1px" }}
                    >
                      GÓC NHẮC NHỞ
                    </p>
                    <h4
                      className="fw-bold mb-4"
                      style={{ color: "#12345a", lineHeight: "1.4" }}
                    >
                      Nhặt được đồ? Hãy đăng tin và giữ kín một vài đặc điểm để
                      xác minh đúng chủ trước khi trao trả.
                    </h4>
                    <div className="mt-auto">
                      <p className="mb-0 fw-bold" style={{ color: "#12345a" }}>
                        Cùng xây dựng campus tử tế
                      </p>
                      <p
                        className="text-secondary mb-0"
                        style={{ fontSize: "0.9rem" }}
                      >
                        Trao trả tại nơi công cộng - Bảo vệ thông tin cá nhân
                      </p>
                    </div>
                  </Card.Body>
                </Col>
              </Row>
            </Card>
          </Col>

          <Col lg={5}>
            <Card className="border shadow-sm rounded-4 h-100 p-4 text-start">
              <div className="d-flex align-items-center mb-4">
                <div
                  className="bg-light rounded d-flex align-items-center justify-content-center me-3"
                  style={{ width: "40px", height: "40px" }}
                >
                  <i className="bi bi-chat-square-text text-secondary fs-5"></i>
                </div>
                <h5 className="fw-bold mb-0" style={{ color: "#12345a" }}>
                  Diễn đàn sinh viên
                </h5>
              </div>

              <div className="d-flex flex-column flex-grow-1">
                {forumPosts.length > 0 ? (
                  forumPosts.slice(0, 5).map((post, index) => (
                    <div
                      key={post.id}
                      className={`flex-fill d-flex flex-column justify-content-center py-3 ${index > 0 ? "border-top" : ""}`}
                    >
                      <h6
                        className="fw-bold text-dark mb-2"
                        title={post.title}
                        style={{
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {post.title}
                      </h6>
                      <div
                        className="d-flex gap-3 text-muted"
                        style={{ fontSize: "0.85rem" }}
                      >
                        <span className="text-primary-custom">
                          {post.category}
                        </span>
                        <span>• {post.date}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-secondary py-3">
                    Đang tải chủ đề...
                  </div>
                )}
              </div>

              <div className="mt-auto border-top pt-4">
                <Link
                  to="/forum"
                  className="text-decoration-none fw-bold text-primary-custom"
                >
                  Xem thêm chủ đề <i className="bi bi-arrow-right"></i>
                </Link>
              </div>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Home;
