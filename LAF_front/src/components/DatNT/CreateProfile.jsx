import { useState, useEffect } from "react";
import { Form, Button, Container, Row, Col, Alert, Card, Badge } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const CreateProfile = () => {
  const primaryColor = "#1f6dba";
  const navigate = useNavigate();
  const location = useLocation();
  const registerData = location.state;

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("Nam");
  const [campus, setCampus] = useState("Cần Thơ");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Thêm state loading

  useEffect(() => {
    if (!registerData) {
      navigate("/register");
    }
  }, [registerData, navigate]);

  const isFullName = (val) => {
    const trimmed = val.trim();
    return trimmed.includes(' ') && /^[a-zA-ZÀ-ỹ\s]+$/.test(trimmed);
  };
  
  const isPhone = (val) => /^0[1-9][0-9]{8}$/.test(val);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!fullName || !phone) {
      setError("Vui lòng điền đầy đủ thông tin.");
      return;
    }
    if (!isFullName(fullName)) {
      setError("Họ và tên không hợp lệ. Phải bao gồm ít nhất 2 từ và không chứa số.");
      return;
    }
    if (!isPhone(phone)) {
      setError("Số điện thoại không hợp lệ. Phải có 10 số, bắt đầu bằng 0, số thứ hai không được là 0.");
      return;
    }

    setIsLoading(true);
    try {
      setError("");
      const params = new URLSearchParams();
      params.append('username', registerData.username);
      params.append('email', registerData.email);
      params.append('code', registerData.code);
      params.append('password', registerData.password);
      params.append('fullName', fullName.trim());
      params.append('phone', phone.trim());
      params.append('gender', gender);
      params.append('campus', campus);

      // Gọi API đăng ký
      const response = await axios.post("/api/register", params);

      if (response.data.status === "success") {
        setSuccess("Đăng ký thành công! Đang chuyển hướng đăng nhập...");
        setTimeout(() => navigate("/login"), 2000);
      }
    } catch (err) {
      // Bắt lỗi trùng SĐT từ Backend trả về
      setError(err.response?.data?.message || "Lỗi kết nối đến máy chủ.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!registerData) return null;

  return (
    <div className="text-start" style={{ backgroundColor: "#eaf3fc", minHeight: "calc(100vh - 150px)", padding: "40px 0" }}>
      <Container>
        <div className="mb-4 text-start">
          <Button 
            variant="link" 
            onClick={() => navigate("/")} 
            className="text-decoration-none text-secondary p-0 d-inline-flex align-items-center gap-2"
            style={{ fontWeight: "500" }}
          >
            <i className="bi bi-arrow-left"></i> Về trang chủ
          </Button>
        </div>

        <Row className="align-items-center">
          <Col lg={6} className="d-none d-lg-block pe-5 text-start">
            <p className="fw-bold mb-3" style={{ color: primaryColor, fontSize: "0.85rem", letterSpacing: "1px" }}>
              <i className="bi bi-circle-fill me-2" style={{ fontSize: "8px" }}></i>
              CAMPUS FPT CẦN THƠ
            </p>
            <h1 className="fw-bold mb-3" style={{ color: "#12345a", fontSize: "3rem", lineHeight: "1.2" }}>
              Tìm lại đồ thất lạc. <br />
              <span style={{ color: primaryColor }}>Kết nối lại với cộng đồng.</span>
            </h1>
            <p className="text-secondary mb-5" style={{ fontSize: "1.05rem", lineHeight: "1.6", maxWidth: "90%" }}>
              Đăng ký để đăng tin, trao đổi và cùng sinh viên trong campus tìm lại những món đồ quan trọng.
            </p>

            <div className="position-relative d-inline-block text-start">
              <img 
                src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&q=80" 
                alt="Campus FPT" 
                className="img-fluid"
                style={{ borderRadius: "20px", maxHeight: "350px", objectFit: "cover", boxShadow: "0 10px 30px rgba(0,0,0,0.1)" }}
              />
              
              <div className="position-absolute bg-white p-3 shadow-sm text-start" style={{ bottom: "20px", left: "20px", borderRadius: "15px", maxWidth: "250px" }}>
                <div className="d-flex align-items-start gap-3">
                  <div className="bg-success bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center text-success flex-shrink-0" style={{ width: "40px", height: "40px" }}>
                    <i className="bi bi-check2"></i>
                  </div>
                  <div>
                    <h6 className="mb-1 fw-bold" style={{ fontSize: "0.9rem", color: "#12345a" }}>Tìm lại đồ, kết nối bạn bè</h6>
                    <p className="mb-0 text-secondary" style={{ fontSize: "0.75rem" }}>Cùng giúp nhau trong campus FPT Cần Thơ.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-4 text-secondary d-flex align-items-center gap-2" style={{ fontSize: "0.9rem" }}>
               <i className="bi bi-shield-check text-success"></i> Trao đổi an toàn - Xác minh trước khi trao trả
            </div>
          </Col>

          <Col lg={6} md={8} sm={10} className="mx-auto text-start">
            <Card className="border-0 shadow p-4 p-md-5" style={{ borderRadius: "20px" }}>
              <Card.Body>
                
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <Button 
                    variant="link" 
                    onClick={() => navigate(-1)} 
                    className="text-decoration-none text-secondary p-0 d-flex align-items-center gap-2" 
                    style={{ fontWeight: "500", fontSize: "0.9rem" }}
                  >
                    <i className="bi bi-arrow-left"></i> Quay lại
                  </Button>
                  <Badge bg="success" className="bg-opacity-10 px-3 py-2 fw-bold" style={{ color: primaryColor, borderRadius: "20px" }}>
                    BƯỚC 2 / 2
                  </Badge>
                </div>

                <div className="mb-4">
                  <div className="d-flex justify-content-between mb-2" style={{ fontSize: "0.85rem", fontWeight: "600" }}>
                    <span style={{ color: primaryColor }}><i className="bi bi-check2"></i> Thông tin tài khoản</span>
                    <span style={{ color: primaryColor }}>Thông tin cá nhân</span>
                  </div>
                  <div className="d-flex gap-2">
                    <div className="w-50 rounded" style={{ height: "3px", backgroundColor: primaryColor }}></div>
                    <div className="w-50 rounded" style={{ height: "3px", backgroundColor: "#E2E8F0" }}></div>
                  </div>
                </div>

                <div className="mb-4 text-start">
                  <div className="bg-success bg-opacity-10 rounded d-inline-flex align-items-center justify-content-center mb-3" style={{ width: "50px", height: "50px", color: primaryColor }}>
                    <i className="bi bi-person-vcard fs-4"></i>
                  </div>
                  <h3 className="fw-bold mb-2" style={{ color: "#12345a" }}>Thông tin cá nhân</h3>
                  <p className="text-secondary" style={{ fontSize: "0.95rem" }}>
                    Cập nhật thông tin cá nhân để hoàn tất đăng ký và bắt đầu kết nối với cộng đồng.
                  </p>
                </div>

                {error && <Alert variant="danger" className="rounded-3 py-2">{error}</Alert>}
                {success && <Alert variant="success" className="rounded-3 py-2">{success}</Alert>}

                <Form onSubmit={handleSubmit} className="text-start">
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold" style={{ color: "#333", fontSize: "0.9rem" }}>
                      Họ và Tên<span className="text-success">*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Nguyễn Văn A"
                      value={fullName} 
                      onChange={(e) => setFullName(e.target.value)}
                      className="shadow-none border-secondary-subtle"
                      style={{ borderRadius: "10px", padding: "12px 15px", fontSize: "0.95rem" }}
                    />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label className="fw-bold" style={{ color: "#333", fontSize: "0.9rem" }}>
                      Số điện thoại<span className="text-success">*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="0912345678"
                      value={phone} 
                      onChange={(e) => setPhone(e.target.value)}
                      className="shadow-none border-secondary-subtle"
                      style={{ borderRadius: "10px", padding: "12px 15px", fontSize: "0.95rem" }}
                    />
                  </Form.Group>

                  <Row className="mb-4">
                    <Col>
                      <Form.Group>
                        <Form.Label className="fw-bold" style={{ color: "#333", fontSize: "0.9rem" }}>
                          Giới tính
                        </Form.Label>
                        <Form.Select 
                          value={gender} 
                          onChange={(e) => setGender(e.target.value)} 
                          className="shadow-none border-secondary-subtle"
                          style={{ borderRadius: "10px", padding: "12px 15px", fontSize: "0.95rem" }}
                        >
                          <option value="Nam">Nam</option>
                          <option value="Nữ">Nữ</option>
                          <option value="Khác">Khác</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col>
                      <Form.Group>
                        <Form.Label className="fw-bold" style={{ color: "#333", fontSize: "0.9rem" }}>
                          Campus
                        </Form.Label>
                        <Form.Select 
                          value={campus} 
                          onChange={(e) => setCampus(e.target.value)} 
                          className="shadow-none border-secondary-subtle"
                          style={{ borderRadius: "10px", padding: "12px 15px", fontSize: "0.95rem" }}
                        >
                          <option value="Cần Thơ">Cần Thơ</option>
                          <option value="Hồ Chí Minh">Hồ Chí Minh</option>
                          <option value="Hà Nội">Hà Nội</option>
                          <option value="Đà Nẵng">Đà Nẵng</option>
                          <option value="Quy Nhơn">Quy Nhơn</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-100 fw-bold" 
                    style={{ borderRadius: "10px", padding: "12px", backgroundColor: primaryColor, borderColor: primaryColor }}
                  >
                    {isLoading ? "Đang xử lý..." : "Hoàn tất đăng ký"}
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default CreateProfile;