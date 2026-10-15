import { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Spinner, Badge } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const ProfilePage = ({ user }) => {
  const primaryColor = "#0C8B72";
  const navigate = useNavigate();
  
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    // Nếu App chưa kịp truyền user hoặc user không có email thì mới văng ra login
    if (!user || !user.email) {
      navigate("/login");
      return;
    }

    // Gọi API lấy full dữ liệu của user này bằng EMAIL
    const fetchProfile = async () => {
      try {
        const response = await axios.get("/api/profile", {
          params: { email: user.email }
        });
        setProfileData(response.data);
      } catch (error) {
        console.error("Lỗi khi tải hồ sơ:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
        <Spinner animation="border" style={{ color: primaryColor }} />
      </div>
    );
  }

  if (!profileData) {
    return <div className="text-center py-5">Không tìm thấy thông tin tài khoản.</div>;
  }

  // Tạo avatar chữ cái đầu nếu không có ảnh
  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.fullName)}&background=0C8B72&color=fff&size=150`;

  return (
    <div style={{ backgroundColor: "#F4F7F6", minHeight: "100vh", padding: "40px 0" }}>
      <Container>
        
        {/* Header Trang */}
        <div className="mb-4 text-start">
          <h3 className="fw-bold mb-1" style={{ color: "#10393B" }}>Hồ sơ cá nhân</h3>
          <p className="text-secondary mb-0">Quản lý thông tin cá nhân và cách người khác liên hệ với bạn.</p>
        </div>

        <Row className="g-4">
          {/* CỘT TRÁI: AVATAR & INFO CƠ BẢN */}
          <Col lg={4}>
            <Card className="border-0 shadow-sm rounded-4 text-center p-4 h-100">
              <Card.Body className="d-flex flex-column align-items-center justify-content-center">
                <div className="position-relative mb-3">
                  <img 
                    src={avatarUrl} 
                    alt="Avatar" 
                    className="rounded-circle shadow-sm"
                    style={{ width: "130px", height: "130px", objectFit: "cover", border: "4px solid white" }}
                  />
                  {/* Nút thay đổi Avatar (Tạm thời là UI hiển thị) */}
                  <div 
                    className="position-absolute bottom-0 end-0 bg-white rounded-circle shadow d-flex justify-content-center align-items-center"
                    style={{ width: "35px", height: "35px", cursor: "pointer", color: primaryColor }}
                  >
                    <i className="bi bi-camera-fill"></i>
                  </div>
                </div>
                
                <h4 className="fw-bold mb-1" style={{ color: "#10393B" }}>{profileData.fullName}</h4>
                <p className="text-secondary mb-3">@{profileData.username}</p>
                
                <Badge bg="success" className="bg-opacity-10 px-3 py-2 rounded-pill mb-4" style={{ color: primaryColor, border: `1px solid ${primaryColor}` }}>
                  Sinh viên {profileData.campus !== "Chưa cập nhật" ? profileData.campus : ""}
                </Badge>

                <div className="w-100 text-start bg-light p-3 rounded-3" style={{ fontSize: "0.9rem" }}>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Đã đăng ký:</span>
                    <span className="fw-semibold text-dark">Tháng 10, 2026</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Đồ đã tìm được:</span>
                    <span className="fw-semibold text-success">0</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">Đồ đã trả lại:</span>
                    <span className="fw-semibold text-primary">0</span>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* CỘT PHẢI: FORM THÔNG TIN CHI TIẾT */}
          <Col lg={8}>
            <Card className="border-0 shadow-sm rounded-4 p-4 h-100 text-start bg-white d-flex flex-column">
              
              {/* Header của form (Đã bỏ nút Chỉnh sửa) */}
              <div className="mb-4 pb-3 border-bottom">
                <h4 className="fw-bold mb-0" style={{ color: "#10393B" }}>Thông tin liên hệ</h4>
              </div>

              {/* Khu vực chứa các ô nhập liệu */}
              <Row className="g-4 flex-grow-1">
                <Col md={6}>
                  <div className="d-flex flex-column h-100">
                    <label className="text-secondary fw-medium mb-2 ms-1" style={{ fontSize: "0.9rem" }}>Họ và tên</label>
                    <div className="px-3 py-3 rounded-3" style={{ border: "1px solid #e2e8f0", backgroundColor: "#f8fafc" }}>
                      <h6 className="fw-bold mb-0 text-truncate" style={{ color: "#10393B", fontSize: "1.05rem" }}>
                        {profileData.fullName}
                      </h6>
                    </div>
                  </div>
                </Col>

                <Col md={6}>
                  <div className="d-flex flex-column h-100">
                    <label className="text-secondary fw-medium mb-2 ms-1" style={{ fontSize: "0.9rem" }}>Tên người dùng (Username)</label>
                    <div className="px-3 py-3 rounded-3" style={{ border: "1px solid #e2e8f0", backgroundColor: "#f8fafc" }}>
                      <h6 className="fw-bold mb-0 text-truncate" style={{ color: "#10393B", fontSize: "1.05rem" }}>
                        {profileData.username}
                      </h6>
                    </div>
                  </div>
                </Col>

                <Col md={6}>
                  <div className="d-flex flex-column h-100">
                    <label className="text-secondary fw-medium mb-2 ms-1" style={{ fontSize: "0.9rem" }}>Địa chỉ Email</label>
                    <div className="px-3 py-3 rounded-3" style={{ border: "1px solid #e2e8f0", backgroundColor: "#f8fafc" }}>
                      <h6 className="fw-bold mb-0 text-truncate" style={{ color: "#10393B", fontSize: "1.05rem" }}>
                        {profileData.email}
                      </h6>
                    </div>
                  </div>
                </Col>

                <Col md={6}>
                  <div className="d-flex flex-column h-100">
                    <label className="text-secondary fw-medium mb-2 ms-1" style={{ fontSize: "0.9rem" }}>Số điện thoại</label>
                    <div className="px-3 py-3 rounded-3" style={{ border: "1px solid #e2e8f0", backgroundColor: "#f8fafc" }}>
                      <h6 className="fw-bold mb-0 text-truncate" style={{ color: "#10393B", fontSize: "1.05rem" }}>
                        {profileData.phone}
                      </h6>
                    </div>
                  </div>
                </Col>

                <Col md={6}>
                  <div className="d-flex flex-column h-100">
                    <label className="text-secondary fw-medium mb-2 ms-1" style={{ fontSize: "0.9rem" }}>Cơ sở (Campus)</label>
                    <div className="px-3 py-3 rounded-3" style={{ border: "1px solid #e2e8f0", backgroundColor: "#f8fafc" }}>
                      <h6 className="fw-bold mb-0 text-truncate" style={{ color: "#10393B", fontSize: "1.05rem" }}>
                        {profileData.campus}
                      </h6>
                    </div>
                  </div>
                </Col>

                <Col md={6}>
                  <div className="d-flex flex-column h-100">
                    <label className="text-secondary fw-medium mb-2 ms-1" style={{ fontSize: "0.9rem" }}>Giới tính</label>
                    <div className="px-3 py-3 rounded-3" style={{ border: "1px solid #e2e8f0", backgroundColor: "#f8fafc" }}>
                      <h6 className="fw-bold mb-0 text-truncate" style={{ color: "#10393B", fontSize: "1.05rem" }}>
                        {profileData.gender}
                      </h6>
                    </div>
                  </div>
                </Col>
              </Row>

              {/* Khu vực Footer (Chứa 2 nút bấm mới) */}
              <div className="mt-4 pt-4 border-top d-flex justify-content-between align-items-center flex-wrap gap-3">
                <span className="text-secondary" style={{ fontSize: "0.9rem" }}>
                  <i className="bi bi-lock-fill me-1"></i> Chỉ có bạn mới thấy thông tin chi tiết này.
                </span>
                
                <div className="d-flex gap-2">
                  <Button 
                    variant="light" 
                    onClick={() => navigate("/change-password")} 
                    className="fw-semibold px-4 shadow-sm"
                    style={{ border: "1px solid #e2e8f0", color: "#475569" }}
                  >
                    Đổi mật khẩu
                  </Button>
                  
                  <Button 
                    variant="primary" 
                    onClick={() => navigate("/edit-profile")}
                    className="fw-semibold px-4 shadow-sm border-0"
                    style={{ backgroundColor: primaryColor }}
                  >
                    Chỉnh sửa hồ sơ
                  </Button>
                </div>
              </div>

            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ProfilePage;