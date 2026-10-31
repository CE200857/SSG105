package controller;

import dao.UserDAO;
import entity.Users;
import filter.PasswordUtils; // Đã đổi sang gọi từ package filter
import java.io.IOException;
import java.io.PrintWriter;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@WebServlet(name = "LoginServlet", urlPatterns = {"/api/login"})
public class LoginServlet extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        
        // Cấu hình UTF-8 và trả về JSON cho React
        response.setContentType("application/json;charset=UTF-8");
        request.setCharacterEncoding("UTF-8");
        
        String identifier = request.getParameter("identifier");
        String password = request.getParameter("password");
        
        PrintWriter out = response.getWriter();
        
        if(identifier == null || password == null) {
            response.setStatus(400);
            out.print("{\"status\":\"error\", \"message\":\"Vui lòng nhập đầy đủ thông tin\"}");
            return;
        }

                // Gọi hàm mã hóa từ package filter
        String hashedPassword = PasswordUtils.hashPassword(password);
        String remember = request.getParameter("remember");

        UserDAO dao = new UserDAO();
        Users user = dao.checkLogin(identifier, hashedPassword);

        com.google.gson.Gson gson = new com.google.gson.Gson();
        java.util.Map<String, Object> result = new java.util.LinkedHashMap<>();

        if (user != null) {
            // Tài khoản đã bị ban (IsActive = 0) -> không cho đăng nhập
            if (!dao.isUserActive(user.getUserID())) {
                response.setStatus(403);
                result.put("status", "banned");
                result.put("message", "Tài khoản của bạn đã bị khóa hoặc không còn hoạt động. Vui lòng liên hệ admin để được mở khóa.");
                out.print(gson.toJson(result));
                return;
            }

            // Tạo session và lưu thông tin user vào session
            jakarta.servlet.http.HttpSession session = request.getSession(true);
            session.setAttribute("user", user);

            // Ghi nhớ đăng nhập: giữ phiên 30 ngày (kể cả khi đóng trình duyệt)
            if ("true".equals(remember)) {
                int thirtyDays = 30 * 24 * 60 * 60;
                session.setMaxInactiveInterval(thirtyDays);
                jakarta.servlet.http.Cookie cookie = new jakarta.servlet.http.Cookie("JSESSIONID", session.getId());
                cookie.setMaxAge(thirtyDays);
                cookie.setPath(request.getContextPath().isEmpty() ? "/" : request.getContextPath());
                cookie.setHttpOnly(true);
                response.addCookie(cookie);
            }

            java.util.Map<String, Object> userMap = new java.util.LinkedHashMap<>();
            userMap.put("id", user.getUserID());
            userMap.put("fullName", user.getFullName());
            userMap.put("email", user.getEmail());
            userMap.put("roleId", user.getRoleID());

            result.put("status", "success");
            result.put("message", "Đăng nhập thành công");
            result.put("user", userMap);
            out.print(gson.toJson(result));
        } else {
            response.setStatus(401);
            result.put("status", "error");
            result.put("message", "Email/Số điện thoại hoặc mật khẩu không đúng!");
            out.print(gson.toJson(result));
        }
    }
}