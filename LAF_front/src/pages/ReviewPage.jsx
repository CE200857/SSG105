/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
  Spinner,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const ReviewPage = ({ user }) => {
  const primaryColor = "#0C8B72";
  const navigate = useNavigate();

  // State cho danh sách và bộ lọc
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [starFilter, setStarFilter] = useState(0); // 0 = Tất cả
  const [sortBy, setSortBy] = useState("newest");

  // State cho form đăng bài
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [submitMsg, setSubmitMsg] = useState({ type: "", text: "" });
  const [submitting, setSubmitting] = useState(false);

  // Tính toán số liệu tổng quan
  const totalReviews = reviews.length;
  const averageRating =
    totalReviews > 0
      ? (
          reviews.reduce((sum, rev) => sum + rev.rating, 0) / totalReviews
        ).toFixed(1)
      : 0;

  // Lấy 5 review mới nhất để hiển thị nổi bật (chỉ lấy khi chưa áp dụng filter để luôn có data)
  const topRecentReviews = [...reviews]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  // Lấy danh sách đánh giá
  const fetchReviews = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/reviews", {
        params: { star: starFilter, sort: sortBy },
      });
      setReviews(response.data);
    } catch (error) {
      console.error("Lỗi khi tải đánh giá:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [starFilter, sortBy]);

  // Gửi đánh giá mới
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate("/login");
      return;
    }
    if (!comment.trim()) return;

    setSubmitting(true);
    try {
      const params = new URLSearchParams();
      params.append("email", user.email);
      params.append("rating", rating);
      params.append("comment", comment);

      const response = await axios.post("/api/reviews", params);
      if (response.data.success) {
        setSubmitMsg({ type: "success", text: response.data.message });
        setComment("");
        setRating(5);
        fetchReviews(); // Load lại danh sách
      } else {
        setSubmitMsg({ type: "danger", text: response.data.message });
      }
    } catch (error) {
      setSubmitMsg({ type: "danger", text: "Lỗi kết nối máy chủ!" });
    } finally {
      setSubmitting(false);
      setTimeout(() => setSubmitMsg({ type: "", text: "" }), 3000);
    }
  };

  return (
    <div
      style={{
        backgroundColor: "#F4F7F6",
        minHeight: "100vh",
        padding: "40px 0",
      }}
    >
      <Container>
        <div className="mb-4 text-start">
          <h3 className="fw-bold mb-1" style={{ color: "#10393B" }}>
            Cộng đồng Đánh giá
          </h3>
          <p className="text-secondary mb-0">
            Chia sẻ trải nghiệm của bạn về hệ thống Lost & Found Campus.
          </p>
        </div>

        <Row className="g-4">
          {/* CỘT TRÁI: FORM ĐĂNG ĐÁNH GIÁ */}
          <Col lg={4}>
            <Card
              className="border-0 shadow-sm rounded-4 p-4 text-start sticky-top"
              style={{ top: "90px" }}
            >
              <h5 className="fw-bold mb-3" style={{ color: "#10393B" }}>
                Viết đánh giá của bạn
              </h5>

              {!user ? (
                <div className="text-center py-4 bg-light rounded-3">
                  <p className="text-secondary mb-3">
                    Vui lòng đăng nhập để đánh giá
                  </p>
                  <Button
                    variant="outline-primary"
                    style={{ borderColor: primaryColor, color: primaryColor }}
                    onClick={() => navigate("/login")}
                  >
                    Đăng nhập ngay
                  </Button>
                </div>
              ) : (
                <Form onSubmit={handleSubmit}>
                  {submitMsg.text && (
                    <Alert variant={submitMsg.type} className="py-2">
                      {submitMsg.text}
                    </Alert>
                  )}

                  <div className="mb-3">
                    <label
                      className="text-secondary fw-semibold mb-2"
                      style={{ fontSize: "0.9rem" }}
                    >
                      Bạn đánh giá bao nhiêu sao?
                    </label>
                    <div className="d-flex gap-1">
                      {[...Array(5)].map((_, index) => {
                        const starValue = index + 1;
                        return (
                          <i
                            key={starValue}
                            className={`bi bi-star-fill fs-3 ${starValue <= (hover || rating) ? "text-warning" : "text-secondary opacity-25"}`}
                            onClick={() => setRating(starValue)}
                            onMouseEnter={() => setHover(starValue)}
                            onMouseLeave={() => setHover(0)}
                            style={{
                              cursor: "pointer",
                              transition: "color 0.2s",
                            }}
                          ></i>
                        );
                      })}
                    </div>
                  </div>

                  <Form.Group className="mb-4">
                    <label
                      className="text-secondary fw-semibold mb-2"
                      style={{ fontSize: "0.9rem" }}
                    >
                      Nhận xét của bạn
                    </label>
                    <Form.Control
                      as="textarea"
                      rows={4}
                      placeholder="Hãy chia sẻ cảm nghĩ của bạn về trang web..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="bg-light border-0 shadow-none p-3 rounded-3"
                      required
                    />
                  </Form.Group>

                  <Button
                    type="submit"
                    className="w-100 fw-bold py-2 border-0 rounded-3 text-white shadow-sm"
                    style={{ backgroundColor: primaryColor }}
                    disabled={submitting}
                  >
                    {submitting ? <Spinner size="sm" /> : "Gửi đánh giá"}
                  </Button>
                </Form>
              )}
            </Card>
          </Col>

          {/* CỘT PHẢI: BỘ LỌC VÀ DANH SÁCH */}
          <Col lg={8}>
            {/* THỐNG KÊ TỔNG QUAN */}
            <Card className="border-0 shadow-sm rounded-4 p-4 mb-4 bg-white text-start overflow-hidden position-relative">
              {/* Trang trí background */}
              <div
                className="position-absolute top-0 end-0 h-100 opacity-10"
                style={{
                  width: "200px",
                  background: `linear-gradient(135deg, transparent, ${primaryColor})`,
                  borderRadius: "50% 0 0 50%",
                }}
              ></div>

              <Row className="align-items-center position-relative z-1">
                <Col md={4} className="text-center border-end border-light">
                  <h6 className="text-secondary fw-semibold mb-2">
                    Điểm trung bình
                  </h6>
                  <h1
                    className="fw-bold mb-0"
                    style={{ fontSize: "3.5rem", color: primaryColor }}
                  >
                    {averageRating}
                  </h1>
                  <div className="d-flex justify-content-center gap-1 text-warning mb-2 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <i
                        key={i}
                        className={
                          i < Math.round(averageRating)
                            ? "bi bi-star-fill fs-5"
                            : "bi bi-star text-secondary opacity-25 fs-5"
                        }
                      ></i>
                    ))}
                  </div>
                  <span className="text-muted" style={{ fontSize: "0.9rem" }}>
                    Dựa trên {totalReviews} đánh giá
                  </span>
                </Col>

                <Col md={8} className="ps-md-4 mt-4 mt-md-0">
                  <h6 className="text-secondary fw-semibold mb-3">
                    5 đánh giá gần đây nhất
                  </h6>
                  {topRecentReviews.length > 0 ? (
                    <div className="d-flex flex-column gap-2">
                      {topRecentReviews.map((rev) => (
                        <div
                          key={`recent-${rev.id}`}
                          className="d-flex align-items-center gap-3 p-2 rounded-3"
                          style={{ backgroundColor: "#f8fafc" }}
                        >
                          <div
                            className="rounded-circle d-flex justify-content-center align-items-center text-white fw-bold flex-shrink-0"
                            style={{
                              width: "35px",
                              height: "35px",
                              backgroundColor: primaryColor,
                              fontSize: "0.85rem",
                            }}
                          >
                            {rev.fullName.charAt(0)}
                          </div>
                          <div className="flex-grow-1 text-truncate">
                            <div className="d-flex align-items-center gap-2">
                              <span
                                className="fw-bold text-dark"
                                style={{ fontSize: "0.9rem" }}
                              >
                                {rev.fullName}
                              </span>
                              <div
                                className="d-flex gap-1 text-warning"
                                style={{ fontSize: "0.75rem" }}
                              >
                                {[...Array(rev.rating)].map((_, i) => (
                                  <i key={i} className="bi bi-star-fill"></i>
                                ))}
                              </div>
                            </div>
                            <p
                              className="text-secondary mb-0 text-truncate"
                              style={{ fontSize: "0.85rem", maxWidth: "90%" }}
                            >
                              {rev.comment}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted" style={{ fontSize: "0.9rem" }}>
                      Chưa có đánh giá nào gần đây.
                    </p>
                  )}
                </Col>
              </Row>
            </Card>
            {/* Bộ lọc */}
            <Card className="border-0 shadow-sm rounded-4 p-3 mb-4 bg-white text-start">
              <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
                <div className="d-flex align-items-center gap-2">
                  <span
                    className="fw-semibold text-secondary"
                    style={{ fontSize: "0.9rem" }}
                  >
                    Lọc theo:
                  </span>
                  <Form.Select
                    value={starFilter}
                    onChange={(e) => setStarFilter(Number(e.target.value))}
                    className="border-0 bg-light shadow-none fw-medium"
                    style={{ width: "auto", cursor: "pointer" }}
                  >
                    <option value={0}>Tất cả số sao</option>
                    <option value={5}>5 Sao</option>
                    <option value={4}>4 Sao</option>
                    <option value={3}>3 Sao</option>
                    <option value={2}>2 Sao</option>
                    <option value={1}>1 Sao</option>
                  </Form.Select>
                </div>

                <div className="d-flex align-items-center gap-2">
                  <span
                    className="fw-semibold text-secondary"
                    style={{ fontSize: "0.9rem" }}
                  >
                    Sắp xếp:
                  </span>
                  <Form.Select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="border-0 bg-light shadow-none fw-medium"
                    style={{ width: "auto", cursor: "pointer" }}
                  >
                    <option value="newest">Mới nhất</option>
                    <option value="oldest">Cũ nhất</option>
                  </Form.Select>
                </div>
              </div>
            </Card>

            {/* Danh sách */}
            {loading ? (
              <div className="text-center py-5">
                <Spinner animation="border" style={{ color: primaryColor }} />
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-5 text-secondary">
                <i className="bi bi-chat-square-text fs-1 opacity-50 mb-3 d-block"></i>
                <h5 className="fw-bold">Chưa có đánh giá nào</h5>
                <p>Hãy là người đầu tiên để lại nhận xét!</p>
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {reviews.map((rev) => (
                  <Card
                    key={rev.id}
                    className="border-0 shadow-sm rounded-4 p-4 text-start"
                  >
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div className="d-flex gap-3 align-items-center">
                        <div
                          className="rounded-circle d-flex justify-content-center align-items-center text-white fw-bold"
                          style={{
                            width: "45px",
                            height: "45px",
                            backgroundColor: primaryColor,
                          }}
                        >
                          {rev.fullName.charAt(0)}
                        </div>
                        <div>
                          <h6 className="fw-bold mb-0 text-dark">
                            {rev.fullName}
                          </h6>
                          <span
                            className="text-muted"
                            style={{ fontSize: "0.8rem" }}
                          >
                            @{rev.username} • {rev.date}
                          </span>
                        </div>
                      </div>

                      <div className="d-flex gap-1 text-warning">
                        {[...Array(5)].map((_, i) => (
                          <i
                            key={i}
                            className={
                              i < rev.rating
                                ? "bi bi-star-fill"
                                : "bi bi-star text-secondary opacity-25"
                            }
                          ></i>
                        ))}
                      </div>
                    </div>

                    <p
                      className="text-secondary mb-0"
                      style={{ fontSize: "0.95rem", lineHeight: "1.6" }}
                    >
                      {rev.comment}
                    </p>
                  </Card>
                ))}
              </div>
            )}
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ReviewPage;
