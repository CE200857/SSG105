package controller;

import dao.EmailCodeDAO;
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

        // Lấy dữ liệu gửi lên (username không còn nhập từ giao diện, server giữ nguyên)
        String currentEmail = request.getParameter("currentEmail");
        String fullName = request.getParameter("fullName");
        String email = request.getParameter("email");
        String phone = request.getParameter("phone");
        String campus = request.getParameter("campus");
        String gender = request.getParameter("gender");
        String code = request.getParameter("code");
        email = (email == null) ? "" : email.trim();

        if (!email.matches("^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$")) {
            result.put("success", false);
            result.put("message", "Email không hợp lệ.");
            out.print(new Gson().toJson(result));
            out.flush();
            return;
        }

        // Chỉ cho chọn campus Cần Thơ (Admin được bỏ qua)
        jakarta.servlet.http.HttpSession sess = request.getSession(false);
        Object sessUser = sess == null ? null : sess.getAttribute("user");
        boolean isAdmin = sessUser instanceof entity.Users && ((entity.Users) sessUser).getRoleID() == 1;
        if (!isAdmin && !util.CampusUtil.isBlankCampus(campus) && !util.CampusUtil.isCanTho(campus)) {
            result.put("success", false);
            result.put("message", util.CampusUtil.unsupportedMessage(campus));
            out.print(new Gson().toJson(result));
            out.flush();
            return;
        }

        UserDAO dao = new UserDAO();

        // 1. Kiểm tra trùng lặp
        String errorMsg = dao.checkDuplicateForUpdate(currentEmail, email, phone);

        // 2. Đổi email: người dùng thường phải xác minh mã gửi tới email MỚI.
        //    Admin được đổi email mà không cần xác minh.
        boolean emailChanged = currentEmail == null || !email.equalsIgnoreCase(currentEmail.trim());
        boolean needCode = emailChanged && !isAdmin;
        if (errorMsg == null && needCode) {
            EmailCodeDAO codeDao = new EmailCodeDAO();
            try {
                if (!codeDao.checkCode(email, code, false)) {
                    result.put("success", false);
                    result.put("needEmailCode", true);
                    result.put("message", "Bạn cần nhập đúng mã xác minh gửi tới email mới. Mã sai hoặc đã hết hạn.");
                    out.print(new Gson().toJson(result));
                    out.flush();
                    return;
                }
            } finally {
                codeDao.close();
            }
        }

        if (errorMsg != null) {
            result.put("success", false);
            result.put("message", errorMsg);
        } else {
            // 3. Tiến hành update
            boolean isUpdated = dao.updateProfile(currentEmail, fullName, email, phone, campus, gender);
            if (isUpdated) {
                if (needCode) {              // mã chỉ dùng 1 lần: xóa sau khi đổi email thành công
                    EmailCodeDAO codeDao = new EmailCodeDAO();
                    try { codeDao.deleteCode(email); } finally { codeDao.close(); }
                }
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