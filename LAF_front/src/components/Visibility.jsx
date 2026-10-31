// Nhãn "Riêng tư" hiện trên bài đăng (chỉ chủ bài và admin nhìn thấy bài riêng tư)
export const VisibilityBadge = ({ visibility, className = "" }) =>
  visibility === "Private" ? (
    <span
      className={`d-inline-flex align-items-center fw-semibold rounded-pill ${className}`}
      style={{
        backgroundColor: "#FEE2E2",
        color: "#991B1B",
        border: "1px solid #FCA5A5",
        padding: "4px 12px",
        fontSize: "0.75rem",
        whiteSpace: "nowrap",
      }}
      title="Chỉ bạn và admin nhìn thấy bài này"
    >
      <i className="bi bi-lock-fill me-1"></i>Riêng tư
    </span>
  ) : null;
