package util;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

/**
 * Username không còn hiển thị / nhập trên giao diện nhưng cột Users.Username vẫn
 * NOT NULL + UNIQUE, nên server tự sinh từ phần đầu của email.
 */
public class UsernameUtil {

    public static String generate(Connection conn, String email) {
        String base = (email == null ? "" : email.trim().toLowerCase());
        int at = base.indexOf('@');
        if (at > 0) base = base.substring(0, at);
        base = base.replaceAll("[^a-z0-9_]", "");
        if (base.length() < 3) base = "user" + base;
        if (base.length() > 16) base = base.substring(0, 16);

        String candidate = base;
        int n = 0;
        while (exists(conn, candidate)) {
            n++;
            candidate = base + n;          // tối đa 16 + vài chữ số < 50 ký tự của cột
            if (n > 10000) {               // phòng hờ, không bao giờ xảy ra thực tế
                candidate = base + System.currentTimeMillis();
                break;
            }
        }
        return candidate;
    }

    private static boolean exists(Connection conn, String username) {
        try (PreparedStatement ps = conn.prepareStatement("SELECT 1 FROM Users WHERE Username = ?")) {
            ps.setString(1, username);
            try (ResultSet rs = ps.executeQuery()) {
                return rs.next();
            }
        } catch (Exception e) {
            System.out.println("Lỗi UsernameUtil.exists: " + e.getMessage());
            return false;
        }
    }
}
