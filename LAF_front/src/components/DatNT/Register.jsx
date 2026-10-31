import { useState } from "react";
import { Form, Button, Container, Row, Col, Alert, Card } from "react-bootstrap";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios"; // Thêm axios để gọi API

const Register = () => {
  const primaryColor = "#1f6dba";
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Trạng thái nút bấm
  const navigate = useNavigate();

  const isEmail = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  const isUsername = (val) => /^[a-zA-Z0-9_]{3,20}$/.test(val);

  const handleNextStep = async (e) => {
    e.preventDefault();

    // 1. Validate phía Frontend
    if (!username || !email || !password || !confirmPassword) {
      setError("Vui lòng điền đầy đủ thông tin.");
      return;
    }
    if (!isUsername(username)) {
      setError("Tên đăng nhập không hợp lệ (3-20 ký tự, không chứa khoảng trắng hay ký tự đặc biệt).");
      return;
    }
    if (!isEmail(email)) {
      setError("Vui lòng nhập Email hợp lệ.");
      return;
    }
    if (password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    // 2. Validate phía Backend (Kiểm tra trùng Username / Email)
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('username', username.trim());
      params.append('email', email.trim());

      const response = await axios.post("/api/check-user", params);

      // Nếu API trả về success (Chưa tồn tại trong DB), tiến hành qua bước tiếp theo
      if (response.data.status === "success") {
        setError("");
        navigate("/create-profile", {
          state: { username: username.trim(), email: email.trim(), password }
        });
      }
    } catch (err) {
      // Nếu API báo lỗi (Trùng lặp)
      if (err.response && err.response.data) {
        setError(err.response.data.message);
      } else {
        setError("Lỗi kết nối đến máy chủ.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="text-start" style={{ backgroundColor: "#eaf3fc", minHeight: "calc(100vh - 150px)", padding: "40px 0" }}>
      <Container>
        {/* Nút quay lại */}
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
          {/* Cột trái: Văn bản và Hình ảnh */}
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

          {/* Cột phải: Form Đăng ký */}
          <Col lg={6} md={8} sm={10} className="mx-auto text-start">
            <Card className="border-0 shadow p-4 p-md-5" style={{ borderRadius: "20px" }}>
              <Card.Body>
                <div className="mb-4 text-start">
                  <div className="bg-success bg-opacity-10 rounded d-inline-flex align-items-center justify-content-center mb-3" style={{ width: "50px", height: "50px", color: primaryColor }}>
                    <i className="bi bi-person-plus fs-4"></i>
                  </div>
                  <h3 className="fw-bold mb-2" style={{ color: "#12345a" }}>Đăng ký</h3>
                  <p className="text-secondary" style={{ fontSize: "0.95rem" }}>
                    Tạo tài khoản để cùng kết nối và giúp nhau tìm lại đồ thất lạc trong campus.
                  </p>
                </div>

                {error && <Alert variant="danger" className="rounded-3 py-2">{error}</Alert>}

                <Form onSubmit={handleNextStep} className="text-start">
                  {/* Ô Tên đăng nhập */}
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold" style={{ color: "#333", fontSize: "0.9rem" }}>
                      Tên đăng nhập<span className="text-success">*</span>
                    </Form.Label>
                    <div className="position-relative">
                      <i className="bi bi-person position-absolute top-50 translate-middle-y text-secondary" style={{ left: "15px", fontSize: "1.2rem" }}></i>
                      <Form.Control
                        type="text" 
                        placeholder="Nhập tên đăng nhập"
                        value={username} 
                        onChange={(e) => setUsername(e.target.value.trim())}
                        className="shadow-none border-secondary-subtle"
                        style={{ borderRadius: "10px", padding: "12px 15px 12px 45px", fontSize: "0.95rem" }}
                      />
                    </div>
                  </Form.Group>

                  {/* Ô Email */}
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold" style={{ color: "#333", fontSize: "0.9rem" }}>
                      Email<span className="text-success">*</span>
                    </Form.Label>
                    <div className="position-relative">
                      <i className="bi bi-envelope position-absolute top-50 translate-middle-y text-secondary" style={{ left: "15px", fontSize: "1.2rem" }}></i>
                      <Form.Control
                        type="email" 
                        placeholder="Nhập email"
                        value={email} 
                        onChange={(e) => setEmail(e.target.value.trim())}
                        className="shadow-none border-secondary-subtle"
                        style={{ borderRadius: "10px", padding: "12px 15px 12px 45px", fontSize: "0.95rem" }}
                      />
                    </div>
                  </Form.Group>

                  {/* Ô Mật khẩu */}
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold" style={{ color: "#333", fontSize: "0.9rem" }}>
                      Mật khẩu<span className="text-success">*</span>
                    </Form.Label>
                    <div className="position-relative">
                      <i className="bi bi-lock position-absolute top-50 translate-middle-y text-secondary" style={{ left: "15px", fontSize: "1.2rem" }}></i>
                      <Form.Control
                        type={showPassword ? "text" : "password"} 
                        placeholder="Nhập mật khẩu (từ 6 ký tự)"
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)}
                        className="shadow-none border-secondary-subtle"
                        style={{ borderRadius: "10px", padding: "12px 45px", fontSize: "0.95rem" }}
                      />
                      <i 
                        className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"} position-absolute top-50 translate-middle-y text-secondary`} 
                        style={{ right: "15px", cursor: "pointer", fontSize: "1.2rem" }}
                        onClick={() => setShowPassword(!showPassword)}
                      ></i>
                    </div>
                  </Form.Group>

                  {/* Ô Xác nhận mật khẩu */}
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-bold" style={{ color: "#333", fontSize: "0.9rem" }}>
                      Xác nhận mật khẩu<span className="text-success">*</span>
                    </Form.Label>
                    <div className="position-relative">
                      <i className="bi bi-lock position-absolute top-50 translate-middle-y text-secondary" style={{ left: "15px", fontSize: "1.2rem" }}></i>
                      <Form.Control
                        type={showConfirmPassword ? "text" : "password"} 
                        placeholder="Xác nhận mật khẩu"
                        value={confirmPassword} 
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="shadow-none border-secondary-subtle"
                        style={{ borderRadius: "10px", padding: "12px 45px", fontSize: "0.95rem" }}
                      />
                      <i 
                        className={`bi ${showConfirmPassword ? "bi-eye-slash" : "bi-eye"} position-absolute top-50 translate-middle-y text-secondary`} 
                        style={{ right: "15px", cursor: "pointer", fontSize: "1.2rem" }}
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      ></i>
                    </div>
                  </Form.Group>

                  {/* Nút Tiếp tục */}
                  <Button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-100 mb-4 fw-bold d-flex justify-content-center align-items-center gap-2" 
                    style={{ borderRadius: "10px", padding: "12px", backgroundColor: primaryColor, borderColor: primaryColor }}
                  >
                    {isLoading ? "Đang kiểm tra..." : "Tiếp tục"} <i className="bi bi-arrow-right"></i>
                  </Button>

                  {/* Divider (phần duy nhất căn giữa) */}
                  <div className="position-relative mb-4 text-center">
                    <hr className="text-secondary opacity-25" />
                    <span className="position-absolute top-50 start-50 translate-middle bg-white px-3 text-secondary" style={{ fontSize: "0.9rem" }}>
                      Đã có tài khoản?
                    </span>
                  </div>

                  <Button 
                    as={Link} 
                    to="/login"
                    variant="outline-primary"
                    className="w-100"
                    style={{ borderColor: primaryColor, color: primaryColor, borderRadius: "10px", padding: "12px" }}
                  >
                    Đăng nhập
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

export default Register;