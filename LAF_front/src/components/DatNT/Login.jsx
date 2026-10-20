/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from "react";
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const Login = ({ setUser }) => {
  const primaryColor = "#0C8B72";
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("laf_remembered_login");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setIdentifier(parsed.identifier || "");
        setPassword(parsed.password || "");
        setRememberMe(true);
      } catch {
        // Bỏ qua nếu dữ liệu lỗi
      }
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const params = new URLSearchParams();
      params.append("identifier", identifier.trim());
      params.append("password", password);

      const response = await axios.post("/api/login", params);
      const data = response.data || {};

      // Nhận diện thành công kể cả khi Backend trả về success: true, status: "success", hoặc message có chữ "thành công"
      const isLoginSuccess =
        data.success === true ||
        data.status === "success" ||
        Boolean(data.user) ||
        Boolean(data.email || data.Email || data.username || data.Username) ||
        (data.message &&
          data.message.toLowerCase().includes("thành công"));

      if (isLoginSuccess) {
        const rawUser = data.user || data.data || data;
        const normalizedRoleId = Number(
          rawUser.roleId || rawUser.RoleID || 2
        );
        const finalUser = {
          ...rawUser,
          username: rawUser.username || rawUser.Username || identifier.trim().split("@")[0],
          fullName: rawUser.fullName || rawUser.FullName || rawUser.username || "Sinh viên FPT",
          email: rawUser.email || rawUser.Email || identifier.trim(),
          roleId: normalizedRoleId,
        };

        sessionStorage.setItem("user", JSON.stringify(finalUser));

        if (rememberMe) {
          localStorage.setItem("user", JSON.stringify(finalUser));
          localStorage.setItem(
            "laf_remembered_login",
            JSON.stringify({ identifier: identifier.trim(), password })
          );
        } else {
          localStorage.removeItem("user");
          localStorage.removeItem("laf_remembered_login");
        }

        if (setUser) setUser(finalUser);

        if (normalizedRoleId === 1) {
          navigate("/admin");
        } else {
          navigate("/");
        }
      } else {
        setErrorMsg(
          data.message || "Tài khoản hoặc mật khẩu không chính xác!"
        );
      }
    } catch (error) {
      setErrorMsg(
        error.response?.data?.message ||
          "Tài khoản hoặc mật khẩu không chính xác!"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        backgroundColor: "#EAF5F3",
        minHeight: "calc(100vh - 70px)",
        padding: "40px 0",
      }}
    >
      <Container fluid className="px-4">
        <Row className="align-items-center justify-content-center g-5">
          <Col lg={6} className="text-start d-none d-lg-block">
            <p
              className="fw-bold mb-3"
              style={{ color: primaryColor, fontSize: "0.9rem", letterSpacing: "1px" }}
            >
              <i className="bi bi-circle-fill me-2" style={{ fontSize: "8px" }}></i>
              CAMPUS FPT CẦN THƠ
            </p>
            <h1
              className="fw-bold mb-3"
              style={{ color: "#10393B", fontSize: "3rem", lineHeight: "1.2" }}
            >
              Tìm lại đồ thất lạc. <br />
              <span style={{ color: primaryColor }}>Kết nối lại với cộng đồng.</span>
            </h1>
            <p className="text-secondary mb-4" style={{ fontSize: "1.05rem" }}>
              Đăng nhập để đăng tin, trao đổi và cùng sinh viên trong campus tìm lại
              những món đồ quan trọng.
            </p>

            <div className="position-relative d-inline-block w-100">
              <img
                src="https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=900&q=80"
                alt="FPT Campus"
                className="img-fluid rounded-4 shadow"
                style={{ maxHeight: "340px", width: "100%", objectFit: "cover" }}
              />
            </div>
          </Col>

          <Col lg={5} md={8}>
            <Card className="border-0 shadow-sm rounded-4 p-4 p-md-5 bg-white text-start">
              <div className="mb-4">
                <div
                  className="d-inline-flex align-items-center justify-content-center rounded-3 mb-3"
                  style={{
                    width: "48px",
                    height: "48px",
                    backgroundColor: "#EAF5F3",
                    color: primaryColor,
                  }}
                >
                  <i className="bi bi-box-arrow-in-right fs-4"></i>
                </div>
                <h3 className="fw-bold mb-1" style={{ color: "#10393B" }}>
                  Đăng nhập
                </h3>
                <p className="text-secondary mb-0" style={{ fontSize: "0.95rem" }}>
                  Chào mừng bạn trở lại! Cùng tiếp tục kết nối với cộng đồng Lost & Found.
                </p>
              </div>

              {errorMsg && (
                <Alert variant="danger" className="py-2 rounded-3">
                  {errorMsg}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold text-dark" style={{ fontSize: "0.9rem" }}>
                    Email hoặc số điện thoại
                  </Form.Label>
                  <div className="position-relative">
                    <i
                      className="bi bi-person position-absolute top-50 translate-middle-y text-secondary"
                      style={{ left: "14px" }}
                    ></i>
                    <Form.Control
                      type="text"
                      placeholder="Nhập email hoặc số điện thoại"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      required
                      className="py-2 shadow-none"
                      style={{ paddingLeft: "40px", borderRadius: "10px" }}
                    />
                  </div>
                  <Form.Text className="text-muted" style={{ fontSize: "0.8rem" }}>
                    Dùng email hoặc số điện thoại bạn đã đăng ký.
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold text-dark" style={{ fontSize: "0.9rem" }}>
                    Mật khẩu
                  </Form.Label>
                  <div className="position-relative">
                    <i
                      className="bi bi-lock position-absolute top-50 translate-middle-y text-secondary"
                      style={{ left: "14px" }}
                    ></i>
                    <Form.Control
                      type={showPassword ? "text" : "password"}
                      placeholder="Nhập mật khẩu"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="py-2 shadow-none"
                      style={{
                        paddingLeft: "40px",
                        paddingRight: "40px",
                        borderRadius: "10px",
                      }}
                    />
                    <i
                      className={`bi ${
                        showPassword ? "bi-eye-slash" : "bi-eye"
                      } position-absolute top-50 translate-middle-y text-secondary`}
                      style={{ right: "14px", cursor: "pointer" }}
                      onClick={() => setShowPassword(!showPassword)}
                    ></i>
                  </div>
                </Form.Group>

                <div className="d-flex justify-content-between align-items-center mb-4">
                  <Form.Check
                    type="checkbox"
                    id="remember-me-checkbox"
                    label="Ghi nhớ đăng nhập"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="text-secondary fw-medium"
                    style={{ fontSize: "0.9rem", cursor: "pointer" }}
                  />
                  <Link
                    to="/forgot-password"
                    className="text-decoration-none fw-bold"
                    style={{ color: primaryColor, fontSize: "0.9rem" }}
                  >
                    Quên mật khẩu?
                  </Link>
                </div>

                <Button
                  type="submit"
                  className="w-100 py-2 fw-bold border-0 text-white shadow-sm mb-3"
                  style={{ backgroundColor: primaryColor, borderRadius: "10px" }}
                  disabled={loading}
                >
                  {loading ? (
                    <Spinner size="sm" />
                  ) : (
                    <>
                      Đăng nhập <i className="bi bi-arrow-right ms-1"></i>
                    </>
                  )}
                </Button>

                <div className="text-center border-top pt-3">
                  <span className="text-muted d-block mb-2" style={{ fontSize: "0.85rem" }}>
                    Bạn chưa có tài khoản?
                  </span>
                  <Link
                    to="/register"
                    className="text-decoration-none fw-bold"
                    style={{ color: primaryColor, fontSize: "1rem" }}
                  >
                    Đăng ký
                  </Link>
                </div>
              </Form>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Login;