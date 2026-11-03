// Quản lý thông tin đăng nhập lưu ở trình duyệt, để dữ liệu tài khoản cũ không bị sót lại

export const readStoredUser = () => {
  try {
    const raw = sessionStorage.getItem("user") || localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const clearAuthStorage = () => {
  try {
    sessionStorage.removeItem("user");
    localStorage.removeItem("user");
  } catch {
    /* bỏ qua */
  }
};

// Ghi lại user vào nơi đang lưu (localStorage chỉ cập nhật nếu đang bật "ghi nhớ đăng nhập")
export const persistUser = (user) => {
  try {
    sessionStorage.setItem("user", JSON.stringify(user));
    if (localStorage.getItem("user")) {
      localStorage.setItem("user", JSON.stringify(user));
    }
  } catch {
    /* bỏ qua */
  }
};
