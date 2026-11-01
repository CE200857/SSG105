package controller;

import com.google.gson.Gson;
import dao.EmailCodeDAO;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.LinkedHashMap;
import java.util.Map;
import util.MailUtil;

@WebServlet(name = "EmailCodeServlet", urlPatterns = {"/api/email-code"})
public class EmailCodeServlet extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json;charset=UTF-8");
        request.setCharacterEncoding("UTF-8");

        String action = request.getParameter("action");
        String email = request.getParameter("email");
        email = (email == null) ? "" : email.trim().toLowerCase();

        // Kiểm tra email hợp lý (cùng regex với RegisterServlet)
        if (!email.matches("^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$")) {
            reply(response, 400, "error", "Email không hợp lệ.", 0);
            return;
        }

        EmailCodeDAO dao = new EmailCodeDAO();
        try {
            if ("send".equals(action)) {
                String purpose = request.getParameter("purpose");
                boolean exists = dao.emailExists(email);
                if ("register".equals(purpose) && exists) {
                    reply(response, 409, "error", "Email này đã được sử dụng.", 0); return;
                }
                if ("reset".equals(purpose) && !exists) {
                    reply(response, 404, "error", "Email này chưa đăng ký tài khoản.", 0); return;
                }
                if (!"register".equals(purpose) && !"reset".equals(purpose)) {
                    reply(response, 400, "error", "Yêu cầu không hợp lệ.", 0); return;
                }
                int wait = dao.cooldownLeft(email);
                if (wait > 0) {
                    reply(response, 429, "error", "Vui lòng đợi " + wait + " giây rồi gửi lại.", wait); return;
                }
                String code = dao.createCode(email);
                if (code == null) {
                    reply(response, 500, "error", "Lỗi hệ thống, vui lòng thử lại.", 0); return;
                }
                try {
                    MailUtil.send(email, "Mã xác minh Lost & Found",
                            "Mã xác minh của bạn là: " + code
                            + "\nMã có hiệu lực trong 5 phút và chỉ dùng được 1 lần."
                            + "\nKhông chia sẻ mã này cho bất kỳ ai.");
                } catch (Exception e) {
                    dao.deleteCode(email);
                    System.out.println("Lỗi gửi mail: " + e.getMessage());
                    reply(response, 500, "error", "Không gửi được email, vui lòng thử lại sau.", 0);
                    return;
                }
                reply(response, 200, "success", "Đã gửi mã xác minh tới email của bạn.", 0);

            } else if ("verify".equals(action)) {   // chỉ kiểm tra, KHÔNG xóa mã
                if (dao.checkCode(email, request.getParameter("code"), false)) {
                    reply(response, 200, "success", "Mã hợp lệ.", 0);
                } else {
                    reply(response, 400, "error", "Mã xác minh sai hoặc đã hết hạn.", 0);
                }
            } else {
                reply(response, 400, "error", "Yêu cầu không hợp lệ.", 0);
            }
        } finally {
            dao.close();
        }
    }

    private void reply(HttpServletResponse res, int code, String status, String msg, int wait) throws IOException {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("status", status);
        m.put("message", msg);
        if (wait > 0) m.put("wait", wait);
        res.setStatus(code);
        res.getWriter().print(new Gson().toJson(m));
    }
}