package controller;

import dao.EmailCodeDAO;
import dao.UserDAO;
import filter.PasswordUtils;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

@WebServlet(name = "ResetPasswordServlet", urlPatterns = {"/api/reset-password"})
public class ResetPasswordServlet extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json;charset=UTF-8");
        request.setCharacterEncoding("UTF-8");

        String email = request.getParameter("email");
        String code = request.getParameter("code");
        String newPassword = request.getParameter("newPassword");

        if (email == null || newPassword == null || newPassword.length() < 6) {
            fail(response, 400, "Mật khẩu mới phải từ 6 ký tự.");
            return;
        }

        EmailCodeDAO codeDao = new EmailCodeDAO();
        boolean codeOk;
        try { codeOk = codeDao.checkCode(email, code, true); } finally { codeDao.close(); }  // đúng -> xóa mã
        if (!codeOk) {
            fail(response, 400, "Mã xác minh sai hoặc đã hết hạn.");
            return;
        }

        boolean ok = new UserDAO().changePassword(email.trim(), PasswordUtils.hashPassword(newPassword));
        if (ok) {
            response.getWriter().print("{\"status\":\"success\",\"message\":\"Đổi mật khẩu thành công.\"}");
        } else {
            fail(response, 500, "Không thể đổi mật khẩu, vui lòng thử lại.");
        }
    }

    private void fail(HttpServletResponse res, int code, String msg) throws IOException {
        res.setStatus(code);
        res.getWriter().print("{\"status\":\"error\",\"message\":\"" + msg + "\"}");
    }
}