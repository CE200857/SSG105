import { useState } from "react";
import { getAvatarSrc } from "../utils/avatar";

const same = (a, b) =>
  !!a && !!b && String(a).trim().toLowerCase() === String(b).trim().toLowerCase();

// Nằm bên trong vòng tròn chữ cái đầu có sẵn: có ảnh thì hiện ảnh, không thì hiện chữ cái đầu.
// Bài/bình luận của chính người đang đăng nhập luôn dùng ảnh mới nhất từ user (kể cả khi đã đổi avatar).
const AvatarFill = ({ user, name, userId, email, avatar }) => {
  const [failedSrc, setFailedSrc] = useState(null);
  const isMe =
    !!user &&
    (same(email, user.email) ||
      (!!userId && !!user.id && Number(userId) === Number(user.id)) ||
      (!email && !userId && same(name, user.fullName)));
  const raw = isMe ? user.avatar || avatar : avatar;
  const initial = name ? String(name).charAt(0) : "U";

  if (!raw || failedSrc === raw) return initial;
  return (
    <img
      src={getAvatarSrc(raw, name, 80)}
      alt={name || "avatar"}
      onError={() => setFailedSrc(raw)}
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
        borderRadius: "50%",
        display: "block",
      }}
    />
  );
};

export default AvatarFill;
