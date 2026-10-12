import { useState } from "react";
import { Form, Button, Container, Row, Col, Alert, Card } from "react-bootstrap";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const Login = ({ setUser }) => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [validated, setValidated] = useState(false);
  const navigate = useNavigate();

  // Biểu thức Regex kiểm tra Email (.edu.vn hoặc chuẩn chung) hoặc SĐT VN (10 số, bắt đầu 0)
  const isEmail = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  const isPhone = (val) => /^(0|\+84)[3|5|7|8|9][0-9]{8}$/.test(val);

  const handleLogin = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;

    // Validate phía Frontend
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
      // Gửi data dưới dạng URL encoded
      const params = new URLSearchParams();
      params.append('identifier', identifier);
      params.append('password', password);

      const response = await axios.post("/api/login", params);

      if (response.data.status === "success") {
        const userData = response.data.user;
        setUser(userData);
        
        // Lưu phiên đăng nhập
        sessionStorage.setItem("user", JSON.stringify(userData));
        
        // Chuyển hướng tất cả người dùng về Trang chủ (Home) sau khi đăng nhập thành công
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
    <div 
      style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)', 
        padding: '20px'
      }}
    >
      <Container>
        <Row className="justify-content-center">
          <Col xs={12} sm={10} md={8} lg={6} xl={5}>
            <Card 
              className="border-0 shadow-lg" 
              style={{ borderRadius: '20px', padding: '30px' }}
            >
              <Card.Body>
                {/* Header: Nút Back và Tiêu đề */}
                <div className="d-flex align-items-center mb-4 position-relative">
                  <Button 
                    variant="link" 
                    onClick={() => navigate(-1)} 
                    className="p-0 position-absolute start-0 text-dark"
                    style={{ textDecoration: 'none' }}
                  >
                    <i className="bi bi-arrow-left fs-4"></i>
                  </Button>
                  <h3 
                    className="w-100 text-center m-0 fw-bold" 
                    style={{ color: '#333', letterSpacing: '1px' }}
                  >
                    ĐĂNG NHẬP
                  </h3>
                </div>

                {error && <Alert variant="danger" className="rounded-3">{error}</Alert>}

                <Form noValidate validated={validated} onSubmit={handleLogin}>
                  {/* Ô nhập Email/SĐT */}
                  <Form.Group className="mb-4" controlId="formIdentifier">
                    <Form.Label className="fw-bold" style={{ color: '#333' }}>
                      Email hoặc Số điện thoại<span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Vui lòng nhập email hoặc sđt"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      required
                      style={{ 
                        borderRadius: '10px', 
                        padding: '12px 15px',
                        border: '1px solid #e0e0e0',
                        backgroundColor: '#fafafa'
                      }}
                    />
                    <Form.Control.Feedback type="invalid">
                      Thông tin đăng nhập không được để trống.
                    </Form.Control.Feedback>
                  </Form.Group>

                  {/* Ô nhập Mật khẩu */}
                  <Form.Group className="mb-4" controlId="formPassword">
                    <Form.Label className="fw-bold" style={{ color: '#333' }}>
                      Mật khẩu<span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Vui lòng nhập mật khẩu"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      style={{ 
                        borderRadius: '10px', 
                        padding: '12px 15px',
                        border: '1px solid #e0e0e0',
                        backgroundColor: '#fafafa'
                      }}
                    />
                    <Form.Control.Feedback type="invalid">
                      Mật khẩu phải có ít nhất 6 ký tự.
                    </Form.Control.Feedback>
                  </Form.Group>

                  {/* Nút Đăng Nhập */}
                  <Button 
                    variant="primary" 
                    type="submit" 
                    className="w-100 mb-4 fw-bold"
                    style={{ 
                      borderRadius: '10px', 
                      padding: '12px',
                      backgroundColor: '#a31d45',
                      borderColor: '#a31d45',
                      fontSize: '16px'
                    }}
                  >
                    Đăng nhập
                  </Button>

                  {/* Các liên kết */}
                  <div className="d-flex flex-column gap-2 text-start">
                    <Link 
                      to="/forgot-password" 
                      style={{ color: '#0d6efd', textDecoration: 'none', fontSize: '15px' }}
                    >
                      Quên mật khẩu?
                    </Link>
                    <span style={{ color: '#555', fontSize: '15px' }}>
                      Chưa có tài khoản?{' '}
                      <Link 
                        to="/register" 
                        style={{ color: '#0d6efd', textDecoration: 'none', fontWeight: '500' }}
                      >
                        Đăng ký
                      </Link>
                    </span>
                  </div>
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