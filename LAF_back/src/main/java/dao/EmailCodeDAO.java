package dao;

import java.security.SecureRandom;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import util.DBContext;

public class EmailCodeDAO extends DBContext {
    private static final SecureRandom RND = new SecureRandom();
    private static final int MAX_ATTEMPTS = 5;

    public boolean emailExists(String email) {
        try (PreparedStatement ps = conn.prepareStatement("SELECT 1 FROM Users WHERE Email = ?")) {
            ps.setString(1, email);
            try (ResultSet rs = ps.executeQuery()) { return rs.next(); }
        } catch (Exception e) {
            System.out.println("Lỗi emailExists: " + e.getMessage());
        }
        return false;
    }

    // Số giây còn phải chờ trước khi được gửi lại (0 = được gửi)
    public int cooldownLeft(String email) {
        String sql = "SELECT DATEDIFF(SECOND, GETDATE(), DATEADD(SECOND, 60, SentAt)) "
                   + "FROM EmailVerification WHERE Email = ?";
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, email);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) return Math.max(0, rs.getInt(1));
            }
        } catch (Exception e) {
            System.out.println("Lỗi cooldownLeft: " + e.getMessage());
        }
        return 0;
    }

    // Tạo mã 6 số mới (thay mã cũ của email này, dọn luôn mã hết hạn). Lỗi -> null
    public String createCode(String email) {
        String code = String.format("%06d", RND.nextInt(1_000_000));
        String sql = "DELETE FROM EmailVerification WHERE Email = ? OR ExpiresAt <= GETDATE(); "
                   + "INSERT INTO EmailVerification (Email, Code, ExpiresAt) "
                   + "VALUES (?, ?, DATEADD(MINUTE, 5, GETDATE()))";
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, email);
            ps.setString(2, email);
            ps.setString(3, code);
            ps.executeUpdate();
            return code;
        } catch (Exception e) {
            System.out.println("Lỗi createCode: " + e.getMessage());
        }
        return null;
    }

    public void deleteCode(String email) {
        try (PreparedStatement ps = conn.prepareStatement("DELETE FROM EmailVerification WHERE Email = ?")) {
            ps.setString(1, email.trim().toLowerCase());
            ps.executeUpdate();
        } catch (Exception e) {
            System.out.println("Lỗi deleteCode: " + e.getMessage());
        }
    }

    // consume = true: mã đúng thì xóa luôn (dùng 1 lần). Sai quá 5 lần -> xóa mã.
    public boolean checkCode(String email, String code, boolean consume) {
        if (email == null || code == null || !code.matches("\\d{6}")) return false;
        email = email.trim().toLowerCase();
        String sql = "SELECT Code, Attempts FROM EmailVerification WHERE Email = ? AND ExpiresAt > GETDATE()";
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, email);
            try (ResultSet rs = ps.executeQuery()) {
                if (!rs.next()) return false;
                String stored = rs.getString(1);
                int attempts = rs.getInt(2);
                if (attempts >= MAX_ATTEMPTS) { deleteCode(email); return false; }
                if (stored.equals(code)) {
                    if (consume) deleteCode(email);
                    return true;
                }
            }
            try (PreparedStatement up = conn.prepareStatement(
                    "UPDATE EmailVerification SET Attempts = Attempts + 1 WHERE Email = ?")) {
                up.setString(1, email);
                up.executeUpdate();
            }
        } catch (Exception e) {
            System.out.println("Lỗi checkCode: " + e.getMessage());
        }
        return false;
    }

    public void close() {
        try { if (conn != null) conn.close(); } catch (Exception ignore) { }
    }
}