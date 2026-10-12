import { useState } from "react";
import { Form, Button, Container, Row, Col, Alert, Card } from "react-bootstrap";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const Login = ({ setUser }) => {
  const primaryColor = "#0C8B72";
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [validated, setValidated] = useState(false);
  const navigate = useNavigate();

  const isEmail = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  const isPhone = (val) => /^(0|\+84)[3|5|7|8|9][0-9]{8}$/.test(val);

  const handleLogin = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;

    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    if (!isEmail(identifier) && !isPhone(identifier)) {
      setError("Vui lòng nhập Email hoặc Số điện thoại hợp lệ.");
      return;
    }

    if (password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }

    try {
      setError("");
      const params = new URLSearchParams();
      params.append('identifier', identifier);
      params.append('password', password);

      const response = await axios.post("/api/login", params);

      if (response.data.status === "success") {
        const userData = response.data.user;
        setUser(userData);
        sessionStorage.setItem("user", JSON.stringify(userData));
        navigate("/");
      }
    } catch (err) {
      if (err.response && err.response.data) {
        setError(err.response.data.message);
      } else {
        setError("Lỗi kết nối đến máy chủ.");
      }
    }
  };

  return (
    <div className="text-start" style={{ backgroundColor: "#EAF5F3", minHeight: "calc(100vh - 150px)", padding: "40px 0" }}>
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
            <h1 className="fw-bold mb-3" style={{ color: "#10393B", fontSize: "3rem", lineHeight: "1.2" }}>
              Tìm lại đồ thất lạc. <br />
              <span style={{ color: primaryColor }}>Kết nối lại với cộng đồng.</span>
            </h1>
            <p className="text-secondary mb-5" style={{ fontSize: "1.05rem", lineHeight: "1.6", maxWidth: "90%" }}>
              Đăng nhập để đăng tin, trao đổi và cùng sinh viên trong campus tìm lại những món đồ quan trọng.
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
                    <h6 className="mb-1 fw-bold" style={{ fontSize: "0.9rem", color: "#10393B" }}>Tìm lại đồ, kết nối bạn bè</h6>
                    <p className="mb-0 text-secondary" style={{ fontSize: "0.75rem" }}>Cùng giúp nhau trong campus FPT Cần Thơ.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-4 text-secondary d-flex align-items-center gap-2" style={{ fontSize: "0.9rem" }}>
               <i className="bi bi-shield-check text-success"></i> Trao đổi an toàn - Xác minh trước khi trao trả
            </div>
          </Col>

          {/* Cột phải: Form đăng nhập */}
          <Col lg={6} md={8} sm={10} className="mx-auto text-start">
            <Card className="border-0 shadow p-4 p-md-5" style={{ borderRadius: "20px" }}>
              <Card.Body>
                <div className="mb-4 text-start">
                  <div className="bg-success bg-opacity-10 rounded d-inline-flex align-items-center justify-content-center mb-3" style={{ width: "50px", height: "50px", color: primaryColor }}>
                    <i className="bi bi-box-arrow-in-right fs-4"></i>
                  </div>
                  <h3 className="fw-bold mb-2" style={{ color: "#10393B" }}>Đăng nhập</h3>
                  <p className="text-secondary" style={{ fontSize: "0.95rem" }}>
                    Chào mừng bạn trở lại! Cùng tiếp tục kết nối với cộng đồng Lost & Found.
                  </p>
                </div>

                {error && <Alert variant="danger" className="rounded-3 py-2">{error}</Alert>}

                <Form noValidate validated={validated} onSubmit={handleLogin} className="text-start">
                  {/* Ô Email / SĐT */}
                  <Form.Group className="mb-4" controlId="formIdentifier">
                    <Form.Label className="fw-bold" style={{ color: "#333", fontSize: "0.9rem" }}>
                      Email hoặc số điện thoại
                    </Form.Label>
                    <div className="position-relative">
                      <i className="bi bi-person position-absolute top-50 translate-middle-y text-secondary" style={{ left: "15px", fontSize: "1.2rem" }}></i>
                      <Form.Control
                        type="text"
                        placeholder="Nhập email hoặc số điện thoại"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        required
                        className="shadow-none border-secondary-subtle"
                        style={{ borderRadius: "10px", padding: "12px 15px 12px 45px", fontSize: "0.95rem" }}
                      />
                    </div>
                    <Form.Text className="text-muted" style={{ fontSize: "0.8rem" }}>
                      Dùng email hoặc số điện thoại bạn đã đăng ký.
                    </Form.Text>
                  </Form.Group>

                  {/* Ô Mật khẩu */}
                  <Form.Group className="mb-4" controlId="formPassword">
                    <Form.Label className="fw-bold" style={{ color: "#333", fontSize: "0.9rem" }}>
                      Mật khẩu
                    </Form.Label>
                    <div className="position-relative">
                      <i className="bi bi-lock position-absolute top-50 translate-middle-y text-secondary" style={{ left: "15px", fontSize: "1.2rem" }}></i>
                      <Form.Control
                        type={showPassword ? "text" : "password"}
                        placeholder="Nhập mật khẩu"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
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

                  {/* Ghi nhớ & Quên mật khẩu */}
                  <div className="d-flex justify-content-between align-items-center mb-4" style={{ fontSize: "0.9rem" }}>
                    <Form.Check 
                      type="checkbox" 
                      id="remember-me" 
                      label="Ghi nhớ đăng nhập" 
                      className="text-secondary m-0 p-0 d-flex gap-2 align-items-center"
                    />
                    <Link to="/forgot-password" style={{ color: primaryColor, textDecoration: "none", fontWeight: "600" }}>
                      Quên mật khẩu?
                    </Link>
                  </div>

                  {/* Nút Đăng nhập */}
                  <Button 
                    type="submit" 
                    className="w-100 mb-4 fw-bold d-flex justify-content-center align-items-center gap-2"
                    style={{ backgroundColor: primaryColor, borderColor: primaryColor, borderRadius: "10px", padding: "12px" }}
                  >
                    Đăng nhập <i className="bi bi-arrow-right"></i>
                  </Button>

                  {/* Divider (phần duy nhất nên căn giữa) */}
                  <div className="position-relative mb-4 text-center">
                    <hr className="text-secondary opacity-25" />
                    <span className="position-absolute top-50 start-50 translate-middle bg-white px-3 text-secondary" style={{ fontSize: "0.9rem" }}>
                      Bạn chưa có tài khoản?
                    </span>
                  </div>

                  {/* Nút Đăng ký */}
                  <Button 
                    as={Link} 
                    to="/register"
                    variant="outline-primary"
                    className="w-100"
                    style={{ borderColor: primaryColor, color: primaryColor, borderRadius: "10px", padding: "12px" }}
                  >
                    Đăng ký
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

export default Login;