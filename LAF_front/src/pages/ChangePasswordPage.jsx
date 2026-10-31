import { useState, useEffect } from "react";
import { Container, Row, Col, Card, Form, Button, Modal, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const ChangePasswordPage = ({ user }) => {
  const primaryColor = "#1f6dba";
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [showModal, setShowModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Ép văng ra ngoài nếu chưa đăng nhập
    if (!user || !user.email) {
      navigate("/login");
    }
  }, [user, navigate]);

  // Xử lý khi bấm nút "Xác nhận đổi mật khẩu" (Mở modal)
  const handlePreSubmit = (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    
    if (newPassword.length < 6) {
        setErrorMsg("Mật khẩu mới phải có ít nhất 6 ký tự.");
        return;
    }
    if (newPassword !== confirmPassword) {
        setErrorMsg("Mật khẩu xác nhận không khớp!");
        return;
    }
    if (currentPassword === newPassword) {
        setErrorMsg("Mật khẩu mới không được trùng với mật khẩu cũ!");
        return;
    }
    
    setShowModal(true); // Nếu qua hết bài test thì mở Modal xác nhận
  };

  // Xử lý khi bấm "Đồng ý" trong Modal (Gọi API)
  const handleConfirmChange = async () => {
    setShowModal(false);
    setIsLoading(true);
    
    try {
      const params = new URLSearchParams();
      params.append('email', user.email);
      params.append('currentPassword', currentPassword);
      params.append('newPassword', newPassword);

      const response = await axios.post('/api/change-password', params);
      
      if (response.data.success) {
          setSuccessMsg(response.data.message);
          setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");
          
          // Sau 2 giây tự động quay về trang Profile
          setTimeout(() => navigate("/profile"), 2000);
      } else {
          setErrorMsg(response.data.message);
      }
    } catch (error) {
      console.error(error);
      setErrorMsg("Lỗi kết nối máy chủ. Vui lòng thử lại!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: "#f4f9ff", minHeight: "100vh", padding: "60px 0" }}>
      <Container>
        <Row className="justify-content-center">
          <Col md={8} lg={6}>
            <Card className="border-0 shadow-sm rounded-4 p-4 p-md-5 bg-white text-start">
              <div className="text-center mb-4">
                <div 
                  className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                  style={{ width: "60px", height: "60px", backgroundColor: "#eaf3fc", color: primaryColor }}
                >
                  <i className="bi bi-shield-lock-fill fs-3"></i>
                </div>
                <h3 className="fw-bold" style={{ color: "#12345a" }}>Đổi mật khẩu</h3>
                <p className="text-secondary">Tạo mật khẩu mới đủ mạnh để bảo vệ tài khoản của bạn.</p>
              </div>

              {errorMsg && <Alert variant="danger" className="rounded-3 border-0 shadow-sm">{errorMsg}</Alert>}
              {successMsg && <Alert variant="success" className="rounded-3 border-0 shadow-sm">{successMsg}</Alert>}

              <Form onSubmit={handlePreSubmit}>
                <Form.Group className="mb-4">
                  <Form.Label className="text-secondary fw-semibold ms-1" style={{ fontSize: "0.9rem" }}>Mật khẩu hiện tại</Form.Label>
                  <Form.Control 
                    type="password" 
                    placeholder="Nhập mật khẩu hiện tại"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    className="px-3 py-3 rounded-3 shadow-none border-0"
                    style={{ backgroundColor: "#f8fafc", color: "#12345a", fontWeight: "500" }}
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="text-secondary fw-semibold ms-1" style={{ fontSize: "0.9rem" }}>Mật khẩu mới</Form.Label>
                  <Form.Control 
                    type="password" 
                    placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="px-3 py-3 rounded-3 shadow-none border-0"
                    style={{ backgroundColor: "#f8fafc", color: "#12345a", fontWeight: "500" }}
                  />
                </Form.Group>

                <Form.Group className="mb-5">
                  <Form.Label className="text-secondary fw-semibold ms-1" style={{ fontSize: "0.9rem" }}>Xác nhận mật khẩu mới</Form.Label>
                  <Form.Control 
                    type="password" 
                    placeholder="Nhập lại mật khẩu mới"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="px-3 py-3 rounded-3 shadow-none border-0"
                    style={{ backgroundColor: "#f8fafc", color: "#12345a", fontWeight: "500" }}
                  />
                </Form.Group>

                <div className="d-flex justify-content-between gap-3">
                  <Button 
                    variant="light" 
                    className="fw-semibold w-50 py-3 rounded-3 shadow-sm"
                    style={{ border: "1px solid #e2e8f0", color: "#475569" }}
                    onClick={() => navigate("/profile")}
                  >
                    Quay lại
                  </Button>
                  <Button 
                    type="submit" 
                    className="fw-semibold w-50 py-3 rounded-3 shadow-sm border-0 text-white"
                    style={{ backgroundColor: primaryColor }}
                    disabled={isLoading}
                  >
                    Xác nhận
                  </Button>
                </div>
              </Form>
            </Card>
          </Col>
        </Row>

        {/* MODAL XÁC NHẬN */}
        <Modal show={showModal} onHide={() => setShowModal(false)} centered contentClassName="border-0 shadow-lg" style={{ borderRadius: "20px", overflow: "hidden" }}>
          <Modal.Header closeButton className="border-0 pb-0 mt-3 mx-3">
            <Modal.Title className="fw-bold d-flex align-items-center" style={{ color: "#212529", fontSize: "1.4rem" }}>
              <i className="bi bi-shield-exclamation me-3 text-warning" style={{ fontSize: "1.5rem" }}></i>
              Xác nhận đổi mật khẩu
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="text-secondary mx-3 pt-3 pb-4" style={{ fontSize: "1.05rem", lineHeight: "1.6" }}>
            Bạn có chắc chắn muốn thay đổi mật khẩu không? Sau khi đổi, bạn sẽ dùng mật khẩu mới này cho các lần đăng nhập tiếp theo.
          </Modal.Body>
          <Modal.Footer className="border-0 pt-0 mb-3 mx-3 d-flex justify-content-end gap-2">
            <Button className="fw-semibold border-0 text-dark" style={{ backgroundColor: "#F4F4F5", borderRadius: "12px", padding: "10px 20px" }} onClick={() => setShowModal(false)}>
              Hủy bỏ
            </Button>
            <Button className="fw-semibold text-white border-0" style={{ backgroundColor: primaryColor, borderRadius: "12px", padding: "10px 20px" }} onClick={handleConfirmChange}>
              Đồng ý
            </Button>
          </Modal.Footer>
        </Modal>

      </Container>
    </div>
  );
};

export default ChangePasswordPage;