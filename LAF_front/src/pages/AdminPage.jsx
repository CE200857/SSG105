/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Table,
  Badge,
  Modal,
  Spinner,
  Alert,
  Image,
} from "react-bootstrap";
import axios from "axios";
import { useSearchParams } from "react-router-dom";
const AdminPage = ({ user }) => {
  const primaryColor = "#0C8B72";

  

  // 5 Tab quản lý chính trên Sidebar
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab") || "lost";
  const [activeSection, setActiveSection] = useState(tabParam);

  useEffect(() => {
    if (tabParam && tabParam !== activeSection) {
      setActiveSection(tabParam);
    }
  }, [tabParam]);

  const [stats, setStats] = useState({
    lostCount: 0,
    foundCount: 0,
    forumCount: 0,
    reviewCount: 0,
    studentCount: 0,
  });

  // Danh sách dữ liệu
  const [lostList, setLostList] = useState([]);
  const [foundList, setFoundList] = useState([]);
  const [forumList, setForumList] = useState([]);
  const [reviewList, setReviewList] = useState([]);
  const [userList, setUserList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", text: "" });

  // ===== BỘ LỌC RIÊNG CHO TỪNG TRANG QUẢN LÝ =====
  // 1. Bộ lọc Lost
  const [lostFilter, setLostFilter] = useState({
    keyword: "",
    category: "Tất cả danh mục",
    location: "Toàn campus",
    status: "Tất cả",
  });
  // 2. Bộ lọc Found
  const [foundFilter, setFoundFilter] = useState({
    keyword: "",
    category: "Tất cả danh mục",
    location: "Toàn campus",
    status: "Tất cả",
  });
  // 3. Bộ lọc Forum
  const [forumFilter, setForumFilter] = useState({
    keyword: "",
    category: "Tất cả",
    sort: "newest",
  });
  // 4. Bộ lọc Review
  const [reviewFilter, setReviewFilter] = useState({
    keyword: "",
    star: 0,
    sort: "newest",
  });
  // 5. Bộ lọc Student Account
  const [userFilter, setUserFilter] = useState({
    keyword: "",
    campus: "Tất cả",
    gender: "Tất cả",
    roleId: "2", // Mặc định lọc Student (Role 2), có thể chọn Tất cả (0) hoặc Admin (1)
  });

  // ===== STATE CHO MODAL CRUD (CREATE / VIEW / EDIT / DELETE) =====
  const [showFormModal, setShowFormModal] = useState(false);
  const [formMode, setFormMode] = useState("create"); // 'create' | 'edit'
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);

  const [showViewModal, setShowViewModal] = useState(false);
  const [viewItem, setViewItem] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const showToast = (type, text) => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback({ type: "", text: "" }), 3500);
  };

  // Tải thống kê tổng quan và danh sách User (dùng cho dropdown chọn tác giả khi Admin tạo bài)
  const fetchStatsAndUsers = async () => {
    try {
      const [stRes, usRes] = await Promise.all([
        axios.get("/api/admin", { params: { type: "stats" } }),
        axios.get("/api/admin", {
          params: {
            type: "users",
            keyword: userFilter.keyword,
            campus: userFilter.campus,
            gender: userFilter.gender,
            roleId: userFilter.roleId,
          },
        }),
      ]);
      if (stRes.data) setStats(stRes.data);
      if (Array.isArray(usRes.data)) setUserList(usRes.data);
    } catch (err) {
      console.error("Lỗi tải thống kê Admin:", err);
    }
  };

  // Tải dữ liệu theo từng mục quản lý
  const fetchSectionData = async () => {
    setLoading(true);
    try {
      await fetchStatsAndUsers();

      if (activeSection === "lost") {
        const res = await axios.get("/api/admin", {
          params: {
            type: "lost",
            keyword: lostFilter.keyword,
            category: lostFilter.category,
            location: lostFilter.location,
          },
        });
        setLostList(Array.isArray(res.data) ? res.data : []);
      } else if (activeSection === "found") {
        const res = await axios.get("/api/admin", {
          params: {
            type: "found",
            keyword: foundFilter.keyword,
            category: foundFilter.category,
            location: foundFilter.location,
            sort: "newest",
          },
        });
        setFoundList(Array.isArray(res.data) ? res.data : []);
      } else if (activeSection === "forum") {
        const res = await axios.get("/api/admin", {
          params: {
            type: "forum",
            category: forumFilter.category,
            sort: forumFilter.sort,
          },
        });
        setForumList(Array.isArray(res.data) ? res.data : []);
      } else if (activeSection === "reviews") {
        const res = await axios.get("/api/admin", {
          params: {
            type: "reviews",
            star: reviewFilter.star,
            sort: reviewFilter.sort,
          },
        });
        setReviewList(Array.isArray(res.data) ? res.data : []);
      } else if (activeSection === "users") {
        const res = await axios.get("/api/admin", {
          params: {
            type: "users",
            keyword: userFilter.keyword,
            campus: userFilter.campus,
            gender: userFilter.gender,
            roleId: userFilter.roleId,
          },
        });
        setUserList(Array.isArray(res.data) ? res.data : []);
      }
    } catch (error) {
      console.error("Lỗi tải dữ liệu quản lý:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSectionData();
  }, [activeSection]);

  // Mở Modal Tạo mới (Create)
  const handleOpenCreate = () => {
    setFormMode("create");
    const defaultEmail = user?.email || "datntce200858@fpt.edu.vn";
    if (activeSection === "lost") {
      setFormData({
        email: defaultEmail,
        title: "",
        category: "Ví & giấy tờ",
        location: "Giảng đường",
        time: "",
        status: "Đang tìm đồ",
        content: "",
        imageUrl: "",
      });
    } else if (activeSection === "found") {
      setFormData({
        email: defaultEmail,
        itemName: "",
        category: "Ví & giấy tờ",
        location: "Giảng đường",
        time: "",
        status: "Unclaimed",
        description: "",
        imageUrl: "",
      });
    } else if (activeSection === "forum") {
      setFormData({
        email: defaultEmail,
        title: "",
        category: "Mẹo campus",
        content: "",
      });
    } else if (activeSection === "reviews") {
      setFormData({
        email: defaultEmail,
        rating: 5,
        comment: "",
      });
    } else if (activeSection === "users") {
      setFormData({
        username: "",
        fullName: "",
        email: "",
        phone: "",
        campus: "Cần Thơ",
        gender: "Nam",
        password: "",
        roleId: 2,
      });
    }
    setShowFormModal(true);
  };

  // Mở Modal Chỉnh sửa (Update)
  const handleOpenEdit = (item) => {
    setFormMode("edit");
    if (activeSection === "lost") {
      setFormData({
        id: item.id,
        title: item.title || "",
        category: item.category || "Ví & giấy tờ",
        location: item.location || "Giảng đường",
        status: item.status || "Đang tìm đồ",
        content: item.content || "",
        imageUrl: item.image || "",
      });
    } else if (activeSection === "found") {
      setFormData({
        id: item.id,
        itemName: item.itemName || "",
        category: item.category || "Ví & giấy tờ",
        location: item.location || "Giảng đường",
        status: item.status || "Unclaimed",
        description: item.description || "",
        imageUrl: item.image || "",
      });
    } else if (activeSection === "forum") {
      setFormData({
        id: item.id,
        title: item.title || "",
        category: item.category || "Mẹo campus",
        content: item.content || "",
      });
    } else if (activeSection === "reviews") {
      setFormData({
        id: item.id,
        rating: item.rating || 5,
        comment: item.comment || "",
      });
    } else if (activeSection === "users") {
      setFormData({
        userId: item.userId,
        username: item.username || "",
        fullName: item.fullName || "",
        email: item.email || "",
        phone: item.phone || "",
        campus: item.campus || "Cần Thơ",
        gender: item.gender || "Nam",
        password: "",
        roleId: item.roleId || 2,
      });
    }
    setShowFormModal(true);
  };

  // Xử lý chọn file ảnh từ máy tính chuyển sang Base64
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, imageUrl: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Lưu dữ liệu (Create / Update)
  const handleSaveForm = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const params = new URLSearchParams();
      const entityMap = {
        lost: "lost",
        found: "found",
        forum: "forum",
        reviews: "review",
        users: "user",
      };
      params.append("entity", entityMap[activeSection]);
      params.append("action", formMode === "create" ? "create" : "update");

      Object.keys(formData).forEach((k) => {
        if (formData[k] !== undefined && formData[k] !== null) {
          params.append(k, formData[k]);
        }
      });

      const res = await axios.post("/api/admin", params);
      if (res.data && res.data.success) {
        showToast(
          "success",
          res.data.message ||
            (formMode === "create"
              ? "Thêm mới thành công!"
              : "Cập nhật dữ liệu thành công!")
        );
        setShowFormModal(false);
        fetchSectionData();
      } else {
        showToast("danger", res.data?.message || "Thao tác không thành công!");
      }
    } catch (error) {
      showToast("danger", "Lỗi kết nối máy chủ khi lưu dữ liệu!");
    } finally {
      setSaving(false);
    }
  };

  // Xác nhận Xóa (Delete)
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      const params = new URLSearchParams();
      const entityMap = {
        lost: "lost",
        found: "found",
        forum: "forum",
        reviews: "review",
        users: "user",
      };
      params.append("entity", entityMap[activeSection]);
      params.append("action", "delete");

      if (activeSection === "users") {
        params.append("userId", deleteTarget.userId);
      } else {
        params.append("id", deleteTarget.id);
      }

      const res = await axios.post("/api/admin", params);
      if (res.data && res.data.success) {
        showToast("success", "Đã xóa dữ liệu khỏi hệ thống!");
        setShowDeleteModal(false);
        fetchSectionData();
      } else {
        showToast("danger", res.data?.message || "Không thể xóa mục này!");
      }
    } catch (err) {
      showToast("danger", "Lỗi kết nối khi xóa dữ liệu!");
    }
  };

  // Lọc nhanh trên giao diện kết hợp cùng dữ liệu từ Server
  const filteredLost = lostList.filter((item) => {
    const matchStatus =
      lostFilter.status === "Tất cả" || item.status === lostFilter.status;
    const kw = lostFilter.keyword.toLowerCase();
    const matchKw =
      !kw ||
      (item.title && item.title.toLowerCase().includes(kw)) ||
      (item.author && item.author.toLowerCase().includes(kw)) ||
      (item.content && item.content.toLowerCase().includes(kw));
    return matchStatus && matchKw;
  });

  const filteredFound = foundList.filter((item) => {
    const matchStatus =
      foundFilter.status === "Tất cả" || item.status === foundFilter.status;
    const kw = foundFilter.keyword.toLowerCase();
    const matchKw =
      !kw ||
      (item.itemName && item.itemName.toLowerCase().includes(kw)) ||
      (item.author && item.author.toLowerCase().includes(kw)) ||
      (item.description && item.description.toLowerCase().includes(kw));
    return matchStatus && matchKw;
  });

  const filteredForum = forumList.filter((item) => {
    const kw = forumFilter.keyword.toLowerCase();
    return (
      !kw ||
      (item.title && item.title.toLowerCase().includes(kw)) ||
      (item.fullName && item.fullName.toLowerCase().includes(kw)) ||
      (item.content && item.content.toLowerCase().includes(kw))
    );
  });

  const filteredReviews = reviewList.filter((item) => {
    const kw = reviewFilter.keyword.toLowerCase();
    return (
      !kw ||
      (item.fullName && item.fullName.toLowerCase().includes(kw)) ||
      (item.username && item.username.toLowerCase().includes(kw)) ||
      (item.comment && item.comment.toLowerCase().includes(kw))
    );
  });

  const sidebarItems = [
    {
      key: "lost",
      label: "Quản lý bài đăng Lost",
      icon: "bi-search",
      count: stats.lostCount,
    },
    {
      key: "found",
      label: "Quản lý bài đăng Found",
      icon: "bi-bag-check-fill",
      count: stats.foundCount,
    },
    {
      key: "forum",
      label: "Quản lý bài đăng Forum",
      icon: "bi-chat-square-quote-fill",
      count: stats.forumCount,
    },
    {
      key: "reviews",
      label: "Quản lý bài đăng Review",
      icon: "bi-star-fill",
      count: stats.reviewCount,
    },
    {
      key: "users",
      label: "Quản lý Account Student",
      icon: "bi-people-fill",
      count: stats.studentCount,
    },
  ];

  const sectionMeta = {
    lost: {
      title: "Quản lý bài đăng Đồ thất lạc (Lost Posts)",
      subtitle:
        "Kiểm soát toàn diện: Thêm mới, Xem chi tiết, Chỉnh sửa nội dung/trạng thái và Xóa bài đăng tìm đồ.",
      addBtn: "Thêm bài đăng Lost",
    },
    found: {
      title: "Quản lý bài đăng Đồ nhặt được (Found Posts)",
      subtitle:
        "Kiểm soát toàn diện: Thêm mới, Xem chi tiết, Chỉnh sửa thông tin/trạng thái trao trả và Xóa bài nhặt đồ.",
      addBtn: "Thêm bài đăng Found",
    },
    forum: {
      title: "Quản lý bài viết Diễn đàn (Forum Posts)",
      subtitle:
        "Kiểm duyệt nội dung thảo luận, mẹo vặt, kinh nghiệm campus và quản lý toàn bộ bài đăng cộng đồng.",
      addBtn: "Thêm bài viết Forum",
    },
    reviews: {
      title: "Quản lý Đánh giá hệ thống (Reviews)",
      subtitle:
        "Theo dõi phản hồi của sinh viên, thêm mới, chỉnh sửa hoặc gỡ bỏ các đánh giá vi phạm tiêu chuẩn.",
      addBtn: "Thêm Đánh giá mới",
    },
    users: {
      title: "Quản lý Tài khoản Sinh viên & Phân quyền",
      subtitle:
        "Quản trị hồ sơ sinh viên, tạo tài khoản mới, cập nhật thông tin, đặt lại mật khẩu và phân quyền.",
      addBtn: "Thêm Tài khoản mới",
    },
  };

  return (
    <div
      className="text-start"
      style={{
        backgroundColor: "#F4F7F6",
        minHeight: "calc(100vh - 70px)",
        paddingBottom: "50px",
      }}
    >
      {/* Banner Header đồng bộ thiết kế Student */}
      <div className="bg-white border-bottom py-4 mb-4">
        <Container fluid className="px-4">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div>
              <p
                className="fw-bold mb-1"
                style={{
                  color: primaryColor,
                  fontSize: "0.82rem",
                  letterSpacing: "1px",
                }}
              >
                <i
                  className="bi bi-shield-lock-fill me-2"
                  style={{ fontSize: "12px" }}
                ></i>
                TRUNG TÂM QUẢN TRỊ HỆ THỐNG - CAMPUS FPT CẦN THƠ
              </p>
              <h3 className="fw-bold mb-1" style={{ color: "#10393B" }}>
                {sectionMeta[activeSection].title}
              </h3>
              <p className="text-secondary mb-0" style={{ fontSize: "0.92rem" }}>
                {sectionMeta[activeSection].subtitle}
              </p>
            </div>

            <Button
              className="fw-bold px-4 py-2 border-0 shadow-sm d-flex align-items-center text-white"
              style={{ backgroundColor: primaryColor, borderRadius: "10px" }}
              onClick={handleOpenCreate}
            >
              <i className="bi bi-plus-circle-fill me-2"></i>
              {sectionMeta[activeSection].addBtn}
            </Button>
          </div>
        </Container>
      </div>

      <Container fluid className="px-4">
        {feedback.text && (
          <Alert
            variant={feedback.type}
            className="border-0 shadow-sm rounded-3 mb-3 py-2 fw-medium"
          >
            <i className="bi bi-check2-circle me-2"></i>
            {feedback.text}
          </Alert>
        )}

        <Row className="g-4">

          {/* ================= CỘT PHẢI: THỐNG KÊ, BỘ LỌC RIÊNG & BẢNG DỮ LIỆU ================= */}
          <Col lg={12}>
            {/* 5 Thẻ Thống Kê Nhanh */}
            <Row className="g-3 mb-4">
              {sidebarItems.map((st) => (
                <Col xs={6} md={4} xl key={st.key}>
                  <Card
                    onClick={() => setSearchParams({ tab: st.key })}
                    className="border-0 shadow-sm rounded-4 p-3 h-100 bg-white"
                    style={{
                      cursor: "pointer",
                      borderBottom:
                        activeSection === st.key
                          ? `4px solid ${primaryColor}`
                          : "4px solid transparent",
                    }}
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <small
                          className="text-secondary fw-semibold d-block text-truncate"
                          style={{ fontSize: "0.78rem" }}
                        >
                          {st.label.replace("Quản lý ", "")}
                        </small>
                        <h4
                          className="fw-bold mb-0 mt-1"
                          style={{ color: "#10393B" }}
                        >
                          {st.count}
                        </h4>
                      </div>
                      <div
                        className="rounded-3 d-flex align-items-center justify-content-center"
                        style={{
                          width: "42px",
                          height: "42px",
                          backgroundColor: "#EAF5F3",
                          color: primaryColor,
                        }}
                      >
                        <i className={`bi ${st.icon} fs-5`}></i>
                      </div>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>

            {/* ================= BỘ LỌC RIÊNG CHO TỪNG TRANG QUẢN LÝ ================= */}
            <Card className="border-0 shadow-sm rounded-4 p-4 mb-4 bg-white">
              {/* 1. BỘ LỌC LOST */}
              {activeSection === "lost" && (
                <Form
                  onSubmit={(e) => {
                    e.preventDefault();
                    fetchSectionData();
                  }}
                >
                  <Row className="g-3 align-items-end">
                    <Col md={3}>
                      <Form.Label className="fw-semibold text-secondary small">
                        Từ khóa tìm kiếm
                      </Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Tiêu đề, người đăng..."
                        value={lostFilter.keyword}
                        onChange={(e) =>
                          setLostFilter({
                            ...lostFilter,
                            keyword: e.target.value,
                          })
                        }
                        className="bg-light border-0"
                      />
                    </Col>
                    <Col md={3}>
                      <Form.Label className="fw-semibold text-secondary small">
                        Danh mục
                      </Form.Label>
                      <Form.Select
                        value={lostFilter.category}
                        onChange={(e) =>
                          setLostFilter({
                            ...lostFilter,
                            category: e.target.value,
                          })
                        }
                        className="bg-light border-0"
                      >
                        <option value="Tất cả danh mục">Tất cả danh mục</option>
                        <option value="Ví & giấy tờ">Ví & giấy tờ</option>
                        <option value="Đồ điện tử">Đồ điện tử</option>
                        <option value="Chìa khóa">Chìa khóa</option>
                        <option value="Túi & balo">Túi & balo</option>
                        <option value="Đồ dùng cá nhân">Đồ dùng cá nhân</option>
                      </Form.Select>
                    </Col>
                    <Col md={2}>
                      <Form.Label className="fw-semibold text-secondary small">
                        Địa điểm
                      </Form.Label>
                      <Form.Select
                        value={lostFilter.location}
                        onChange={(e) =>
                          setLostFilter({
                            ...lostFilter,
                            location: e.target.value,
                          })
                        }
                        className="bg-light border-0"
                      >
                        <option value="Toàn campus">Toàn campus</option>
                        <option value="Tòa Alpha">Tòa Alpha</option>
                        <option value="Tòa Beta">Tòa Beta</option>
                        <option value="Giảng đường">Giảng đường</option>
                        <option value="Thư viện">Thư viện</option>
                        <option value="Căn tin">Căn tin</option>
                        <option value="Bãi gửi xe">Bãi gửi xe</option>
                      </Form.Select>
                    </Col>
                    <Col md={2}>
                      <Form.Label className="fw-semibold text-secondary small">
                        Trạng thái
                      </Form.Label>
                      <Form.Select
                        value={lostFilter.status}
                        onChange={(e) =>
                          setLostFilter({
                            ...lostFilter,
                            status: e.target.value,
                          })
                        }
                        className="bg-light border-0"
                      >
                        <option value="Tất cả">Tất cả</option>
                        <option value="Đang tìm đồ">Đang tìm đồ</option>
                        <option value="Đã tìm được">Đã tìm được</option>
                      </Form.Select>
                    </Col>
                    <Col md={2} className="d-flex gap-2">
                      <Button
                        type="submit"
                        className="w-100 border-0 fw-semibold text-white"
                        style={{ backgroundColor: primaryColor }}
                      >
                        <i className="bi bi-funnel-fill me-1"></i> Lọc
                      </Button>
                      <Button
                        variant="light"
                        onClick={() => {
                          setLostFilter({
                            keyword: "",
                            category: "Tất cả danh mục",
                            location: "Toàn campus",
                            status: "Tất cả",
                          });
                          setTimeout(fetchSectionData, 50);
                        }}
                        title="Đặt lại"
                      >
                        <i className="bi bi-arrow-counterclockwise"></i>
                      </Button>
                    </Col>
                  </Row>
                </Form>
              )}

              {/* 2. BỘ LỌC FOUND */}
              {activeSection === "found" && (
                <Form
                  onSubmit={(e) => {
                    e.preventDefault();
                    fetchSectionData();
                  }}
                >
                  <Row className="g-3 align-items-end">
                    <Col md={3}>
                      <Form.Label className="fw-semibold text-secondary small">
                        Từ khóa tìm kiếm
                      </Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Tên đồ vật, người nhặt..."
                        value={foundFilter.keyword}
                        onChange={(e) =>
                          setFoundFilter({
                            ...foundFilter,
                            keyword: e.target.value,
                          })
                        }
                        className="bg-light border-0"
                      />
                    </Col>
                    <Col md={3}>
                      <Form.Label className="fw-semibold text-secondary small">
                        Danh mục
                      </Form.Label>
                      <Form.Select
                        value={foundFilter.category}
                        onChange={(e) =>
                          setFoundFilter({
                            ...foundFilter,
                            category: e.target.value,
                          })
                        }
                        className="bg-light border-0"
                      >
                        <option value="Tất cả danh mục">Tất cả danh mục</option>
                        <option value="Ví & giấy tờ">Ví & giấy tờ</option>
                        <option value="Đồ điện tử">Đồ điện tử</option>
                        <option value="Chìa khóa">Chìa khóa</option>
                        <option value="Túi & balo">Túi & balo</option>
                        <option value="Đồ dùng cá nhân">Đồ dùng cá nhân</option>
                      </Form.Select>
                    </Col>
                    <Col md={2}>
                      <Form.Label className="fw-semibold text-secondary small">
                        Địa điểm nhặt
                      </Form.Label>
                      <Form.Select
                        value={foundFilter.location}
                        onChange={(e) =>
                          setFoundFilter({
                            ...foundFilter,
                            location: e.target.value,
                          })
                        }
                        className="bg-light border-0"
                      >
                        <option value="Toàn campus">Toàn campus</option>
                        <option value="Tòa Alpha">Tòa Alpha</option>
                        <option value="Tòa Beta">Tòa Beta</option>
                        <option value="Giảng đường">Giảng đường</option>
                        <option value="Thư viện">Thư viện</option>
                        <option value="Căn tin">Căn tin</option>
                        <option value="Bãi gửi xe">Bãi gửi xe</option>
                      </Form.Select>
                    </Col>
                    <Col md={2}>
                      <Form.Label className="fw-semibold text-secondary small">
                        Trạng thái
                      </Form.Label>
                      <Form.Select
                        value={foundFilter.status}
                        onChange={(e) =>
                          setFoundFilter({
                            ...foundFilter,
                            status: e.target.value,
                          })
                        }
                        className="bg-light border-0"
                      >
                        <option value="Tất cả">Tất cả</option>
                        <option value="Unclaimed">Đang tìm chủ</option>
                        <option value="Claimed">Đã trao trả</option>
                      </Form.Select>
                    </Col>
                    <Col md={2} className="d-flex gap-2">
                      <Button
                        type="submit"
                        className="w-100 border-0 fw-semibold text-white"
                        style={{ backgroundColor: primaryColor }}
                      >
                        <i className="bi bi-funnel-fill me-1"></i> Lọc
                      </Button>
                      <Button
                        variant="light"
                        onClick={() => {
                          setFoundFilter({
                            keyword: "",
                            category: "Tất cả danh mục",
                            location: "Toàn campus",
                            status: "Tất cả",
                          });
                          setTimeout(fetchSectionData, 50);
                        }}
                      >
                        <i className="bi bi-arrow-counterclockwise"></i>
                      </Button>
                    </Col>
                  </Row>
                </Form>
              )}

              {/* 3. BỘ LỌC FORUM */}
              {activeSection === "forum" && (
                <Form
                  onSubmit={(e) => {
                    e.preventDefault();
                    fetchSectionData();
                  }}
                >
                  <Row className="g-3 align-items-end">
                    <Col md={4}>
                      <Form.Label className="fw-semibold text-secondary small">
                        Tìm kiếm bài viết
                      </Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Tiêu đề, tác giả, nội dung..."
                        value={forumFilter.keyword}
                        onChange={(e) =>
                          setForumFilter({
                            ...forumFilter,
                            keyword: e.target.value,
                          })
                        }
                        className="bg-light border-0"
                      />
                    </Col>
                    <Col md={3}>
                      <Form.Label className="fw-semibold text-secondary small">
                        Chủ đề diễn đàn
                      </Form.Label>
                      <Form.Select
                        value={forumFilter.category}
                        onChange={(e) =>
                          setForumFilter({
                            ...forumFilter,
                            category: e.target.value,
                          })
                        }
                        className="bg-light border-0"
                      >
                        <option value="Tất cả">Tất cả chủ đề</option>
                        <option value="Mẹo campus">Mẹo campus</option>
                        <option value="Kinh nghiệm campus">
                          Kinh nghiệm campus
                        </option>
                        <option value="Hỏi đáp">Hỏi đáp</option>
                        <option value="Khác">Khác</option>
                      </Form.Select>
                    </Col>
                    <Col md={3}>
                      <Form.Label className="fw-semibold text-secondary small">
                        Sắp xếp thời gian
                      </Form.Label>
                      <Form.Select
                        value={forumFilter.sort}
                        onChange={(e) =>
                          setForumFilter({
                            ...forumFilter,
                            sort: e.target.value,
                          })
                        }
                        className="bg-light border-0"
                      >
                        <option value="newest">Mới đăng nhất</option>
                        <option value="oldest">Cũ nhất</option>
                      </Form.Select>
                    </Col>
                    <Col md={2} className="d-flex gap-2">
                      <Button
                        type="submit"
                        className="w-100 border-0 fw-semibold text-white"
                        style={{ backgroundColor: primaryColor }}
                      >
                        <i className="bi bi-funnel-fill me-1"></i> Lọc
                      </Button>
                      <Button
                        variant="light"
                        onClick={() => {
                          setForumFilter({
                            keyword: "",
                            category: "Tất cả",
                            sort: "newest",
                          });
                          setTimeout(fetchSectionData, 50);
                        }}
                      >
                        <i className="bi bi-arrow-counterclockwise"></i>
                      </Button>
                    </Col>
                  </Row>
                </Form>
              )}

              {/* 4. BỘ LỌC REVIEW */}
              {activeSection === "reviews" && (
                <Form
                  onSubmit={(e) => {
                    e.preventDefault();
                    fetchSectionData();
                  }}
                >
                  <Row className="g-3 align-items-end">
                    <Col md={4}>
                      <Form.Label className="fw-semibold text-secondary small">
                        Từ khóa nhận xét / Người đánh giá
                      </Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Nhập tên sinh viên hoặc nội dung..."
                        value={reviewFilter.keyword}
                        onChange={(e) =>
                          setReviewFilter({
                            ...reviewFilter,
                            keyword: e.target.value,
                          })
                        }
                        className="bg-light border-0"
                      />
                    </Col>
                    <Col md={3}>
                      <Form.Label className="fw-semibold text-secondary small">
                        Số sao đánh giá
                      </Form.Label>
                      <Form.Select
                        value={reviewFilter.star}
                        onChange={(e) =>
                          setReviewFilter({
                            ...reviewFilter,
                            star: Number(e.target.value),
                          })
                        }
                        className="bg-light border-0"
                      >
                        <option value={0}>Tất cả số sao</option>
                        <option value={5}>5 Sao</option>
                        <option value={4}>4 Sao</option>
                        <option value={3}>3 Sao</option>
                        <option value={2}>2 Sao</option>
                        <option value={1}>1 Sao</option>
                      </Form.Select>
                    </Col>
                    <Col md={3}>
                      <Form.Label className="fw-semibold text-secondary small">
                        Thứ tự hiển thị
                      </Form.Label>
                      <Form.Select
                        value={reviewFilter.sort}
                        onChange={(e) =>
                          setReviewFilter({
                            ...reviewFilter,
                            sort: e.target.value,
                          })
                        }
                        className="bg-light border-0"
                      >
                        <option value="newest">Mới nhất</option>
                        <option value="oldest">Cũ nhất</option>
                      </Form.Select>
                    </Col>
                    <Col md={2} className="d-flex gap-2">
                      <Button
                        type="submit"
                        className="w-100 border-0 fw-semibold text-white"
                        style={{ backgroundColor: primaryColor }}
                      >
                        <i className="bi bi-funnel-fill me-1"></i> Lọc
                      </Button>
                      <Button
                        variant="light"
                        onClick={() => {
                          setReviewFilter({
                            keyword: "",
                            star: 0,
                            sort: "newest",
                          });
                          setTimeout(fetchSectionData, 50);
                        }}
                      >
                        <i className="bi bi-arrow-counterclockwise"></i>
                      </Button>
                    </Col>
                  </Row>
                </Form>
              )}

              {/* 5. BỘ LỌC TÀI KHOẢN SINH VIÊN */}
              {activeSection === "users" && (
                <Form
                  onSubmit={(e) => {
                    e.preventDefault();
                    fetchSectionData();
                  }}
                >
                  <Row className="g-3 align-items-end">
                    <Col md={4}>
                      <Form.Label className="fw-semibold text-secondary small">
                        Tìm kiếm tài khoản
                      </Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Tên, username, email, SĐT..."
                        value={userFilter.keyword}
                        onChange={(e) =>
                          setUserFilter({
                            ...userFilter,
                            keyword: e.target.value,
                          })
                        }
                        className="bg-light border-0"
                      />
                    </Col>
                    <Col md={2}>
                      <Form.Label className="fw-semibold text-secondary small">
                        Cơ sở (Campus)
                      </Form.Label>
                      <Form.Select
                        value={userFilter.campus}
                        onChange={(e) =>
                          setUserFilter({
                            ...userFilter,
                            campus: e.target.value,
                          })
                        }
                        className="bg-light border-0"
                      >
                        <option value="Tất cả">Tất cả cơ sở</option>
                        <option value="Cần Thơ">Cần Thơ</option>
                        <option value="Hồ Chí Minh">Hồ Chí Minh</option>
                        <option value="Hà Nội">Hà Nội</option>
                        <option value="Đà Nẵng">Đà Nẵng</option>
                        <option value="Quy Nhơn">Quy Nhơn</option>
                      </Form.Select>
                    </Col>
                    <Col md={2}>
                      <Form.Label className="fw-semibold text-secondary small">
                        Giới tính
                      </Form.Label>
                      <Form.Select
                        value={userFilter.gender}
                        onChange={(e) =>
                          setUserFilter({
                            ...userFilter,
                            gender: e.target.value,
                          })
                        }
                        className="bg-light border-0"
                      >
                        <option value="Tất cả">Tất cả</option>
                        <option value="Nam">Nam</option>
                        <option value="Nữ">Nữ</option>
                        <option value="Khác">Khác</option>
                      </Form.Select>
                    </Col>
                    <Col md={2}>
                      <Form.Label className="fw-semibold text-secondary small">
                        Vai trò
                      </Form.Label>
                      <Form.Select
                        value={userFilter.roleId}
                        onChange={(e) =>
                          setUserFilter({
                            ...userFilter,
                            roleId: e.target.value,
                          })
                        }
                        className="bg-light border-0"
                      >
                        <option value="2">Student (Sinh viên)</option>
                        <option value="0">Tất cả tài khoản</option>
                        <option value="1">Admin (Quản trị)</option>
                      </Form.Select>
                    </Col>
                    <Col md={2} className="d-flex gap-2">
                      <Button
                        type="submit"
                        className="w-100 border-0 fw-semibold text-white"
                        style={{ backgroundColor: primaryColor }}
                      >
                        <i className="bi bi-funnel-fill me-1"></i> Lọc
                      </Button>
                      <Button
                        variant="light"
                        onClick={() => {
                          setUserFilter({
                            keyword: "",
                            campus: "Tất cả",
                            gender: "Tất cả",
                            roleId: "2",
                          });
                          setTimeout(fetchSectionData, 50);
                        }}
                      >
                        <i className="bi bi-arrow-counterclockwise"></i>
                      </Button>
                    </Col>
                  </Row>
                </Form>
              )}
            </Card>

            {/* ================= BẢNG DỮ LIỆU QUẢN TRỊ ================= */}
            <Card className="border-0 shadow-sm rounded-4 bg-white overflow-hidden">
              {loading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" style={{ color: primaryColor }} />
                </div>
              ) : (
                <div className="table-responsive">
                  {/* 1. BẢNG QUẢN LÝ LOST */}
                  {activeSection === "lost" && (
                    <Table hover className="align-middle mb-0">
                      <thead>
                        <tr>
                          <th
                            className="ps-4 py-3"
                            style={{ backgroundColor: "#10393B", color: "#ffffff", fontSize: "0.8rem" }}
                          >
                            MÃ BÀI
                          </th>
                          <th
                            className="py-3"
                            style={{ backgroundColor: "#10393B", color: "#ffffff", fontSize: "0.8rem" }}
                          >
                            BÀI ĐĂNG TÌM ĐỒ
                          </th>
                          <th
                            className="py-3"
                            style={{ backgroundColor: "#10393B", color: "#ffffff", fontSize: "0.8rem" }}
                          >
                            DANH MỤC
                          </th>
                          <th
                            className="py-3"
                            style={{ backgroundColor: "#10393B", color: "#ffffff", fontSize: "0.8rem" }}
                          >
                            ĐỊA ĐIỂM MẤT
                          </th>
                          <th
                            className="py-3"
                            style={{ backgroundColor: "#10393B", color: "#ffffff", fontSize: "0.8rem" }}
                          >
                            NGƯỜI ĐĂNG & NGÀY
                          </th>
                          <th
                            className="py-3"
                            style={{ backgroundColor: "#10393B", color: "#ffffff", fontSize: "0.8rem" }}
                          >
                            TRẠNG THÁI
                          </th>
                          <th
                            className="text-end pe-4 py-3"
                            style={{ backgroundColor: "#10393B", color: "#ffffff", fontSize: "0.8rem" }}
                          >
                            THAO TÁC CRUD
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredLost.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="text-center py-4 text-muted">
                              Không có bài đăng Lost nào khớp với bộ lọc.
                            </td>
                          </tr>
                        ) : (
                          filteredLost.map((item) => {
                            const isFinding = item.status === "Đang tìm đồ";
                            return (
                              <tr key={item.id}>
                                <td className="ps-4 fw-bold text-secondary">
                                  #{item.id}
                                </td>
                                <td style={{ maxWidth: "260px" }}>
                                  <div className="fw-bold text-dark text-truncate">
                                    {item.title}
                                  </div>
                                  <small className="text-muted text-truncate d-block">
                                    {item.content}
                                  </small>
                                </td>
                                <td>
                                  <span
                                    className="px-3 py-1 rounded-pill fw-semibold d-inline-block"
                                    style={{
                                      backgroundColor: "#F1F5F9",
                                      color: "#334155",
                                      border: "1px solid #CBD5E1",
                                      fontSize: "0.8rem",
                                    }}
                                  >
                                    {item.category}
                                  </span>
                                </td>
                                <td className="fw-medium text-dark">{item.location}</td>
                                <td>
                                  <div className="fw-semibold text-dark">
                                    {item.author}
                                  </div>
                                  <small className="text-muted">{item.date}</small>
                                </td>
                                <td>
                                  <span
                                    className="px-3 py-1 rounded-pill fw-bold d-inline-block"
                                    style={{
                                      fontSize: "0.8rem",
                                      backgroundColor: isFinding ? "#FEF3C7" : "#D1FAE5",
                                      color: isFinding ? "#B45309" : "#065F46",
                                      border: isFinding ? "1px solid #F59E0B" : "1px solid #10B981",
                                    }}
                                  >
                                    {isFinding ? "Đang tìm đồ" : "Đã tìm được"}
                                  </span>
                                </td>
                                <td className="text-end pe-4">
                                  <div className="d-flex justify-content-end gap-2">
                                    <Button
                                      size="sm"
                                      variant="light"
                                      onClick={() => {
                                        setViewItem(item);
                                        setShowViewModal(true);
                                      }}
                                      title="Xem chi tiết"
                                    >
                                      <i className="bi bi-eye-fill text-secondary"></i>
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="light"
                                      onClick={() => handleOpenEdit(item)}
                                      title="Chỉnh sửa"
                                    >
                                      <i
                                        className="bi bi-pencil-square"
                                        style={{ color: primaryColor }}
                                      ></i>
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="light"
                                      onClick={() => {
                                        setDeleteTarget(item);
                                        setShowDeleteModal(true);
                                      }}
                                      title="Xóa"
                                    >
                                      <i className="bi bi-trash3-fill text-danger"></i>
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </Table>
                  )}

                  {/* 2. BẢNG QUẢN LÝ FOUND */}
                  {activeSection === "found" && (
                    <Table hover className="align-middle mb-0">
                      <thead>
                        <tr>
                          <th
                            className="ps-4 py-3"
                            style={{ backgroundColor: "#10393B", color: "#ffffff", fontSize: "0.8rem" }}
                          >
                            MÃ BÀI
                          </th>
                          <th
                            className="py-3"
                            style={{ backgroundColor: "#10393B", color: "#ffffff", fontSize: "0.8rem" }}
                          >
                            MÓN ĐỒ NHẶT ĐƯỢC
                          </th>
                          <th
                            className="py-3"
                            style={{ backgroundColor: "#10393B", color: "#ffffff", fontSize: "0.8rem" }}
                          >
                            DANH MỤC
                          </th>
                          <th
                            className="py-3"
                            style={{ backgroundColor: "#10393B", color: "#ffffff", fontSize: "0.8rem" }}
                          >
                            ĐỊA ĐIỂM NHẶT
                          </th>
                          <th
                            className="py-3"
                            style={{ backgroundColor: "#10393B", color: "#ffffff", fontSize: "0.8rem" }}
                          >
                            NGƯỜI NHẶT & THỜI GIAN
                          </th>
                          <th
                            className="py-3"
                            style={{ backgroundColor: "#10393B", color: "#ffffff", fontSize: "0.8rem" }}
                          >
                            TRẠNG THÁI
                          </th>
                          <th
                            className="text-end pe-4 py-3"
                            style={{ backgroundColor: "#10393B", color: "#ffffff", fontSize: "0.8rem" }}
                          >
                            THAO TÁC CRUD
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredFound.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="text-center py-4 text-muted">
                              Không có bài đăng Found nào khớp với bộ lọc.
                            </td>
                          </tr>
                        ) : (
                          filteredFound.map((item) => {
                            const isUnclaimed = item.status === "Unclaimed";
                            return (
                              <tr key={item.id}>
                                <td className="ps-4 fw-bold text-secondary">
                                  #{item.id}
                                </td>
                                <td style={{ maxWidth: "260px" }}>
                                  <div className="d-flex align-items-center gap-2">
                                    {item.image && (
                                      <Image
                                        src={item.image}
                                        rounded
                                        style={{
                                          width: "42px",
                                          height: "42px",
                                          objectFit: "cover",
                                        }}
                                      />
                                    )}
                                    <div className="text-truncate">
                                      <div className="fw-bold text-dark text-truncate">
                                        {item.itemName}
                                      </div>
                                      <small className="text-muted text-truncate d-block">
                                        {item.description}
                                      </small>
                                    </div>
                                  </div>
                                </td>
                                <td>
                                  <span
                                    className="px-3 py-1 rounded-pill fw-semibold d-inline-block"
                                    style={{
                                      backgroundColor: "#F1F5F9",
                                      color: "#334155",
                                      border: "1px solid #CBD5E1",
                                      fontSize: "0.8rem",
                                    }}
                                  >
                                    {item.category}
                                  </span>
                                </td>
                                <td className="fw-medium text-dark">{item.location}</td>
                                <td>
                                  <div className="fw-semibold text-dark">
                                    {item.author}
                                  </div>
                                  <small className="text-muted">{item.time}</small>
                                </td>
                                <td>
                                  <span
                                    className="px-3 py-1 rounded-pill fw-bold d-inline-block"
                                    style={{
                                      fontSize: "0.8rem",
                                      backgroundColor: isUnclaimed ? "#FEF3C7" : "#D1FAE5",
                                      color: isUnclaimed ? "#B45309" : "#065F46",
                                      border: isUnclaimed ? "1px solid #F59E0B" : "1px solid #10B981",
                                    }}
                                  >
                                    {isUnclaimed ? "Đang tìm chủ" : "Đã trao trả"}
                                  </span>
                                </td>
                                <td className="text-end pe-4">
                                  <div className="d-flex justify-content-end gap-2">
                                    <Button
                                      size="sm"
                                      variant="light"
                                      onClick={() => {
                                        setViewItem(item);
                                        setShowViewModal(true);
                                      }}
                                    >
                                      <i className="bi bi-eye-fill text-secondary"></i>
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="light"
                                      onClick={() => handleOpenEdit(item)}
                                    >
                                      <i
                                        className="bi bi-pencil-square"
                                        style={{ color: primaryColor }}
                                      ></i>
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="light"
                                      onClick={() => {
                                        setDeleteTarget(item);
                                        setShowDeleteModal(true);
                                      }}
                                    >
                                      <i className="bi bi-trash3-fill text-danger"></i>
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </Table>
                  )}

                  {/* 3. BẢNG QUẢN LÝ FORUM */}
                  {activeSection === "forum" && (
                    <Table hover className="align-middle mb-0">
                      <thead>
                        <tr>
                          <th
                            className="ps-4 py-3"
                            style={{ backgroundColor: "#10393B", color: "#ffffff", fontSize: "0.8rem" }}
                          >
                            MÃ BÀI
                          </th>
                          <th
                            className="py-3"
                            style={{ backgroundColor: "#10393B", color: "#ffffff", fontSize: "0.8rem" }}
                          >
                            TIÊU ĐỀ & NỘI DUNG
                          </th>
                          <th
                            className="py-3"
                            style={{ backgroundColor: "#10393B", color: "#ffffff", fontSize: "0.8rem" }}
                          >
                            CHỦ ĐỀ
                          </th>
                          <th
                            className="py-3"
                            style={{ backgroundColor: "#10393B", color: "#ffffff", fontSize: "0.8rem" }}
                          >
                            TÁC GIẢ & NGÀY ĐĂNG
                          </th>
                          <th
                            className="py-3"
                            style={{ backgroundColor: "#10393B", color: "#ffffff", fontSize: "0.8rem" }}
                          >
                            TƯƠNG TÁC
                          </th>
                          <th
                            className="py-3"
                            style={{ backgroundColor: "#10393B", color: "#ffffff", fontSize: "0.8rem" }}
                          >
                            TRẠNG THÁI
                          </th>
                          <th
                            className="text-end pe-4 py-3"
                            style={{ backgroundColor: "#10393B", color: "#ffffff", fontSize: "0.8rem" }}
                          >
                            THAO TÁC CRUD
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredForum.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="text-center py-4 text-muted">
                              Không có bài viết diễn đàn nào khớp với bộ lọc.
                            </td>
                          </tr>
                        ) : (
                          filteredForum.map((item) => (
                            <tr key={item.id}>
                              <td className="ps-4 fw-bold text-secondary">
                                #{item.id}
                              </td>
                              <td style={{ maxWidth: "280px" }}>
                                <div className="fw-bold text-dark text-truncate">
                                  {item.title}
                                </div>
                                <small className="text-muted text-truncate d-block">
                                  {item.content}
                                </small>
                              </td>
                              <td>
                                <span
                                  className="px-3 py-1 rounded-pill fw-semibold d-inline-block"
                                  style={{
                                    backgroundColor: "#E0F2FE",
                                    color: "#0369A1",
                                    border: "1px solid #7DD3FC",
                                    fontSize: "0.8rem",
                                  }}
                                >
                                  {item.category}
                                </span>
                              </td>
                              <td>
                                <div className="fw-semibold text-dark">
                                  {item.fullName}
                                </div>
                                <small className="text-muted">
                                  @{item.username} • {item.date}
                                </small>
                              </td>
                              <td>
                                <small className="text-secondary fw-medium">
                                  <i className="bi bi-hand-thumbs-up me-1"></i>
                                  {item.likes || 0} •{" "}
                                  <i className="bi bi-chat-dots ms-1 me-1"></i>
                                  {(item.comments || []).length}
                                </small>
                              </td>
                              <td>
                                <span
                                  className="px-3 py-1 rounded-pill fw-bold d-inline-block"
                                  style={{
                                    fontSize: "0.8rem",
                                    backgroundColor: "#D1FAE5",
                                    color: "#065F46",
                                    border: "1px solid #10B981",
                                  }}
                                >
                                  Đang hiển thị
                                </span>
                              </td>
                              <td className="text-end pe-4">
                                <div className="d-flex justify-content-end gap-2">
                                  <Button
                                    size="sm"
                                    variant="light"
                                    onClick={() => {
                                      setViewItem(item);
                                      setShowViewModal(true);
                                    }}
                                  >
                                    <i className="bi bi-eye-fill text-secondary"></i>
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="light"
                                    onClick={() => handleOpenEdit(item)}
                                  >
                                    <i
                                      className="bi bi-pencil-square"
                                      style={{ color: primaryColor }}
                                    ></i>
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="light"
                                    onClick={() => {
                                      setDeleteTarget(item);
                                      setShowDeleteModal(true);
                                    }}
                                  >
                                    <i className="bi bi-trash3-fill text-danger"></i>
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </Table>
                  )}

                  {/* 4. BẢNG QUẢN LÝ REVIEW */}
                  {activeSection === "reviews" && (
                    <Table hover className="align-middle mb-0">
                      <thead>
                        <tr>
                          <th
                            className="ps-4 py-3"
                            style={{ backgroundColor: "#10393B", color: "#ffffff", fontSize: "0.8rem" }}
                          >
                            MÃ ĐG
                          </th>
                          <th
                            className="py-3"
                            style={{ backgroundColor: "#10393B", color: "#ffffff", fontSize: "0.8rem" }}
                          >
                            NGƯỜI ĐÁNH GIÁ
                          </th>
                          <th
                            className="py-3"
                            style={{ backgroundColor: "#10393B", color: "#ffffff", fontSize: "0.8rem" }}
                          >
                            SỐ SAO
                          </th>
                          <th
                            className="py-3"
                            style={{ backgroundColor: "#10393B", color: "#ffffff", fontSize: "0.8rem" }}
                          >
                            NỘI DUNG NHẬN XÉT
                          </th>
                          <th
                            className="py-3"
                            style={{ backgroundColor: "#10393B", color: "#ffffff", fontSize: "0.8rem" }}
                          >
                            NGÀY ĐĂNG
                          </th>
                          <th
                            className="py-3"
                            style={{ backgroundColor: "#10393B", color: "#ffffff", fontSize: "0.8rem" }}
                          >
                            TRẠNG THÁI
                          </th>
                          <th
                            className="text-end pe-4 py-3"
                            style={{ backgroundColor: "#10393B", color: "#ffffff", fontSize: "0.8rem" }}
                          >
                            THAO TÁC CRUD
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredReviews.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="text-center py-4 text-muted">
                              Không có đánh giá nào khớp với bộ lọc.
                            </td>
                          </tr>
                        ) : (
                          filteredReviews.map((item) => (
                            <tr key={item.id}>
                              <td className="ps-4 fw-bold text-secondary">
                                #{item.id}
                              </td>
                              <td>
                                <div className="fw-bold text-dark">
                                  {item.fullName}
                                </div>
                                <small className="text-muted">
                                  @{item.username}
                                </small>
                              </td>
                              <td>
                                <div className="text-warning">
                                  {[...Array(Number(item.rating) || 5)].map(
                                    (_, idx) => (
                                      <i
                                        key={idx}
                                        className="bi bi-star-fill me-1"
                                      ></i>
                                    )
                                  )}
                                </div>
                              </td>
                              <td style={{ maxWidth: "300px" }}>
                                <span className="text-secondary">
                                  {item.comment}
                                </span>
                              </td>
                              <td>
                                <small className="text-muted">{item.date}</small>
                              </td>
                              <td>
                                <span
                                  className="px-3 py-1 rounded-pill fw-bold d-inline-block"
                                  style={{
                                    fontSize: "0.8rem",
                                    backgroundColor:
                                      Number(item.rating) >= 4 ? "#D1FAE5" : "#FEF3C7",
                                    color:
                                      Number(item.rating) >= 4 ? "#065F46" : "#B45309",
                                    border:
                                      Number(item.rating) >= 4
                                        ? "1px solid #10B981"
                                        : "1px solid #F59E0B",
                                  }}
                                >
                                  {Number(item.rating) >= 4 ? "Tích cực" : "Cần chú ý"}
                                </span>
                              </td>
                              <td className="text-end pe-4">
                                <div className="d-flex justify-content-end gap-2">
                                  <Button
                                    size="sm"
                                    variant="light"
                                    onClick={() => {
                                      setViewItem(item);
                                      setShowViewModal(true);
                                    }}
                                  >
                                    <i className="bi bi-eye-fill text-secondary"></i>
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="light"
                                    onClick={() => handleOpenEdit(item)}
                                  >
                                    <i
                                      className="bi bi-pencil-square"
                                      style={{ color: primaryColor }}
                                    ></i>
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="light"
                                    onClick={() => {
                                      setDeleteTarget(item);
                                      setShowDeleteModal(true);
                                    }}
                                  >
                                    <i className="bi bi-trash3-fill text-danger"></i>
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </Table>
                  )}

                  {/* 5. BẢNG QUẢN LÝ ACCOUNT STUDENT */}
                  {activeSection === "users" && (
                    <Table hover className="align-middle mb-0">
                      <thead>
                        <tr>
                          <th
                            className="ps-4 py-3"
                            style={{ backgroundColor: "#10393B", color: "#ffffff", fontSize: "0.8rem" }}
                          >
                            MÃ TK
                          </th>
                          <th
                            className="py-3"
                            style={{ backgroundColor: "#10393B", color: "#ffffff", fontSize: "0.8rem" }}
                          >
                            HỌ TÊN & USERNAME
                          </th>
                          <th
                            className="py-3"
                            style={{ backgroundColor: "#10393B", color: "#ffffff", fontSize: "0.8rem" }}
                          >
                            EMAIL & SĐT
                          </th>
                          <th
                            className="py-3"
                            style={{ backgroundColor: "#10393B", color: "#ffffff", fontSize: "0.8rem" }}
                          >
                            CƠ SỞ
                          </th>
                          <th
                            className="py-3"
                            style={{ backgroundColor: "#10393B", color: "#ffffff", fontSize: "0.8rem" }}
                          >
                            GIỚI TÍNH
                          </th>
                          <th
                            className="py-3"
                            style={{ backgroundColor: "#10393B", color: "#ffffff", fontSize: "0.8rem" }}
                          >
                            VAI TRÒ & TRẠNG THÁI
                          </th>
                          <th
                            className="text-end pe-4 py-3"
                            style={{ backgroundColor: "#10393B", color: "#ffffff", fontSize: "0.8rem" }}
                          >
                            THAO TÁC CRUD
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {userList.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="text-center py-4 text-muted">
                              Không tìm thấy tài khoản nào khớp với bộ lọc.
                            </td>
                          </tr>
                        ) : (
                          userList.map((u) => (
                            <tr key={u.userId}>
                              <td className="ps-4 fw-bold text-secondary">
                                #{u.userId}
                              </td>
                              <td>
                                <div className="fw-bold text-dark">
                                  {u.fullName}
                                </div>
                                <small className="text-muted">
                                  @{u.username}
                                </small>
                              </td>
                              <td>
                                <div className="text-dark small">{u.email}</div>
                                <small className="text-muted">
                                  {u.phone || "Chưa cập nhật"}
                                </small>
                              </td>
                              <td>{u.campus}</td>
                              <td>{u.gender}</td>
                              <td>
                                <div className="d-flex align-items-center gap-1 flex-wrap">
                                  <span
                                    className="px-3 py-1 rounded-pill fw-bold"
                                    style={{
                                      fontSize: "0.78rem",
                                      backgroundColor:
                                        u.roleId === 1 ? "#FEE2E2" : "#E0F2FE",
                                      color:
                                        u.roleId === 1 ? "#991B1B" : "#075985",
                                      border:
                                        u.roleId === 1
                                          ? "1px solid #F87171"
                                          : "1px solid #38BDF8",
                                    }}
                                  >
                                    {u.roleId === 1 ? "Admin" : "Student"}
                                  </span>
                                  <span
                                    className="px-2 py-1 rounded-pill fw-semibold"
                                    style={{
                                      fontSize: "0.75rem",
                                      backgroundColor: "#D1FAE5",
                                      color: "#065F46",
                                      border: "1px solid #10B981",
                                    }}
                                  >
                                    Đang hoạt động
                                  </span>
                                </div>
                              </td>
                              <td className="text-end pe-4">
                                <div className="d-flex justify-content-end gap-2">
                                  <Button
                                    size="sm"
                                    variant="light"
                                    onClick={() => {
                                      setViewItem(u);
                                      setShowViewModal(true);
                                    }}
                                  >
                                    <i className="bi bi-eye-fill text-secondary"></i>
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="light"
                                    onClick={() => handleOpenEdit(u)}
                                  >
                                    <i
                                      className="bi bi-pencil-square"
                                      style={{ color: primaryColor }}
                                    ></i>
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="light"
                                    onClick={() => {
                                      setDeleteTarget(u);
                                      setShowDeleteModal(true);
                                    }}
                                  >
                                    <i className="bi bi-trash3-fill text-danger"></i>
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </Table>
                  )}
                </div>
              )}
            </Card>
          </Col>
        </Row>
      </Container>

      {/* ================= MODAL THÊM MỚI / CHỈNH SỬA (CREATE / UPDATE) ================= */}
      <Modal
        show={showFormModal}
        onHide={() => setShowFormModal(false)}
        centered
        scrollable
        size="lg"
        contentClassName="border-0 shadow-lg rounded-4"
      >
        <Modal.Header closeButton className="border-0 pb-0 mt-2 mx-3">
          <Modal.Title className="fw-bold" style={{ color: "#10393B" }}>
            <i
              className={`bi ${
                formMode === "create" ? "bi-plus-circle-fill" : "bi-pencil-square"
              } me-2`}
              style={{ color: primaryColor }}
            ></i>
            {formMode === "create" ? "Thêm mới" : "Chỉnh sửa"} -{" "}
            {sectionMeta[activeSection].title}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body
          className="mx-3 py-3 text-start"
          style={{ maxHeight: "75vh", overflowY: "auto" }}
        >
          <Form id="adminCrudForm" onSubmit={handleSaveForm}>
            {/* Chọn người đăng khi Admin tạo mới bài đăng */}
            {formMode === "create" && activeSection !== "users" && (
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold text-secondary">
                  Tài khoản người đăng
                </Form.Label>
                <Form.Select
                  value={formData.email || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="bg-light border-0"
                >
                  {user && (
                    <option value={user.email}>
                      {user.fullName} ({user.email}) - Hiện tại
                    </option>
                  )}
                  {userList.map((u) => (
                    <option key={u.userId} value={u.email}>
                      {u.fullName} (@{u.username} - {u.email})
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            )}

            {/* FORM LOST */}
            {activeSection === "lost" && (
              <Row className="g-3">
                <Col md={12}>
                  <Form.Label className="fw-semibold text-secondary">
                    Tiêu đề bài đăng <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    required
                    value={formData.title || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="bg-light border-0"
                  />
                </Col>
                <Col md={4}>
                  <Form.Label className="fw-semibold text-secondary">
                    Danh mục
                  </Form.Label>
                  <Form.Select
                    value={formData.category || "Ví & giấy tờ"}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="bg-light border-0"
                  >
                    <option value="Ví & giấy tờ">Ví & giấy tờ</option>
                    <option value="Đồ điện tử">Đồ điện tử</option>
                    <option value="Chìa khóa">Chìa khóa</option>
                    <option value="Túi & balo">Túi & balo</option>
                    <option value="Đồ dùng cá nhân">Đồ dùng cá nhân</option>
                  </Form.Select>
                </Col>
                <Col md={4}>
                  <Form.Label className="fw-semibold text-secondary">
                    Địa điểm mất
                  </Form.Label>
                  <Form.Select
                    value={formData.location || "Giảng đường"}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    className="bg-light border-0"
                  >
                    <option value="Tòa Alpha">Tòa Alpha</option>
                    <option value="Tòa Beta">Tòa Beta</option>
                    <option value="Giảng đường">Giảng đường</option>
                    <option value="Thư viện">Thư viện</option>
                    <option value="Căn tin">Căn tin</option>
                    <option value="Bãi gửi xe">Bãi gửi xe</option>
                  </Form.Select>
                </Col>
                <Col md={4}>
                  <Form.Label className="fw-semibold text-secondary">
                    Trạng thái
                  </Form.Label>
                  <Form.Select
                    value={formData.status || "Đang tìm đồ"}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    className="bg-light border-0"
                  >
                    <option value="Đang tìm đồ">Đang tìm đồ</option>
                    <option value="Đã tìm được">Đã tìm được</option>
                  </Form.Select>
                </Col>
                <Col md={12}>
                  <Form.Label className="fw-semibold text-secondary">
                    Nội dung chi tiết <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    required
                    value={formData.content || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, content: e.target.value })
                    }
                    className="bg-light border-0"
                  />
                </Col>
                <Col md={12}>
                  <Form.Label className="fw-semibold text-secondary">
                    Hình ảnh đính kèm
                  </Form.Label>
                  <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="mb-2"
                  />
                  {formData.imageUrl && (
                    <Image
                      src={formData.imageUrl}
                      rounded
                      style={{
                        width: "140px",
                        height: "95px",
                        objectFit: "cover",
                      }}
                    />
                  )}
                </Col>
              </Row>
            )}

            {/* FORM FOUND */}
            {activeSection === "found" && (
              <Row className="g-3">
                <Col md={12}>
                  <Form.Label className="fw-semibold text-secondary">
                    Tên món đồ nhặt được <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    required
                    value={formData.itemName || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, itemName: e.target.value })
                    }
                    className="bg-light border-0"
                  />
                </Col>
                <Col md={4}>
                  <Form.Label className="fw-semibold text-secondary">
                    Danh mục
                  </Form.Label>
                  <Form.Select
                    value={formData.category || "Ví & giấy tờ"}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="bg-light border-0"
                  >
                    <option value="Ví & giấy tờ">Ví & giấy tờ</option>
                    <option value="Đồ điện tử">Đồ điện tử</option>
                    <option value="Chìa khóa">Chìa khóa</option>
                    <option value="Túi & balo">Túi & balo</option>
                    <option value="Đồ dùng cá nhân">Đồ dùng cá nhân</option>
                  </Form.Select>
                </Col>
                <Col md={4}>
                  <Form.Label className="fw-semibold text-secondary">
                    Địa điểm nhặt
                  </Form.Label>
                  <Form.Select
                    value={formData.location || "Giảng đường"}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    className="bg-light border-0"
                  >
                    <option value="Tòa Alpha">Tòa Alpha</option>
                    <option value="Tòa Beta">Tòa Beta</option>
                    <option value="Giảng đường">Giảng đường</option>
                    <option value="Thư viện">Thư viện</option>
                    <option value="Căn tin">Căn tin</option>
                    <option value="Bãi gửi xe">Bãi gửi xe</option>
                  </Form.Select>
                </Col>
                <Col md={4}>
                  <Form.Label className="fw-semibold text-secondary">
                    Trạng thái
                  </Form.Label>
                  <Form.Select
                    value={formData.status || "Unclaimed"}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    className="bg-light border-0"
                  >
                    <option value="Unclaimed">Đang tìm chủ</option>
                    <option value="Claimed">Đã trao trả</option>
                  </Form.Select>
                </Col>
                <Col md={12}>
                  <Form.Label className="fw-semibold text-secondary">
                    Mô tả chi tiết <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    required
                    value={formData.description || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="bg-light border-0"
                  />
                </Col>
                <Col md={12}>
                  <Form.Label className="fw-semibold text-secondary">
                    Hình ảnh món đồ
                  </Form.Label>
                  <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="mb-2"
                  />
                  {formData.imageUrl && (
                    <Image
                      src={formData.imageUrl}
                      rounded
                      style={{
                        width: "140px",
                        height: "95px",
                        objectFit: "cover",
                      }}
                    />
                  )}
                </Col>
              </Row>
            )}

            {/* FORM FORUM */}
            {activeSection === "forum" && (
              <Row className="g-3">
                <Col md={8}>
                  <Form.Label className="fw-semibold text-secondary">
                    Tiêu đề bài viết <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    required
                    value={formData.title || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="bg-light border-0"
                  />
                </Col>
                <Col md={4}>
                  <Form.Label className="fw-semibold text-secondary">
                    Chủ đề
                  </Form.Label>
                  <Form.Select
                    value={formData.category || "Mẹo campus"}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="bg-light border-0"
                  >
                    <option value="Mẹo campus">Mẹo campus</option>
                    <option value="Kinh nghiệm campus">
                      Kinh nghiệm campus
                    </option>
                    <option value="Hỏi đáp">Hỏi đáp</option>
                    <option value="Khác">Khác</option>
                  </Form.Select>
                </Col>
                <Col md={12}>
                  <Form.Label className="fw-semibold text-secondary">
                    Nội dung bài viết <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={5}
                    required
                    value={formData.content || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, content: e.target.value })
                    }
                    className="bg-light border-0"
                  />
                </Col>
              </Row>
            )}

            {/* FORM REVIEWS */}
            {activeSection === "reviews" && (
              <Row className="g-3">
                <Col md={12}>
                  <Form.Label className="fw-semibold text-secondary">
                    Số sao đánh giá (1 - 5 sao)
                  </Form.Label>
                  <Form.Select
                    value={formData.rating || 5}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        rating: Number(e.target.value),
                      })
                    }
                    className="bg-light border-0"
                  >
                    <option value={5}>5 Sao - Tuyệt vời</option>
                    <option value={4}>4 Sao - Tốt</option>
                    <option value={3}>3 Sao - Khá</option>
                    <option value={2}>2 Sao - Trung bình</option>
                    <option value={1}>1 Sao - Cần cải thiện</option>
                  </Form.Select>
                </Col>
                <Col md={12}>
                  <Form.Label className="fw-semibold text-secondary">
                    Nội dung đánh giá <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    required
                    value={formData.comment || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, comment: e.target.value })
                    }
                    className="bg-light border-0"
                  />
                </Col>
              </Row>
            )}

            {/* FORM USERS (ACCOUNT STUDENT / ADMIN) */}
            {activeSection === "users" && (
              <Row className="g-3">
                <Col md={6}>
                  <Form.Label className="fw-semibold text-secondary">
                    Họ và tên <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    required
                    value={formData.fullName || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    className="bg-light border-0"
                  />
                </Col>
                <Col md={6}>
                  <Form.Label className="fw-semibold text-secondary">
                    Tên đăng nhập (Username){" "}
                    <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    required
                    value={formData.username || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    className="bg-light border-0"
                  />
                </Col>
                <Col md={6}>
                  <Form.Label className="fw-semibold text-secondary">
                    Email sinh viên <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="email"
                    required
                    value={formData.email || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="bg-light border-0"
                  />
                </Col>
                <Col md={6}>
                  <Form.Label className="fw-semibold text-secondary">
                    Số điện thoại
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.phone || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="bg-light border-0"
                  />
                </Col>
                <Col md={4}>
                  <Form.Label className="fw-semibold text-secondary">
                    Cơ sở (Campus)
                  </Form.Label>
                  <Form.Select
                    value={formData.campus || "Cần Thơ"}
                    onChange={(e) =>
                      setFormData({ ...formData, campus: e.target.value })
                    }
                    className="bg-light border-0"
                  >
                    <option value="Cần Thơ">Cần Thơ</option>
                    <option value="Hồ Chí Minh">Hồ Chí Minh</option>
                    <option value="Hà Nội">Hà Nội</option>
                    <option value="Đà Nẵng">Đà Nẵng</option>
                    <option value="Quy Nhơn">Quy Nhơn</option>
                  </Form.Select>
                </Col>
                <Col md={4}>
                  <Form.Label className="fw-semibold text-secondary">
                    Giới tính
                  </Form.Label>
                  <Form.Select
                    value={formData.gender || "Nam"}
                    onChange={(e) =>
                      setFormData({ ...formData, gender: e.target.value })
                    }
                    className="bg-light border-0"
                  >
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                    <option value="Khác">Khác</option>
                  </Form.Select>
                </Col>
                <Col md={4}>
                  <Form.Label className="fw-semibold text-secondary">
                    Vai trò (Role)
                  </Form.Label>
                  <Form.Select
                    value={formData.roleId || 2}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        roleId: Number(e.target.value),
                      })
                    }
                    className="bg-light border-0"
                  >
                    <option value={2}>Student (Sinh viên)</option>
                    <option value={1}>Admin (Quản trị viên)</option>
                  </Form.Select>
                </Col>
                <Col md={12}>
                  <Form.Label className="fw-semibold text-secondary">
                    {formMode === "create"
                      ? "Mật khẩu khởi tạo (Mặc định: 123456 nếu để trống)"
                      : "Đặt lại mật khẩu mới (Để trống nếu giữ nguyên mật khẩu cũ)"}
                  </Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Nhập mật khẩu..."
                    value={formData.password || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="bg-light border-0"
                  />
                </Col>
              </Row>
            )}
          </Form>
        </Modal.Body>

        <Modal.Footer className="border-0 pt-0 mb-2 mx-3">
          <Button variant="light" onClick={() => setShowFormModal(false)}>
            Hủy bỏ
          </Button>
          <Button
            type="submit"
            form="adminCrudForm"
            className="border-0 text-white fw-semibold px-4"
            style={{ backgroundColor: primaryColor }}
            disabled={saving}
          >
            {saving ? <Spinner size="sm" /> : "Lưu thông tin"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ================= MODAL XEM CHI TIẾT (READ) ================= */}
      {viewItem && (
        <Modal
          show={showViewModal}
          onHide={() => setShowViewModal(false)}
          centered
          scrollable
          contentClassName="border-0 shadow-lg rounded-4"
        >
          <Modal.Header closeButton className="border-0 pb-0 mt-2 mx-3">
            <Modal.Title className="fw-bold" style={{ color: "#10393B" }}>
              Chi tiết bản ghi #{viewItem.id || viewItem.userId}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="mx-3 py-3 text-start">
            {activeSection === "users" ? (
              <div className="d-flex flex-column gap-2">
                <div>
                  <strong>Họ và tên:</strong> {viewItem.fullName}
                </div>
                <div>
                  <strong>Username:</strong> @{viewItem.username}
                </div>
                <div>
                  <strong>Email:</strong> {viewItem.email}
                </div>
                <div>
                  <strong>Số điện thoại:</strong>{" "}
                  {viewItem.phone || "Chưa cập nhật"}
                </div>
                <div>
                  <strong>Cơ sở:</strong> {viewItem.campus}
                </div>
                <div>
                  <strong>Giới tính:</strong> {viewItem.gender}
                </div>
                <div>
                  <strong>Vai trò:</strong>{" "}
                  {viewItem.roleId === 1 ? "Admin" : "Student"}
                </div>
              </div>
            ) : (
              <div>
                <h5 className="fw-bold mb-2" style={{ color: primaryColor }}>
                  {viewItem.title ||
                    viewItem.itemName ||
                    `Đánh giá ${viewItem.rating} sao`}
                </h5>
                <p className="text-muted small mb-3">
                  Người đăng:{" "}
                  <strong>{viewItem.author || viewItem.fullName}</strong> •{" "}
                  {viewItem.date || viewItem.time}
                </p>
                <p className="text-dark" style={{ whiteSpace: "pre-wrap" }}>
                  {viewItem.content ||
                    viewItem.description ||
                    viewItem.comment}
                </p>
                {viewItem.image && (
                  <Image
                    src={viewItem.image}
                    rounded
                    className="w-100 mt-2 border"
                    style={{ maxHeight: "260px", objectFit: "contain" }}
                  />
                )}
              </div>
            )}
          </Modal.Body>
          <Modal.Footer className="border-0 pt-0 mb-2 mx-3">
            <Button variant="light" onClick={() => setShowViewModal(false)}>
              Đóng
            </Button>
            <Button
              className="border-0 text-white fw-semibold"
              style={{ backgroundColor: primaryColor }}
              onClick={() => {
                setShowViewModal(false);
                handleOpenEdit(viewItem);
              }}
            >
              Chỉnh sửa bản ghi này
            </Button>
          </Modal.Footer>
        </Modal>
      )}

      {/* ================= MODAL XÁC NHẬN XÓA (DELETE) ================= */}
      <Modal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        centered
        contentClassName="border-0 shadow-lg rounded-4"
      >
        <Modal.Header closeButton className="border-0 pb-0 mt-3 mx-3">
          <Modal.Title className="fw-bold text-dark">
            <i className="bi bi-exclamation-triangle-fill me-2 text-danger"></i>
            Xác nhận xóa vĩnh viễn
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-secondary mx-3 py-3">
          Bạn đang thực hiện quyền Admin để xóa vĩnh viễn mục{" "}
          <strong className="text-dark">
            {deleteTarget?.title ||
              deleteTarget?.itemName ||
              deleteTarget?.fullName ||
              `#${deleteTarget?.id}`}
          </strong>{" "}
          khỏi cơ sở dữ liệu. Hành động này không thể hoàn tác!
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0 mb-3 mx-3">
          <Button variant="light" onClick={() => setShowDeleteModal(false)}>
            Hủy bỏ
          </Button>
          <Button
            className="fw-semibold text-white border-0 px-4"
            style={{ backgroundColor: "#ae1111", borderRadius: "10px" }}
            onClick={handleConfirmDelete}
          >
            Xóa vĩnh viễn
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminPage;