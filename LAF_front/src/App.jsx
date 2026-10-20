/* eslint-disable no-unused-vars */
import { BrowserRouter } from "react-router-dom";
import { useState, useEffect } from "react";
import AppRoutes from "./routes/AppRoutes";
import axios from "axios";
import "./App.css";

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
          // Chỉ đăng xuất khi Backend thực sự báo 401 (Hết phiên), tránh lỗi 404 làm mất đăng nhập
          if (error.response && error.response.status === 401) {
            sessionStorage.removeItem("user");
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