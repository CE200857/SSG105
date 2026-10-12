import { useState } from "react";
import { Form, Button, Container, Row, Col, Alert, Card } from "react-bootstrap";
import { useNavigate, Link } from "react-router-dom";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Regex kiểm tra
  const isEmail = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  const isUsername = (val) => /^[a-zA-Z0-9_]{3,20}$/.test(val); // Không khoảng trắng, 3-20 ký tự

  const handleNextStep = (e) => {
    e.preventDefault();

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

    setError("");
    // Chuyển sang bước nhập Profile
    navigate("/create-profile", {
      state: { username, email, password }
    });
  };

  return (
    <div style={{ 
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)', padding: '20px'
    }}>
      <Container>
        <Row className="justify-content-center">
          <Col xs={12} sm={10} md={8} lg={6} xl={5}>
            <Card className="border-0 shadow-lg" style={{ borderRadius: '20px', padding: '30px' }}>
              <Card.Body>
                <h3 className="text-center mb-4 fw-bold" style={{ color: '#333' }}>ĐĂNG KÝ</h3>
                
                {error && <Alert variant="danger">{error}</Alert>}

                <Form onSubmit={handleNextStep}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">Tên đăng nhập<span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="text" placeholder="Nhập tên đăng nhập"
                      value={username} onChange={(e) => setUsername(e.target.value.trim())}
                      style={{ borderRadius: '10px', padding: '10px 15px' }}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">Email<span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="email" placeholder="Nhập email"
                      value={email} onChange={(e) => setEmail(e.target.value.trim())}
                      style={{ borderRadius: '10px', padding: '10px 15px' }}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">Mật khẩu<span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="password" placeholder="Nhập mật khẩu (từ 6 ký tự)"
                      value={password} onChange={(e) => setPassword(e.target.value)}
                      style={{ borderRadius: '10px', padding: '10px 15px' }}
                    />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label className="fw-bold">Xác nhận mật khẩu<span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="password" placeholder="Xác nhận mật khẩu"
                      value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                      style={{ borderRadius: '10px', padding: '10px 15px' }}
                    />
                  </Form.Group>

                  <Button type="submit" className="w-100 mb-4 fw-bold" style={{ borderRadius: '10px', padding: '12px', backgroundColor: '#a31d45', borderColor: '#a31d45' }}>
                    Tiếp tục
                  </Button>

                  <div className="text-center" style={{ color: '#555' }}>
                    Đã có tài khoản? <Link to="/login" style={{ color: '#0d6efd', textDecoration: 'none' }}>Đăng nhập</Link>
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

export default Register;