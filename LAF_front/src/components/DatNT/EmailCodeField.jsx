import { useState, useEffect } from "react";
import { Form, Button } from "react-bootstrap";
import axios from "axios";

// Ô nhập mã 6 số + nút "Gửi mã". purpose = "register" | "reset"
export default function EmailCodeField({ email, purpose, code, setCode, onError }) {
  const [wait, setWait] = useState(0);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (wait <= 0) return;
    const t = setTimeout(() => setWait((w) => w - 1), 1000);
    return () => clearTimeout(t);
  }, [wait]);

  const handleSend = async () => {
    onError("");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      onError("Vui lòng nhập Email hợp lệ trước khi gửi mã.");
      return;
    }
    setSending(true);
    try {
      const params = new URLSearchParams();
      params.append("action", "send");
      params.append("purpose", purpose);
      params.append("email", email.trim());
      await axios.post("/api/email-code", params);
      setSent(true);
      setWait(60);
    } catch (err) {
      onError(err.response?.data?.message || "Không gửi được mã, vui lòng thử lại.");
      if (err.response?.data?.wait) setWait(err.response.data.wait);
    } finally {
      setSending(false);
    }
  };

  return (
    <Form.Group className="mb-3">
      <Form.Label className="fw-bold" style={{ color: "#333", fontSize: "0.9rem" }}>
        Mã xác minh<span className="text-success">*</span>
      </Form.Label>
      <div className="d-flex gap-2">
        <Form.Control
          placeholder="Nhập mã 6 số"
          inputMode="numeric"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          className="shadow-none border-secondary-subtle"
          style={{ borderRadius: "10px", padding: "12px 15px", fontSize: "0.95rem" }}
        />
        <Button
          type="button"
          disabled={sending || wait > 0}
          onClick={handleSend}
          style={{ borderRadius: "10px", whiteSpace: "nowrap", minWidth: "115px" }}
        >
          {sending ? "Đang gửi..." : wait > 0 ? `Gửi lại (${wait}s)` : sent ? "Gửi lại" : "Gửi mã"}
        </Button>
      </div>
      {sent && <Form.Text className="text-success">Mã đã được gửi, có hiệu lực 5 phút.</Form.Text>}
    </Form.Group>
  );
}