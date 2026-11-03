package controller;

import com.google.gson.Gson;
import dao.AccountDAO;
import dao.UserDAO;
import entity.Users;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import java.io.IOException;
import java.io.PrintWriter;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.MessageDigest;
import java.util.HashMap;
import java.util.Map;
import util.ImageUtil;

// Người dùng tự xóa tài khoản: phải đang đăng nhập (session) + nhập đúng mật khẩu
@WebServlet(name = "DeleteAccountServlet", urlPatterns = {"/api/delete-account"})
public class DeleteAccountServlet extends HttpServlet {

    private static final String URL_PREFIX = "/uploads/avatars/";
    private static final Path DIR = Paths.get(
            System.getProperty("laf.upload.dir", System.getProperty("user.home") + "/laf_uploads"),
            "avatars").toAbsolutePath().normalize();

    private String md5(String s) {
        try {
            MessageDigest md = MessageDigest.getInstance("MD5");
            md.update(s.getBytes());
            StringBuilder sb = new StringBuilder();
            for (byte b : md.digest()) {
                sb.append(Integer.toString((b & 0xff) + 0x100, 16).substring(1));
            }
            return sb.toString();
        } catch (Exception e) {
            return null;
        }
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json;charset=UTF-8");
        PrintWriter out = response.getWriter();
        Map<String, Object> result = new HashMap<>();
        result.put("success", false);

        HttpSession session = request.getSession(false);
        Object sessionUser = session == null ? null : session.getAttribute("user");
        String password = request.getParameter("password");

        if (!(sessionUser instanceof Users)) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            result.put("message", "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại rồi thử lại.");
        } else if (password == null || password.isEmpty()) {
            result.put("message", "Vui lòng nhập mật khẩu để xác nhận.");
        } else {
            Users user = (Users) sessionUser;
            if (user.getRoleID() == 1) {
                result.put("message", "Không thể xóa tài khoản Quản trị viên.");
            } else if (!new UserDAO().checkCurrentPassword(user.getEmail(), md5(password))) {
                result.put("message", "Mật khẩu không đúng!");
            } else {
                AccountDAO dao = new AccountDAO();
                String avatar = dao.getAvatarPath(user.getUserID());
                if (dao.deleteAccount(user.getUserID(), user.getEmail())) {
                    // Xóa file ảnh đại diện (nếu có) và hủy phiên
                    if (avatar != null && avatar.startsWith(URL_PREFIX)) {
                        String name = avatar.substring(URL_PREFIX.length());
                        if (ImageUtil.isSafeFileName(name)) {
                            Files.deleteIfExists(DIR.resolve(name));
                        }
                    }
                    session.invalidate();
                    result.put("success", true);
                    result.put("message", "Đã xóa tài khoản.");
                } else {
                    result.put("message", "Không thể xóa tài khoản lúc này, vui lòng thử lại sau.");
                }
            }
        }
        out.print(new Gson().toJson(result));
        out.flush();
    }
}
