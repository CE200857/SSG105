import { useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import axios from "axios";

const MAX_LEN = 1000;

const callApi = async (action, type, commentId, content) => {
  const params = new URLSearchParams();
  params.append("action", action);
  params.append("type", type);
  params.append("commentId", commentId);
  if (content !== undefined) params.append("content", content);
  const res = await axios.post("/api/comments", params);
  if (!res.data || !res.data.success) {
    throw new Error((res.data && res.data.message) || "Thao tác thất bại.");
  }
  return res.data;
};

// Nội dung 1 bình luận + nút Chỉnh sửa / Xóa (chỉ hiện với chủ bình luận hoặc admin).
// local = true: bình luận lưu ở trình duyệt (phần trả lời), không gọi máy chủ.
export default function CommentContent({
  type,
  comment,
  local = false,
  fontSize = "0.9rem",
  onEdited,
  onDeleted,
}) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(comment.text);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);

  const startEdit = () => {
    setText(comment.text);
    setError("");
    setEditing(true);
  };

  const save = async () => {
    const value = text.trim();
    if (!value) {
      setError("Nội dung không được để trống.");
      return;
    }
    if (value === comment.text) {
      setEditing(false);
      return;
    }
    setBusy(true);
    setError("");
    try {
      const data = local
        ? { text: value }
        : await callApi("update", type, comment.id, value);
      if (onEdited) onEdited(data.text ?? value);
      setEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Không thể lưu.");
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    setBusy(true);
    setError("");
    try {
      const data = local
        ? { deletedIds: [comment.id] }
        : await callApi("delete", type, comment.id);
      setConfirmOpen(false);
      if (onDeleted) onDeleted(data.deletedIds || [comment.id]);
    } catch (err) {
      setConfirmOpen(false);
      setError(err.response?.data?.message || err.message || "Không thể xóa.");
    } finally {
      setBusy(false);
    }
  };

  if (editing) {
    return (
      <div>
        <Form.Control
          as="textarea"
          rows={2}
          maxLength={MAX_LEN}
          autoFocus
          value={text}
          disabled={busy}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setEditing(false);
            if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) save();
          }}
          style={{ fontSize }}
        />
        {error && <div className="text-danger small mt-1">{error}</div>}
        <div className="d-flex gap-2 mt-2 justify-content-end">
          <Button
            size="sm"
            variant="light"
            disabled={busy}
            onClick={() => setEditing(false)}
          >
            Hủy
          </Button>
          <Button
            size="sm"
            disabled={busy}
            onClick={save}
            style={{ backgroundColor: "#1f6dba", border: 0 }}
          >
            {busy ? "Đang lưu..." : "Lưu"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <p
        className="mb-0 text-secondary"
        style={{ fontSize, whiteSpace: "pre-wrap" }}
      >
        {comment.text}
      </p>
      {error && <div className="text-danger small mt-1">{error}</div>}
      {comment.canManage && (
        <div className="d-flex gap-3 mt-1" style={{ fontSize: "0.78rem" }}>
          <button type="button" className="comment-act" onClick={startEdit}>
            <i className="bi bi-pencil me-1"></i>Chỉnh sửa
          </button>
          <button
            type="button"
            className="comment-act comment-act-danger"
            onClick={() => setConfirmOpen(true)}
          >
            <i className="bi bi-trash me-1"></i>Xóa
          </button>
        </div>
      )}

      <Modal
        show={confirmOpen}
        onHide={() => !busy && setConfirmOpen(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title className="fs-5 fw-bold">Xóa bình luận?</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-secondary">
          Bình luận sẽ bị xóa vĩnh viễn
          {local ? "." : " cùng các phản hồi của nó."} Bạn không thể hoàn tác.
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button
            variant="light"
            disabled={busy}
            onClick={() => setConfirmOpen(false)}
          >
            Hủy
          </Button>
          <Button variant="danger" disabled={busy} onClick={remove}>
            {busy ? "Đang xóa..." : "Xóa"}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
