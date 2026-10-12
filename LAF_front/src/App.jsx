/* eslint-disable no-unused-vars */
import { BrowserRouter } from "react-router-dom";
import { useState, useEffect } from "react";
import AppRoutes from "./routes/AppRoutes";
import axios from "axios";
import "./App.css";

function App() {
  // 1. Chuyển đổi localStorage thành sessionStorage để dữ liệu tự xóa khi đóng tab
  const [user, setUser] = useState(() => {
    const loggedInUser = sessionStorage.getItem("user");
    return loggedInUser ? JSON.parse(loggedInUser) : null;
  });

  useEffect(() => {
    const verifySession = async () => {
      if (user) {
        try {
          await axios.get("/api/protected/check-session");
        } catch (error) {
          // 2. Ép đăng xuất trong MỌI TRƯỜNG HỢP lỗi: 
          // (Backend trả về 401, hoặc chưa bật Tomcat, hoặc mất kết nối mạng)
          console.log("Phiên không hợp lệ hoặc Server backend đang tắt. Ép đăng xuất.");
          sessionStorage.removeItem("user");
          setUser(null);
        }
      }
    };

    verifySession();
  }, []); // Chỉ chạy 1 lần khi load app

  return (
    <BrowserRouter>
      <AppRoutes user={user} setUser={setUser} />
    </BrowserRouter>
  );
}

export default App;