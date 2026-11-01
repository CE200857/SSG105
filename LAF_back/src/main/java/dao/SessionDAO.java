package dao;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import util.DBContext;

public class SessionDAO extends DBContext {

    // Trả về email hiện tại của user nếu tài khoản còn hoạt động, ngược lại null
    public String getActiveEmail(int userId) {
        String sql = "SELECT Email FROM Users WHERE UserID = ? AND IsActive = 1";
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, userId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) return rs.getString(1);
            }
        } catch (Exception e) {
            System.out.println("Lỗi getActiveEmail: " + e.getMessage());
        }
        return null;
    }

    // Kiểm tra user có phải chủ bài không
    public boolean isOwner(String type, int id, int userId) {
        String table, col;
        switch (type) {
            case "lost":   table = "LostPosts";  col = "LostPostID";  break;
            case "found":  table = "FoundPosts"; col = "FoundPostID"; break;
            case "forum":  table = "ForumPosts"; col = "PostID";      break;
            case "review": table = "Reviews";    col = "ReviewID";    break;
            default: return false;
        }
        String sql = "SELECT 1 FROM " + table + " WHERE " + col + " = ? AND UserID = ?";
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, id);
            ps.setInt(2, userId);
            try (ResultSet rs = ps.executeQuery()) {
                return rs.next();
            }
        } catch (Exception e) {
            System.out.println("Lỗi isOwner: " + e.getMessage());
        }
        return false;
    }

    public void close() {
        try { if (conn != null) conn.close(); } catch (Exception ignore) { }
    }
}