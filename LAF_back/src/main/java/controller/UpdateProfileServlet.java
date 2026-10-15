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
import java.util.HashMap;
import java.util.Map;

@WebServlet(name = "UpdateProfileServlet", urlPatterns = {"/api/update-profile"})
public class UpdateProfileServlet extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        
        response.setContentType("application/json;charset=UTF-8");
        PrintWriter out = response.getWriter();
        Map<String, Object> result = new HashMap<>();

        // Lấy dữ liệu gửi lên
        String currentEmail = request.getParameter("currentEmail");
        String username = request.getParameter("username");
        String fullName = request.getParameter("fullName");
        String email = request.getParameter("email");
        String phone = request.getParameter("phone");
        String campus = request.getParameter("campus");
        String gender = request.getParameter("gender");

        UserDAO dao = new UserDAO();
        
        // 1. Kiểm tra trùng lặp
        String errorMsg = dao.checkDuplicateForUpdate(currentEmail, username, email, phone);
        if (errorMsg != null) {
            result.put("success", false);
            result.put("message", errorMsg);
        } else {
            // 2. Tiến hành update
            boolean isUpdated = dao.updateProfile(currentEmail, username, fullName, email, phone, campus, gender);
            if (isUpdated) {
                result.put("success", true);
                result.put("message", "Cập nhật hồ sơ thành công!");
                // Trả về thông tin cơ bản để React cập nhật Session
                result.put("newEmail", email);
                result.put("newFullName", fullName);
            } else {
                result.put("success", false);
                result.put("message", "Lỗi cập nhật. Vui lòng thử lại!");
            }
        }

        out.print(new Gson().toJson(result));
        out.flush();
    }
}