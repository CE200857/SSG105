package controller;

import java.io.IOException;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

// Đặt đường dẫn nằm trong vùng kiểm tra của AuthFilter
@WebServlet(name = "AuthCheckServlet", urlPatterns = {"/api/protected/check-session"})
public class AuthCheckServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        // Nếu code chạy được vào đây, nghĩa là Filter đã xác nhận Session tồn tại
        response.setContentType("application/json;charset=UTF-8");

        // Nếu tài khoản vừa bị admin ban -> hủy phiên, báo cho frontend đăng xuất
        jakarta.servlet.http.HttpSession session = request.getSession(false);
        Object u = (session != null) ? session.getAttribute("user") : null;
        if (u instanceof entity.Users && !new dao.UserDAO().isUserActive(((entity.Users) u).getUserID())) {
            session.invalidate();
            response.setStatus(403);
            response.getWriter().print("{\"status\":\"banned\", \"message\":\"Tài khoản của bạn đã bị khóa. Vui lòng liên hệ admin để được mở khóa.\"}");
            return;
        }

        java.util.Map<String, Object> result = new java.util.LinkedHashMap<>();
        result.put("status", "success");
        result.put("message", "Session hợp lệ");
        if (u instanceof entity.Users) {
            entity.Users su = (entity.Users) u;
            java.util.Map<String, Object> userMap = new java.util.LinkedHashMap<>();
            userMap.put("id", su.getUserID());
            userMap.put("fullName", su.getFullName());
            userMap.put("email", su.getEmail());
            userMap.put("roleId", su.getRoleID());
            // Luôn lấy avatar mới nhất từ CSDL (null cũng được gửi để frontend xóa avatar cũ)
            String avatar = new dao.AvatarDAO().getAvatarByUserId(su.getUserID());
            userMap.put("avatar", avatar == null ? "" : avatar);
            result.put("user", userMap);
        }
        response.setStatus(200);
        response.getWriter().print(new com.google.gson.Gson().toJson(result));
    }
}
