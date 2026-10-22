/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Badge,
  Image,
  Modal,
  Alert,
  Spinner,
  Dropdown,
} from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";


const LostFoundPage = ({ user }) => {
  const primaryColor = "#0C8B72";
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const locationData = useLocation();
  const navState = locationData.state || {};

  // States cho bộ lọc API
  const [keyword, setKeyword] = useState(navState.keyword || "");
  const [categoryFilter, setCategoryFilter] = useState("Tất cả danh mục");
  const [locationFilter, setLocationFilter] = useState(
    navState.location || "Toàn campus"
  );
  const [activeTab, setActiveTab] = useState("Tất cả");

  // ===== STATE CHO MODAL ĐĂNG BÀI =====
  const [showPostModal, setShowPostModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState("Ví & giấy tờ");
  const [newLocation, setNewLocation] = useState("");
  const [newTime, setNewTime] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // ===== STATE CHO MODAL CHỈNH SỬA BÀI ĐĂNG =====
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editCategory, setEditCategory] = useState("Ví & giấy tờ");
  const [editLocation, setEditLocation] = useState("Giảng đường");
  const [editDate, setEditDate] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editImagePreview, setEditImagePreview] = useState(null);

  // ===== STATE CHO MODAL XÓA BÀI & XÁC NHẬN TRẠNG THÁI =====
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState(null);

  // ===== STATE CHO MODAL CHI TIẾT, BÌNH LUẬN, TRẢ LỜI & LIKE COMMENT =====
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedPostDetail, setSelectedPostDetail] = useState(null);
  const [commentSortBy, setCommentSortBy] = useState("newest");
  const [newCommentText, setNewCommentText] = useState("");
  const [replyingToId, setReplyingToId] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [commentMeta, setCommentMeta] = useState(() => {
    return JSON.parse(localStorage.getItem("laf_comment_meta_lost")) || {};
  });

  // ===== STATE CHO MODAL CHIA SẺ BÀI ĐĂNG =====
  const [showShareModal, setShowShareModal] = useState(false);
  const [postToShare, setPostToShare] = useState(null);
  const [shareCaption, setShareCaption] = useState("");
  const [shareSuccessMsg, setShareSuccessMsg] = useState("");

  // Kiểm tra quyền tác giả bài viết
  const isOwner = (post) => {
    if (!user || !post) return false;
    return (
      (post.authorEmail &&
        user.email &&
        post.authorEmail.toLowerCase() === user.email.toLowerCase()) ||
      (post.author &&
        user.fullName &&
        post.author.toLowerCase() === user.fullName.toLowerCase())
    );
  };

  const requireLogin = (actionName) => {
    if (!user) {
      alert(`Vui lòng đăng nhập để ${actionName}!`);
      navigate("/login");
      return false;
    }
    return true;
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
      postType: "lost",
      postId,
      message,
      time: "Vừa xong",
      isRead: false,
    };

    const existing =
      JSON.parse(localStorage.getItem("laf_notifications")) || [];
    localStorage.setItem(
      "laf_notifications",
      JSON.stringify([newNotif, ...existing])
    );
    window.dispatchEvent(new Event("laf-notifications-updated"));

    try {
      const params = new URLSearchParams();
      params.append("action", "create");
      params.append("recipientEmail", recipientEmail || "");
      params.append("senderName", user.fullName);
      params.append("type", type);
      params.append("postType", "lost");
      params.append("postId", postId);
      params.append("message", message);
      await axios.post("/api/notifications", params);
    } catch {
      // Đã lưu localStorage
    }
  };

  const handleViewUserProfile = (authorName, authorEmail, e) => {
    if (e) e.stopPropagation();
    const query = new URLSearchParams();
    if (authorEmail) query.set("email", authorEmail);
    if (authorName) query.set("name", authorName);
    navigate(`/profile?${query.toString()}`);
  };

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/lost-posts", {
        params: {
          keyword: keyword,
          category: categoryFilter === "Tất cả danh mục" ? "" : categoryFilter,
          location: locationFilter === "Toàn campus" ? "" : locationFilter,
          email: user ? user.email : "",
        },
      });
      const localImages =
        JSON.parse(localStorage.getItem("laf_lost_images")) || {};
      const localEdits =
        JSON.parse(localStorage.getItem("laf_edited_lost_posts")) || {};
      const deletedIds =
        JSON.parse(localStorage.getItem("laf_deleted_lost_ids")) || [];

      const merged = (response.data || [])
        .filter((p) => !deletedIds.includes(p.id))
        .map((p) => {
          const edited = localEdits[p.id] || {};
          return {
            ...p,
            ...edited,
            image:
              edited.image ||
              p.image ||
              localImages[p.id] ||
              localImages[p.title] ||
              null,
          };
        });
      setPosts(merged);

      if (navState.openPostId) {
        const target = merged.find(
          (item) => Number(item.id) === Number(navState.openPostId)
        );
        if (target) {
          setSelectedPostDetail(target);
          setShowDetailModal(true);
        }
      }
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu bài đăng mất đồ:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [user, navState.openPostId]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchPosts();
  };

  const handleReset = async () => {
    setKeyword("");
    setCategoryFilter("Tất cả danh mục");
    setLocationFilter("Toàn campus");
    setActiveTab("Tất cả");
    setLoading(true);
    try {
      const response = await axios.get("/api/lost-posts", {
        params: {
          keyword: "",
          category: "",
          location: "",
          email: user ? user.email : "",
        },
      });
      const deletedIds =
        JSON.parse(localStorage.getItem("laf_deleted_lost_ids")) || [];
      setPosts((response.data || []).filter((p) => !deletedIds.includes(p.id)));
    } catch (error) {
      console.error("Lỗi khi tải lại dữ liệu:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPostModal = () => {
    if (requireLogin("đăng bài tìm đồ")) {
      setShowPostModal(true);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
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
      params.append("location", newLocation || "Giảng đường");
      params.append("time", newTime);
      if (imagePreview) {
        params.append("imageUrl", imagePreview);
      }

      const response = await axios.post("/api/lost-posts", params);
      if (response.data.success) {
        if (imagePreview) {
          const localImages =
            JSON.parse(localStorage.getItem("laf_lost_images")) || {};
          localImages[newTitle] = imagePreview;
          localStorage.setItem("laf_lost_images", JSON.stringify(localImages));
        }
        setShowPostModal(false);
        setNewTitle("");
        setNewContent("");
        setNewLocation("");
        setNewTime("");
        setSelectedImage(null);
        setImagePreview(null);
        fetchPosts();
      }
    } catch (error) {
      console.error("Lỗi khi đăng bài:", error);
    } finally {
      setSubmitting(false);
    }
  };

  // Mở Modal Chỉnh sửa bài đăng của mình
  const handleOpenEditModal = (post, e) => {
    if (e) e.stopPropagation();
    setEditingPost(post);
    setEditTitle(post.title || "");
    setEditCategory(post.category || "Ví & giấy tờ");
    setEditLocation(post.location || "Giảng đường");
    setEditDate(post.date || "");
    setEditContent(post.content || "");
    setEditImagePreview(post.image || null);
    setShowEditModal(true);
  };

  // Lưu Chỉnh sửa bài đăng
  const handleSaveEditPost = async (e) => {
    e.preventDefault();
    if (!editingPost || !editTitle.trim() || !editContent.trim()) return;

    const updatedFields = {
      title: editTitle.trim(),
      category: editCategory,
      location: editLocation,
      date: editDate || editingPost.date,
      content: editContent.trim(),
      image: editImagePreview,
    };

    try {
      const params = new URLSearchParams();
      params.append("action", "update");
      params.append("postId", editingPost.id);
      params.append("title", updatedFields.title);
      params.append("category", updatedFields.category);
      params.append("location", updatedFields.location);
      params.append("content", updatedFields.content);
      await axios.post("/api/lost-posts", params);
    } catch {
      // Đồng bộ tiếp ở state & localStorage bên dưới
    }

    const localEdits =
      JSON.parse(localStorage.getItem("laf_edited_lost_posts")) || {};
    localEdits[editingPost.id] = updatedFields;
    localStorage.setItem("laf_edited_lost_posts", JSON.stringify(localEdits));

    setPosts(
      posts.map((p) =>
        p.id === editingPost.id ? { ...p, ...updatedFields } : p
      )
    );
    if (selectedPostDetail && selectedPostDetail.id === editingPost.id) {
      setSelectedPostDetail((prev) => ({ ...prev, ...updatedFields }));
    }
    setShowEditModal(false);
  };

  // Xóa bài đăng
  const handleDeleteConfirm = async () => {
    try {
      const params = new URLSearchParams();
      params.append("action", "delete");
      params.append("postId", selectedPostId);
      await axios.post("/api/lost-posts", params);
    } catch {
      // Bỏ qua nếu backend chưa xử lý
    } finally {
      const deletedIds =
        JSON.parse(localStorage.getItem("laf_deleted_lost_ids")) || [];
      localStorage.setItem(
        "laf_deleted_lost_ids",
        JSON.stringify([...deletedIds, selectedPostId])
      );
      setPosts(posts.filter((post) => post.id !== selectedPostId));
      if (selectedPostDetail && selectedPostDetail.id === selectedPostId) {
        setShowDetailModal(false);
      }
      setShowDeleteModal(false);
    }
  };

  // Đổi trạng thái Đang tìm đồ <-> Đã tìm được
  const handleStatusConfirm = async () => {
    const targetPost = posts.find((p) => p.id === selectedPostId);
    if (!targetPost) return;
    const nextStatus =
      targetPost.status === "Đang tìm đồ" ? "Đã tìm được" : "Đang tìm đồ";

    try {
      const params = new URLSearchParams();
      params.append("action", "status");
      params.append("postId", selectedPostId);
      params.append("status", nextStatus);
      await axios.post("/api/lost-posts", params);
    } catch {
      // Vẫn cập nhật giao diện
    } finally {
      setPosts(
        posts.map((post) =>
          post.id === selectedPostId ? { ...post, status: nextStatus } : post
        )
      );
      if (selectedPostDetail && selectedPostDetail.id === selectedPostId) {
        setSelectedPostDetail((prev) => ({ ...prev, status: nextStatus }));
      }
      setShowStatusModal(false);
    }
  };

  const handleLikePost = async (post, e) => {
    if (e) e.stopPropagation();
    if (!requireLogin("thích bài viết")) return;

    try {
      const params = new URLSearchParams();
      params.append("action", "like");
      params.append("postId", post.id);
      params.append("email", user.email);

      const response = await axios.post("/api/lost-posts", params);
      if (response.data.success) {
        if (response.data.hasLiked) {
          pushNotification({
            recipientEmail: post.authorEmail,
            recipientName: post.author,
            type: "LIKE_POST",
            postId: post.id,
            message: `đã thích bài tìm đồ "${post.title}" của bạn.`,
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
              : p
          )
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

      const response = await axios.post("/api/lost-posts", params);
      if (response.data.success) {
        pushNotification({
          recipientEmail: selectedPostDetail.authorEmail,
          recipientName: selectedPostDetail.author,
          type: "COMMENT",
          postId: selectedPostDetail.id,
          message: `đã bình luận về bài đăng "${selectedPostDetail.title}": "${newCommentText}"`,
        });

        const updatedComments = response.data.comments;
        const updatedPost = {
          ...selectedPostDetail,
          comments: updatedComments,
          commentsCount: updatedComments.length,
        };
        setSelectedPostDetail(updatedPost);
        setPosts(
          posts.map((p) => (p.id === selectedPostDetail.id ? updatedPost : p))
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
    localStorage.setItem("laf_comment_meta_lost", JSON.stringify(nextMeta));

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
    localStorage.setItem("laf_comment_meta_lost", JSON.stringify(nextMeta));

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

  const handleConfirmShare = async (e) => {
    e.preventDefault();
    if (!postToShare || !user) return;

    const sharedItem = {
      shareId: Date.now(),
      sharerName: user.fullName,
      sharerEmail: user.email,
      caption: shareCaption.trim(),
      sharedAt: new Date().toLocaleDateString("vi-VN"),
      postType: "lost",
      originalPost: {
        id: postToShare.id,
        title: postToShare.title,
        content: postToShare.content,
        category: postToShare.category,
        location: postToShare.location,
        author: postToShare.author,
        authorEmail: postToShare.authorEmail,
        date: postToShare.date || postToShare.time,
        image: postToShare.image,
        status: postToShare.status,
      },
      likes: 0,
      likedBy: [],
      comments: [],
    };

    const existingShares =
      JSON.parse(localStorage.getItem("laf_shared_posts")) || [];
    localStorage.setItem(
      "laf_shared_posts",
      JSON.stringify([sharedItem, ...existingShares])
    );

    pushNotification({
      recipientEmail: postToShare.authorEmail,
      recipientName: postToShare.author,
      type: "SHARE",
      postId: postToShare.id,
      message: `đã chia sẻ bài đăng "${postToShare.title}" của bạn về trang cá nhân.`,
    });

    setShareSuccessMsg("Đã chia sẻ bài viết về trang cá nhân của bạn!");
    setTimeout(() => {
      setShowShareModal(false);
    }, 1200);
  };

  const displayedPosts = posts.filter((post) => {
    if (activeTab === "Tất cả") return true;
    if (activeTab === "Bài của tôi") return isOwner(post);
    return post.status === activeTab;
  });

  return (
    <div
      className="text-start"
      style={{
        backgroundColor: "#F4F7F6",
        minHeight: "100vh",
        paddingBottom: "40px",
      }}
    >
      <div className="bg-white border-bottom pt-5 pb-4 mb-4 text-start">
        <Container>
          <div className="d-flex justify-content-between align-items-end flex-wrap gap-3">
            <div>
              <p
                className="fw-bold mb-2"
                style={{
                  color: primaryColor,
                  fontSize: "0.85rem",
                  letterSpacing: "1px",
                }}
              >
                <i
                  className="bi bi-circle-fill me-2"
                  style={{ fontSize: "8px" }}
                ></i>{" "}
                CAMPUS FPT CẦN THƠ - TÌM ĐỒ BỊ MẤT
              </p>
              <h2
                className="fw-bold mb-2"
                style={{ color: "#10393B", fontSize: "2rem" }}
              >
                Bạn đang tìm đồ? Cùng lên tiếng.
              </h2>
              <p className="text-secondary mb-0" style={{ maxWidth: "600px" }}>
                Đăng bài tìm món đồ bị mất, chia sẻ manh mối và giúp nhau tìm
                lại.
              </p>
            </div>
            <Button
              className="fw-bold px-4 py-2 shadow-sm border-0 d-flex align-items-center"
              style={{ backgroundColor: primaryColor }}
              onClick={handleOpenPostModal}
            >
              <i className="bi bi-megaphone-fill me-2"></i> Đăng tin tìm đồ
            </Button>
          </div>
        </Container>
      </div>

      <Container>
        <Row className="g-4">
          <Col lg={3}>
            <Card
              className="border-0 shadow-sm rounded-4 p-4 sticky-top text-start"
              style={{ top: "85px", zIndex: 1000 }}
            >
              <h5 className="fw-bold mb-4" style={{ color: "#10393B" }}>
                Tìm món đồ của bạn
              </h5>
              <Form onSubmit={handleSearch}>
                <Form.Group className="mb-4">
                  <Form.Label
                    className="fw-semibold text-secondary"
                    style={{ fontSize: "0.9rem" }}
                  >
                    Từ khóa
                  </Form.Label>
                  <div className="position-relative">
                    <i
                      className="bi bi-search position-absolute top-50 translate-middle-y text-secondary"
                      style={{ left: "15px" }}
                    ></i>
                    <Form.Control
                      type="text"
                      placeholder="Tên, màu sắc món đồ..."
                      style={{ paddingLeft: "40px" }}
                      value={keyword}
                      onChange={(e) => setKeyword(e.target.value)}
                      className="bg-light border-0 shadow-none py-2"
                    />
                  </div>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label
                    className="fw-semibold text-secondary"
                    style={{ fontSize: "0.9rem" }}
                  >
                    Danh mục
                  </Form.Label>
                  <Form.Select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="bg-light border-0 shadow-none py-2"
                  >
                    <option value="Tất cả danh mục">Tất cả danh mục</option>
                    <option value="Ví & giấy tờ">Ví & giấy tờ</option>
                    <option value="Đồ điện tử">Đồ điện tử</option>
                    <option value="Chìa khóa">Chìa khóa</option>
                    <option value="Túi & balo">Túi & balo</option>
                    <option value="Đồ dùng cá nhân">Đồ dùng cá nhân</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label
                    className="fw-semibold text-secondary"
                    style={{ fontSize: "0.9rem" }}
                  >
                    Địa điểm bị mất
                  </Form.Label>
                  <Form.Select
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    className="bg-light border-0 shadow-none py-2"
                  >
                    <option value="Toàn campus">Toàn campus</option>
                    <option value="Tòa Alpha">Tòa Alpha</option>
                    <option value="Tòa Beta">Tòa Beta</option>
                    <option value="Giảng đường">Giảng đường</option>
                    <option value="Thư viện">Thư viện</option>
                    <option value="Căn tin">Căn tin</option>
                    <option value="Bãi gửi xe">Bãi gửi xe</option>
                  </Form.Select>
                </Form.Group>

                <Button
                  type="submit"
                  className="w-100 fw-bold mb-3 border-0 py-2"
                  style={{ backgroundColor: primaryColor }}
                >
                  <i className="bi bi-search me-2"></i> Lọc kết quả
                </Button>

                <div className="text-center">
                  <Button
                    variant="link"
                    onClick={handleReset}
                    className="text-decoration-none text-secondary p-0"
                    style={{ fontSize: "0.9rem" }}
                  >
                    Đặt lại bộ lọc
                  </Button>
                </div>
              </Form>
            </Card>
          </Col>

          <Col lg={9}>
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
              <h5 className="fw-bold mb-0 text-dark">Bài đăng từ cộng đồng</h5>
              <div className="d-flex gap-2 flex-wrap">
                {["Tất cả", "Đang tìm đồ", "Đã tìm được", "Bài của tôi"].map(
                  (tab) => (
                    <Button
                      key={tab}
                      size="sm"
                      className={`rounded-pill px-3 fw-medium border-0 ${
                        activeTab === tab
                          ? "text-white"
                          : "text-dark bg-white shadow-sm"
                      }`}
                      style={{
                        backgroundColor:
                          activeTab === tab ? primaryColor : "white",
                      }}
                      onClick={() => setActiveTab(tab)}
                    >
                      {tab}
                    </Button>
                  )
                )}
              </div>
            </div>

            {loading ? (
              <div className="text-center py-5">
                <Spinner animation="border" style={{ color: primaryColor }} />
              </div>
            ) : displayedPosts.length === 0 ? (
              <div className="text-center py-5 text-secondary">
                <h5>Không tìm thấy bài đăng nào.</h5>
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {displayedPosts.map((post) => (
                  <Card
                    key={post.id}
                    className="border-0 shadow-sm rounded-4 p-4 text-start transition-hover"
                    style={{ cursor: "pointer" }}
                    onClick={() => handleOpenDetailModal(post)}
                  >
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div
                        className="d-flex align-items-center gap-3"
                        onClick={(e) =>
                          handleViewUserProfile(
                            post.author,
                            post.authorEmail,
                            e
                          )
                        }
                        title={`Xem trang cá nhân của ${post.author}`}
                      >
                        <div
                          className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow-sm"
                          style={{
                            width: "45px",
                            height: "45px",
                            backgroundColor: primaryColor,
                          }}
                        >
                          {post.author ? post.author.charAt(0) : "U"}
                        </div>
                        <div>
                          <h6 className="fw-bold mb-0 text-dark hover-primary">
                            {post.author}
                          </h6>
                          <span
                            className="text-muted"
                            style={{ fontSize: "0.8rem" }}
                          >
                            {post.time}
                          </span>
                        </div>
                      </div>

                      {/* GÓC TRÊN PHẢI: CATEGORY + TRẠNG THÁI + NÚT ... (SỬA/XÓA) */}
                      <div
                        className="d-flex align-items-center gap-2 flex-wrap justify-content-end"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Badge
                          bg="light"
                          className="text-dark border px-3 py-2 rounded-pill fw-semibold"
                          style={{ fontSize: "0.78rem" }}
                        >
                          <i
                            className="bi bi-tag-fill me-1"
                            style={{ color: primaryColor }}
                          ></i>
                          {post.category}
                        </Badge>

                        <div
                          onClick={() => {
                            if (isOwner(post)) {
                              setSelectedPostId(post.id);
                              setShowStatusModal(true);
                            }
                          }}
                          className="fw-bold px-3 py-2 rounded-pill"
                          style={{
                            fontSize: "0.8rem",
                            border:
                              post.status === "Đang tìm đồ"
                                ? "1px solid #ffc107"
                                : "1px solid #198754",
                            color:
                              post.status === "Đang tìm đồ"
                                ? "#b38600"
                                : "white",
                            backgroundColor:
                              post.status === "Đang tìm đồ"
                                ? "#fff9e6"
                                : "#0C8B72",
                            cursor: isOwner(post) ? "pointer" : "default",
                            transition: "all 0.2s",
                          }}
                          title={
                            isOwner(post)
                              ? "Bấm để đổi trạng thái tìm đồ"
                              : ""
                          }
                        >
                          {post.status}
                        </div>

                        {/* NÚT ... CHO BÀI ĐĂNG CỦA BẢN THÂN */}
                        {isOwner(post) && (
                          <Dropdown align="end">
                            <Dropdown.Toggle
                              variant="light"
                              size="sm"
                              className="rounded-circle border-0 shadow-sm d-flex align-items-center justify-content-center p-0 no-caret"
                              style={{ width: "32px", height: "32px" }}
                            >
                              <i className="bi bi-three-dots fs-5 text-secondary"></i>
                            </Dropdown.Toggle>
                            <Dropdown.Menu
                              className="shadow border-0 rounded-3"
                              style={{ fontSize: "0.9rem" }}
                            >
                              <Dropdown.Item
                                onClick={(e) => handleOpenEditModal(post, e)}
                                className="py-2"
                              >
                                <i
                                  className="bi bi-pencil-square me-2"
                                  style={{ color: primaryColor }}
                                ></i>
                                Chỉnh sửa bài đăng
                              </Dropdown.Item>
                              <Dropdown.Item
                                onClick={() => {
                                  setSelectedPostId(post.id);
                                  setShowDeleteModal(true);
                                }}
                                className="py-2 text-danger"
                              >
                                <i className="bi bi-trash3-fill me-2"></i>
                                Xóa bài đăng
                              </Dropdown.Item>
                            </Dropdown.Menu>
                          </Dropdown>
                        )}
                      </div>
                    </div>

                    <Row className="g-3 my-1">
                      <Col md={post.image ? 8 : 12}>
                        <h5
                          className="fw-bold mb-2"
                          style={{ color: "#10393B" }}
                        >
                          {post.title}
                        </h5>
                        <p
                          className="text-secondary mb-3"
                          style={{ fontSize: "0.95rem", lineHeight: "1.6" }}
                        >
                          {post.content}
                        </p>

                        <div
                          className="d-flex flex-wrap gap-2 text-muted mb-2"
                          style={{ fontSize: "0.85rem" }}
                        >
                          <span className="bg-light px-2 py-1 rounded-3">
                            <i className="bi bi-geo-alt-fill me-1"></i>{" "}
                            {post.location}
                          </span>
                          <span className="bg-light px-2 py-1 rounded-3">
                            <i className="bi bi-clock-fill me-1"></i>{" "}
                            {post.date}
                          </span>
                        </div>
                      </Col>
                      {post.image && (
                        <Col
                          md={4}
                          className="d-flex align-items-center justify-content-end"
                        >
                          <Image
                            src={post.image}
                            rounded
                            className="object-fit-cover shadow-sm"
                            style={{ width: "100%", maxHeight: "150px" }}
                          />
                        </Col>
                      )}
                    </Row>

                    <div
                      className="mt-3 pt-3 border-top d-flex justify-content-between text-secondary"
                      style={{ fontSize: "0.85rem" }}
                    >
                      <span
                        className="hover-primary fw-medium"
                        style={{
                          color: post.hasLiked ? primaryColor : "inherit",
                          cursor: "pointer",
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
                        style={{ cursor: "pointer" }}
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
                        style={{ cursor: "pointer" }}
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
      </Container>

      {/* ================= MODAL TẠO BÀI ĐĂNG (CÓ CUỘN DỌC) ================= */}
      <Modal
        show={showPostModal}
        onHide={() => setShowPostModal(false)}
        centered
        scrollable
        size="lg"
        contentClassName="border-0 shadow-lg rounded-4"
      >
        <Modal.Header closeButton className="border-0 pb-0 mt-2 mx-3">
          <Modal.Title
            className="fw-bold d-flex align-items-center"
            style={{ color: "#212529" }}
          >
            <i
              className="bi bi-megaphone-fill me-2"
              style={{ color: primaryColor }}
            ></i>{" "}
            Đăng tin tìm đồ bị mất
          </Modal.Title>
        </Modal.Header>

        <Modal.Body
          className="mx-3 py-3 text-start"
          style={{ maxHeight: "75vh", overflowY: "auto" }}
        >
          <Alert variant="warning" className="border-0 shadow-sm py-2">
            <i className="bi bi-exclamation-triangle-fill me-2"></i> Không đăng
            tải các thông tin nhạy cảm (Số CMND/CCCD, Số thẻ ngân hàng...).
          </Alert>

          <Form id="lostForm" onSubmit={handleSubmitPost}>
            <Row className="g-4">
              <Col md={12}>
                <Form.Group>
                  <Form.Label
                    className="fw-semibold text-secondary"
                    style={{ fontSize: "0.9rem" }}
                  >
                    Tiêu đề bài đăng <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Ví dụ: Tìm ví da màu nâu bị mất ở thư viện"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    required
                    className="bg-light border-0 shadow-none px-3 py-2"
                  />
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group>
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
                    <option value="Ví & giấy tờ">Ví & giấy tờ</option>
                    <option value="Đồ điện tử">Đồ điện tử</option>
                    <option value="Chìa khóa">Chìa khóa</option>
                    <option value="Túi & balo">Túi & balo</option>
                    <option value="Đồ dùng cá nhân">Đồ dùng cá nhân</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group>
                  <Form.Label
                    className="fw-semibold text-secondary"
                    style={{ fontSize: "0.9rem" }}
                  >
                    Địa điểm mất
                  </Form.Label>
                  <Form.Select
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="bg-light border-0 shadow-none px-3 py-2"
                    required
                  >
                    <option value="">Chọn khu vực</option>
                    <option value="Tòa Alpha">Tòa Alpha</option>
                    <option value="Tòa Beta">Tòa Beta</option>
                    <option value="Giảng đường">Giảng đường</option>
                    <option value="Thư viện">Thư viện</option>
                    <option value="Căn tin">Căn tin</option>
                    <option value="Bãi gửi xe">Bãi gửi xe</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group>
                  <Form.Label
                    className="fw-semibold text-secondary"
                    style={{ fontSize: "0.9rem" }}
                  >
                    Thời gian mất
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="VD: Sáng nay 9h00"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="bg-light border-0 shadow-none px-3 py-2"
                  />
                </Form.Group>
              </Col>

              <Col md={12}>
                <Form.Group>
                  <Form.Label
                    className="fw-semibold text-secondary"
                    style={{ fontSize: "0.9rem" }}
                  >
                    Mô tả chi tiết <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Màu sắc, đặc điểm nhận biết, nơi bạn nhìn thấy lần cuối..."
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    required
                    className="bg-light border-0 shadow-none p-3"
                  />
                </Form.Group>
              </Col>

              <Col md={12}>
                <Form.Group>
                  <Form.Label
                    className="fw-semibold text-secondary d-block"
                    style={{ fontSize: "0.9rem" }}
                  >
                    Hình ảnh minh họa món đồ (nếu có)
                  </Form.Label>
                  <div className="d-flex align-items-center gap-3">
                    <Form.Control
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      id="upload-lost-photo"
                      className="d-none"
                    />
                    <label
                      htmlFor="upload-lost-photo"
                      className="btn btn-outline-secondary d-flex align-items-center gap-2"
                      style={{ borderStyle: "dashed" }}
                    >
                      <i className="bi bi-camera"></i> Chọn ảnh từ thiết bị
                    </label>
                    {selectedImage && (
                      <span
                        className="text-success fw-medium"
                        style={{ fontSize: "0.9rem" }}
                      >
                        <i className="bi bi-check-circle-fill me-1"></i>{" "}
                        {selectedImage.name}
                      </span>
                    )}
                  </div>
                  {imagePreview && (
                    <div className="mt-3 position-relative d-inline-block">
                      <Image
                        src={imagePreview}
                        rounded
                        style={{
                          width: "160px",
                          height: "110px",
                          objectFit: "cover",
                          border: "2px solid #e2e8f0",
                        }}
                      />
                      <Button
                        variant="danger"
                        size="sm"
                        className="position-absolute top-0 end-0 rounded-circle p-0"
                        style={{
                          width: "24px",
                          height: "24px",
                          transform: "translate(30%, -30%)",
                        }}
                        onClick={() => {
                          setSelectedImage(null);
                          setImagePreview(null);
                        }}
                      >
                        <i className="bi bi-x"></i>
                      </Button>
                    </div>
                  )}
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>

        <Modal.Footer className="border-0 pt-0 mb-2 mx-3 d-flex justify-content-end">
          <Button
            variant="light"
            className="fw-semibold px-4"
            onClick={() => setShowPostModal(false)}
          >
            Hủy
          </Button>
          <Button
            type="submit"
            form="lostForm"
            className="fw-semibold px-4 border-0 text-white"
            style={{ backgroundColor: primaryColor }}
            disabled={submitting}
          >
            {submitting ? <Spinner size="sm" /> : "Đăng bài"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ================= MODAL CHỈNH SỬA BÀI ĐĂNG ================= */}
      <Modal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        centered
        scrollable
        size="lg"
        contentClassName="border-0 shadow-lg rounded-4"
      >
        <Modal.Header closeButton className="border-0 pb-0 mt-2 mx-3">
          <Modal.Title className="fw-bold" style={{ color: "#10393B" }}>
            <i
              className="bi bi-pencil-square me-2"
              style={{ color: primaryColor }}
            ></i>
            Chỉnh sửa bài tìm đồ
          </Modal.Title>
        </Modal.Header>
        <Modal.Body
          className="mx-3 py-3 text-start"
          style={{ maxHeight: "75vh", overflowY: "auto" }}
        >
          <Form id="editLostForm" onSubmit={handleSaveEditPost}>
            <Row className="g-3">
              <Col md={12}>
                <Form.Label className="fw-semibold text-secondary">
                  Tiêu đề bài đăng
                </Form.Label>
                <Form.Control
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  required
                  className="bg-light border-0 shadow-none"
                />
              </Col>
              <Col md={6}>
                <Form.Label className="fw-semibold text-secondary">
                  Danh mục
                </Form.Label>
                <Form.Select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="bg-light border-0 shadow-none"
                >
                  <option value="Ví & giấy tờ">Ví & giấy tờ</option>
                  <option value="Đồ điện tử">Đồ điện tử</option>
                  <option value="Chìa khóa">Chìa khóa</option>
                  <option value="Túi & balo">Túi & balo</option>
                  <option value="Đồ dùng cá nhân">Đồ dùng cá nhân</option>
                </Form.Select>
              </Col>
              <Col md={6}>
                <Form.Label className="fw-semibold text-secondary">
                  Địa điểm mất
                </Form.Label>
                <Form.Select
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  className="bg-light border-0 shadow-none"
                >
                  <option value="Tòa Alpha">Tòa Alpha</option>
                  <option value="Tòa Beta">Tòa Beta</option>
                  <option value="Giảng đường">Giảng đường</option>
                  <option value="Thư viện">Thư viện</option>
                  <option value="Căn tin">Căn tin</option>
                  <option value="Bãi gửi xe">Bãi gửi xe</option>
                </Form.Select>
              </Col>
              <Col md={12}>
                <Form.Label className="fw-semibold text-secondary">
                  Mô tả chi tiết
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  required
                  className="bg-light border-0 shadow-none"
                />
              </Col>
              <Col md={12}>
                <Form.Label className="fw-semibold text-secondary d-block">
                  Cập nhật hình ảnh
                </Form.Label>
                <Form.Control
                  type="file"
                  accept="image/*"
                  onChange={handleEditImageChange}
                  className="mb-2"
                />
                {editImagePreview && (
                  <Image
                    src={editImagePreview}
                    rounded
                    style={{ width: "150px", height: "100px", objectFit: "cover" }}
                  />
                )}
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0 mb-2 mx-3">
          <Button variant="light" onClick={() => setShowEditModal(false)}>
            Hủy
          </Button>
          <Button
            type="submit"
            form="editLostForm"
            className="border-0 text-white fw-semibold px-4"
            style={{ backgroundColor: primaryColor }}
          >
            Lưu thay đổi
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ================= MODAL XÓA BÀI ================= */}
      <Modal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        centered
        contentClassName="border-0 shadow-lg rounded-4"
      >
        <Modal.Header closeButton className="border-0 pb-0 mt-3 mx-3">
          <Modal.Title
            className="fw-bold d-flex align-items-center"
            style={{ color: "#212529", fontSize: "1.4rem" }}
          >
            <i
              className="bi bi-exclamation-triangle-fill me-3 text-danger"
              style={{ fontSize: "1.5rem" }}
            ></i>
            Xóa bài đăng
          </Modal.Title>
        </Modal.Header>
        <Modal.Body
          className="text-secondary mx-3 pt-3 pb-4"
          style={{ fontSize: "1.05rem", lineHeight: "1.6" }}
        >
          Bạn có chắc chắn muốn xóa bài đăng này không? Hành động này không thể
          hoàn tác.
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0 mb-3 mx-3 d-flex justify-content-end gap-2">
          <Button
            className="fw-semibold border-0 text-dark"
            style={{
              backgroundColor: "#F4F4F5",
              borderRadius: "12px",
              padding: "10px 20px",
            }}
            onClick={() => setShowDeleteModal(false)}
          >
            Hủy bỏ
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

      {/* ================= MODAL XÁC NHẬN ĐỔI TRẠNG THÁI ================= */}
      <Modal
        show={showStatusModal}
        onHide={() => setShowStatusModal(false)}
        centered
        contentClassName="border-0 shadow-lg rounded-4"
      >
        <Modal.Header closeButton className="border-0 pb-0 mt-3 mx-3">
          <Modal.Title
            className="fw-bold d-flex align-items-center"
            style={{ color: "#212529", fontSize: "1.4rem" }}
          >
            <i
              className="bi bi-check-circle-fill me-3"
              style={{ color: primaryColor, fontSize: "1.5rem" }}
            ></i>
            Cập nhật trạng thái?
          </Modal.Title>
        </Modal.Header>
        <Modal.Body
          className="text-secondary mx-3 pt-3 pb-4"
          style={{ fontSize: "1.05rem", lineHeight: "1.6" }}
        >
          Bạn có chắc chắn muốn thay đổi trạng thái của bài đăng tìm đồ này
          không?
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0 mb-3 mx-3 d-flex justify-content-end gap-2">
          <Button
            className="fw-semibold border-0 text-dark"
            style={{
              backgroundColor: "#F4F4F5",
              borderRadius: "12px",
              padding: "10px 20px",
            }}
            onClick={() => setShowStatusModal(false)}
          >
            Hủy
          </Button>
          <Button
            className="fw-semibold text-white border-0"
            style={{
              backgroundColor: "#0C8B72",
              borderRadius: "12px",
              padding: "10px 20px",
            }}
            onClick={handleStatusConfirm}
          >
            Xác nhận
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ================= MODAL CHIA SẺ BÀI ĐĂNG ================= */}
      <Modal
        show={showShareModal}
        onHide={() => setShowShareModal(false)}
        centered
        contentClassName="border-0 shadow-lg rounded-4"
      >
        <Modal.Header closeButton className="border-0 pb-0 mt-3 mx-3">
          <Modal.Title className="fw-bold" style={{ color: "#10393B" }}>
            <i
              className="bi bi-share-fill me-2"
              style={{ color: primaryColor }}
            ></i>
            Chia sẻ về trang cá nhân
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
                  placeholder="Hãy nói gì đó về bài đăng này..."
                  value={shareCaption}
                  onChange={(e) => setShareCaption(e.target.value)}
                  className="bg-light border-0 shadow-none p-3 rounded-3"
                />
              </Form.Group>

              <div className="p-3 rounded-3 border bg-white mb-3">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span className="fw-bold text-dark">
                    {postToShare.author}
                  </span>
                  <Badge bg="secondary">{postToShare.category}</Badge>
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

      {/* ================= MODAL CHI TIẾT BÀI ĐĂNG & BÌNH LUẬN (CUỘN MƯỢT MÀ + CÓ NÚT ...) ================= */}
      {selectedPostDetail && (
        <Modal
          show={showDetailModal}
          onHide={() => setShowDetailModal(false)}
          centered
          scrollable
          size="lg"
          contentClassName="border-0 shadow-lg rounded-4"
        >
          <Modal.Header closeButton className="border-0 pb-2 mt-2 mx-3">
            <div className="d-flex align-items-center justify-content-between w-100 me-2">
              <div
                className="d-flex align-items-center gap-3"
                style={{ cursor: "pointer" }}
                onClick={() => {
                  setShowDetailModal(false);
                  handleViewUserProfile(
                    selectedPostDetail.author,
                    selectedPostDetail.authorEmail
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
                  {selectedPostDetail.author
                    ? selectedPostDetail.author.charAt(0)
                    : "U"}
                </div>
                <div>
                  <h5 className="fw-bold mb-0 text-dark hover-primary">
                    {selectedPostDetail.author}
                  </h5>
                  <span className="text-muted" style={{ fontSize: "0.85rem" }}>
                    Đăng lúc: {selectedPostDetail.time}
                  </span>
                </div>
              </div>

              {isOwner(selectedPostDetail) && (
                <Dropdown align="end">
                  <Dropdown.Toggle
                    variant="light"
                    size="sm"
                    className="rounded-circle border-0 shadow-sm d-flex align-items-center justify-content-center p-0 no-caret"
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
                      <i
                        className="bi bi-pencil-square me-2"
                        style={{ color: primaryColor }}
                      ></i>
                      Chỉnh sửa bài đăng
                    </Dropdown.Item>
                    <Dropdown.Item
                      onClick={() => {
                        setSelectedPostId(selectedPostDetail.id);
                        setShowDeleteModal(true);
                      }}
                      className="py-2 text-danger"
                    >
                      <i className="bi bi-trash3-fill me-2"></i>
                      Xóa bài đăng
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              )}
            </div>
          </Modal.Header>

          <Modal.Body
            className="mx-3 py-3 text-start"
            style={{ maxHeight: "75vh", overflowY: "auto" }}
          >
            <div className="d-flex gap-2 mb-3">
              <Badge
                bg={
                  selectedPostDetail.status === "Đang tìm đồ"
                    ? "warning"
                    : "success"
                }
                className={`px-3 py-2 rounded-pill fw-medium ${
                  selectedPostDetail.status === "Đang tìm đồ" ? "text-dark" : ""
                }`}
              >
                {selectedPostDetail.status}
              </Badge>
              <Badge
                bg="light"
                className="text-dark border px-3 py-2 rounded-pill fw-semibold"
              >
                <i
                  className="bi bi-tag-fill me-1"
                  style={{ color: primaryColor }}
                ></i>
                {selectedPostDetail.category}
              </Badge>
            </div>

            <h4 className="fw-bold mb-3" style={{ color: "#10393B" }}>
              {selectedPostDetail.title}
            </h4>
            <p
              className="text-secondary mb-4"
              style={{ fontSize: "1rem", lineHeight: "1.6" }}
            >
              {selectedPostDetail.content}
            </p>

            <Row className="g-3 mb-4">
              <Col md={6}>
                <div className="p-3 bg-light rounded-3 h-100 border">
                  <p className="text-muted mb-1" style={{ fontSize: "0.85rem" }}>
                    <i className="bi bi-geo-alt-fill me-2"></i> Địa điểm mất
                  </p>
                  <h6 className="fw-bold mb-0 text-dark">
                    {selectedPostDetail.location}
                  </h6>
                </div>
              </Col>
              <Col md={6}>
                <div className="p-3 bg-light rounded-3 h-100 border">
                  <p className="text-muted mb-1" style={{ fontSize: "0.85rem" }}>
                    <i className="bi bi-clock-fill me-2"></i> Thời gian mất
                  </p>
                  <h6 className="fw-bold mb-0 text-dark">
                    {selectedPostDetail.date}
                  </h6>
                </div>
              </Col>
            </Row>

            {selectedPostDetail.image && (
              <div className="mb-4 text-center">
                <Image
                  src={selectedPostDetail.image}
                  rounded
                  className="shadow-sm w-100"
                  style={{
                    maxHeight: "350px",
                    objectFit: "contain",
                    backgroundColor: "#f8fafc",
                  }}
                />
              </div>
            )}

            <div className="py-3 border-top border-bottom d-flex justify-content-around text-secondary mb-4">
              <span
                className="hover-primary fw-medium"
                style={{
                  cursor: "pointer",
                  color: selectedPostDetail.hasLiked ? primaryColor : "inherit",
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
                            handleViewUserProfile(c.author, c.authorEmail);
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
                                  handleViewUserProfile(
                                    c.author,
                                    c.authorEmail
                                  );
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
                                if (!requireLogin("phản hồi bình luận")) return;
                                setReplyingToId(
                                  replyingToId === c.id ? null : c.id
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
                                      handleViewUserProfile(
                                        rep.author,
                                        rep.authorEmail
                                      );
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
                                            rep.authorEmail
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

      <style>{`
        .transition-hover { transition: transform 0.2s, box-shadow 0.2s; }
        .transition-hover:hover { transform: translateY(-3px); box-shadow: 0 .25rem .75rem rgba(0,0,0,.1)!important; }
        .hover-primary:hover { color: ${primaryColor} !important; }
        .no-caret::after { display: none !important; }
      `}</style>
    </div>
  );
};

export default LostFoundPage;