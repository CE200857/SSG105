/* eslint-disable no-unused-vars */
import { BrowserRouter } from "react-router-dom";
import { useState, useEffect } from "react";
import AppRoutes from "./routes/AppRoutes";
import axios from "axios";
import "./App.css";
import "./theme.css";
import "./dark-theme.css";
import GlobalLoadingBar from "./components/GlobalLoadingBar";
import { clearAuthStorage, persistUser, readStoredUser } from "./utils/session";

function App() {
  const [user, setUser] = useState(() => {
    const sessionUser = sessionStorage.getItem("user");
    if (sessionUser) return JSON.parse(sessionUser);
    const localUser = localStorage.getItem("user");
    if (localUser) {
      sessionStorage.setItem("user", localUser);
      return JSON.parse(localUser);
    }
    return null;
  });

  // Luôn đối chiếu với tài khoản thật đang đăng nhập trên máy chủ (và giữa các tab),
  // tránh hiện avatar / tên của tài khoản trước đó sau khi đăng xuất rồi đổi tài khoản.
  useEffect(() => {
    const sameEmail = (a, b) =>
      String(a || "").trim().toLowerCase() === String(b || "").trim().toLowerCase();

    const verifySession = async () => {
      const current = readStoredUser();
      if (!current) return;
      try {
        const res = await axios.get("/api/protected/check-session", {
          silent: true,
        });
        const server = res.data && res.data.user;
        if (!server || !server.email) return;

        if (!sameEmail(server.email, current.email)) {
          // Máy chủ đang đăng nhập tài khoản khác -> thay toàn bộ thông tin cũ
          const next = {
            ...server,
            roleId: Number(server.roleId || 2),
            avatar: server.avatar || null,
          };
          persistUser(next);
          setUser(next);
        } else if (
          (server.avatar || null) !== (current.avatar || null) ||
          (server.fullName && server.fullName !== current.fullName)
        ) {
          const next = {
            ...current,
            fullName: server.fullName || current.fullName,
            avatar: server.avatar || null,
          };
          persistUser(next);
          setUser(next);
        }
      } catch (error) {
        // Đăng xuất khi hết phiên (401) hoặc tài khoản bị ban (403); tránh lỗi 404 làm mất đăng nhập
        const status = error.response && error.response.status;
        if (status === 401 || status === 403) {
          clearAuthStorage();
          setUser(null);
        }
      }
    };

    // Tab khác đăng nhập / đăng xuất -> tab này đồng bộ theo
    const onStorage = (e) => {
      if (e.key !== "user") return;
      if (!e.newValue) {
        sessionStorage.removeItem("user");
        setUser(null);
      } else {
        try {
          const next = JSON.parse(e.newValue);
          sessionStorage.setItem("user", e.newValue);
          setUser(next);
        } catch {
          /* bỏ qua */
        }
      }
    };

    verifySession();
    window.addEventListener("focus", verifySession);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("focus", verifySession);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  return (
    <BrowserRouter>
      <GlobalLoadingBar />
      <AppRoutes user={user} setUser={setUser} />
    </BrowserRouter>
  );
}

export default App;
