/* eslint-disable no-unused-vars */
import { BrowserRouter } from "react-router-dom";
import { useState, useEffect } from "react";
import AppRoutes from "./routes/AppRoutes";
import axios from "axios";
import "./App.css";
import "./theme.css";

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

  useEffect(() => {
    const verifySession = async () => {
      if (user) {
        try {
          await axios.get("/api/protected/check-session");
        } catch (error) {
          // Đăng xuất khi hết phiên (401) hoặc tài khoản bị ban (403); tránh lỗi 404 làm mất đăng nhập
          const status = error.response && error.response.status;
          if (status === 401 || status === 403) {
            sessionStorage.removeItem("user");
            localStorage.removeItem("user");
            setUser(null);
          }
        }
      }
    };

    verifySession();
  }, []);

  return (
    <BrowserRouter>
      <AppRoutes user={user} setUser={setUser} />
    </BrowserRouter>
  );
}

export default App;
