/* eslint-disable react-hooks/exhaustive-deps */
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
  Modal,
  Spinner,
  Badge,
  Alert,
  Dropdown,
} from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { setPostVisibility } from "../utils/visibility";
import { VisibilityBadge } from "../components/Visibility";

// Mác phân loại chủ đề của bài viết Forum
const CATEGORY_META = {
  "Mẹo campus": {
    icon: "bi-lightbulb-fill",
    color: "#0A7360",
    bg: "#E3F5EF",
    border: "#B7E3D6",
  },
  "Kinh nghiệm campus": {
    icon: "bi-mortarboard-fill",
    color: "#1D4ED8",
    bg: "#E6EEFF",
    border: "#BFD2FF",
  },
  "Hỏi đáp": {
    icon: "bi-patch-question-fill",
    color: "#B45309",
    bg: "#FFF3D6",
    border: "#F8DC9B",
  },
  Khác: {
    icon: "bi-tag-fill",
    color: "#4B5563",
    bg: "#EEF1F4",
    border: "#D5DAE0",
  },
};

// Chủ đề lạ hoặc để trống sẽ tự quy về "Khác"
const CategoryBadge = ({ category, large = false }) => {
  const key = CATEGORY_META[category] ? category : "Khác";
  const m = CATEGORY_META[key];
  return (
    <span
      className="d-inline-flex align-items-center fw-semibold"
      style={{
        backgroundColor: m.bg,
        color: m.color,
        border: `1px solid ${m.border}`,
        borderRadius: "999px",
        padding: large ? "7px 18px" : "4px 12px",
        fontSize: large ? "0.92rem" : "0.8rem",
        lineHeight: 1.2,
        whiteSpace: "nowrap",
      }}
    >
      <i
        className={`bi ${m.icon} me-2`}
        style={{ fontSize: large ? "1.05rem" : "0.9rem" }}
      ></i>
      {key}
    </span>
  );
};

