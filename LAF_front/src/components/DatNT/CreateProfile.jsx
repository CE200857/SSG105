import { useState, useEffect } from "react";
import { Form, Button, Container, Row, Col, Alert, Card } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const CreateProfile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const registerData = location.state;

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("Nam");
  const [campus, setCampus] = useState("Cần Thơ");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!registerData) {
      navigate("/register");
    }
  }, [registerData, navigate]);

  // Regex tên: Chỉ chữ cái (hỗ trợ Unicode tiếng Việt) & khoảng trắng, ít nhất 2 từ.
  const isFullName = (val) => {
    const trimmed = val.trim();
    // Phải có ít nhất 1 khoảng trắng và không chứa số/kí tự đặc biệt
    return trimmed.includes(' ') && /^[a-zA-ZÀ-ỹ\s]+$/.test(trimmed);
  };
  
  // Regex SĐT: Bắt đầu 0, số thứ 2 từ 1-9, tổng 10 số.
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

    try {
      setError("");
      const params = new URLSearchParams();
      params.append('username', registerData.username);
      params.append('email', registerData.email);
      params.append('password', registerData.password); // Backend sẽ mã hóa cái này
      params.append('fullName', fullName.trim());
      params.append('phone', phone);
      params.append('gender', gender);
      params.append('campus', campus);

      const response = await axios.post("/api/register", params);

      if (response.data.status === "success") {
        setSuccess("Đăng ký thành công! Đang chuyển hướng đăng nhập...");
        setTimeout(() => navigate("/login"), 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi kết nối đến máy chủ.");
    }
  };

  if (!registerData) return null;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)', padding: '20px' }}>
      <Container>
        <Row className="justify-content-center">
          <Col xs={12} sm={10} md={8} lg={6} xl={5}>
            <Card className="border-0 shadow-lg" style={{ borderRadius: '20px', padding: '30px' }}>
              <Card.Body>
                <div className="d-flex align-items-center mb-4 position-relative">
                  <Button variant="link" onClick={() => navigate(-1)} className="p-0 position-absolute start-0 text-dark">
                    <i className="bi bi-arrow-left fs-4"></i>
                  </Button>
                  <h4 className="w-100 text-center m-0 fw-bold" style={{ color: '#333' }}>THÔNG TIN CÁ NHÂN</h4>
                </div>

                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">{success}</Alert>}

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">Họ và Tên<span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="text" placeholder="Vd: Nguyễn Tiến Đạt"
                      value={fullName} onChange={(e) => setFullName(e.target.value)}
                      style={{ borderRadius: '10px', padding: '10px 15px' }}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">Số điện thoại<span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="text" placeholder="Vd: 0912345678"
                      value={phone} onChange={(e) => setPhone(e.target.value)}
                      style={{ borderRadius: '10px', padding: '10px 15px' }}
                    />
                  </Form.Group>

                  <Row className="mb-4">
                    <Col>
                      <Form.Group>
                        <Form.Label className="fw-bold">Giới tính</Form.Label>
                        <Form.Select value={gender} onChange={(e) => setGender(e.target.value)} style={{ borderRadius: '10px', padding: '10px 15px' }}>
                          <option value="Nam">Nam</option>
                          <option value="Nữ">Nữ</option>
                          <option value="Khác">Khác</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col>
                      <Form.Group>
                        <Form.Label className="fw-bold">Campus</Form.Label>
                        <Form.Select value={campus} onChange={(e) => setCampus(e.target.value)} style={{ borderRadius: '10px', padding: '10px 15px' }}>
                          <option value="Cần Thơ">Cần Thơ</option>
                          <option value="Hồ Chí Minh">Hồ Chí Minh</option>
                          <option value="Hà Nội">Hà Nội</option>
                          <option value="Đà Nẵng">Đà Nẵng</option>
                          <option value="Quy Nhơn">Quy Nhơn</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Button type="submit" className="w-100 fw-bold" style={{ borderRadius: '10px', padding: '12px', backgroundColor: '#a31d45', borderColor: '#a31d45' }}>
                    Hoàn tất đăng ký
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