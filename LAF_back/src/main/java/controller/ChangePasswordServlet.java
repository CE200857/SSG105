package controller;

import dao.UserDAO;
import com.google.gson.Gson;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HashMap;
import java.util.Map;

@WebServlet(name = "ChangePasswordServlet", urlPatterns = {"/api/change-password"})
public class ChangePasswordServlet extends HttpServlet {

    // Hàm mã hóa MD5 (Tái sử dụng lại logic bạn đang dùng ở phần Đăng nhập/Đăng ký)
    private String hashPassword(String password) {
        try {
            MessageDigest md = MessageDigest.getInstance("MD5");
            md.update(password.getBytes());
            byte[] bytes = md.digest();
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < bytes.length; i++) {
                sb.append(Integer.toString((bytes[i] & 0xff) + 0x100, 16).substring(1));
            }
            return sb.toString();
        } catch (NoSuchAlgorithmException e) {
            e.printStackTrace();
            return null;
        }
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        
        response.setContentType("application/json;charset=UTF-8");
        PrintWriter out = response.getWriter();
        Map<String, Object> result = new HashMap<>();

        String email = request.getParameter("email");
        String currentPassword = request.getParameter("currentPassword");
        String newPassword = request.getParameter("newPassword");

        // BẮT BUỘC: Mã hóa MD5 trước khi so sánh hoặc lưu vào DB
        String hashedCurrentPassword = hashPassword(currentPassword);
        String hashedNewPassword = hashPassword(newPassword);

        UserDAO dao = new UserDAO();
        
        // Kiểm tra mật khẩu cũ đã mã hóa
        if (!dao.checkCurrentPassword(email, hashedCurrentPassword)) {
            result.put("success", false);
            result.put("message", "Mật khẩu hiện tại không đúng!");
        } else {
            // Cập nhật mật khẩu mới đã mã hóa
            boolean isChanged = dao.changePassword(email, hashedNewPassword);
            if (isChanged) {
                result.put("success", true);
                result.put("message", "Đổi mật khẩu thành công!");
            } else {
                result.put("success", false);
                result.put("message", "Có lỗi xảy ra, vui lòng thử lại sau!");
            }
        }

        out.print(new Gson().toJson(result));
        out.flush();
    }
}