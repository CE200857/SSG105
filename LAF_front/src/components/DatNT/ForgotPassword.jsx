import { useState } from "react";
import { Form, Button, Container, Row, Col, Alert, Card } from "react-bootstrap";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import EmailCodeField from "./EmailCodeField";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || code.length !== 6 || !password) {
      setError("Vui lòng nhập email, mã xác minh 6 số và mật khẩu mới.");
      return;
    }
    if (password.length < 6) { setError("Mật khẩu phải có ít nhất 6 ký tự."); return; }
    if (password !== confirm) { setError("Mật khẩu xác nhận không khớp."); return; }

    setLoading(true);
    try {
      const p = new URLSearchParams();
      p.append("email", email.trim());
      p.append("code", code);
      p.append("newPassword", password);
      await axios.post("/api/reset-password", p);
      setSuccess("Đổi mật khẩu thành công! Đang chuyển đến trang đăng nhập...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Không thể kết nối máy chủ.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = { borderRadius: "10px", padding: "12px 15px", fontSize: "0.95rem" };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={7} lg={5}>
          <Card className="shadow-sm border-0 p-4" style={{ borderRadius: "16px" }}>
            <h4 className="fw-bold text-center mb-3">Quên mật khẩu</h4>
            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}
            <Form onSubmit={handleSubmit} className="text-start">
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold" style={{ fontSize: "0.9rem" }}>Email</Form.Label>
                <Form.Control type="email" placeholder="Nhập email đã đăng ký" value={email}
                  onChange={(e) => setEmail(e.target.value.trim())}
                  className="shadow-none border-secondary-subtle" style={inputStyle} />
              </Form.Group>

              <EmailCodeField email={email} purpose="reset" code={code} setCode={setCode} onError={setError} />

              <Form.Group className="mb-3">
                <Form.Label className="fw-bold" style={{ fontSize: "0.9rem" }}>Mật khẩu mới</Form.Label>
                <Form.Control type="password" placeholder="Từ 6 ký tự" value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="shadow-none border-secondary-subtle" style={inputStyle} />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold" style={{ fontSize: "0.9rem" }}>Nhập lại mật khẩu mới</Form.Label>
                <Form.Control type="password" placeholder="Nhập lại mật khẩu" value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="shadow-none border-secondary-subtle" style={inputStyle} />
              </Form.Group>

              <Button type="submit" className="w-100 fw-bold" disabled={loading || !!success}
                style={{ borderRadius: "10px", padding: "12px" }}>
                {loading ? "Đang xử lý..." : "Đổi mật khẩu"}
              </Button>
              <div className="text-center mt-3"><Link to="/login">Quay lại đăng nhập</Link></div>
            </Form>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}