import { useState, useEffect } from "react";
import { Container, Row, Col, Card, Form, Button, Spinner, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const EditProfilePage = ({ user, setUser }) => {
  const primaryColor = "#1f6dba";
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Các state lưu trữ dữ liệu form
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    phone: "",
    campus: "",
    gender: ""
  });

  useEffect(() => {
    if (!user || !user.email) {
      navigate("/login");
      return;
    }

    // Lấy dữ liệu cũ để điền sẵn vào form
    const fetchProfile = async () => {
      try {
        const response = await axios.get("/api/profile", {
          params: { email: user.email }
        });
        const data = response.data;
        setFormData({
          fullName: data.fullName || "",
          username: data.username || "",
          email: data.email || "",
          phone: data.phone === "Chưa cập nhật" ? "" : data.phone,
          campus: data.campus === "Chưa cập nhật" ? "" : data.campus,
          gender: data.gender === "Chưa xác định" ? "" : data.gender
        });
      } catch (error) {
        console.error("Lỗi khi tải hồ sơ:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    // Validate Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) return "Định dạng email không hợp lệ!";
    
    // Validate Phone (10 chữ số)
    const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
    if (formData.phone && !phoneRegex.test(formData.phone)) return "Số điện thoại không hợp lệ (Phải bắt đầu bằng số 0 và có 10 số)!";
    
    // Validate tên đăng nhập (Không chứa dấu cách)
    if (/\s/.test(formData.username)) return "Tên người dùng không được chứa khoảng trắng!";

    return null;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    const validationError = validateForm();
    if (validationError) {
      setErrorMsg(validationError);
      return;
    }

    setSaving(true);
    try {
      const params = new URLSearchParams();
      params.append('currentEmail', user.email);
      params.append('username', formData.username);
      params.append('fullName', formData.fullName);
      params.append('email', formData.email);
      params.append('phone', formData.phone);
      params.append('campus', formData.campus);
      params.append('gender', formData.gender);

      const response = await axios.post('/api/update-profile', params);

      if (response.data.success) {
        setSuccessMsg(response.data.message);
        
        // Cập nhật lại session user do email/tên có thể bị đổi
        const updatedUser = { ...user, email: response.data.newEmail, fullName: response.data.newFullName };
        sessionStorage.setItem("user", JSON.stringify(updatedUser));
        if(setUser) setUser(updatedUser);

        setTimeout(() => navigate("/profile"), 1500); // Tự động về trang cá nhân
      } else {
        setErrorMsg(response.data.message);
      }
    } catch (error) {
      console.error(error);
      setErrorMsg("Lỗi kết nối đến máy chủ.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
        <Spinner animation="border" style={{ color: primaryColor }} />
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "#f4f9ff", minHeight: "100vh", padding: "40px 0" }}>
      <Container>
        <div className="mb-4 text-start">
          <h3 className="fw-bold mb-1" style={{ color: "#12345a" }}>Chỉnh sửa hồ sơ</h3>
          <p className="text-secondary mb-0">Cập nhật thông tin cá nhân của bạn.</p>
        </div>

        <Row className="justify-content-center">
          <Col lg={10}>
            <Card className="border-0 shadow-sm rounded-4 p-4 p-md-5 bg-white text-start">
              
              {errorMsg && <Alert variant="danger" className="rounded-3 border-0 shadow-sm">{errorMsg}</Alert>}
              {successMsg && <Alert variant="success" className="rounded-3 border-0 shadow-sm">{successMsg}</Alert>}

              <Form onSubmit={handleSave}>
                <Row className="g-4">
                  <Col md={6}>
                    <Form.Group className="d-flex flex-column h-100">
                      <Form.Label className="text-secondary fw-medium mb-2 ms-1" style={{ fontSize: "0.9rem" }}>Họ và tên <span className="text-danger">*</span></Form.Label>
                      <Form.Control 
                        type="text" 
                        name="fullName"
                        value={formData.fullName} 
                        onChange={handleChange}
                        required
                        className="px-3 py-3 rounded-3 shadow-none border-0 flex-grow-1" 
                        style={{ backgroundColor: "#f8fafc", color: "#12345a", fontWeight: "600", border: "1px solid #e2e8f0" }}
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="d-flex flex-column h-100">
                      <Form.Label className="text-secondary fw-medium mb-2 ms-1" style={{ fontSize: "0.9rem" }}>Tên người dùng (Username) <span className="text-danger">*</span></Form.Label>
                      <Form.Control 
                        type="text" 
                        name="username"
                        value={formData.username} 
                        onChange={handleChange}
                        required
                        className="px-3 py-3 rounded-3 shadow-none border-0 flex-grow-1" 
                        style={{ backgroundColor: "#f8fafc", color: "#12345a", fontWeight: "600", border: "1px solid #e2e8f0" }}
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="d-flex flex-column h-100">
                      <Form.Label className="text-secondary fw-medium mb-2 ms-1" style={{ fontSize: "0.9rem" }}>Địa chỉ Email <span className="text-danger">*</span></Form.Label>
                      <Form.Control 
                        type="email" 
                        name="email"
                        value={formData.email} 
                        onChange={handleChange}
                        required
                        className="px-3 py-3 rounded-3 shadow-none border-0 flex-grow-1" 
                        style={{ backgroundColor: "#f8fafc", color: "#12345a", fontWeight: "600", border: "1px solid #e2e8f0" }}
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="d-flex flex-column h-100">
                      <Form.Label className="text-secondary fw-medium mb-2 ms-1" style={{ fontSize: "0.9rem" }}>Số điện thoại</Form.Label>
                      <Form.Control 
                        type="text" 
                        name="phone"
                        value={formData.phone} 
                        onChange={handleChange}
                        className="px-3 py-3 rounded-3 shadow-none border-0 flex-grow-1" 
                        style={{ backgroundColor: "#f8fafc", color: "#12345a", fontWeight: "600", border: "1px solid #e2e8f0" }}
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="d-flex flex-column h-100">
                      <Form.Label className="text-secondary fw-medium mb-2 ms-1" style={{ fontSize: "0.9rem" }}>Cơ sở (Campus)</Form.Label>
                      <Form.Select 
                        name="campus"
                        value={formData.campus} 
                        onChange={handleChange}
                        className="px-3 py-3 rounded-3 shadow-none border-0 flex-grow-1" 
                        style={{ backgroundColor: "#f8fafc", color: "#12345a", fontWeight: "600", border: "1px solid #e2e8f0" }}
                      >
                        <option value="">-- Chọn cơ sở --</option>
                        <option value="Hà Nội">Hà Nội</option>
                        <option value="Hồ Chí Minh">Hồ Chí Minh</option>
                        <option value="Đà Nẵng">Đà Nẵng</option>
                        <option value="Cần Thơ">Cần Thơ</option>
                        <option value="Quy Nhơn">Quy Nhơn</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="d-flex flex-column h-100">
                      <Form.Label className="text-secondary fw-medium mb-2 ms-1" style={{ fontSize: "0.9rem" }}>Giới tính</Form.Label>
                      <Form.Select 
                        name="gender"
                        value={formData.gender} 
                        onChange={handleChange}
                        className="px-3 py-3 rounded-3 shadow-none border-0 flex-grow-1" 
                        style={{ backgroundColor: "#f8fafc", color: "#12345a", fontWeight: "600", border: "1px solid #e2e8f0" }}
                      >
                        <option value="">-- Chọn giới tính --</option>
                        <option value="Nam">Nam</option>
                        <option value="Nữ">Nữ</option>
                        <option value="Khác">Khác</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <div className="mt-5 pt-4 border-top d-flex justify-content-end gap-3">
                  <Button 
                    variant="light" 
                    className="fw-semibold px-4 shadow-sm"
                    style={{ border: "1px solid #e2e8f0", color: "#475569" }}
                    onClick={() => navigate("/profile")}
                  >
                    Hủy bỏ
                  </Button>
                  <Button 
                    type="submit" 
                    className="fw-semibold px-5 shadow-sm border-0"
                    style={{ backgroundColor: primaryColor, color: "white" }}
                    disabled={saving}
                  >
                    {saving ? <Spinner size="sm" /> : "Lưu thay đổi"}
                  </Button>
                </div>
              </Form>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default EditProfilePage;