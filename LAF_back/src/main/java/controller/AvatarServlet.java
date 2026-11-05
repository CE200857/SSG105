package controller;

import dao.AvatarDAO;
import entity.Users;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.MultipartConfig;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.Part;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import util.AuthUtil;
import util.ImageUtil;

// POST /api/upload-avatar  : tải avatar lên (multipart, trường "avatar")
// GET  /uploads/avatars/xx : phục vụ file avatar
@WebServlet(name = "AvatarServlet", urlPatterns = {"/api/upload-avatar", "/uploads/avatars/*"})
@MultipartConfig(maxFileSize = 2 * 1024 * 1024, maxRequestSize = 3 * 1024 * 1024)
public class AvatarServlet extends HttpServlet {

    private static final String URL_PREFIX = "/uploads/avatars/";
    // Lưu ngoài thư mục web để không bị mất khi redeploy: <thư mục người dùng>/laf_uploads/avatars
    private static final Path DIR = Paths.get(
            System.getProperty("laf.upload.dir", System.getProperty("user.home") + "/laf_uploads"),
            "avatars").toAbsolutePath().normalize();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        String info = request.getPathInfo();
        String name = (info == null) ? null : info.substring(1);
        if (!ImageUtil.isSafeFileName(name)) {
            response.setStatus(HttpServletResponse.SC_NOT_FOUND);
            return;
        }
        Path file = DIR.resolve(name).normalize();
        if (!file.startsWith(DIR) || !Files.isRegularFile(file)) {
            response.setStatus(HttpServletResponse.SC_NOT_FOUND);
            return;
        }
        response.setContentType(ImageUtil.contentType(name));
        response.setHeader("X-Content-Type-Options", "nosniff");
        response.setHeader("Cache-Control", "public, max-age=604800");   // tên file luôn mới khi đổi ảnh
        response.setContentLengthLong(Files.size(file));
        Files.copy(file, response.getOutputStream());
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json;charset=UTF-8");

        Users user = AuthUtil.currentUser(request);
        if (user == null || AuthUtil.currentEmail(request) == null) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().print("{\"success\":false,\"message\":\"Bạn chưa đăng nhập hoặc phiên đã hết hạn.\"}");
            return;
        }

        Part part;
        try {
            part = request.getPart("avatar");
        } catch (Exception e) {   // vượt quá 2MB hoặc không phải multipart
            fail(response, "Ảnh quá lớn (tối đa 2MB) hoặc dữ liệu không hợp lệ.");
            return;
        }
        if (part == null || part.getSize() <= 0) {
            fail(response, "Chưa chọn ảnh.");
            return;
        }

        byte[] head = new byte[12];
        try (InputStream in = part.getInputStream()) {
            int read = in.readNBytes(head, 0, head.length);
            if (read < head.length) {
                fail(response, "Tệp không phải ảnh hợp lệ.");
                return;
            }
        }
        String ext = ImageUtil.detectExtension(head);
        if (ext == null) {
            fail(response, "Chỉ hỗ trợ ảnh JPG, PNG, GIF hoặc WEBP.");
            return;
        }

        String fileName = "u" + user.getUserID() + "_" + System.currentTimeMillis() + "." + ext;
        Files.createDirectories(DIR);
        try (InputStream in = part.getInputStream()) {
            Files.copy(in, DIR.resolve(fileName), StandardCopyOption.REPLACE_EXISTING);
        }

        String newPath = URL_PREFIX + fileName;
        String[] oldPath = new String[1];
        AvatarDAO dao = new AvatarDAO();
        if (!dao.replaceAvatar(user.getUserID(), newPath, oldPath)) {
            Files.deleteIfExists(DIR.resolve(fileName));
            fail(response, "Không thể lưu ảnh, vui lòng thử lại.");
            return;
        }

        // Xóa ảnh cũ do hệ thống tạo (không đụng tới link ngoài)
        if (oldPath[0] != null && oldPath[0].startsWith(URL_PREFIX)) {
            String oldName = oldPath[0].substring(URL_PREFIX.length());
            if (ImageUtil.isSafeFileName(oldName)) {
                Files.deleteIfExists(DIR.resolve(oldName));
            }
        }

        util.UpdateHub.publish("profile", "lost", "found", "forum", "reviews");
        response.getWriter().print("{\"success\":true,\"avatar\":\"" + newPath + "\"}");
    }

    private void fail(HttpServletResponse response, String message) throws IOException {
        response.getWriter().print("{\"success\":false,\"message\":\"" + message + "\"}");
    }
}