const ForumPage = ({ user }) => {
  const primaryColor = "#1f6dba";
  const navigate = useNavigate();
  const locationData = useLocation();
  const navState = locationData.state || {};

  // State danh sách bài viết và bộ lọc
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("Tất cả");
  const [onlyMine, setOnlyMine] = useState(false); // lọc bài của bản thân
  const [sortBy, setSortBy] = useState("newest");

  // State cho Modal Tạo bài viết mới
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("Mẹo campus");
  const [newContent, setNewContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState({ type: "", text: "" });

  // ===== STATE CHO CHỈNH SỬA & XÓA BÀI VIẾT CỦA BẢN THÂN =====
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editCategory, setEditCategory] = useState("Mẹo campus");
  const [editContent, setEditContent] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState(null);

  // ===== STATE CHO MODAL CHI TIẾT, BÌNH LUẬN, TRẢ LỜI & LIKE COMMENT =====
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedPostDetail, setSelectedPostDetail] = useState(null);
  const [commentSortBy, setCommentSortBy] = useState("newest");
  const [newCommentText, setNewCommentText] = useState("");
  const [replyingToId, setReplyingToId] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [commentMeta, setCommentMeta] = useState(() => {
    return JSON.parse(localStorage.getItem("laf_comment_meta_forum")) || {};
  });

  // ===== STATE CHO MODAL CHIA SẺ =====
  const [showShareModal, setShowShareModal] = useState(false);
  const [postToShare, setPostToShare] = useState(null);
  const [shareCaption, setShareCaption] = useState("");
  const [shareSuccessMsg, setShareSuccessMsg] = useState("");

  const requireLogin = (actionName) => {
    if (!user) {
      alert(`Vui lòng đăng nhập để ${actionName}!`);
      navigate("/login");
      return false;
    }
    return true;
  };

  // Kiểm tra quyền tác giả bài viết
  // Đổi chế độ xem bài của mình: Công khai <-> Riêng tư
  const handleToggleVisibility = async (item) => {
    const next = item.visibility === "Private" ? "Public" : "Private";
    const ok = await setPostVisibility("forum", item.id, user?.email, next);
    if (ok) {
      setPosts((prev) =>
        prev.map((p) => (p.id === item.id ? { ...p, visibility: next } : p)),
      );
      setSelectedPostDetail((prev) =>
        prev && prev.id === item.id ? { ...prev, visibility: next } : prev,
      );
    }
  };

  const isOwner = (post) => {
    if (!user || !post) return false;
    return (
      (post.fullName &&
        user.fullName &&
        post.fullName.toLowerCase() === user.fullName.toLowerCase()) ||
      (post.username &&
        user.username &&
        post.username.toLowerCase() === user.username.toLowerCase()) ||
      (post.authorEmail &&
        user.email &&
        post.authorEmail.toLowerCase() === user.email.toLowerCase())
    );
  };

  const pushNotification = async ({
    recipientEmail,
    recipientName,
    type,
    postId,
    message,
  }) => {
    if (!user) return;
    if (
      (recipientEmail && recipientEmail === user.email) ||
      (recipientName && recipientName === user.fullName)
    ) {
      return;
    }

    const newNotif = {
      id: Date.now(),
      recipientEmail: recipientEmail || "",
      recipientName: recipientName || "",
      senderName: user.fullName,
      type,
      postType: "forum",
      postId,
      message,
      time: "Vừa xong",
      isRead: false,
    };

    const existing =
      JSON.parse(localStorage.getItem("laf_notifications")) || [];
    localStorage.setItem(
      "laf_notifications",
      JSON.stringify([newNotif, ...existing]),
    );
    window.dispatchEvent(new Event("laf-notifications-updated"));

    try {
      const params = new URLSearchParams();
      params.append("action", "create");
      params.append("recipientEmail", recipientEmail || "");
      params.append("senderName", user.fullName);
      params.append("type", type);
      params.append("postType", "forum");
      params.append("postId", postId);
      params.append("message", message);
      await axios.post("/api/notifications", params);
    } catch {
      // Đã lưu đồng bộ vào localStorage
    }
  };

  const handleViewUserProfile = (authorName, username, e) => {
    if (e) e.stopPropagation();
    const query = new URLSearchParams();
    if (username) query.set("username", username);
    if (authorName) query.set("name", authorName);
    navigate(`/profile?${query.toString()}`);
  };

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/forum", {
        params: {
          category: categoryFilter,
          sort: sortBy,
          email: user ? user.email : "",
        },
      });
      const editedMap =
        JSON.parse(localStorage.getItem("laf_edited_forum_posts")) || {};
      const deletedIds =
        JSON.parse(localStorage.getItem("laf_deleted_forum_posts")) || [];

      const finalPosts = (response.data || [])
        .filter((p) => !deletedIds.includes(p.id))
        .map((p) => (editedMap[p.id] ? { ...p, ...editedMap[p.id] } : p));

      setPosts(finalPosts);

      if (navState.openPostId) {
        const target = finalPosts.find(
          (item) => Number(item.id) === Number(navState.openPostId),
        );
        if (target) {
          setSelectedPostDetail(target);
          setShowDetailModal(true);
        }
      }
    } catch (error) {
      console.error("Lỗi khi tải bài viết:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [categoryFilter, sortBy, user, navState.openPostId]);

  const handleOpenModal = () => {
    if (requireLogin("đăng bài viết")) {
      setShowModal(true);
      setSubmitMsg({ type: "", text: "" });
    }
  };

  const handleSubmitPost = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    setSubmitting(true);
    try {
      const params = new URLSearchParams();
      params.append("action", "create");
      params.append("email", user.email);
      params.append("title", newTitle);
      params.append("category", newCategory);
      params.append("content", newContent);

      const response = await axios.post("/api/forum", params);

      if (response.data.success) {
        setSubmitMsg({ type: "success", text: response.data.message });
        setNewTitle("");
        setNewContent("");
        setNewCategory("Mẹo campus");
        fetchPosts();
        setTimeout(() => setShowModal(false), 3000);
      } else {
        setSubmitMsg({ type: "danger", text: response.data.message });
      }
    } catch {
      setSubmitMsg({ type: "danger", text: "Lỗi kết nối máy chủ!" });
    } finally {
      setSubmitting(false);
    }
  };

  // Mở Modal Chỉnh sửa bài viết
  const handleOpenEditModal = (post, e) => {
    if (e) e.stopPropagation();
    setEditingPost(post);
    setEditTitle(post.title);
    setEditCategory(post.category);
    setEditContent(post.content);
    setShowEditModal(true);
  };

  // Lưu Chỉnh sửa bài viết
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingPost || !editTitle.trim() || !editContent.trim()) return;

    const updatedFields = {
      title: editTitle.trim(),
      category: editCategory,
      content: editContent.trim(),
    };

    try {
      const params = new URLSearchParams();
      params.append("action", "edit");
      params.append("postId", editingPost.id);
      params.append("title", updatedFields.title);
      params.append("category", updatedFields.category);
      params.append("content", updatedFields.content);
      await axios.post("/api/forum", params);
    } catch {
      // Fallback lưu đồng bộ
    }

    const editedMap =
      JSON.parse(localStorage.getItem("laf_edited_forum_posts")) || {};
    editedMap[editingPost.id] = updatedFields;
    localStorage.setItem("laf_edited_forum_posts", JSON.stringify(editedMap));

    setPosts(
      posts.map((p) =>
        p.id === editingPost.id ? { ...p, ...updatedFields } : p,
      ),
    );
    if (selectedPostDetail && selectedPostDetail.id === editingPost.id) {
      setSelectedPostDetail({ ...selectedPostDetail, ...updatedFields });
    }
    setShowEditModal(false);
  };

  // Xác nhận Xóa bài viết
  const handleDeleteConfirm = async () => {
    try {
      const params = new URLSearchParams();
      params.append("action", "delete");
      params.append("postId", selectedPostId);
      await axios.post("/api/forum", params);
    } catch {
      // Fallback xóa đồng bộ
    }

    const deletedIds =
      JSON.parse(localStorage.getItem("laf_deleted_forum_posts")) || [];
    if (!deletedIds.includes(selectedPostId)) {
      deletedIds.push(selectedPostId);
      localStorage.setItem(
        "laf_deleted_forum_posts",
        JSON.stringify(deletedIds),
      );
    }

    setPosts(posts.filter((p) => p.id !== selectedPostId));
    if (selectedPostDetail && selectedPostDetail.id === selectedPostId) {
      setShowDetailModal(false);
    }
    setShowDeleteModal(false);
  };

  // Like / Unlike bài viết Forum
  const handleLikePost = async (post, e) => {
    if (e) e.stopPropagation();
    if (!requireLogin("thích bài viết")) return;

    try {
      const params = new URLSearchParams();
      params.append("action", "like");
      params.append("postId", post.id);
      params.append("email", user.email);

      const response = await axios.post("/api/forum", params);
      if (response.data.success) {
        if (response.data.hasLiked) {
          pushNotification({
            recipientName: post.fullName,
            type: "LIKE_POST",
            postId: post.id,
            message: `đã thích bài viết diễn đàn "${post.title}" của bạn.`,
          });
        }
        setPosts(
          posts.map((p) =>
            p.id === post.id
              ? {
                  ...p,
                  likes: response.data.likes,
                  hasLiked: response.data.hasLiked,
                }
              : p,
          ),
        );
        if (selectedPostDetail && selectedPostDetail.id === post.id) {
          setSelectedPostDetail((prev) => ({
            ...prev,
            likes: response.data.likes,
            hasLiked: response.data.hasLiked,
          }));
        }
      }
    } catch (error) {
      console.error("Lỗi khi like bài viết:", error);
    }
  };

  const handleOpenDetailModal = (post) => {
    setSelectedPostDetail(post);
    setShowDetailModal(true);
    setCommentSortBy("newest");
    setReplyingToId(null);
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    try {
      const params = new URLSearchParams();
      params.append("action", "comment");
      params.append("postId", selectedPostDetail.id);
      params.append("email", user.email);
      params.append("content", newCommentText);

      const response = await axios.post("/api/forum", params);
      if (response.data.success) {
        pushNotification({
          recipientName: selectedPostDetail.fullName,
          type: "COMMENT",
          postId: selectedPostDetail.id,
          message: `đã bình luận về bài viết "${selectedPostDetail.title}": "${newCommentText}"`,
        });

        const updatedComments = response.data.comments;
        const updatedPost = {
          ...selectedPostDetail,
          comments: updatedComments,
          commentsCount: updatedComments.length,
        };
        setSelectedPostDetail(updatedPost);
        setPosts(
          posts.map((p) => (p.id === selectedPostDetail.id ? updatedPost : p)),
        );
        setNewCommentText("");
      }
    } catch (error) {
      console.error("Lỗi khi gửi bình luận:", error);
    }
  };

  const handleLikeComment = (comment) => {
    if (!requireLogin("thích bình luận")) return;
    const key = `c_${comment.id}`;
    const current = commentMeta[key] || {
      likes: 0,
      likedBy: [],
      replies: [],
    };
    const hasLiked = current.likedBy.includes(user.email);
    const updatedLikedBy = hasLiked
      ? current.likedBy.filter((em) => em !== user.email)
      : [...current.likedBy, user.email];

    const nextMeta = {
      ...commentMeta,
      [key]: {
        ...current,
        likes: updatedLikedBy.length,
        likedBy: updatedLikedBy,
      },
    };
    setCommentMeta(nextMeta);
    localStorage.setItem("laf_comment_meta_forum", JSON.stringify(nextMeta));

    if (!hasLiked) {
      pushNotification({
        recipientName: comment.author,
        type: "LIKE_COMMENT",
        postId: selectedPostDetail.id,
        message: `đã thích bình luận của bạn: "${comment.text}"`,
      });
    }
  };

  const handleSubmitReply = (comment, e) => {
    e.preventDefault();
    if (!requireLogin("trả lời bình luận")) return;
    if (!replyText.trim()) return;

    const key = `c_${comment.id}`;
    const current = commentMeta[key] || {
      likes: 0,
      likedBy: [],
      replies: [],
    };
    const newReply = {
      id: Date.now(),
      author: user.fullName,
      authorEmail: user.email,
      text: replyText.trim(),
      time: "Vừa xong",
    };

    const nextMeta = {
      ...commentMeta,
      [key]: {
        ...current,
        replies: [...(current.replies || []), newReply],
      },
    };
    setCommentMeta(nextMeta);
    localStorage.setItem("laf_comment_meta_forum", JSON.stringify(nextMeta));

    pushNotification({
      recipientName: comment.author,
      type: "REPLY_COMMENT",
      postId: selectedPostDetail.id,
      message: `đã phản hồi bình luận của bạn: "${replyText.trim()}"`,
    });

    setReplyText("");
    setReplyingToId(null);
  };

  const handleOpenShareModal = (post, e) => {
    if (e) e.stopPropagation();
    if (!requireLogin("chia sẻ bài viết")) return;
    setPostToShare(post);
    setShareCaption("");
    setShareSuccessMsg("");
    setShowShareModal(true);
  };

  const handleConfirmShare = (e) => {
    e.preventDefault();
    if (!postToShare || !user) return;

    const sharedItem = {
      shareId: Date.now(),
      sharerName: user.fullName,
      sharerEmail: user.email,
      caption: shareCaption.trim(),
      sharedAt: new Date().toLocaleDateString("vi-VN"),
      postType: "forum",
      originalPost: {
        id: postToShare.id,
        title: postToShare.title,
        content: postToShare.content,
        category: postToShare.category,
        location: "Diễn đàn sinh viên",
        author: postToShare.fullName,
        username: postToShare.username,
        date: postToShare.date,
        status: postToShare.category,
      },
      likes: 0,
      likedBy: [],
      comments: [],
    };

    const existingShares =
      JSON.parse(localStorage.getItem("laf_shared_posts")) || [];
    localStorage.setItem(
      "laf_shared_posts",
      JSON.stringify([sharedItem, ...existingShares]),
    );

    pushNotification({
      recipientName: postToShare.fullName,
      type: "SHARE",
      postId: postToShare.id,
      message: `đã chia sẻ bài viết diễn đàn "${postToShare.title}" của bạn.`,
    });

    setShareSuccessMsg("Đã chia sẻ bài viết về trang cá nhân của bạn!");
    setTimeout(() => {
      setShowShareModal(false);
    }, 1200);
  };

  // Danh sách hiển thị: có thể chỉ giữ bài của chính mình
  const visiblePosts = onlyMine ? posts.filter((p) => isOwner(p)) : posts;

  return (
    <div
      style={{
        backgroundColor: "#f4f9ff",
        minHeight: "100vh",
        padding: "40px 0",
      }}
    >
      <Container>
        {/* Header Trang */}
        <div className="d-flex flex-wrap justify-content-between align-items-end mb-4">
          <div className="text-start mb-3 mb-md-0">
            <h3 className="fw-bold mb-1" style={{ color: "#12345a" }}>
              Diễn đàn sinh viên
            </h3>
            <p className="text-secondary mb-0">
              Nơi trao đổi kinh nghiệm, mẹo vặt và hỏi đáp quanh khu vực Campus.
            </p>
          </div>
          <Button
            className="fw-bold px-4 py-2 border-0 shadow-sm d-flex align-items-center"
            style={{ backgroundColor: primaryColor }}
            onClick={handleOpenModal}
          >
            <i className="bi bi-pencil-square me-2"></i> Tạo bài viết
          </Button>
        </div>

        <Row className="g-4">
          {/* CỘT TRÁI: BỘ LỌC */}
          <Col lg={3}>
            <Card
              className="border-0 shadow-sm rounded-4 p-4 text-start sticky-top"
              style={{ top: "85px", zIndex: 1000 }}
            >
              <h6 className="fw-bold text-dark mb-3">Lọc theo chủ đề</h6>
              <div className="d-flex flex-column gap-2">
                {[
                  "Tất cả",
                  "Mẹo campus",
                  "Kinh nghiệm campus",
                  "Hỏi đáp",
                  "Khác",
                ].map((cat) => (
                  <div
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className="p-2 rounded-3 text-dark fw-medium"
                    style={{
                      cursor: "pointer",
                      transition: "0.2s",
                      backgroundColor:
                        categoryFilter === cat ? "#eaf3fc" : "transparent",
                      color: categoryFilter === cat ? primaryColor : "inherit",
                      borderLeft:
                        categoryFilter === cat
                          ? `4px solid ${primaryColor}`
                          : "4px solid transparent",
                    }}
                  >
                    {cat}
                  </div>
                ))}
              </div>

              {user && (
                <div
                  onClick={() => setOnlyMine(!onlyMine)}
                  className="mt-4 p-2 rounded-3 fw-semibold d-flex align-items-center justify-content-between"
                  style={{
                    cursor: "pointer",
                    transition: "0.2s",
                    backgroundColor: onlyMine ? primaryColor : "#EAF3FC",
                    color: onlyMine ? "#fff" : primaryColor,
                  }}
                >
                  <span>
                    <i className="bi bi-person-check-fill me-2"></i>
                    Bài viết của tôi
                  </span>
                  {onlyMine && <i className="bi bi-check-lg"></i>}
                </div>
              )}

              <h6 className="fw-bold text-dark mb-3 mt-5">Sắp xếp bài viết</h6>
              <Form.Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-light border-0 shadow-none"
              >
                <option value="newest">Mới đăng nhất</option>
                <option value="oldest">Cũ nhất</option>
              </Form.Select>
            </Card>
          </Col>

          {/* CỘT PHẢI: DANH SÁCH BÀI VIẾT */}
          <Col lg={9}>
            {loading ? (
              <div className="text-center py-5">
                <Spinner animation="border" style={{ color: primaryColor }} />
              </div>
            ) : visiblePosts.length === 0 ? (
              <div className="text-center py-5 text-secondary">
                <i className="bi bi-journal-x fs-1 opacity-50 mb-3 d-block"></i>
                <h5 className="fw-bold">Chưa có bài viết nào</h5>
                <p>Hãy là người đầu tiên chia sẻ kinh nghiệm trong mục này!</p>
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {visiblePosts.map((post) => (
                  <Card
                    key={post.id}
                    className="border-0 shadow-sm rounded-4 p-4 text-start transition-hover"
                    style={{ cursor: "pointer" }}
                    onClick={() => handleOpenDetailModal(post)}
                  >
                    <div className="d-flex align-items-center mb-3">
                      <div
                        className="d-flex align-items-center"
                        onClick={(e) =>
                          handleViewUserProfile(post.fullName, post.username, e)
                        }
                        title={`Xem trang cá nhân của ${post.fullName}`}
                      >
                        <div
                          className="rounded-circle d-flex justify-content-center align-items-center text-white fw-bold me-3 shadow-sm"
                          style={{
                            width: "42px",
                            height: "42px",
                            backgroundColor: primaryColor,
                          }}
                        >
                          {post.fullName ? post.fullName.charAt(0) : "U"}
                        </div>
                        <div>
                          <h6
                            className="fw-bold mb-0 text-dark hover-primary"
                            style={{ fontSize: "0.95rem" }}
                          >
                            {post.fullName}
                          </h6>
                          <span
                            className="text-muted"
                            style={{ fontSize: "0.8rem" }}
                          >
                            @{post.username} • {post.date}
                          </span>
                        </div>
                      </div>

                      <div
                        className="ms-auto d-flex align-items-center gap-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <VisibilityBadge visibility={post.visibility} />
                        <CategoryBadge category={post.category} />

                        {/* MENU BA CHẤM (...) CHO BÀI VIẾT CỦA CHÍNH MÌNH */}
                        {isOwner(post) && (
                          <Dropdown align="end">
                            <Dropdown.Toggle
                              variant="light"
                              size="sm"
                              className="rounded-circle border-0 shadow-none p-1 d-flex align-items-center justify-content-center"
                              style={{ width: "32px", height: "32px" }}
                            >
                              <i className="bi bi-three-dots fs-5 text-secondary"></i>
                            </Dropdown.Toggle>
                            <Dropdown.Menu className="shadow border-0 rounded-3">
                              <Dropdown.Item
                                onClick={(e) => handleOpenEditModal(post, e)}
                                className="py-2"
                              >
                                <i className="bi bi-pencil-square me-2 text-primary"></i>
                                Chỉnh sửa bài viết
                              </Dropdown.Item>
                    <Dropdown.Item
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleVisibility(post);
                      }}
                      className="py-2"
                    >
                      <i
                        className={`bi ${post.visibility === "Private" ? "bi-globe2" : "bi-lock-fill"} me-2`}
                        style={{ color: primaryColor }}
                      ></i>
                      {post.visibility === "Private"
                        ? "Chuyển sang Công khai"
                        : "Chuyển sang Riêng tư"}
                    </Dropdown.Item>
                              <Dropdown.Item
                                onClick={() => {
                                  setSelectedPostId(post.id);
                                  setShowDeleteModal(true);
                                }}
                                className="py-2 text-danger"
                              >
                                <i className="bi bi-trash3-fill me-2"></i>
                                Xóa bài viết
                              </Dropdown.Item>
                            </Dropdown.Menu>
                          </Dropdown>
                        )}
                      </div>
                    </div>

                    <h5 className="fw-bold mb-2" style={{ color: "#12345a" }}>
                      {post.title}
                    </h5>
                    <p
                      className="text-secondary mb-0"
                      style={{ fontSize: "0.95rem", lineHeight: "1.6" }}
                    >
                      {post.content}
                    </p>

                    <div
                      className="mt-3 pt-3 post-actions border-top d-flex justify-content-between text-secondary"
                      style={{ fontSize: "0.85rem" }}
                    >
                      <span
                        className="hover-primary fw-medium"
                        style={{
                          color: post.hasLiked ? primaryColor : "inherit",
                        }}
                        onClick={(e) => handleLikePost(post, e)}
                      >
                        <i
                          className={
                            post.hasLiked
                              ? "bi bi-hand-thumbs-up-fill me-1"
                              : "bi bi-hand-thumbs-up me-1"
                          }
                        ></i>{" "}
                        Thích ({post.likes || 0})
                      </span>
                      <span
                        className="hover-primary fw-medium"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDetailModal(post);
                        }}
                      >
                        <i className="bi bi-chat-text me-1"></i> Bình luận (
                        {(post.comments || []).length})
                      </span>
                      <span
                        className="hover-primary fw-medium ms-auto"
                        onClick={(e) => handleOpenShareModal(post, e)}
                      >
                        <i className="bi bi-share me-1"></i> Chia sẻ
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </Col>
        </Row>

        {/* ================= MODAL TẠO BÀI VIẾT MỚI ================= */}
        <Modal
          show={showModal}
          onHide={() => setShowModal(false)}
          centered
          scrollable
          size="lg"
          contentClassName="border-0 shadow-lg"
          style={{ borderRadius: "20px", overflow: "hidden" }}
        >
          <Modal.Header closeButton className="border-0 pb-0 mt-3 mx-3">
            <Modal.Title
              className="fw-bold d-flex align-items-center"
              style={{ color: "#212529" }}
            >
              <i
                className="bi bi-pencil-square me-2"
                style={{ color: primaryColor }}
              ></i>{" "}
              Tạo bài viết mới
            </Modal.Title>
          </Modal.Header>

          <Modal.Body
            className="mx-3 py-3"
            style={{ maxHeight: "75vh", overflowY: "auto" }}
          >
            {submitMsg.text && (
              <Alert variant={submitMsg.type} className="border-0 shadow-sm">
                {submitMsg.text}
              </Alert>
            )}

            <Form id="forumForm" onSubmit={handleSubmitPost}>
              <Form.Group className="mb-4">
                <Form.Label
                  className="fw-semibold text-secondary"
                  style={{ fontSize: "0.9rem" }}
                >
                  Tiêu đề bài viết
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Ví dụ: Bí kíp tìm lại thẻ sinh viên khi làm rớt..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                  className="bg-light border-0 shadow-none px-3 py-2"
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label
                  className="fw-semibold text-secondary"
                  style={{ fontSize: "0.9rem" }}
                >
                  Danh mục
                </Form.Label>
                <Form.Select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="bg-light border-0 shadow-none px-3 py-2"
                >
                  <option value="Mẹo campus">Mẹo campus</option>
                  <option value="Kinh nghiệm campus">Kinh nghiệm campus</option>
                  <option value="Hỏi đáp">Hỏi đáp</option>
                  <option value="Khác">Khác</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-2">
                <Form.Label
                  className="fw-semibold text-secondary"
                  style={{ fontSize: "0.9rem" }}
                >
                  Nội dung chia sẻ
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={6}
                  placeholder="Nhập nội dung bài viết của bạn..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  required
                  className="bg-light border-0 shadow-none p-3"
                />
              </Form.Group>
            </Form>
          </Modal.Body>

          <Modal.Footer className="border-0 pt-0 mb-3 mx-3 d-flex justify-content-end">
            <Button
              variant="light"
              className="fw-semibold px-4"
              onClick={() => setShowModal(false)}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              form="forumForm"
              className="fw-semibold px-4 border-0 text-white"
              style={{ backgroundColor: primaryColor }}
              disabled={submitting}
            >
              {submitting ? <Spinner size="sm" /> : "Đăng bài"}
            </Button>
          </Modal.Footer>
        </Modal>

        {/* ================= MODAL CHỈNH SỬA BÀI VIẾT ================= */}
        <Modal
          show={showEditModal}
          onHide={() => setShowEditModal(false)}
          centered
          scrollable
          size="lg"
          contentClassName="border-0 shadow-lg"
          style={{ borderRadius: "20px", overflow: "hidden" }}
        >
          <Modal.Header closeButton className="border-0 pb-0 mt-3 mx-3">
            <Modal.Title className="fw-bold" style={{ color: "#12345a" }}>
              <i
                className="bi bi-pencil-square me-2"
                style={{ color: primaryColor }}
              ></i>
              Chỉnh sửa bài viết diễn đàn
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="mx-3 py-3 text-start">
            <Form id="editForumForm" onSubmit={handleSaveEdit}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold text-secondary">
                  Tiêu đề
                </Form.Label>
                <Form.Control
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  required
                  className="bg-light border-0 shadow-none"
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold text-secondary">
                  Danh mục
                </Form.Label>
                <Form.Select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="bg-light border-0 shadow-none"
                >
                  <option value="Mẹo campus">Mẹo campus</option>
                  <option value="Kinh nghiệm campus">Kinh nghiệm campus</option>
                  <option value="Hỏi đáp">Hỏi đáp</option>
                  <option value="Khác">Khác</option>
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label className="fw-semibold text-secondary">
                  Nội dung
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={5}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  required
                  className="bg-light border-0 shadow-none"
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer className="border-0 pt-0 mb-3 mx-3">
            <Button variant="light" onClick={() => setShowEditModal(false)}>
              Hủy
            </Button>
            <Button
              type="submit"
              form="editForumForm"
              className="border-0 text-white fw-semibold px-4"
              style={{ backgroundColor: primaryColor }}
            >
              Lưu thay đổi
            </Button>
          </Modal.Footer>
        </Modal>

        {/* ================= MODAL XÁC NHẬN XÓA BÀI VIẾT ================= */}
        <Modal
          show={showDeleteModal}
          onHide={() => setShowDeleteModal(false)}
          centered
          contentClassName="border-0 shadow-lg"
        >
          <Modal.Header closeButton className="border-0 pb-0 mt-3 mx-3">
            <Modal.Title className="fw-bold text-dark">
              <i className="bi bi-exclamation-triangle-fill me-2 text-danger"></i>
              Xóa bài viết
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="text-secondary mx-3 py-3">
            Bạn có chắc chắn muốn xóa bài viết này khỏi diễn đàn không?
          </Modal.Body>
          <Modal.Footer className="border-0 pt-0 mb-3 mx-3">
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

        {/* ================= MODAL CHIA SẺ BÀI ĐĂNG ================= */}
        <Modal
          show={showShareModal}
          onHide={() => setShowShareModal(false)}
          centered
          contentClassName="border-0 shadow-lg"
          style={{ borderRadius: "20px", overflow: "hidden" }}
        >
          <Modal.Header closeButton className="border-0 pb-0 mt-3 mx-3">
            <Modal.Title className="fw-bold" style={{ color: "#12345a" }}>
              <i
                className="bi bi-share-fill me-2"
                style={{ color: primaryColor }}
              ></i>
              Chia sẻ bài viết diễn đàn
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="mx-3 py-3 text-start">
            {shareSuccessMsg && (
              <Alert variant="success" className="py-2">
                {shareSuccessMsg}
              </Alert>
            )}
            {postToShare && (
              <Form onSubmit={handleConfirmShare}>
                <Form.Group className="mb-3">
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Viết cảm nghĩ của bạn khi chia sẻ bài viết này..."
                    value={shareCaption}
                    onChange={(e) => setShareCaption(e.target.value)}
                    className="bg-light border-0 shadow-none p-3 rounded-3"
                  />
                </Form.Group>

                <div className="p-3 rounded-3 border bg-white mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="fw-bold text-dark">
                      {postToShare.fullName}
                    </span>
                    <CategoryBadge category={postToShare.category} />
                  </div>
                  <h6 className="fw-bold mb-1" style={{ color: primaryColor }}>
                    {postToShare.title}
                  </h6>
                  <p
                    className="text-secondary mb-0 text-truncate"
                    style={{ fontSize: "0.85rem" }}
                  >
                    {postToShare.content}
                  </p>
                </div>

                <div className="d-flex justify-content-end gap-2">
                  <Button
                    variant="light"
                    onClick={() => setShowShareModal(false)}
                  >
                    Hủy
                  </Button>
                  <Button
                    type="submit"
                    className="border-0 text-white fw-semibold px-4"
                    style={{ backgroundColor: primaryColor }}
                  >
                    Chia sẻ ngay
                  </Button>
                </div>
              </Form>
            )}
          </Modal.Body>
        </Modal>

        {/* ================= MODAL CHI TIẾT BÀI ĐĂNG (CÓ CUỘN DỌC & MENU ...) ================= */}
        {selectedPostDetail && (
          <Modal
            show={showDetailModal}
            onHide={() => setShowDetailModal(false)}
            centered
            scrollable
            size="lg"
            contentClassName="border-0 shadow-lg"
            style={{ borderRadius: "20px", overflow: "hidden" }}
          >
            <Modal.Header closeButton className="border-0 pb-2 mt-2 mx-3">
              <div className="d-flex align-items-center justify-content-between w-100 me-2">
                <div
                  className="d-flex align-items-center gap-3"
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    setShowDetailModal(false);
                    handleViewUserProfile(
                      selectedPostDetail.fullName,
                      selectedPostDetail.username,
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
                    {selectedPostDetail.fullName
                      ? selectedPostDetail.fullName.charAt(0)
                      : "U"}
                  </div>
                  <div>
                    <h5 className="fw-bold mb-0 text-dark hover-primary">
                      {selectedPostDetail.fullName}
                    </h5>
                    <span
                      className="text-muted"
                      style={{ fontSize: "0.85rem" }}
                    >
                      @{selectedPostDetail.username} • {selectedPostDetail.date}
                    </span>
                  </div>
                </div>

                <div className="d-flex align-items-center gap-2">
                  {isOwner(selectedPostDetail) && (
                    <Dropdown align="end">
                      <Dropdown.Toggle
                        variant="light"
                        size="sm"
                        className="rounded-circle border-0 shadow-sm p-0 d-flex align-items-center justify-content-center no-caret"
                        style={{ width: "34px", height: "34px" }}
                      >
                        <i className="bi bi-three-dots fs-5 text-secondary"></i>
                      </Dropdown.Toggle>
                      <Dropdown.Menu className="shadow border-0 rounded-3">
                        <Dropdown.Item
                          onClick={(e) =>
                            handleOpenEditModal(selectedPostDetail, e)
                          }
                          className="py-2"
                        >
                          <i className="bi bi-pencil-square me-2 text-primary"></i>
                          Chỉnh sửa bài viết
                        </Dropdown.Item>
                    <Dropdown.Item
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleVisibility(selectedPostDetail);
                      }}
                      className="py-2"
                    >
                      <i
                        className={`bi ${selectedPostDetail.visibility === "Private" ? "bi-globe2" : "bi-lock-fill"} me-2`}
                        style={{ color: primaryColor }}
                      ></i>
                      {selectedPostDetail.visibility === "Private"
                        ? "Chuyển sang Công khai"
                        : "Chuyển sang Riêng tư"}
                    </Dropdown.Item>
                        <Dropdown.Item
                          onClick={() => {
                            setSelectedPostId(selectedPostDetail.id);
                            setShowDeleteModal(true);
                          }}
                          className="py-2 text-danger"
                        >
                          <i className="bi bi-trash3-fill me-2"></i>
                          Xóa bài viết
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  )}
                </div>
              </div>
            </Modal.Header>

            <Modal.Body
              className="mx-3 py-3 text-start"
              style={{ maxHeight: "75vh", overflowY: "auto" }}
            >
              <div className="d-flex align-items-center gap-2 mb-3">
                <CategoryBadge category={selectedPostDetail.category} large />
                <span className="text-muted" style={{ fontSize: "0.85rem" }}>
                  Chủ đề bài viết
                </span>
              </div>
              <h4 className="fw-bold mb-3" style={{ color: "#12345a" }}>
                {selectedPostDetail.title}
              </h4>
              <p
                className="text-secondary mb-4"
                style={{
                  fontSize: "1rem",
                  lineHeight: "1.6",
                  whiteSpace: "pre-wrap",
                }}
              >
                {selectedPostDetail.content}
              </p>

              {/* THANH TƯƠNG TÁC BÊN TRONG MODAL */}
              <div className="py-3 border-top border-bottom d-flex justify-content-around text-secondary mb-4">
                <span
                  className="hover-primary fw-medium"
                  style={{
                    cursor: "pointer",
                    color: selectedPostDetail.hasLiked
                      ? primaryColor
                      : "inherit",
                  }}
                  onClick={(e) => handleLikePost(selectedPostDetail, e)}
                >
                  <i
                    className={
                      selectedPostDetail.hasLiked
                        ? "bi bi-hand-thumbs-up-fill me-1"
                        : "bi bi-hand-thumbs-up me-1"
                    }
                  ></i>{" "}
                  Thích ({selectedPostDetail.likes || 0})
                </span>
                <span
                  className="hover-primary fw-medium"
                  style={{ cursor: "pointer" }}
                >
                  <i className="bi bi-chat-text me-1"></i> Bình luận (
                  {(selectedPostDetail.comments || []).length})
                </span>
                <span
                  className="hover-primary fw-medium"
                  style={{ cursor: "pointer" }}
                  onClick={(e) => handleOpenShareModal(selectedPostDetail, e)}
                >
                  <i className="bi bi-share me-1"></i> Chia sẻ
                </span>
              </div>

              {/* KHU VỰC BÌNH LUẬN */}
              <div className="mt-3">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="fw-bold text-dark mb-0">Bình luận</h6>
                  <Form.Select
                    size="sm"
                    style={{
                      width: "auto",
                      fontSize: "0.85rem",
                      cursor: "pointer",
                    }}
                    className="border-0 bg-light shadow-none fw-medium"
                    value={commentSortBy}
                    onChange={(e) => setCommentSortBy(e.target.value)}
                  >
                    <option value="newest">Mới nhất</option>
                    <option value="oldest">Cũ nhất</option>
                  </Form.Select>
                </div>

                {user ? (
                  <Form
                    onSubmit={handleSubmitComment}
                    className="d-flex gap-2 mb-4"
                  >
                    <div
                      className="rounded-circle d-flex justify-content-center align-items-center text-white fw-bold flex-shrink-0"
                      style={{
                        width: "40px",
                        height: "40px",
                        backgroundColor: primaryColor,
                        fontSize: "0.9rem",
                      }}
                    >
                      {user.fullName.charAt(0)}
                    </div>
                    <div className="flex-grow-1 position-relative">
                      <Form.Control
                        type="text"
                        placeholder="Viết bình luận của bạn..."
                        className="rounded-pill bg-light border-0 shadow-sm pe-5 py-2"
                        style={{ fontSize: "0.95rem" }}
                        value={newCommentText}
                        onChange={(e) => setNewCommentText(e.target.value)}
                      />
                      <Button
                        type="submit"
                        variant="link"
                        className="position-absolute top-50 translate-middle-y end-0 me-2 p-0 text-secondary hover-primary"
                        style={{ zIndex: 5 }}
                      >
                        <i className="bi bi-send-fill fs-5"></i>
                      </Button>
                    </div>
                  </Form>
                ) : (
                  <div className="text-center py-3 mb-4 bg-light rounded-3 border">
                    <span className="text-muted" style={{ fontSize: "0.9rem" }}>
                      Bạn cần{" "}
                      <span
                        className="text-primary hover-primary fw-bold"
                        style={{ cursor: "pointer" }}
                        onClick={() => navigate("/login")}
                      >
                        Đăng nhập
                      </span>{" "}
                      để bình luận.
                    </span>
                  </div>
                )}

                {selectedPostDetail.comments &&
                selectedPostDetail.comments.length > 0 ? (
                  <div className="d-flex flex-column gap-3">
                    {(commentSortBy === "newest"
                      ? [...selectedPostDetail.comments]
                      : [...selectedPostDetail.comments].reverse()
                    ).map((c) => {
                      const meta = commentMeta[`c_${c.id}`] || {
                        likes: 0,
                        likedBy: [],
                        replies: [],
                      };
                      const isCommentLiked =
                        user && meta.likedBy.includes(user.email);

                      return (
                        <div key={c.id} className="d-flex gap-3">
                          <div
                            className="rounded-circle d-flex justify-content-center align-items-center text-white fw-bold flex-shrink-0"
                            style={{
                              width: "40px",
                              height: "40px",
                              backgroundColor: "#6c757d",
                              fontSize: "0.9rem",
                              cursor: "pointer",
                            }}
                            onClick={() => {
                              setShowDetailModal(false);
                              handleViewUserProfile(c.author, "");
                            }}
                          >
                            {c.author ? c.author.charAt(0) : "U"}
                          </div>
                          <div className="flex-grow-1">
                            <div className="bg-light p-3 rounded-4 border">
                              <div className="d-flex justify-content-between align-items-baseline gap-3 mb-1">
                                <span
                                  className="fw-bold text-dark hover-primary"
                                  style={{
                                    fontSize: "0.95rem",
                                    cursor: "pointer",
                                  }}
                                  onClick={() => {
                                    setShowDetailModal(false);
                                    handleViewUserProfile(c.author, "");
                                  }}
                                >
                                  {c.author}
                                </span>
                                <span
                                  className="text-muted"
                                  style={{ fontSize: "0.8rem" }}
                                >
                                  {c.time}
                                </span>
                              </div>
                              <p
                                className="mb-0 text-secondary"
                                style={{ fontSize: "0.9rem" }}
                              >
                                {c.text}
                              </p>
                            </div>

                            <div
                              className="d-flex gap-3 mt-1 ms-2 text-secondary"
                              style={{ fontSize: "0.8rem" }}
                            >
                              <span
                                className="fw-semibold hover-primary"
                                style={{
                                  cursor: "pointer",
                                  color: isCommentLiked
                                    ? primaryColor
                                    : "inherit",
                                }}
                                onClick={() => handleLikeComment(c)}
                              >
                                <i className="bi bi-hand-thumbs-up-fill me-1"></i>
                                Thích ({meta.likes || 0})
                              </span>
                              <span
                                className="fw-semibold hover-primary"
                                style={{ cursor: "pointer" }}
                                onClick={() => {
                                  if (!requireLogin("phản hồi bình luận"))
                                    return;
                                  setReplyingToId(
                                    replyingToId === c.id ? null : c.id,
                                  );
                                }}
                              >
                                Phản hồi
                              </span>
                            </div>

                            {meta.replies && meta.replies.length > 0 && (
                              <div className="ms-4 mt-2 d-flex flex-column gap-2">
                                {meta.replies.map((rep) => (
                                  <div
                                    key={rep.id}
                                    className="d-flex gap-2 align-items-start"
                                  >
                                    <div
                                      className="rounded-circle d-flex justify-content-center align-items-center text-white fw-bold flex-shrink-0"
                                      style={{
                                        width: "30px",
                                        height: "30px",
                                        backgroundColor: primaryColor,
                                        fontSize: "0.75rem",
                                        cursor: "pointer",
                                      }}
                                      onClick={() => {
                                        setShowDetailModal(false);
                                        handleViewUserProfile(rep.author, "");
                                      }}
                                    >
                                      {rep.author.charAt(0)}
                                    </div>
                                    <div className="bg-white p-2 px-3 rounded-3 border flex-grow-1">
                                      <div className="d-flex justify-content-between">
                                        <span
                                          className="fw-bold text-dark hover-primary"
                                          style={{
                                            fontSize: "0.85rem",
                                            cursor: "pointer",
                                          }}
                                          onClick={() => {
                                            setShowDetailModal(false);
                                            handleViewUserProfile(
                                              rep.author,
                                              "",
                                            );
                                          }}
                                        >
                                          {rep.author}
                                        </span>
                                        <small
                                          className="text-muted"
                                          style={{ fontSize: "0.75rem" }}
                                        >
                                          {rep.time}
                                        </small>
                                      </div>
                                      <p
                                        className="mb-0 text-secondary"
                                        style={{ fontSize: "0.85rem" }}
                                      >
                                        {rep.text}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {replyingToId === c.id && (
                              <Form
                                onSubmit={(e) => handleSubmitReply(c, e)}
                                className="ms-4 mt-2 d-flex gap-2"
                              >
                                <Form.Control
                                  size="sm"
                                  type="text"
                                  placeholder={`Phản hồi ${c.author}...`}
                                  value={replyText}
                                  onChange={(e) => setReplyText(e.target.value)}
                                  className="rounded-pill bg-white"
                                />
                                <Button
                                  size="sm"
                                  type="submit"
                                  className="rounded-pill px-3 border-0"
                                  style={{ backgroundColor: primaryColor }}
                                >
                                  Gửi
                                </Button>
                              </Form>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p
                    className="text-muted text-center mb-0 mt-4"
                    style={{ fontSize: "0.9rem" }}
                  >
                    Chưa có bình luận nào.
                  </p>
                )}
              </div>
            </Modal.Body>
          </Modal>
        )}
      </Container>

      <style>{`
        .transition-hover { transition: transform 0.2s; }
        .transition-hover:hover { transform: translateY(-3px); }
        .hover-primary:hover { color: ${primaryColor} !important; }
        .dropdown-toggle::after { display: none !important; }
      `}</style>
    </div>
  );
};

export default ForumPage;
