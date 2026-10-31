package dao;

import util.DBContext;
import java.sql.PreparedStatement;

/**
 * Đổi chế độ xem (Public / Private) của bài đăng: lost, found, forum, review.
 * - Student: chỉ đổi được bài của chính mình (kiểm tra theo email).
 * - Admin: đổi được mọi bài (dùng setVisibilityAdmin).
 */
public class VisibilityDAO extends DBContext {

    public static String normalize(String v) {
        return "Private".equalsIgnoreCase(v) ? "Private" : "Public";
    }

    // {bảng, cột ID}
    private String[] meta(String type) {
        if ("lost".equals(type)) return new String[]{"LostPosts", "LostPostID"};
        if ("found".equals(type)) return new String[]{"FoundPosts", "FoundPostID"};
        if ("forum".equals(type)) return new String[]{"ForumPosts", "PostID"};
        if ("review".equals(type)) return new String[]{"Reviews", "ReviewID"};
        return null;
    }

    // Student đổi chế độ xem bài của chính mình
    public boolean setVisibility(String type, int id, String email, String visibility) {
        String[] m = meta(type);
        if (m == null || email == null || email.trim().isEmpty()) return false;
        String sql = "UPDATE " + m[0] + " SET Visibility = ? WHERE " + m[1] + " = ? "
                + "AND UserID = (SELECT UserID FROM Users WHERE Email = ?)";
        try {
            PreparedStatement ps = conn.prepareStatement(sql);
            ps.setString(1, normalize(visibility));
            ps.setInt(2, id);
            ps.setString(3, email.trim());
            return ps.executeUpdate() > 0;
        } catch (Exception e) {
            System.out.println("Lỗi setVisibility: " + e.getMessage());
        }
        return false;
    }

    // Admin đổi chế độ xem của bất kỳ bài nào
    public boolean setVisibilityAdmin(String type, int id, String visibility) {
        String[] m = meta(type);
        if (m == null) return false;
        String sql = "UPDATE " + m[0] + " SET Visibility = ? WHERE " + m[1] + " = ?";
        try {
            PreparedStatement ps = conn.prepareStatement(sql);
            ps.setString(1, normalize(visibility));
            ps.setInt(2, id);
            return ps.executeUpdate() > 0;
        } catch (Exception e) {
            System.out.println("Lỗi setVisibilityAdmin: " + e.getMessage());
        }
        return false;
    }
}
