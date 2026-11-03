package util;

import dao.SessionDAO;
import entity.Users;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;

public class AuthUtil {

    // Người dùng đang đăng nhập (lấy từ session), hoặc null
    public static Users currentUser(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        Object attr = (session == null) ? null : session.getAttribute("user");
        return (attr instanceof Users) ? (Users) attr : null;
    }

    // Email hiện tại nếu còn đăng nhập và tài khoản chưa bị khóa, ngược lại null
    public static String currentEmail(HttpServletRequest request) {
        Users u = currentUser(request);
        if (u == null) {
            return null;
        }
        SessionDAO dao = new SessionDAO();
        try {
            return dao.getActiveEmail(u.getUserID());
        } finally {
            dao.close();
        }
    }
}
