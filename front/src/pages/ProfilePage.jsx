/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Spinner,
  Badge,
  Form,
  Image,
  Dropdown,
  Modal,
} from "react-bootstrap";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";

const ProfilePage = ({ user }) => {
  const primaryColor = "#0C8B72";
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const queryEmail = searchParams.get("email");
  const queryName = searchParams.get("name");
  const queryUsername = searchParams.get("username");

  const [profileData, setProfileData] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [sharedPosts, setSharedPosts] = useState([]);
  const [activePostFilter, setActivePostFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);

  const [openShareCommentId, setOpenShareCommentId] = useState(null);
  const [shareCommentText, setShareCommentText] = useState("");

  // State Chỉnh sửa & Xóa bài đăng ngay trên Trang cá nhân
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingItem, setDeletingItem] = useState(null);

  const isOwnProfile = Boolean(
    user &&
      ((!queryEmail && !queryName && !queryUsername) ||
        (queryEmail &&
          queryEmail.toLowerCase() === user.email?.toLowerCase()) ||
        (queryName &&
          queryName.toLowerCase() === user.fullName?.toLowerCase()))
  );

  useEffect(() => {
    if (!queryEmail && !queryName && !queryUsername && (!user || !user.email)) {
      navigate("/login");
      return;
    }

    const fetchProfileAndPosts = async () => {
      setLoading(true);
      try {
        let targetEmail = queryEmail || (isOwnProfile ? user?.email : "");
        let loadedProfile = null;

        if (targetEmail) {
          try {
            const profRes = await axios.get("/api/profile", {
              params: { email: targetEmail },
            });
            if (profRes.data && profRes.data.fullName) {
              loadedProfile = profRes.data;
            }
          } catch {
            // Fallback bên dưới
          }
        }

        const [lostRes, foundRes, forumRes] = await Promise.all([
          axios.get("/api/lost-posts").catch(() => ({ data: [] })),
          axios.get("/api/found-posts").catch(() => ({ data: [] })),
          axios.get("/api/forum").catch(() => ({ data: [] })),
        ]);

        const allLost = Array.isArray(lostRes.data) ? lostRes.data : [];
        const allFound = Array.isArray(foundRes.data) ? foundRes.data : [];
        const allForum = Array.isArray(forumRes.data) ? forumRes.data : [];

        if (!loadedProfile) {
          const matchedForum = allForum.find(
            (p) =>
              (queryUsername && p.username === queryUsername) ||
              (queryName && p.fullName === queryName)
          );
          const matchedLost = allLost.find(
            (p) =>
              (queryName && p.author === queryName) ||
              (queryEmail && p.authorEmail === queryEmail)
          );

          if (!loadedProfile) {
            const displayName =
              queryName ||
              matchedForum?.fullName ||
              matchedLost?.author ||
              user?.fullName ||
              "Sinh viên FPT";
            const displayUsername =
              queryUsername ||
              matchedForum?.username ||
              (targetEmail ? targetEmail.split("@")[0] : "fpt_student");
            loadedProfile = {
              fullName: displayName,
              username: displayUsername,
              email:
                targetEmail ||
                matchedLost?.authorEmail ||
                `${displayUsername}@fpt.edu.vn`,
              phone: "Đã ẩn bảo mật",
              campus: "Cần Thơ",
              gender: "Sinh viên FPT",
            };
          }
        }

        setProfileData(loadedProfile);

        const targetFullName = loadedProfile.fullName;
        const deletedLostIds = JSON.parse(localStorage.getItem("laf_deleted_lost_ids")) || [];
        const deletedFoundIds = JSON.parse(localStorage.getItem("laf_deleted_found_ids")) || [];
        const deletedForumIds = JSON.parse(localStorage.getItem("laf_deleted_forum_posts")) || [];

        const myLost = allLost
          .filter(
            (p) =>
              !deletedLostIds.includes(p.id) &&
              (p.author === targetFullName ||
                (loadedProfile.email && p.authorEmail === loadedProfile.email))
          )
          .map((p) => ({
            ...p,
            postSource: "LOST",
            displayTitle: p.title,
            displayContent: p.content,
            displayDate: p.date || p.time,
          }));

        const myFound = allFound
          .filter(
            (p) =>
              !deletedFoundIds.includes(p.id) &&
              (p.author === targetFullName ||
                (loadedProfile.email && p.authorEmail === loadedProfile.email))
          )
          .map((p) => ({
            ...p,
            postSource: "FOUND",
            displayTitle: p.itemName,
            displayContent: p.description,
            displayDate: p.time,
          }));

        const myForum = allForum
          .filter(
            (p) =>
              !deletedForumIds.includes(p.id) &&
              (p.fullName === targetFullName ||
                (loadedProfile.username && p.username === loadedProfile.username))
          )
          .map((p) => ({
            ...p,
            postSource: "FORUM",
            displayTitle: p.title,
            displayContent: p.content,
            displayDate: p.date,
          }));

        setUserPosts([...myLost, ...myFound, ...myForum]);

        const allShares =
          JSON.parse(localStorage.getItem("laf_shared_posts")) || [];
        const userShares = allShares.filter(
          (s) =>
            s.sharerName === targetFullName ||
            (loadedProfile.email && s.sharerEmail === loadedProfile.email)
        );
        setSharedPosts(userShares);
      } catch (error) {
        console.error("Lỗi khi tải hồ sơ:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileAndPosts();
  }, [user, queryEmail, queryName, queryUsername]);

  // Mở Modal Sửa bài đăng / bài chia sẻ
  const handleOpenEdit = (item, isShare = false, e) => {
    if (e) e.stopPropagation();
    setEditingItem({ ...item, isShare });
    if (isShare) {
      setEditTitle("Bài viết chia sẻ");
      setEditContent(item.caption || "");
    } else {
      setEditTitle(item.displayTitle || "");
      setEditContent(item.displayContent || "");
    }
    setShowEditModal(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingItem) return;

    if (editingItem.isShare) {
      const allShares =
        JSON.parse(localStorage.getItem("laf_shared_posts")) || [];
      const updated = allShares.map((s) =>
        s.shareId === editingItem.shareId ? { ...s, caption: editContent } : s
      );
      localStorage.setItem("laf_shared_posts", JSON.stringify(updated));
      setSharedPosts(
        sharedPosts.map((s) =>
          s.shareId === editingItem.shareId ? { ...s, caption: editContent } : s
        )
      );
    } else {
      try {
        const params = new URLSearchParams();
        params.append("action", "update");
        params.append("postId", editingItem.id);
        params.append("category", editingItem.category || "Khác");
        params.append("location", editingItem.location || "Giảng đường");

        if (editingItem.postSource === "LOST") {
          params.append("title", editTitle);
          params.append("content", editContent);
          await axios.post("/api/lost-posts", params);
        } else if (editingItem.postSource === "FOUND") {
          params.append("itemName", editTitle);
          params.append("description", editContent);
          await axios.post("/api/found-posts", params);
        } else if (editingItem.postSource === "FORUM") {
          params.append("title", editTitle);
          params.append("content", editContent);
          await axios.post("/api/forum", params);
        }
      } catch (err) {
        console.error("Lỗi cập nhật bài viết:", err);
      }

      setUserPosts(
        userPosts.map((p) =>
          p.id === editingItem.id && p.postSource === editingItem.postSource
            ? {
                ...p,
                displayTitle: editTitle,
                displayContent: editContent,
              }
            : p
        )
      );
    }
    setShowEditModal(false);
  };

  // Xác nhận Xóa bài đăng (Xóa trực tiếp trong Database cho cả LOST, FOUND, FORUM)
  const handleConfirmDelete = async () => {
    if (!deletingItem) return;

    if (deletingItem.isShare) {
      const allShares =
        JSON.parse(localStorage.getItem("laf_shared_posts")) || [];
      const updated = allShares.filter(
        (s) => s.shareId !== deletingItem.shareId
      );
      localStorage.setItem("laf_shared_posts", JSON.stringify(updated));
      setSharedPosts(
        sharedPosts.filter((s) => s.shareId !== deletingItem.shareId)
      );
    } else {
      try {
        const params = new URLSearchParams();
        params.append("action", "delete");
        params.append("postId", deletingItem.id);

        if (deletingItem.postSource === "LOST") {
          await axios.post("/api/lost-posts", params);
          const del = JSON.parse(localStorage.getItem("laf_deleted_lost_ids")) || [];
          localStorage.setItem("laf_deleted_lost_ids", JSON.stringify([...del, deletingItem.id]));
        } else if (deletingItem.postSource === "FOUND") {
          await axios.post("/api/found-posts", params);
          const del = JSON.parse(localStorage.getItem("laf_deleted_found_ids")) || [];
          localStorage.setItem("laf_deleted_found_ids", JSON.stringify([...del, deletingItem.id]));
        } else if (deletingItem.postSource === "FORUM") {
          await axios.post("/api/forum", params);
          const del = JSON.parse(localStorage.getItem("laf_deleted_forum_posts")) || [];
          localStorage.setItem("laf_deleted_forum_posts", JSON.stringify([...del, deletingItem.id]));
        }
      } catch (err) {
        console.error("Lỗi xóa bài viết:", err);
      }

      setUserPosts(
        userPosts.filter(
          (p) =>
            !(
              p.id === deletingItem.id &&
              p.postSource === deletingItem.postSource
            )
        )
      );
    }
    setShowDeleteModal(false);
  };

  const handleLikeSharedPost = (shareId) => {
    if (!user) {
      alert("Vui lòng đăng nhập để thích bài chia sẻ!");
      navigate("/login");
      return;
    }
    const allShares =
      JSON.parse(localStorage.getItem("laf_shared_posts")) || [];
    const updatedAll = allShares.map((s) => {
      if (s.shareId === shareId) {
        const likedBy = s.likedBy || [];
        const hasLiked = likedBy.includes(user.email);
        const nextLikedBy = hasLiked
          ? likedBy.filter((e) => e !== user.email)
          : [...likedBy, user.email];
        return {
          ...s,
          likedBy: nextLikedBy,
          likes: nextLikedBy.length,
        };
      }
      return s;
    });
    localStorage.setItem("laf_shared_posts", JSON.stringify(updatedAll));
    setSharedPosts(
      updatedAll.filter(
        (s) =>
          s.sharerName === profileData.fullName ||
          s.sharerEmail === profileData.email
      )
    );
  };

  const handleCommentSharedPost = (shareId, e) => {
    e.preventDefault();
    if (!user) {
      navigate("/login");
      return;
    }
    if (!shareCommentText.trim()) return;

    const newComment = {
      id: Date.now(),
      author: user.fullName,
      text: shareCommentText.trim(),
      time: "Vừa xong",
    };

    const allShares =
      JSON.parse(localStorage.getItem("laf_shared_posts")) || [];
    const updatedAll = allShares.map((s) => {
      if (s.shareId === shareId) {
        return {
          ...s,
          comments: [...(s.comments || []), newComment],
        };
      }
      return s;
    });
    localStorage.setItem("laf_shared_posts", JSON.stringify(updatedAll));
    setSharedPosts(
      updatedAll.filter(
        (s) =>
          s.sharerName === profileData.fullName ||
          s.sharerEmail === profileData.email
      )
    );
    setShareCommentText("");
  };

  const handleGoToOriginalPost = (postType, postId) => {
    if (postType === "lost" || postType === "LOST") {
      navigate("/lost-found", { state: { openPostId: postId } });
    } else if (postType === "found" || postType === "FOUND") {
      navigate("/found-items", { state: { openPostId: postId } });
    } else if (postType === "forum" || postType === "FORUM") {
      navigate("/forum", { state: { openPostId: postId } });
    }
  };

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "80vh" }}
      >
        <Spinner animation="border" style={{ color: primaryColor }} />
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="text-center py-5">Không tìm thấy thông tin tài khoản.</div>
    );
  }

  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    profileData.fullName
  )}&background=0C8B72&color=fff&size=200`;

  const getSourceBadge = (source) => {
    if (source === "LOST")
      return { text: "Đồ thất lạc (Tìm đồ)", bg: "danger", icon: "bi-search" };
    if (source === "FOUND")
      return {
        text: "Đồ nhặt được (Tìm chủ)",
        bg: "success",
        icon: "bi-bag-check-fill",
      };
    return {
      text: "Bài viết Diễn đàn",
      bg: "primary",
      icon: "bi-chat-quote-fill",
    };
  };

  const filteredOriginalPosts = userPosts.filter((p) => {
    if (activePostFilter === "ALL") return true;
    return p.postSource === activePostFilter;
  });

  return (
    <div
      style={{
        backgroundColor: "#F0F2F5",
        minHeight: "100vh",
        paddingBottom: "60px",
      }}
    >
      {/* HEADER TRANG CÁ NHÂN (ĐÃ BỎ BACKGROUND CHE TÊN) */}
      <div className="bg-white shadow-sm mb-4 pt-4">
        <Container>
          <div className="px-4 pb-4">
            <div className="d-flex flex-column flex-md-row align-items-center justify-content-between">
              <div className="d-flex flex-column flex-md-row align-items-center text-center text-md-start">
                <div className="position-relative me-md-4 mb-3 mb-md-0">
                  <img
                    src={avatarUrl}
                    alt="Avatar"
                    className="rounded-circle shadow"
                    style={{
                      width: "160px",
                      height: "160px",
                      objectFit: "cover",
                      border: "5px solid white",
                      backgroundColor: "white",
                    }}
                  />
                </div>

                <div className="mb-2">
                  <div className="d-flex align-items-baseline justify-content-center justify-content-md-start gap-2 flex-wrap">
                    <h2
                      className="fw-bold mb-0"
                      style={{ color: "#10393B", fontSize: "2rem" }}
                    >
                      {profileData.fullName}
                    </h2>
                    <span
                      className="text-secondary fw-semibold"
                      style={{ fontSize: "1.1rem" }}
                    >
                      (@{profileData.username})
                    </span>
                  </div>

                  <p className="text-secondary mb-1 mt-1 fw-medium">
                    <i className="bi bi-file-earmark-post me-1"></i>
                    {userPosts.length} bài đã đăng • {sharedPosts.length} bài đã
                    chia sẻ
                  </p>
                  <div
                    className="text-muted d-flex align-items-center justify-content-center justify-content-md-start gap-3 flex-wrap"
                    style={{ fontSize: "0.9rem" }}
                  >
                    <span>
                      <i className="bi bi-geo-alt-fill me-1 text-danger"></i>
                      Cơ sở {profileData.campus}
                    </span>
                    <span>
                      <i className="bi bi-mortarboard-fill me-1 text-dark"></i>
                      Đại học FPT Cần Thơ
                    </span>
                  </div>
                </div>
              </div>

              {isOwnProfile && (
                <div className="d-flex gap-2 mt-3 mt-md-0 mb-2">
                  <Button
                    variant="light"
                    onClick={() => navigate("/change-password")}
                    className="fw-semibold px-3 py-2 shadow-sm d-flex align-items-center"
                    style={{
                      border: "1px solid #d8dadf",
                      backgroundColor: "#E4E6EB",
                      color: "#050505",
                      borderRadius: "8px",
                    }}
                  >
                    <i className="bi bi-shield-lock-fill me-2"></i> Đổi mật khẩu
                  </Button>

                  <Button
                    onClick={() => navigate("/edit-profile")}
                    className="fw-semibold px-3 py-2 shadow-sm border-0 d-flex align-items-center text-white"
                    style={{
                      backgroundColor: primaryColor,
                      borderRadius: "8px",
                    }}
                  >
                    <i className="bi bi-pencil-fill me-2"></i> Chỉnh sửa trang cá
                    nhân
                  </Button>
                </div>
              )}
            </div>

            <hr className="mt-4 mb-0 opacity-25" />

            <div className="d-flex gap-2 pt-2 overflow-auto">
              {[
                { key: "ALL", label: "Tất cả bài viết" },
                { key: "LOST", label: "Đồ thất lạc" },
                { key: "FOUND", label: "Đồ nhặt được" },
                { key: "FORUM", label: "Diễn đàn" },
                { key: "SHARED", label: "Bài đã chia sẻ" },
              ].map((t) => (
                <Button
                  key={t.key}
                  variant="link"
                  onClick={() => setActivePostFilter(t.key)}
                  className="text-decoration-none fw-bold px-3 py-2 rounded-0"
                  style={{
                    color:
                      activePostFilter === t.key ? primaryColor : "#65676B",
                    borderBottom:
                      activePostFilter === t.key
                        ? `3px solid ${primaryColor}`
                        : "3px solid transparent",
                  }}
                >
                  {t.label}
                </Button>
              ))}
            </div>
          </div>
        </Container>
      </div>

      {/* 2 CỘT DƯỚI: THÔNG TIN CÁ NHÂN & DANH SÁCH BÀI ĐĂNG */}
      <Container>
        <Row className="g-4">
          <Col lg={4}>
            <Card
              className="border-0 shadow-sm rounded-4 p-4 text-start sticky-top"
              style={{ top: "85px", zIndex: 1000 }}
            >
              <h5 className="fw-bold mb-3" style={{ color: "#10393B" }}>
                Thông tin cá nhân
              </h5>

              <div className="d-flex flex-column gap-3">
                <div className="d-flex align-items-center gap-3">
                  <i className="bi bi-person-badge fs-5 text-secondary"></i>
                  <div>
                    <small className="text-muted d-block">Họ và tên</small>
                    <span className="fw-semibold text-dark">
                      {profileData.fullName}
                    </span>
                  </div>
                </div>

                <div className="d-flex align-items-center gap-3">
                  <i className="bi bi-at fs-5 text-secondary"></i>
                  <div>
                    <small className="text-muted d-block">Username</small>
                    <span className="fw-semibold text-dark">
                      @{profileData.username}
                    </span>
                  </div>
                </div>

                <div className="d-flex align-items-center gap-3">
                  <i className="bi bi-envelope-fill fs-5 text-secondary"></i>
                  <div className="text-truncate">
                    <small className="text-muted d-block">Email</small>
                    <span className="fw-semibold text-dark">
                      {profileData.email}
                    </span>
                  </div>
                </div>

                <div className="d-flex align-items-center gap-3">
                  <i className="bi bi-telephone-fill fs-5 text-secondary"></i>
                  <div>
                    <small className="text-muted d-block">Số điện thoại</small>
                    <span className="fw-semibold text-dark">
                      {profileData.phone}
                    </span>
                  </div>
                </div>

                <div className="d-flex align-items-center gap-3">
                  <i className="bi bi-building-fill fs-5 text-secondary"></i>
                  <div>
                    <small className="text-muted d-block">Cơ sở học tập</small>
                    <span className="fw-semibold text-dark">
                      FPT University - {profileData.campus}
                    </span>
                  </div>
                </div>

                <div className="d-flex align-items-center gap-3">
                  <i className="bi bi-gender-ambiguous fs-5 text-secondary"></i>
                  <div>
                    <small className="text-muted d-block">Giới tính</small>
                    <span className="fw-semibold text-dark">
                      {profileData.gender}
                    </span>
                  </div>
                </div>
              </div>

              {isOwnProfile && (
                <Button
                  variant="light"
                  className="w-100 fw-semibold mt-4 py-2"
                  style={{ backgroundColor: "#E4E6EB", borderRadius: "8px" }}
                  onClick={() => navigate("/edit-profile")}
                >
                  Chỉnh sửa chi tiết
                </Button>
              )}
            </Card>
          </Col>

          <Col lg={8} className="text-start">
            <Card className="border-0 shadow-sm rounded-4 p-3 mb-3 bg-white">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="fw-bold mb-0" style={{ color: "#10393B" }}>
                  Bài viết của {profileData.fullName}
                </h5>
                <span className="text-muted" style={{ fontSize: "0.85rem" }}>
                  Tổng cộng: {userPosts.length + sharedPosts.length} bài viết
                </span>
              </div>
            </Card>

            {/* CÁC BÀI ĐÃ CHIA SẺ */}
            {(activePostFilter === "ALL" || activePostFilter === "SHARED") &&
              sharedPosts.map((share) => {
                const badgeInfo = getSourceBadge(
                  share.postType.toUpperCase()
                );
                const isLiked =
                  user && (share.likedBy || []).includes(user.email);

                return (
                  <Card
                    key={share.shareId}
                    className="border-0 shadow-sm rounded-4 p-4 mb-3 bg-white"
                  >
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div className="d-flex align-items-center gap-2">
                        <img
                          src={avatarUrl}
                          alt="avt"
                          className="rounded-circle"
                          style={{ width: "42px", height: "42px" }}
                        />
                        <div>
                          <span className="fw-bold text-dark">
                            {share.sharerName}
                          </span>{" "}
                          <span
                            className="text-muted"
                            style={{ fontSize: "0.9rem" }}
                          >
                            đã chia sẻ một bài viết
                          </span>
                          <div
                            className="text-muted"
                            style={{ fontSize: "0.78rem" }}
                          >
                            {share.sharedAt}
                          </div>
                        </div>
                      </div>

                      <div className="d-flex align-items-center gap-2">
                        <Badge bg="info" className="rounded-pill px-3 py-2">
                          <i className="bi bi-share-fill me-1"></i> Bài chia sẻ
                        </Badge>
                        {isOwnProfile && (
                          <Dropdown align="end">
                            <Dropdown.Toggle
                              variant="light"
                              size="sm"
                              className="rounded-circle border-0 p-1"
                              style={{ width: "32px", height: "32px" }}
                            >
                              <i className="bi bi-three-dots fs-5 text-secondary"></i>
                            </Dropdown.Toggle>
                            <Dropdown.Menu className="shadow border-0 rounded-3">
                              <Dropdown.Item
                                onClick={(e) => handleOpenEdit(share, true, e)}
                              >
                                <i className="bi bi-pencil-square me-2 text-primary"></i>
                                Chỉnh sửa lời nhắn
                              </Dropdown.Item>
                              <Dropdown.Item
                                onClick={() => {
                                  setDeletingItem({ ...share, isShare: true });
                                  setShowDeleteModal(true);
                                }}
                                className="text-danger"
                              >
                                <i className="bi bi-trash3-fill me-2"></i>
                                Xóa bài chia sẻ
                              </Dropdown.Item>
                            </Dropdown.Menu>
                          </Dropdown>
                        )}
                      </div>
                    </div>

                    {share.caption && (
                      <p
                        className="text-dark mb-3 mt-1"
                        style={{ fontSize: "0.98rem" }}
                      >
                        {share.caption}
                      </p>
                    )}

                    <div
                      className="p-3 rounded-4 border bg-light"
                      style={{ cursor: "pointer" }}
                      onClick={() =>
                        handleGoToOriginalPost(
                          share.postType,
                          share.originalPost.id
                        )
                      }
                    >
                      <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-2">
                        <div className="d-flex align-items-center gap-2">
                          <Badge
                            bg={badgeInfo.bg}
                            className="rounded-pill px-3 py-1"
                          >
                            <i className={`bi ${badgeInfo.icon} me-1`}></i>
                            {badgeInfo.text}
                          </Badge>
                          <Badge
                            bg="secondary"
                            className="rounded-pill px-2 py-1"
                          >
                            {share.originalPost.category}
                          </Badge>
                        </div>
                        <span
                          className="fw-bold"
                          style={{ color: primaryColor, fontSize: "0.85rem" }}
                        >
                          Xem bài viết gốc{" "}
                          <i className="bi bi-box-arrow-up-right ms-1"></i>
                        </span>
                      </div>

                      <h6 className="fw-bold mb-1" style={{ color: "#10393B" }}>
                        {share.originalPost.title}
                      </h6>
                      <p
                        className="text-secondary mb-2"
                        style={{ fontSize: "0.9rem" }}
                      >
                        {share.originalPost.content}
                      </p>

                      {share.originalPost.image && (
                        <Image
                          src={share.originalPost.image}
                          rounded
                          className="w-100 mb-2"
                          style={{ maxHeight: "220px", objectFit: "cover" }}
                        />
                      )}

                      <small className="text-muted">
                        Đăng bởi <strong>{share.originalPost.author}</strong> •{" "}
                        {share.originalPost.location}
                      </small>
                    </div>

                    <div
                      className="mt-3 pt-2 border-top d-flex justify-content-between text-secondary"
                      style={{ fontSize: "0.85rem" }}
                    >
                      <span
                        style={{
                          cursor: "pointer",
                          color: isLiked ? primaryColor : "inherit",
                        }}
                        className="fw-medium"
                        onClick={() => handleLikeSharedPost(share.shareId)}
                      >
                        <i
                          className={
                            isLiked
                              ? "bi bi-hand-thumbs-up-fill me-1"
                              : "bi bi-hand-thumbs-up me-1"
                          }
                        ></i>
                        Thích ({share.likes || 0})
                      </span>
                      <span
                        style={{ cursor: "pointer" }}
                        className="fw-medium"
                        onClick={() =>
                          setOpenShareCommentId(
                            openShareCommentId === share.shareId
                              ? null
                              : share.shareId
                          )
                        }
                      >
                        <i className="bi bi-chat-text me-1"></i> Bình luận (
                        {(share.comments || []).length})
                      </span>
                      <span
                        style={{ cursor: "pointer" }}
                        className="fw-medium"
                        onClick={() =>
                          handleGoToOriginalPost(
                            share.postType,
                            share.originalPost.id
                          )
                        }
                      >
                        <i className="bi bi-arrow-right-circle me-1"></i> Tới
                        bài gốc
                      </span>
                    </div>

                    {openShareCommentId === share.shareId && (
                      <div className="mt-3 pt-3 border-top">
                        {user && (
                          <Form
                            onSubmit={(e) =>
                              handleCommentSharedPost(share.shareId, e)
                            }
                            className="d-flex gap-2 mb-3"
                          >
                            <Form.Control
                              size="sm"
                              type="text"
                              placeholder="Viết bình luận cho bài chia sẻ này..."
                              value={shareCommentText}
                              onChange={(e) =>
                                setShareCommentText(e.target.value)
                              }
                              className="rounded-pill bg-light"
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
                        {(share.comments || []).map((c) => (
                          <div
                            key={c.id}
                            className="bg-light p-2 px-3 rounded-3 mb-2 border"
                            style={{ fontSize: "0.85rem" }}
                          >
                            <span className="fw-bold text-dark">
                              {c.author}:{" "}
                            </span>
                            <span className="text-secondary">{c.text}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>
                );
              })}

            {/* CÁC BÀI ĐĂNG GỐC CỦA USER (CÓ MENU ... SỬA/XÓA) */}
            {activePostFilter !== "SHARED" &&
              filteredOriginalPosts.map((post) => {
                const badgeInfo = getSourceBadge(post.postSource);
                return (
                  <Card
                    key={`${post.postSource}-${post.id}`}
                    className="border-0 shadow-sm rounded-4 p-4 mb-3 bg-white"
                    style={{ cursor: "pointer" }}
                    onClick={() =>
                      handleGoToOriginalPost(post.postSource, post.id)
                    }
                  >
                    <div className="d-flex justify-content-between align-items-start mb-3 flex-wrap gap-2">
                      <div className="d-flex align-items-center gap-2">
                        <img
                          src={avatarUrl}
                          alt="avt"
                          className="rounded-circle"
                          style={{ width: "42px", height: "42px" }}
                        />
                        <div>
                          <h6 className="fw-bold mb-0 text-dark">
                            {profileData.fullName}
                          </h6>
                          <span
                            className="text-muted"
                            style={{ fontSize: "0.8rem" }}
                          >
                            {post.displayDate}
                          </span>
                        </div>
                      </div>

                      <div
                        className="d-flex gap-2 align-items-center flex-wrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Badge
                          bg={badgeInfo.bg}
                          className="rounded-pill px-3 py-2 fw-semibold"
                        >
                          <i className={`bi ${badgeInfo.icon} me-1`}></i>
                          {badgeInfo.text}
                        </Badge>
                        {post.category && (
                          <Badge
                            bg="light"
                            className="text-dark border rounded-pill px-3 py-2"
                          >
                            {post.category}
                          </Badge>
                        )}

                        {isOwnProfile && (
                          <Dropdown align="end">
                            <Dropdown.Toggle
                              variant="light"
                              size="sm"
                              className="rounded-circle border-0 p-1"
                              style={{ width: "32px", height: "32px" }}
                            >
                              <i className="bi bi-three-dots fs-5 text-secondary"></i>
                            </Dropdown.Toggle>
                            <Dropdown.Menu className="shadow border-0 rounded-3">
                              <Dropdown.Item
                                onClick={(e) => handleOpenEdit(post, false, e)}
                              >
                                <i className="bi bi-pencil-square me-2 text-primary"></i>
                                Chỉnh sửa bài viết
                              </Dropdown.Item>
                              <Dropdown.Item
                                onClick={() => {
                                  setDeletingItem({ ...post, isShare: false });
                                  setShowDeleteModal(true);
                                }}
                                className="text-danger"
                              >
                                <i className="bi bi-trash3-fill me-2"></i>
                                Xóa bài viết
                              </Dropdown.Item>
                            </Dropdown.Menu>
                          </Dropdown>
                        )}
                      </div>
                    </div>

                    <h5 className="fw-bold mb-2" style={{ color: "#10393B" }}>
                      {post.displayTitle}
                    </h5>
                    <p
                      className="text-secondary mb-3"
                      style={{ fontSize: "0.95rem", lineHeight: "1.6" }}
                    >
                      {post.displayContent}
                    </p>

                    {post.image && (
                      <div className="mb-3">
                        <Image
                          src={post.image}
                          rounded
                          className="w-100"
                          style={{ maxHeight: "260px", objectFit: "cover" }}
                        />
                      </div>
                    )}

                    <div
                      className="pt-3 border-top d-flex justify-content-between text-secondary"
                      style={{ fontSize: "0.85rem" }}
                    >
                      <span>
                        <i className="bi bi-hand-thumbs-up me-1"></i> Thích (
                        {post.likes || 0})
                      </span>
                      <span>
                        <i className="bi bi-chat-text me-1"></i> Bình luận (
                        {(post.comments || []).length})
                      </span>
                      <span
                        className="fw-bold"
                        style={{ color: primaryColor }}
                      >
                        Mở bài viết <i className="bi bi-arrow-right ms-1"></i>
                      </span>
                    </div>
                  </Card>
                );
              })}

            {filteredOriginalPosts.length === 0 && sharedPosts.length === 0 && (
              <Card className="border-0 shadow-sm rounded-4 p-5 text-center text-secondary">
                <i className="bi bi-journal-text fs-1 opacity-50 mb-2"></i>
                <h6 className="fw-bold">Chưa có bài đăng nào</h6>
                <p className="mb-0" style={{ fontSize: "0.9rem" }}>
                  Người dùng này hiện chưa có bài viết hoặc hoạt động chia sẻ
                  nào.
                </p>
              </Card>
            )}
          </Col>
        </Row>
      </Container>

      {/* MODAL CHỈNH SỬA BÀI VIẾT TRÊN PROFILE */}
      <Modal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        centered
        contentClassName="border-0 shadow-lg"
      >
        <Modal.Header closeButton className="border-0 pb-0 mt-3 mx-3">
          <Modal.Title className="fw-bold" style={{ color: "#10393B" }}>
            Chỉnh sửa nội dung
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="mx-3 py-3 text-start">
          <Form onSubmit={handleSaveEdit}>
            {!editingItem?.isShare && (
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold text-secondary">
                  Tiêu đề
                </Form.Label>
                <Form.Control
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  required
                  className="bg-light border-0"
                />
              </Form.Group>
            )}
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold text-secondary">
                Nội dung
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                required={!editingItem?.isShare}
                className="bg-light border-0"
              />
            </Form.Group>
            <div className="d-flex justify-content-end gap-2">
              <Button variant="light" onClick={() => setShowEditModal(false)}>
                Hủy
              </Button>
              <Button
                type="submit"
                className="border-0 text-white fw-semibold px-4"
                style={{ backgroundColor: primaryColor }}
              >
                Lưu thay đổi
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* MODAL XÓA BÀI VIẾT TRÊN PROFILE */}
      <Modal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        centered
        contentClassName="border-0 shadow-lg"
      >
        <Modal.Header closeButton className="border-0 pb-0 mt-3 mx-3">
          <Modal.Title className="fw-bold text-dark">
            Xác nhận xóa bài viết
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-secondary mx-3 py-3">
          Bạn có chắc chắn muốn xóa bài đăng này không?
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0 mb-3 mx-3">
          <Button variant="light" onClick={() => setShowDeleteModal(false)}>
            Hủy
          </Button>
          <Button variant="danger" onClick={handleConfirmDelete}>
            Xóa ngay
          </Button>
        </Modal.Footer>
      </Modal>

      <style>{`
        .dropdown-toggle::after { display: none !important; }
      `}</style>
    </div>
  );
};

export default ProfilePage;