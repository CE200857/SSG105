/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/exhaustive-deps */
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
  Dropdown,
  Modal,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const ReviewPage = ({ user }) => {
  const primaryColor = "#0C8B72";
  const navigate = useNavigate();

  // State cho danh sách và bộ lọc
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [starFilter, setStarFilter] = useState(0);
  const [sortBy, setSortBy] = useState("newest");
  const [activeTab, setActiveTab] = useState("ALL"); // "ALL" hoặc "MINE"

  // State cho form đăng bài
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [submitMsg, setSubmitMsg] = useState({ type: "", text: "" });
  const [submitting, setSubmitting] = useState(false);

  // ===== STATE CHO MODAL CHI TIẾT, CHỈNH SỬA & XÓA ĐÁNH GIÁ CỦA BẢN THÂN =====
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [editRating, setEditRating] = useState(5);
  const [editHover, setEditHover] = useState(0);
  const [editComment, setEditComment] = useState("");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedReviewId, setSelectedReviewId] = useState(null);

  // Kiểm tra quyền tác giả của bài đánh giá
  const isOwner = (rev) => {
    if (!user || !rev) return false;
    return (
      (rev.authorEmail &&
        user.email &&
        rev.authorEmail.toLowerCase() === user.email.toLowerCase()) ||
      (rev.username &&
        user.username &&
        rev.username.toLowerCase() === user.username.toLowerCase()) ||
      (rev.fullName &&
        user.fullName &&
        rev.fullName.toLowerCase() === user.fullName.toLowerCase())
    );
  };

  const handleViewUserProfile = (fullName, username, e) => {
    if (e) e.stopPropagation();
    const query = new URLSearchParams();
    if (username) query.set("username", username);
    if (fullName) query.set("name", fullName);
    navigate(`/profile?${query.toString()}`);
  };

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/reviews", {
        params: { star: starFilter, sort: sortBy },
      });
      const editedMap =
        JSON.parse(localStorage.getItem("laf_edited_reviews")) || {};
      const deletedIds =
        JSON.parse(localStorage.getItem("laf_deleted_review_ids")) || [];

      const finalReviews = (response.data || [])
        .filter((r) => !deletedIds.includes(r.id))
        .map((r) => (editedMap[r.id] ? { ...r, ...editedMap[r.id] } : r))
        .filter((r) =>
          starFilter > 0 ? Number(r.rating) === Number(starFilter) : true,
        );

      setReviews(finalReviews);
    } catch (error) {
      console.error("Lỗi khi tải đánh giá:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalReviews = reviews.length;
  const averageRating =
    totalReviews > 0
      ? (
          reviews.reduce((sum, rev) => sum + Number(rev.rating), 0) /
          totalReviews
        ).toFixed(1)
      : 0;

  const topRecentReviews = [...reviews].slice(0, 5);

  useEffect(() => {
    fetchReviews();
  }, [starFilter, sortBy]);

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
      params.append("action", "create");
      params.append("email", user.email);
      params.append("rating", rating);
      params.append("comment", comment);

      const response = await axios.post("/api/reviews", params);
      if (response.data.success) {
        setSubmitMsg({ type: "success", text: response.data.message });
        setComment("");
        setRating(5);
        fetchReviews();
      } else {
        setSubmitMsg({ type: "danger", text: response.data.message });
      }
    } catch {
      setSubmitMsg({ type: "danger", text: "Lỗi kết nối máy chủ!" });
    } finally {
      setSubmitting(false);
      setTimeout(() => setSubmitMsg({ type: "", text: "" }), 3000);
    }
  };

  // Mở Modal Chi tiết đánh giá
  const handleOpenDetailModal = (rev) => {
    setSelectedReview(rev);
    setShowDetailModal(true);
  };

  // Mở Modal Chỉnh sửa đánh giá
  const handleOpenEditModal = (rev, e) => {
    if (e) e.stopPropagation();
    setEditingReview(rev);
    setEditRating(rev.rating || 5);
    setEditComment(rev.comment || "");
    setShowEditModal(true);
  };

  // Lưu Chỉnh sửa đánh giá
  const handleSaveEditReview = async (e) => {
    e.preventDefault();
    if (!editingReview || !editComment.trim()) return;

    const updatedFields = {
      rating: Number(editRating),
      comment: editComment.trim(),
    };

    try {
      const params = new URLSearchParams();
      params.append("action", "update");
      params.append("reviewId", editingReview.id);
      params.append("rating", updatedFields.rating);
      params.append("comment", updatedFields.comment);
      await axios.post("/api/reviews", params);
    } catch {
      // Fallback đồng bộ vào localStorage
    }

    const editedMap =
      JSON.parse(localStorage.getItem("laf_edited_reviews")) || {};
    editedMap[editingReview.id] = updatedFields;
    localStorage.setItem("laf_edited_reviews", JSON.stringify(editedMap));

    setReviews(
      reviews.map((r) =>
        r.id === editingReview.id ? { ...r, ...updatedFields } : r,
      ),
    );
    if (selectedReview && selectedReview.id === editingReview.id) {
      setSelectedReview({ ...selectedReview, ...updatedFields });
    }
    setShowEditModal(false);
  };

  // Xác nhận Xóa đánh giá
  const handleDeleteConfirm = async () => {
    try {
      const params = new URLSearchParams();
      params.append("action", "delete");
      params.append("reviewId", selectedReviewId);
      await axios.post("/api/reviews", params);
    } catch {
      // Fallback đồng bộ vào localStorage
    } finally {
      const deletedIds =
        JSON.parse(localStorage.getItem("laf_deleted_review_ids")) || [];
      if (!deletedIds.includes(selectedReviewId)) {
        deletedIds.push(selectedReviewId);
        localStorage.setItem(
          "laf_deleted_review_ids",
          JSON.stringify(deletedIds),
        );
      }
      setReviews(reviews.filter((r) => r.id !== selectedReviewId));
      if (selectedReview && selectedReview.id === selectedReviewId) {
        setShowDetailModal(false);
      }
      setShowDeleteModal(false);
    }
  };

  const displayedReviews = reviews.filter((rev) => {
    if (activeTab === "MINE") return isOwner(rev);
    return true;
  });

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
              style={{ top: "85px", zIndex: 1000 }}
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
                            className={`bi bi-star-fill fs-3 ${
                              starValue <= (hover || rating)
                                ? "text-warning"
                                : "text-secondary opacity-25"
                            }`}
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

          {/* CỘT PHẢI: THỐNG KÊ, BỘ LỌC VÀ DANH SÁCH */}
          <Col lg={8}>
            <Card className="border-0 shadow-sm rounded-4 p-4 mb-4 bg-white text-start overflow-hidden position-relative">
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
                          style={{
                            backgroundColor: "#f8fafc",
                            cursor: "pointer",
                          }}
                          onClick={() => handleOpenDetailModal(rev)}
                        >
                          <div
                            className="rounded-circle d-flex justify-content-center align-items-center text-white fw-bold flex-shrink-0"
                            style={{
                              width: "35px",
                              height: "35px",
                              backgroundColor: primaryColor,
                              fontSize: "0.85rem",
                            }}
                            onClick={(e) =>
                              handleViewUserProfile(
                                rev.fullName,
                                rev.username,
                                e,
                              )
                            }
                          >
                            {rev.fullName.charAt(0)}
                          </div>
                          <div className="flex-grow-1 text-truncate">
                            <div className="d-flex align-items-center gap-2">
                              <span
                                className="fw-bold text-dark hover-primary"
                                style={{ fontSize: "0.9rem" }}
                                onClick={(e) =>
                                  handleViewUserProfile(
                                    rev.fullName,
                                    rev.username,
                                    e,
                                  )
                                }
                              >
                                {rev.fullName}
                              </span>
                              <div
                                className="d-flex gap-1 text-warning"
                                style={{ fontSize: "0.75rem" }}
                              >
                                {[...Array(Number(rev.rating) || 5)].map(
                                  (_, i) => (
                                    <i key={i} className="bi bi-star-fill"></i>
                                  ),
                                )}
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

            {/* Bộ lọc + Nút Tất cả & Đánh giá của tôi */}
            <Card className="border-0 shadow-sm rounded-4 p-3 mb-4 bg-white text-start">
              <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
                {/* 2 Nút chuyển đổi Tất cả / Đánh giá của tôi */}
                <div className="d-flex gap-2">
                  <Button
                    size="sm"
                    className={`rounded-pill px-3 fw-semibold border-0 ${
                      activeTab === "ALL" ? "text-white" : "text-dark bg-light"
                    }`}
                    style={{
                      backgroundColor:
                        activeTab === "ALL" ? primaryColor : "#f1f5f9",
                    }}
                    onClick={() => setActiveTab("ALL")}
                  >
                    Tất cả đánh giá
                  </Button>
                  <Button
                    size="sm"
                    className={`rounded-pill px-3 fw-semibold border-0 ${
                      activeTab === "MINE" ? "text-white" : "text-dark bg-light"
                    }`}
                    style={{
                      backgroundColor:
                        activeTab === "MINE" ? primaryColor : "#f1f5f9",
                    }}
                    onClick={() => {
                      if (!user) {
                        alert("Vui lòng đăng nhập để xem đánh giá của bạn!");
                        navigate("/login");
                        return;
                      }
                      setActiveTab("MINE");
                    }}
                  >
                    Đánh giá của tôi
                  </Button>
                </div>

                {/* Dropdown lọc số sao & sắp xếp */}
                <div className="d-flex flex-wrap align-items-center gap-3">
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
              </div>
            </Card>

            {/* Danh sách đánh giá */}
            {loading ? (
              <div className="text-center py-5">
                <Spinner animation="border" style={{ color: primaryColor }} />
              </div>
            ) : displayedReviews.length === 0 ? (
              <div className="text-center py-5 text-secondary">
                <i className="bi bi-chat-square-text fs-1 opacity-50 mb-3 d-block"></i>
                <h5 className="fw-bold">Chưa có đánh giá nào</h5>
                <p>
                  {activeTab === "MINE"
                    ? "Bạn chưa đăng đánh giá nào."
                    : "Hãy là người đầu tiên để lại nhận xét!"}
                </p>
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {displayedReviews.map((rev) => (
                  <Card
                    key={rev.id}
                    className="border-0 shadow-sm rounded-4 p-4 text-start transition-hover position-relative"
                    style={{ cursor: "pointer" }}
                    onClick={() => handleOpenDetailModal(rev)}
                  >
                    {/* NÚT ... NẰM SÁT GÓC TRÊN BÊN PHẢI CHO BÀI ĐÁNH GIÁ CỦA BẢN THÂN */}
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div
                        className="d-flex gap-3 align-items-center"
                        onClick={(e) =>
                          handleViewUserProfile(rev.fullName, rev.username, e)
                        }
                      >
                        <div
                          className="rounded-circle d-flex justify-content-center align-items-center text-white fw-bold shadow-sm"
                          style={{
                            width: "45px",
                            height: "45px",
                            backgroundColor: primaryColor,
                          }}
                        >
                          {rev.fullName.charAt(0)}
                        </div>
                        <div>
                          <h6 className="fw-bold mb-0 text-dark hover-primary">
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

                      <div
                        className="d-flex align-items-center gap-2 ms-auto"
                        onClick={(e) => e.stopPropagation()}
                      >
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

                        {isOwner(rev) && (
                          <Dropdown align="end">
                            <Dropdown.Toggle
                              variant="light"
                              size="sm"
                              className="rounded-circle border-0 shadow-sm d-flex align-items-center justify-content-center p-0 no-caret ms-1"
                              style={{ width: "32px", height: "32px" }}
                            >
                              <i className="bi bi-three-dots fs-5 text-secondary"></i>
                            </Dropdown.Toggle>
                            <Dropdown.Menu className="shadow border-0 rounded-3">
                              <Dropdown.Item
                                onClick={(e) => handleOpenEditModal(rev, e)}
                                className="py-2"
                              >
                                <i
                                  className="bi bi-pencil-square me-2"
                                  style={{ color: primaryColor }}
                                ></i>
                                Chỉnh sửa đánh giá
                              </Dropdown.Item>
                              <Dropdown.Item
                                onClick={() => {
                                  setSelectedReviewId(rev.id);
                                  setShowDeleteModal(true);
                                }}
                                className="py-2 text-danger"
                              >
                                <i className="bi bi-trash3-fill me-2"></i>
                                Xóa đánh giá
                              </Dropdown.Item>
                            </Dropdown.Menu>
                          </Dropdown>
                        )}
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

        {/* ================= MODAL CHI TIẾT ĐÁNH GIÁ ================= */}
        {selectedReview && (
          <Modal
            show={showDetailModal}
            onHide={() => setShowDetailModal(false)}
            centered
            scrollable
            contentClassName="border-0 shadow-lg rounded-4"
          >
            <Modal.Header closeButton className="border-0 pb-0 mt-2 mx-3">
              <div className="d-flex align-items-center justify-content-between w-100 me-2">
                <div
                  className="d-flex align-items-center gap-3"
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    setShowDetailModal(false);
                    handleViewUserProfile(
                      selectedReview.fullName,
                      selectedReview.username
                    );
                  }}
                >
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                    style={{
                      width: "45px",
                      height: "45px",
                      backgroundColor: primaryColor,
                    }}
                  >
                    {selectedReview.fullName.charAt(0)}
                  </div>
                  <div>
                    <h6 className="fw-bold mb-0 text-dark hover-primary">
                      {selectedReview.fullName}
                    </h6>
                    <small className="text-muted">
                      @{selectedReview.username} • {selectedReview.date}
                    </small>
                  </div>
                </div>

                {isOwner(selectedReview) && (
                  <Dropdown align="end">
                    <Dropdown.Toggle
                      variant="light"
                      size="sm"
                      className="rounded-circle border-0 shadow-sm d-flex align-items-center justify-content-center p-0 no-caret"
                      style={{ width: "32px", height: "32px" }}
                    >
                      <i className="bi bi-three-dots fs-5 text-secondary"></i>
                    </Dropdown.Toggle>
                    <Dropdown.Menu className="shadow border-0 rounded-3">
                      <Dropdown.Item
                        onClick={(e) => handleOpenEditModal(selectedReview, e)}
                        className="py-2"
                      >
                        <i
                          className="bi bi-pencil-square me-2"
                          style={{ color: primaryColor }}
                        ></i>
                        Chỉnh sửa đánh giá
                      </Dropdown.Item>
                      <Dropdown.Item
                        onClick={() => {
                          setSelectedReviewId(selectedReview.id);
                          setShowDeleteModal(true);
                        }}
                        className="py-2 text-danger"
                      >
                        <i className="bi bi-trash3-fill me-2"></i>
                        Xóa đánh giá
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                )}
              </div>
            </Modal.Header>

            <Modal.Body className="mx-3 py-4 text-start">
              <div className="d-flex gap-1 text-warning mb-3 fs-5">
                {[...Array(5)].map((_, i) => (
                  <i
                    key={i}
                    className={
                      i < selectedReview.rating
                        ? "bi bi-star-fill"
                        : "bi bi-star text-secondary opacity-25"
                    }
                  ></i>
                ))}
              </div>
              <p
                className="text-dark mb-0"
                style={{ fontSize: "1.05rem", lineHeight: "1.6" }}
              >
                {selectedReview.comment}
              </p>
            </Modal.Body>
          </Modal>
        )}

        {/* ================= MODAL CHỈNH SỬA ĐÁNH GIÁ ================= */}
        <Modal
          show={showEditModal}
          onHide={() => setShowEditModal(false)}
          centered
          contentClassName="border-0 shadow-lg rounded-4"
        >
          <Modal.Header closeButton className="border-0 pb-0 mt-2 mx-3">
            <Modal.Title className="fw-bold" style={{ color: "#10393B" }}>
              <i
                className="bi bi-pencil-square me-2"
                style={{ color: primaryColor }}
              ></i>
              Chỉnh sửa đánh giá
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="mx-3 py-3 text-start">
            <Form id="editReviewForm" onSubmit={handleSaveEditReview}>
              <div className="mb-3">
                <Form.Label className="fw-semibold text-secondary d-block">
                  Số sao đánh giá
                </Form.Label>
                <div className="d-flex gap-1">
                  {[...Array(5)].map((_, index) => {
                    const starValue = index + 1;
                    return (
                      <i
                        key={starValue}
                        className={`bi bi-star-fill fs-3 ${
                          starValue <= (editHover || editRating)
                            ? "text-warning"
                            : "text-secondary opacity-25"
                        }`}
                        onClick={() => setEditRating(starValue)}
                        onMouseEnter={() => setEditHover(starValue)}
                        onMouseLeave={() => setEditHover(0)}
                        style={{ cursor: "pointer" }}
                      ></i>
                    );
                  })}
                </div>
              </div>
              <Form.Group className="mb-2">
                <Form.Label className="fw-semibold text-secondary">
                  Nội dung nhận xét
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  value={editComment}
                  onChange={(e) => setEditComment(e.target.value)}
                  required
                  className="bg-light border-0 shadow-none"
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer className="border-0 pt-0 mb-2 mx-3">
            <Button variant="light" onClick={() => setShowEditModal(false)}>
              Hủy
            </Button>
            <Button
              type="submit"
              form="editReviewForm"
              className="border-0 text-white fw-semibold px-4"
              style={{ backgroundColor: primaryColor }}
            >
              Lưu thay đổi
            </Button>
          </Modal.Footer>
        </Modal>

        {/* ================= MODAL XÓA ĐÁNH GIÁ ================= */}
        <Modal
          show={showDeleteModal}
          onHide={() => setShowDeleteModal(false)}
          centered
          contentClassName="border-0 shadow-lg rounded-4"
        >
          <Modal.Header closeButton className="border-0 pb-0 mt-3 mx-3">
            <Modal.Title className="fw-bold text-dark">
              <i className="bi bi-exclamation-triangle-fill me-2 text-danger"></i>
              Xóa đánh giá
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="text-secondary mx-3 py-3">
            Bạn có chắc chắn muốn xóa đánh giá này không?
          </Modal.Body>
          <Modal.Footer className="border-0 pt-0 mb-2 mx-3">
            <Button variant="light" onClick={() => setShowDeleteModal(false)}>
              Hủy
            </Button>
            <Button
              className="fw-semibold text-white border-0"
              style={{
                backgroundColor: "#ae1111",
                borderRadius: "12px",
                padding: "10px 20px",
              }}
              onClick={handleDeleteConfirm}
            >
              Xác nhận xóa
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>

      <style>{`
        .transition-hover { transition: transform 0.2s, box-shadow 0.2s; }
        .transition-hover:hover { transform: translateY(-3px); box-shadow: 0 .25rem .75rem rgba(0,0,0,.1)!important; }
        .hover-primary:hover { color: ${primaryColor} !important; }
        .no-caret::after { display: none !important; }
      `}</style>
    </div>
  );
};

export default ReviewPage;
