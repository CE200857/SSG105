package dao;

import util.DBContext;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class ModerationDAO extends DBContext {

        // ===== Danh sách bài đang chờ duyệt (cả 3 trang), cũ nhất lên trước =====
    public List<Map<String, Object>> getPendingPosts() {
        return queryPending(null);
    }

    // ===== Bài đang chờ duyệt của 1 student (dùng cho trang Profile) =====
    public List<Map<String, Object>> getPendingPostsByEmail(String email) {
        if (email == null || email.trim().isEmpty()) {
            return new ArrayList<>();
        }
        return queryPending(email.trim());
    }

    private List<Map<String, Object>> queryPending(String email) {
        List<Map<String, Object>> list = new ArrayList<>();
        String f = (email == null) ? "" : " AND u.Email = ? ";
        String query =
            "SELECT * FROM (" +
            " SELECT l.LostPostID AS PostId, 'lost' AS PostType, l.Title AS Title, l.Content AS Content, " +
            "  l.Category AS Category, l.LocationLost AS Location, " +
            "  (SELECT TOP 1 ImageURL FROM LostImages WHERE LostPostID = l.LostPostID) AS Image, " +
            "  u.FullName, u.Username, u.Email, l.CreatedAt " +
            " FROM LostPosts l JOIN Users u ON l.UserID = u.UserID WHERE l.ApprovalStatus = 'Pending' " + f +
            " UNION ALL " +
            " SELECT fp.FoundPostID, 'found', fp.ItemName, fp.Description, fp.Category, fp.LocationFound, " +
            "  (SELECT TOP 1 ImageURL FROM FoundImages WHERE FoundPostID = fp.FoundPostID), " +
            "  u.FullName, u.Username, u.Email, fp.CreatedAt " +
            " FROM FoundPosts fp JOIN Users u ON fp.UserID = u.UserID WHERE fp.ApprovalStatus = 'Pending' " + f +
            " UNION ALL " +
            " SELECT p.PostID, 'forum', p.Title, p.Content, p.Category, NULL, NULL, " +
            "  u.FullName, u.Username, u.Email, p.CreatedAt " +
            " FROM ForumPosts p JOIN Users u ON p.UserID = u.UserID WHERE p.ApprovalStatus = 'Pending' " + f +
            ") AS T ORDER BY CreatedAt ASC";
        try {
            PreparedStatement ps = conn.prepareStatement(query);
            if (email != null) {
                ps.setString(1, email);
                ps.setString(2, email);
                ps.setString(3, email);
            }
            ResultSet rs = ps.executeQuery();
            while (rs.next()) {
                Map<String, Object> m = new HashMap<>();
                m.put("id", rs.getInt("PostId"));
                m.put("postType", rs.getString("PostType"));
                m.put("title", rs.getNString("Title"));
                m.put("content", rs.getNString("Content"));
                m.put("category", rs.getNString("Category"));
                m.put("location", rs.getNString("Location"));
                m.put("image", rs.getString("Image"));
                m.put("author", rs.getNString("FullName"));
                m.put("username", rs.getString("Username"));
                m.put("authorEmail", rs.getString("Email"));
                java.sql.Timestamp ts = rs.getTimestamp("CreatedAt");
                m.put("createdAt", ts != null
                        ? new java.text.SimpleDateFormat("dd/MM/yyyy HH:mm").format(ts) : "");
                list.add(m);
            }
        } catch (Exception e) {
            System.out.println("Lỗi queryPending: " + e.getMessage());
        }
        return list;
    }

    // ===== Duyệt bài + thông báo cho student =====
    public boolean approvePost(String postType, int postId, String adminEmail) {
        String[] meta = getMeta(postType);
        if (meta == null) return false;
        try {
            PreparedStatement sel = conn.prepareStatement(
                "SELECT UserID, " + meta[2] + " AS Title FROM " + meta[0] +
                " WHERE " + meta[1] + " = ? AND ApprovalStatus = 'Pending'");
            sel.setInt(1, postId);
            ResultSet rs = sel.executeQuery();
            if (!rs.next()) return false;
            int ownerId = rs.getInt("UserID");
            String title = rs.getNString("Title");

            PreparedStatement up = conn.prepareStatement(
                "UPDATE " + meta[0] + " SET ApprovalStatus = 'Approved' WHERE " + meta[1] + " = ?");
            up.setInt(1, postId);
            if (up.executeUpdate() <= 0) return false;

            notifyOwner(ownerId, adminEmail, "POST_APPROVED", postType, postId,
                    "đã duyệt bài đăng \"" + cut(title, 60) + "\" của bạn tại mục " + meta[3]
                    + ". Bài đăng hiện đã được hiển thị công khai.");
            return true;
        } catch (Exception e) {
            System.out.println("Lỗi approvePost: " + e.getMessage());
        }
        return false;
    }

    // ===== Xóa bài (kèm lý do không bắt buộc) + thông báo cho student =====
    public boolean deleteWithNotice(String postType, int postId, String reason, String adminEmail) {
        String[] meta = getMeta(postType);
        if (meta == null) return false;
        try {
            // Lấy chủ bài + tiêu đề TRƯỚC khi xóa
            PreparedStatement sel = conn.prepareStatement(
                "SELECT UserID, " + meta[2] + " AS Title FROM " + meta[0] + " WHERE " + meta[1] + " = ?");
            sel.setInt(1, postId);
            ResultSet rs = sel.executeQuery();
            if (!rs.next()) return false;
            int ownerId = rs.getInt("UserID");
            String title = rs.getNString("Title");

            boolean ok;
            if ("lost".equals(postType)) ok = new LostPostDAO().deletePost(postId);
            else if ("found".equals(postType)) ok = new FoundPostDAO().deletePost(postId);
            else ok = new ForumDAO().deleteForumPost(postId);

            if (ok) {
                String msg = "đã xóa bài đăng \"" + cut(title, 60) + "\" của bạn tại mục " + meta[3] + ".";
                if (reason != null && !reason.trim().isEmpty()) {
                    msg += " Lý do: " + cut(reason.trim(), 250);
                }
                // Tạo thông báo SAU khi xóa (vì hàm xóa có dọn bảng Notifications theo PostID)
                notifyOwner(ownerId, adminEmail, "POST_DELETED", postType, postId, msg);
            }
            return ok;
        } catch (Exception e) {
            System.out.println("Lỗi deleteWithNotice: " + e.getMessage());
        }
        return false;
    }

    // ===== Tiện ích =====
    // {bảng, cột ID, cột tiêu đề, tên mục hiển thị}
    private String[] getMeta(String postType) {
        if ("lost".equals(postType)) return new String[]{"LostPosts", "LostPostID", "Title", "Tìm đồ (Lost)"};
        if ("found".equals(postType)) return new String[]{"FoundPosts", "FoundPostID", "ItemName", "Nhặt đồ (Found)"};
        if ("forum".equals(postType)) return new String[]{"ForumPosts", "PostID", "Title", "Diễn đàn (Forum)"};
        return null;
    }

    private void notifyOwner(int ownerId, String adminEmail, String type, String postType, int postId, String msg) {
        NotificationDAO notif = new NotificationDAO();
        int adminId = notif.getUserIdByEmail(adminEmail);
        if (adminId <= 0) adminId = getAnyAdminId();
        notif.createNotification(ownerId, adminId, type, postType, postId, msg);
    }

    private int getAnyAdminId() {
        try {
            ResultSet rs = conn.prepareStatement("SELECT TOP 1 UserID FROM Users WHERE RoleID = 1").executeQuery();
            if (rs.next()) return rs.getInt(1);
        } catch (Exception e) {
            System.out.println("Lỗi getAnyAdminId: " + e.getMessage());
        }
        return -1;
    }

    private String cut(String s, int max) {
        if (s == null) return "";
        return s.length() > max ? s.substring(0, max) + "..." : s;
    }
}