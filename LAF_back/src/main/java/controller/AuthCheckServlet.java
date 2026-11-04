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
            // Lấy thông tin MỚI NHẤT từ CSDL (email, họ tên, avatar có thể đã đổi sau khi đăng nhập)
            dao.SessionDAO sdao = new dao.SessionDAO();
            java.util.Map<String, Object> info;
            try {
                info = sdao.getActiveUserInfo(((entity.Users) u).getUserID());
            } finally {
                sdao.close();
            }
            if (info == null) { // tài khoản đã bị xóa hoặc không còn hoạt động
                session.invalidate();
                response.setStatus(401);
                response.getWriter().print("{\"status\":\"error\", \"message\":\"Tài khoản không còn tồn tại.\"}");
                return;
            }
            result.put("user", info);
        }
        response.setStatus(200);
        response.getWriter().print(new com.google.gson.Gson().toJson(result));
    }
}
