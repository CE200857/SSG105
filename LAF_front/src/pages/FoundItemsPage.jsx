/* eslint-disable no-unused-vars */
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
  Spinner,
  Alert,
  Modal,
  Image,
  Dropdown,
  Toast,
  ToastContainer,
} from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { setPostVisibility } from "../utils/visibility";
import { VisibilityBadge } from "../components/Visibility";
import { compressImage } from "../utils/compressImage";
import { postImgProps, getPostImage } from "../utils/postImage";

const FoundItemsPage = ({ user }) => {
  const primaryColor = "#1f6dba";
  const navigate = useNavigate();
  const locationData = useLocation();
  const navState = locationData.state || {};

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [keyword, setKeyword] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Tất cả danh mục");
  const [locationFilter, setLocationFilter] = useState("Toàn campus");
  const [sortBy, setSortBy] = useState("newest");
  const [activeTab, setActiveTab] = useState("Tất cả");

  // ===== STATE CHO MODAL ĐĂNG BÀI =====
  const [showModal, setShowModal] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [newCategory, setNewCategory] = useState("Ví & giấy tờ");
  const [newDescription, setNewDescription] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newTime, setNewTime] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState({ type: "", text: "" });

  // ===== STATE CHO MODAL CHỈNH SỬA & XÓA BÀI ĐĂNG =====
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [editItemName, setEditItemName] = useState("");
  const [editCategory, setEditCategory] = useState("Ví & giấy tờ");
  const [editLocation, setEditLocation] = useState("Giảng đường");
  const [editDescription, setEditDescription] = useState("");
  const [editImagePreview, setEditImagePreview] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [toast, setToast] = useState(null);
  const [selectedPostId, setSelectedPostId] = useState(null);

  // ===== STATE CHO MODAL CHI TIẾT, BÌNH LUẬN, TRẢ LỜI & LIKE COMMENT =====
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [commentSortBy, setCommentSortBy] = useState("newest");
  const [newCommentText, setNewCommentText] = useState("");
  const [replyingToId, setReplyingToId] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [commentMeta, setCommentMeta] = useState(() => {
    return JSON.parse(localStorage.getItem("laf_comment_meta_found")) || {};
  });

  // ===== STATE CHO MODAL CHIA SẺ =====
  const [showShareModal, setShowShareModal] = useState(false);
  const [postToShare, setPostToShare] = useState(null);
  const [shareCaption, setShareCaption] = useState("");
  const [shareSuccessMsg, setShareSuccessMsg] = useState("");

  // Đổi chế độ xem bài của mình: Công khai <-> Riêng tư
  const handleToggleVisibility = async (item) => {
    const next = item.visibility === "Private" ? "Public" : "Private";
    const ok = await setPostVisibility("found", item.id, user?.email, next);
    if (ok) {
      setPosts((prev) =>
        prev.map((p) => (p.id === item.id ? { ...p, visibility: next } : p)),
      );
      setSelectedPost((prev) =>
        prev && prev.id === item.id ? { ...prev, visibility: next } : prev,
      );
    }
  };

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
      postType: "found",
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
      params.append("postType", "found");
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
      const response = await axios.get("/api/found-posts", {
        params: {
          keyword,
          category: categoryFilter === "Tất cả danh mục" ? "" : categoryFilter,
          location: locationFilter === "Toàn campus" ? "" : locationFilter,
          sort: sortBy,
          email: user ? user.email : "",
        },
      });
      const localImages =
        JSON.parse(localStorage.getItem("laf_found_images")) || {};
      const localEdits =
        JSON.parse(localStorage.getItem("laf_edited_found_posts")) || {};
      const deletedIds =
        JSON.parse(localStorage.getItem("laf_deleted_found_ids")) || [];

      const merged = (response.data || [])
        .filter((p) => !deletedIds.includes(p.id))
        .map((p) => {
          const edited = localEdits[p.id] || {};
          return {
            ...p,
            ...edited,
            image:
              edited.image ||
              localImages[p.id] ||
              localImages[p.itemName] ||
              p.image ||
              "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&q=80",
          };
        });
      setPosts(merged);

      if (navState.openPostId) {
        const target = merged.find(
          (item) => Number(item.id) === Number(navState.openPostId),
        );
        if (target) {
          setSelectedPost(target);
          setShowDetailModal(true);
        }
      }
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu đồ nhặt được:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [sortBy, user, navState.openPostId]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchPosts();
  };

  const handleReset = async () => {
    setKeyword("");
    setCategoryFilter("Tất cả danh mục");
    setLocationFilter("Toàn campus");
    setSortBy("newest");
    setActiveTab("Tất cả");
    setLoading(true);
    try {
      const response = await axios.get("/api/found-posts", {
        params: {
          keyword: "",
          category: "",
          location: "",
          sort: "newest",
          email: user ? user.email : "",
        },
      });
      const deletedIds =
        JSON.parse(localStorage.getItem("laf_deleted_found_ids")) || [];
      setPosts((response.data || []).filter((p) => !deletedIds.includes(p.id)));
    } catch (error) {
      console.error("Lỗi khi reset:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePostNew = () => {
    if (requireLogin("đăng tin nhặt đồ")) {
      setShowModal(true);
      setSubmitMsg({ type: "", text: "" });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      compressImage(file).then(setImagePreview);
    }
  };

  const handleEditImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      compressImage(file).then(setEditImagePreview);
    }
  };

  const handleSubmitPost = async (e) => {
    e.preventDefault();
    if (!newItemName.trim() || !newDescription.trim()) return;

    setSubmitting(true);
    try {
      const params = new URLSearchParams();
      params.append("action", "create");
      params.append("email", user.email);
      params.append("itemName", newItemName);
      params.append("category", newCategory);
      params.append("description", newDescription);
      params.append("location", newLocation || "Giảng đường");
      params.append("time", newTime);
      if (imagePreview) {
        params.append("imageUrl", imagePreview);
      }

      const response = await axios.post("/api/found-posts", params);

      if (response.data.success) {
        if (imagePreview) {
          const localImages =
            JSON.parse(localStorage.getItem("laf_found_images")) || {};
          localImages[newItemName] = imagePreview;
          localStorage.setItem("laf_found_images", JSON.stringify(localImages));
        }
        setSubmitMsg({ type: "success", text: response.data.message });
        setNewItemName("");
        setNewCategory("Ví & giấy tờ");
        setNewDescription("");
        setNewLocation("");
        setNewTime("");
        setSelectedImage(null);
        setImagePreview(null);
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

  // Mở Modal Chỉnh sửa bài đồ nhặt được
  const handleOpenEditModal = (post, e) => {
    if (e) e.stopPropagation();
    setEditingPost(post);
    setEditItemName(post.itemName || "");
    setEditCategory(post.category || "Ví & giấy tờ");
    setEditLocation(post.location || "Giảng đường");
    setEditDescription(post.description || "");
    setEditImagePreview(post.image || null);
    setShowEditModal(true);
  };

  // Lưu Chỉnh sửa bài đồ nhặt được
  const handleSaveEditPost = async (e) => {
    e.preventDefault();
    if (!editingPost || !editItemName.trim() || !editDescription.trim()) return;

    const updatedFields = {
      itemName: editItemName.trim(),
      category: editCategory,
      location: editLocation,
      description: editDescription.trim(),
      image: editImagePreview,
    };

    try {
      const params = new URLSearchParams();
      params.append("action", "update");
      params.append("postId", editingPost.id);
      params.append("itemName", updatedFields.itemName);
      params.append("category", updatedFields.category);
      params.append("location", updatedFields.location);
      params.append("description", updatedFields.description);
      if (updatedFields.image) {
        params.append("imageUrl", updatedFields.image);
      }
      await axios.post("/api/found-posts", params);
    } catch {
      // Lưu đồng bộ ở client bên dưới
    }

    const localEdits =
      JSON.parse(localStorage.getItem("laf_edited_found_posts")) || {};
    localEdits[editingPost.id] = updatedFields;
    localStorage.setItem("laf_edited_found_posts", JSON.stringify(localEdits));

    setPosts(
      posts.map((p) =>
        p.id === editingPost.id ? { ...p, ...updatedFields } : p,
      ),
    );
    if (selectedPost && selectedPost.id === editingPost.id) {
      setSelectedPost((prev) => ({ ...prev, ...updatedFields }));
    }
    setShowEditModal(false);
  };

  // Xóa bài đồ nhặt được
  const handleDeleteConfirm = async () => {
    try {
      const params = new URLSearchParams();
      params.append("action", "delete");
      params.append("postId", selectedPostId);
      await axios.post("/api/found-posts", params);
    } catch {
      // Bỏ qua nếu backend chưa hỗ trợ
    } finally {
      const deletedIds =
        JSON.parse(localStorage.getItem("laf_deleted_found_ids")) || [];
      localStorage.setItem(
        "laf_deleted_found_ids",
        JSON.stringify([...deletedIds, selectedPostId]),
      );
      setPosts(posts.filter((p) => p.id !== selectedPostId));
      if (selectedPost && selectedPost.id === selectedPostId) {
        setShowDetailModal(false);
      }
      setShowDeleteModal(false);
    }
  };

  // Bấm nút trạng thái: mở popup xác nhận (không đổi ngay)
  const handleToggleStatus = (post, e) => {
    e.stopPropagation();
    if (!isOwner(post) || post.pendingStatus) return;
    setSelectedPostId(post.id);
    setShowStatusModal(true);
  };

  const handleStatusConfirm = async () => {
    const target = posts.find((p) => p.id === selectedPostId);
    if (!target) return;
    const nextStatus = target.status === "Unclaimed" ? "Claimed" : "Unclaimed";

    try {
      const params = new URLSearchParams();
      params.append("action", "status");
      params.append("postId", selectedPostId);
      params.append("status", nextStatus);
      const res = await axios.post("/api/found-posts", params);

      if (res.data?.success) {
        const patch = res.data.applied
          ? { status: nextStatus }
          : { pendingStatus: nextStatus };
        setPosts(
          posts.map((p) => (p.id === selectedPostId ? { ...p, ...patch } : p)),
        );
        if (selectedPost && selectedPost.id === selectedPostId) {
          setSelectedPost((prev) => ({ ...prev, ...patch }));
        }
        setToast({ variant: "success", msg: res.data.message });
      } else {
        setToast({
          variant: "danger",
          msg: res.data?.message || "Không gửi được yêu cầu.",
        });
      }
    } catch (err) {
      setToast({
        variant: "danger",
        msg: err.response?.data?.message || "Lỗi kết nối máy chủ.",
      });
    } finally {
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

      const response = await axios.post("/api/found-posts", params);
      if (response.data.success) {
        if (response.data.hasLiked) {
          pushNotification({
            recipientEmail: post.authorEmail,
            recipientName: post.author,
            type: "LIKE_POST",
            postId: post.id,
            message: `đã thích bài đăng đồ nhặt được "${post.itemName}" của bạn.`,
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
        if (selectedPost && selectedPost.id === post.id) {
          setSelectedPost((prev) => ({
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
    setSelectedPost(post);
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
      params.append("postId", selectedPost.id);
      params.append("email", user.email);
      params.append("content", newCommentText);

      const response = await axios.post("/api/found-posts", params);
      if (response.data.success) {
        pushNotification({
          recipientEmail: selectedPost.authorEmail,
          recipientName: selectedPost.author,
          type: "COMMENT",
          postId: selectedPost.id,
          message: `đã bình luận về món đồ "${selectedPost.itemName}": "${newCommentText}"`,
        });

        const updatedComments = response.data.comments;
        const updatedPost = {
          ...selectedPost,
          comments: updatedComments,
          commentsCount: updatedComments.length,
        };
        setSelectedPost(updatedPost);
        setPosts(
          posts.map((p) => (p.id === selectedPost.id ? updatedPost : p)),
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
    localStorage.setItem("laf_comment_meta_found", JSON.stringify(nextMeta));

    if (!hasLiked) {
      pushNotification({
        recipientName: comment.author,
        type: "LIKE_COMMENT",
        postId: selectedPost.id,
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
    localStorage.setItem("laf_comment_meta_found", JSON.stringify(nextMeta));

    pushNotification({
      recipientName: comment.author,
      type: "REPLY_COMMENT",
      postId: selectedPost.id,
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
      postType: "found",
      originalPost: {
        id: postToShare.id,
        title: postToShare.itemName,
        content: postToShare.description,
        category: postToShare.category,
        location: postToShare.location,
        author: postToShare.author,
        authorEmail: postToShare.authorEmail,
        date: postToShare.time,
        image: getPostImage(postToShare),
        status:
          postToShare.status === "Unclaimed" ? "Đang tìm chủ" : "Đã trao trả",
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
      recipientEmail: postToShare.authorEmail,
      recipientName: postToShare.author,
      type: "SHARE",
      postId: postToShare.id,
      message: `đã chia sẻ bài đăng đồ nhặt được "${postToShare.itemName}" của bạn.`,
    });

    setShareSuccessMsg("Đã chia sẻ bài viết về trang cá nhân của bạn!");
    setTimeout(() => {
      setShowShareModal(false);
    }, 1200);
  };

  const displayedPosts = posts.filter((post) => {
    if (activeTab === "Tất cả") return true;
    if (activeTab === "Đang tìm") return post.status === "Unclaimed";
    if (activeTab === "Đã trao trả") return post.status !== "Unclaimed";
    if (activeTab === "Của tôi") return isOwner(post);
    return true;
  });

  return (
    <div
      style={{
        backgroundColor: "#F9FAFB",
        minHeight: "100vh",
        paddingBottom: "50px",
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
                CAMPUS FPT CẦN THƠ - ĐỒ NHẶT ĐƯỢC
              </p>
              <h2
                className="fw-bold mb-2"
                style={{ color: "#12345a", fontSize: "2rem" }}
              >
                Đồ đã nhặt được, đang tìm chủ
              </h2>
              <p className="text-secondary mb-0" style={{ maxWidth: "600px" }}>
                Có thể món đồ của bạn đang ở đây. Xem ảnh, địa điểm và thời gian
                nhặt được để nhận diện, rồi trao đổi với người nhặt để xác minh
                trước khi nhận lại.
              </p>
            </div>
            <Button
              className="fw-bold px-4 py-2 shadow-sm border-0 d-flex align-items-center"
              style={{ backgroundColor: primaryColor }}
              onClick={handlePostNew}
            >
              <i className="bi bi-plus-lg me-2"></i> Đăng đồ nhặt được
            </Button>
          </div>

          <Alert
            variant="success"
            className="mt-4 mb-0 py-2 d-inline-flex align-items-center bg-opacity-10 border-success border-opacity-25"
            style={{ color: primaryColor }}
          >
            <i className="bi bi-info-circle-fill me-2"></i>
            <span style={{ fontSize: "0.9rem" }}>
              Chỉ hiển thị đồ đã được nhặt và chưa trao trả — không bao gồm tin
              đăng tìm đồ bị mất.
            </span>
          </Alert>
        </Container>
      </div>

      <Container>
        <Row className="g-4">
          <Col lg={3}>
            <Card
              className="border-0 shadow-sm rounded-4 p-4 sticky-top text-start"
              style={{ top: "85px", zIndex: 1000 }}
            >
              <h5 className="fw-bold mb-4" style={{ color: "#12345a" }}>
                Tìm món đồ của bạn
              </h5>

              <Form onSubmit={handleSearch}>
                <Form.Group className="mb-3">
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
                    Địa điểm nhặt được
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

              <div
                className="mt-5 p-3 rounded-3"
                style={{
                  backgroundColor: "#eaf3fc",
                  border: `1px solid ${primaryColor}40`,
                }}
              >
                <h6 className="fw-bold mb-2" style={{ color: primaryColor }}>
                  <i className="bi bi-shield-check me-2"></i> Bạn nhận ra món
                  đồ?
                </h6>
                <p
                  className="text-secondary mb-0"
                  style={{ fontSize: "0.85rem" }}
                >
                  Mở chi tiết và mô tả đặc điểm riêng để người nhặt xác minh.
                  Hẹn nhận lại tại nơi công cộng trong campus. Không chia sẻ số
                  thẻ, CMND/CCCD.
                </p>
              </div>
            </Card>
          </Col>

          <Col lg={9}>
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
              <div className="d-flex gap-2 flex-wrap">
                {["Tất cả", "Đang tìm", "Đã trao trả", "Của tôi"].map((tab) => (
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
                ))}
              </div>

              <div className="d-flex align-items-center gap-2">
                <span className="text-secondary" style={{ fontSize: "0.9rem" }}>
                  Sắp xếp:
                </span>
                <Form.Select
                  size="sm"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border-0 bg-white shadow-sm fw-medium"
                  style={{ cursor: "pointer", width: "auto" }}
                >
                  <option value="newest">Mới nhất</option>
                  <option value="oldest">Cũ nhất</option>
                </Form.Select>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-5">
                <Spinner animation="border" style={{ color: primaryColor }} />
              </div>
            ) : displayedPosts.length === 0 ? (
              <div className="text-center py-5 text-secondary">
                <h5 className="fw-bold">Không tìm thấy món đồ nào phù hợp.</h5>
              </div>
            ) : (
              <Row className="g-4">
                {displayedPosts.map((post) => (
                  <Col md={6} xl={4} key={post.id}>
                    <Card
                      className="h-100 border-0 shadow-sm rounded-4 overflow-hidden text-start transition-hover"
                      style={{ cursor: "pointer" }}
                      onClick={() => handleOpenDetailModal(post)}
                    >
                      <div className="position-relative">
                        <Card.Img
                          variant="top"
                          {...postImgProps(post)}
                          style={{ height: "180px", objectFit: "cover" }}
                        />
                        {/* GÓC TRÊN BÊN TRÁI: BADGE CATEGORY */}
                        <Badge
                          bg="light"
                          className="position-absolute top-0 start-0 m-2 px-3 py-2 rounded-pill text-dark shadow-sm border"
                          style={{ fontSize: "0.75rem", zIndex: 2 }}
                        >
                          <i
                            className="bi bi-tag-fill me-1"
                            style={{ color: primaryColor }}
                          ></i>
                          {post.category}
                        </Badge>

                        {/* SÁT GÓC TRÊN BÊN PHẢI: TRẠNG THÁI + NÚT ... (SỬA/XÓA) */}
                        <div
                          className="position-absolute top-0 end-0 m-2 d-flex align-items-center gap-1"
                          style={{ zIndex: 3 }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <VisibilityBadge visibility={post.visibility} />
                          <div
                            onClick={(e) => handleToggleStatus(post, e)}
                            className="px-3 py-1 rounded-pill fw-bold shadow-sm"
                            style={{
                              fontSize: "0.78rem",
                              border:
                                post.status === "Unclaimed"
                                  ? "1px solid #ffc107"
                                  : "1px solid #198754",
                              color:
                                post.status === "Unclaimed"
                                  ? "#b38600"
                                  : "white",
                              backgroundColor:
                                post.status === "Unclaimed"
                                  ? "#fff9e6"
                                  : "#198754",
                              cursor: isOwner(post) ? "pointer" : "default",
                            }}
                            title={
                              isOwner(post)
                                ? "Bấm để đổi trạng thái trao trả"
                                : ""
                            }
                          >
                            {post.status === "Unclaimed"
                              ? "Đang tìm chủ"
                              : "Đã trao trả"}
                          </div>

                          {post.pendingStatus && (
                            <Badge
                              bg="warning"
                              text="dark"
                              className="rounded-pill"
                            >
                              <i className="bi bi-hourglass-split me-1"></i>Chờ
                              duyệt
                            </Badge>
                          )}

                          {isOwner(post) && (
                            <Dropdown align="end">
                              <Dropdown.Toggle
                                variant="light"
                                size="sm"
                                className="rounded-circle border-0 shadow-sm p-0 d-flex align-items-center justify-content-center no-caret bg-white"
                                style={{ width: "30px", height: "30px" }}
                              >
                                <i className="bi bi-three-dots text-dark"></i>
                              </Dropdown.Toggle>
                              <Dropdown.Menu
                                className="shadow border-0 rounded-3"
                                style={{ fontSize: "0.85rem" }}
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
                                  Xóa bài đăng
                                </Dropdown.Item>
                              </Dropdown.Menu>
                            </Dropdown>
                          )}
                        </div>
                      </div>

                      <Card.Body className="d-flex flex-column">
                        {/* NGƯỜI ĐĂNG + NÚT ... SỬA/XÓA CHO BÀI CỦA MÌNH */}
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <div
                            className="d-flex align-items-center gap-2 text-truncate"
                            onClick={(e) =>
                              handleViewUserProfile(
                                post.author,
                                post.authorEmail,
                                e,
                              )
                            }
                          >
                            <div
                              className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold flex-shrink-0"
                              style={{
                                width: "26px",
                                height: "26px",
                                backgroundColor: primaryColor,
                                fontSize: "0.75rem",
                              }}
                            >
                              {post.author ? post.author.charAt(0) : "U"}
                            </div>
                            <span
                              className="fw-semibold text-secondary hover-primary text-truncate"
                              style={{ fontSize: "0.82rem" }}
                            >
                              {post.author}
                            </span>
                          </div>
                        </div>

                        <Card.Title
                          className="fw-bold text-truncate"
                          style={{ color: "#12345a", fontSize: "1.1rem" }}
                        >
                          {post.itemName}
                        </Card.Title>
                        <p
                          className="text-secondary mb-3 text-truncate"
                          style={{ fontSize: "0.85rem" }}
                        >
                          {post.description}
                        </p>

                        <div className="mt-auto">
                          <div
                            className="d-flex align-items-center text-secondary mb-1"
                            style={{ fontSize: "0.8rem" }}
                          >
                            <i className="bi bi-geo-alt-fill me-2 opacity-75"></i>{" "}
                            <span className="text-truncate">
                              {post.location}
                            </span>
                          </div>
                          <div
                            className="d-flex align-items-center text-secondary"
                            style={{ fontSize: "0.8rem" }}
                          >
                            <i className="bi bi-clock-fill me-2 opacity-75"></i>{" "}
                            {post.time}
                          </div>
                        </div>

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
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            )}
          </Col>
        </Row>
      </Container>

      {/* ================= MODAL TẠO BÀI ĐĂNG ĐỒ NHẶT ĐƯỢC (CUỘN DỌC MƯỢT MÀ) ================= */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
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
              className="bi bi-bag-check-fill me-2"
              style={{ color: primaryColor }}
            ></i>{" "}
            Đăng thông tin đồ nhặt được
          </Modal.Title>
        </Modal.Header>

        <Modal.Body
          className="mx-3 py-3 text-start"
          style={{ maxHeight: "75vh", overflowY: "auto" }}
        >
          {submitMsg.text && (
            <Alert variant={submitMsg.type} className="border-0 shadow-sm">
              {submitMsg.text}
            </Alert>
          )}
          <p className="text-secondary mb-4" style={{ fontSize: "0.95rem" }}>
            Cảm ơn bạn đã có hành động đẹp. Vui lòng cung cấp hình ảnh và địa
            điểm nhặt được để người mất dễ dàng nhận diện.
          </p>

          <Form id="foundForm" onSubmit={handleSubmitPost}>
            <Row className="g-4">
              <Col md={6}>
                <Form.Group>
                  <Form.Label
                    className="fw-semibold text-secondary"
                    style={{ fontSize: "0.9rem" }}
                  >
                    Tên món đồ <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Ví dụ: Chìa khóa xe Honda"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    required
                    className="bg-light border-0 shadow-none px-3 py-2"
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
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

              <Col md={6}>
                <Form.Group>
                  <Form.Label
                    className="fw-semibold text-secondary"
                    style={{ fontSize: "0.9rem" }}
                  >
                    Địa điểm nhặt được
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

              <Col md={6}>
                <Form.Group>
                  <Form.Label
                    className="fw-semibold text-secondary"
                    style={{ fontSize: "0.9rem" }}
                  >
                    Thời gian nhặt được
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="VD: 14:00 chiều nay..."
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
                    placeholder="Màu sắc, đặc điểm nhận biết (Nên giữ lại 1 đặc điểm để xác minh chủ nhân)..."
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
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
                    Hình ảnh đính kèm
                  </Form.Label>
                  <div className="d-flex align-items-center gap-3">
                    <Form.Control
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      id="upload-found-photo"
                      className="d-none"
                    />
                    <label
                      htmlFor="upload-found-photo"
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
                          width: "150px",
                          height: "100px",
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
            onClick={() => setShowModal(false)}
          >
            Hủy bỏ
          </Button>
          <Button
            type="submit"
            form="foundForm"
            className="fw-semibold px-4 border-0 text-white"
            style={{ backgroundColor: primaryColor }}
            disabled={submitting}
          >
            {submitting ? <Spinner size="sm" /> : "Đăng bài"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ================= MODAL CHỈNH SỬA ĐỒ NHẶT ĐƯỢC ================= */}
      <Modal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        centered
        scrollable
        size="lg"
        contentClassName="border-0 shadow-lg rounded-4"
      >
        <Modal.Header closeButton className="border-0 pb-0 mt-2 mx-3">
          <Modal.Title className="fw-bold" style={{ color: "#12345a" }}>
            <i
              className="bi bi-pencil-square me-2"
              style={{ color: primaryColor }}
            ></i>
            Chỉnh sửa bài đăng đồ nhặt được
          </Modal.Title>
        </Modal.Header>
        <Modal.Body
          className="mx-3 py-3 text-start"
          style={{ maxHeight: "75vh", overflowY: "auto" }}
        >
          <Form id="editFoundForm" onSubmit={handleSaveEditPost}>
            <Row className="g-3">
              <Col md={12}>
                <Form.Label className="fw-semibold text-secondary">
                  Tên món đồ
                </Form.Label>
                <Form.Control
                  type="text"
                  value={editItemName}
                  onChange={(e) => setEditItemName(e.target.value)}
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
                  Địa điểm nhặt được
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
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
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
                    style={{
                      width: "150px",
                      height: "100px",
                      objectFit: "cover",
                    }}
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
            form="editFoundForm"
            className="border-0 text-white fw-semibold px-4"
            style={{ backgroundColor: primaryColor }}
          >
            Lưu thay đổi
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ================= MODAL XÓA BÀI ĐĂNG ================= */}
      <Modal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        centered
        contentClassName="border-0 shadow-lg rounded-4"
      >
        <Modal.Header closeButton className="border-0 pb-0 mt-3 mx-3">
          <Modal.Title className="fw-bold text-dark">
            <i className="bi bi-exclamation-triangle-fill me-2 text-danger"></i>
            Xóa bài đăng
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-secondary mx-3">
          Bạn có chắc chắn muốn xóa bài đăng đồ nhặt được này không?
        </Modal.Body>
        <Modal.Footer className="border-0 mb-2 mx-3">
          <Button variant="light" onClick={() => setShowDeleteModal(false)}>
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
              style={{ color: "#1f6dba", fontSize: "1.5rem" }}
            ></i>
            Cập nhật trạng thái?
          </Modal.Title>
        </Modal.Header>
        <Modal.Body
          className="text-secondary mx-3 pt-3 pb-4"
          style={{ fontSize: "1.05rem", lineHeight: "1.6" }}
        >
          Yêu cầu đổi trạng thái trao trả sẽ được gửi đến admin kiểm tra. Trạng
          thái chỉ thay đổi sau khi admin duyệt.
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
              backgroundColor: "#1f6dba",
              borderRadius: "12px",
              padding: "10px 20px",
            }}
            onClick={handleStatusConfirm}
          >
            Xác nhận
          </Button>
        </Modal.Footer>
      </Modal>

      <ToastContainer
        position="top-center"
        className="p-3 position-fixed"
        style={{ zIndex: 2000 }}
      >
        <Toast
          show={!!toast}
          onClose={() => setToast(null)}
          delay={4500}
          autohide
          bg={toast?.variant}
        >
          <Toast.Body className="text-white fw-semibold">
            {toast?.msg}
          </Toast.Body>
        </Toast>
      </ToastContainer>

      {/* ================= MODAL CHIA SẺ BÀI ĐĂNG ================= */}
      <Modal
        show={showShareModal}
        onHide={() => setShowShareModal(false)}
        centered
        contentClassName="border-0 shadow-lg rounded-4"
      >
        <Modal.Header closeButton className="border-0 pb-0 mt-3 mx-3">
          <Modal.Title className="fw-bold" style={{ color: "#12345a" }}>
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
                  placeholder="Hãy nói gì đó về món đồ nhặt được này..."
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
                  {postToShare.itemName}
                </h6>
                <p
                  className="text-secondary mb-0 text-truncate"
                  style={{ fontSize: "0.85rem" }}
                >
                  {postToShare.description}
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

      {/* ================= MODAL CHI TIẾT BÀI ĐĂNG & BÌNH LUẬN (CUỘN DỌC + NÚT ...) ================= */}
      {selectedPost && (
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
                    selectedPost.author,
                    selectedPost.authorEmail,
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
                  {selectedPost.author ? selectedPost.author.charAt(0) : "U"}
                </div>
                <div>
                  <h5 className="fw-bold mb-0 text-dark hover-primary">
                    {selectedPost.author}
                  </h5>
                  <span className="text-muted" style={{ fontSize: "0.85rem" }}>
                    Đăng lúc: {selectedPost.time}
                  </span>
                </div>
              </div>

              {isOwner(selectedPost) && (
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
                      onClick={(e) => handleOpenEditModal(selectedPost, e)}
                      className="py-2"
                    >
                      <i
                        className="bi bi-pencil-square me-2"
                        style={{ color: primaryColor }}
                      ></i>
                      Chỉnh sửa bài đăng
                    </Dropdown.Item>
                    <Dropdown.Item
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleVisibility(selectedPost);
                      }}
                      className="py-2"
                    >
                      <i
                        className={`bi ${selectedPost.visibility === "Private" ? "bi-globe2" : "bi-lock-fill"} me-2`}
                        style={{ color: primaryColor }}
                      ></i>
                      {selectedPost.visibility === "Private"
                        ? "Chuyển sang Công khai"
                        : "Chuyển sang Riêng tư"}
                    </Dropdown.Item>
                    <Dropdown.Item
                      onClick={() => {
                        setSelectedPostId(selectedPost.id);
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
                bg={selectedPost.status === "Unclaimed" ? "warning" : "success"}
                className={`px-3 py-2 rounded-pill fw-medium ${
                  selectedPost.status === "Unclaimed" ? "text-dark" : ""
                }`}
              >
                {selectedPost.status === "Unclaimed"
                  ? "Đang tìm chủ"
                  : "Đã trao trả"}
              </Badge>
              <Badge
                bg="light"
                className="text-dark border px-3 py-2 rounded-pill fw-semibold"
              >
                <i
                  className="bi bi-tag-fill me-1"
                  style={{ color: primaryColor }}
                ></i>
                {selectedPost.category}
              </Badge>
            </div>

            <h4 className="fw-bold mb-3" style={{ color: "#12345a" }}>
              {selectedPost.itemName}
            </h4>
            <p
              className="text-secondary mb-4"
              style={{ fontSize: "1rem", lineHeight: "1.6" }}
            >
              {selectedPost.description}
            </p>

            <Row className="g-3 mb-4">
              <Col md={6}>
                <div className="p-3 bg-light rounded-3 h-100 border">
                  <p
                    className="text-muted mb-1"
                    style={{ fontSize: "0.85rem" }}
                  >
                    <i className="bi bi-geo-alt-fill me-2"></i> Địa điểm nhặt
                    được
                  </p>
                  <h6 className="fw-bold mb-0 text-dark">
                    {selectedPost.location}
                  </h6>
                </div>
              </Col>
              <Col md={6}>
                <div className="p-3 bg-light rounded-3 h-100 border">
                  <p
                    className="text-muted mb-1"
                    style={{ fontSize: "0.85rem" }}
                  >
                    <i className="bi bi-clock-fill me-2"></i> Thời gian nhặt
                    được
                  </p>
                  <h6 className="fw-bold mb-0 text-dark">
                    {selectedPost.time}
                  </h6>
                </div>
              </Col>
            </Row>

            <div className="mb-4 text-center">
              <Image
                {...postImgProps(selectedPost)}
                rounded
                className="shadow-sm w-100"
                style={{
                  maxHeight: "350px",
                  objectFit: "contain",
                  backgroundColor: "#f8fafc",
                }}
              />
            </div>

            <div className="py-3 border-top border-bottom d-flex justify-content-around text-secondary mb-4">
              <span
                className="hover-primary fw-medium"
                style={{
                  cursor: "pointer",
                  color: selectedPost.hasLiked ? primaryColor : "inherit",
                }}
                onClick={(e) => handleLikePost(selectedPost, e)}
              >
                <i
                  className={
                    selectedPost.hasLiked
                      ? "bi bi-hand-thumbs-up-fill me-1"
                      : "bi bi-hand-thumbs-up me-1"
                  }
                ></i>{" "}
                Thích ({selectedPost.likes || 0})
              </span>
              <span
                className="hover-primary fw-medium"
                style={{ cursor: "pointer" }}
              >
                <i className="bi bi-chat-text me-1"></i> Bình luận (
                {(selectedPost.comments || []).length})
              </span>
              <span
                className="hover-primary fw-medium"
                style={{ cursor: "pointer" }}
                onClick={(e) => handleOpenShareModal(selectedPost, e)}
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

              {selectedPost.comments && selectedPost.comments.length > 0 ? (
                <div className="d-flex flex-column gap-3">
                  {(commentSortBy === "newest"
                    ? [...selectedPost.comments]
                    : [...selectedPost.comments].reverse()
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
                                    c.authorEmail,
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
                                      handleViewUserProfile(
                                        rep.author,
                                        rep.authorEmail,
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
                                            rep.authorEmail,
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
        .transition-hover:hover { transform: translateY(-5px); box-shadow: 0 .5rem 1rem rgba(0,0,0,.15)!important; }
        .hover-primary:hover { color: ${primaryColor} !important; }
        .no-caret::after { display: none !important; }
      `}</style>
    </div>
  );
};

export default FoundItemsPage;
