import axios from "axios";

// Avatar lưu trong CSDL dạng "/uploads/avatars/xxx.jpg" (máy chủ) hoặc link http(s) đầy đủ
export const resolveAvatar = (avatar) => {
  if (!avatar) return null;
  if (/^https?:\/\//i.test(avatar)) return avatar;
  return `${axios.defaults.baseURL || ""}${avatar}`;
};

export const fallbackAvatar = (name, size = 200) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "U")}&background=0C8B72&color=fff&size=${size}`;

export const getAvatarSrc = (avatar, name, size = 200) =>
  resolveAvatar(avatar) || fallbackAvatar(name, size);
