package dao;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import util.DBContext;

public class CommentDAO extends DBContext {

    private static final int MAX_LEN = 1000;
    private static final String ADMIN_MARK = " [đã chỉnh sửa bởi quản trị viên]";

    // {bảng bình luận, giá trị CommentType trong CommentLikes, cột id bài trong bảng bình luận}
    private String[] meta(String type) {
        if (type == null) {
            return null;
        }
        switch (type) {
            case "lost":  return new String[]{"LostComments", "lost", "LostPostID"};
            case "found": return new String[]{"FoundComments", "found", "FoundPostID"};
            case "forum": return new String[]{"ForumComments", "forum", "PostID"};
            case "share": return new String[]{"SharedComments", "shared", "ShareID"};
            default: return null;
        }
    }

    private Map<String, Object> fail(String message) {
        Map<String, Object> r = new HashMap<>();
        r.put("success", false);
        r.put("message", message);
        return r;
    }

    // Thông tin cần để phân quyền: {chủ bình luận, người thao tác, là admin, id bài}
    private int[] loadAccess(String[] m, int commentId, String email) throws Exception {
        String sql = "SELECT c.UserID AS OwnerID, u.UserID AS ReqID, u.RoleID, c." + m[2] + " AS PostRef "
                + "FROM " + m[0] + " c CROSS JOIN Users u WHERE c.CommentID = ? AND u.Email = ?";
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, commentId);
            ps.setString(2, email);
            try (ResultSet rs = ps.executeQuery()) {
                if (!rs.next()) {
                    return null;
                }
                return new int[]{rs.getInt("OwnerID"), rs.getInt("ReqID"), rs.getInt("RoleID"), rs.getInt("PostRef")};
            }
        }
    }

    private void notifyOwner(String type, int ownerId, int actorId, int postId, String typeCode, String message) {
        if (type.equals("share")) {
            return;   // bài chia sẻ không có trang đích để mở
        }
        new NotificationDAO().createNotification(ownerId, actorId, typeCode, type, postId, message);
    }

    public Map<String, Object> update(String type, int commentId, String email, String content) {
        String[] m = meta(type);
        if (m == null || email == null) {
            return fail("Yêu cầu không hợp lệ.");
        }
        String text = content == null ? "" : content.trim();
        if (text.isEmpty()) {
            return fail("Nội dung bình luận không được để trống.");
        }
        if (text.length() > MAX_LEN) {
            return fail("Bình luận tối đa " + MAX_LEN + " ký tự.");
        }
        try {
            int[] a = loadAccess(m, commentId, email);
            if (a == null) {
                return fail("Không tìm thấy bình luận.");
            }
            boolean owner = a[0] == a[1];
            boolean admin = a[2] == 1;
            if (!owner && !admin) {
                return fail("Bạn không có quyền sửa bình luận này.");
            }
            String saved = text;
            if (!owner) {
                saved = text + ADMIN_MARK;   // minh bạch: người đọc biết admin đã sửa
            }
            try (PreparedStatement ps = conn.prepareStatement("UPDATE " + m[0] + " SET Content = ? WHERE CommentID = ?")) {
                ps.setNString(1, saved);
                ps.setInt(2, commentId);
                ps.executeUpdate();
            }
            if (!owner) {
                notifyOwner(type, a[0], a[1], a[3], "COMMENT_EDITED",
                        "đã chỉnh sửa một bình luận của bạn.");
            }
            Map<String, Object> r = new HashMap<>();
            r.put("success", true);
            r.put("text", saved);
            return r;
        } catch (Exception e) {
            System.out.println("Lỗi update comment: " + e.getMessage());
            return fail("Lỗi hệ thống, vui lòng thử lại.");
        }
    }

    public Map<String, Object> delete(String type, int commentId, String email) {
        String[] m = meta(type);
        if (m == null || email == null) {
            return fail("Yêu cầu không hợp lệ.");
        }
        List<Integer> ids = new ArrayList<>();
        int[] a;
        try {
            a = loadAccess(m, commentId, email);
            if (a == null) {
                return fail("Không tìm thấy bình luận.");
            }
            boolean owner = a[0] == a[1];
            boolean admin = a[2] == 1;
            if (!owner && !admin) {
                return fail("Bạn không có quyền xóa bình luận này.");
            }

            // Gom bình luận này và mọi phản hồi con cháu của nó
            ids.add(commentId);
            for (int i = 0; i < ids.size() && ids.size() < 500; i++) {
                try (PreparedStatement ps = conn.prepareStatement(
                        "SELECT CommentID FROM " + m[0] + " WHERE ParentCommentID = ?")) {
                    ps.setInt(1, ids.get(i));
                    try (ResultSet rs = ps.executeQuery()) {
                        while (rs.next()) {
                            int child = rs.getInt(1);
                            if (!ids.contains(child)) {
                                ids.add(child);
                            }
                        }
                    }
                }
            }

            StringBuilder in = new StringBuilder();
            for (int i = 0; i < ids.size(); i++) {
                in.append(i == 0 ? "?" : ",?");
            }
            conn.setAutoCommit(false);
            try (PreparedStatement likes = conn.prepareStatement(
                    "DELETE FROM CommentLikes WHERE CommentType = ? AND CommentID IN (" + in + ")");
                 PreparedStatement del = conn.prepareStatement(
                    "DELETE FROM " + m[0] + " WHERE CommentID IN (" + in + ")")) {
                likes.setString(1, m[1]);
                for (int i = 0; i < ids.size(); i++) {
                    likes.setInt(i + 2, ids.get(i));
                    del.setInt(i + 1, ids.get(i));
                }
                likes.executeUpdate();
                del.executeUpdate();
                conn.commit();
            } catch (Exception e) {
                conn.rollback();
                throw e;
            } finally {
                conn.setAutoCommit(true);
            }

            if (!owner) {
                notifyOwner(type, a[0], a[1], a[3], "COMMENT_DELETED",
                        "đã gỡ một bình luận của bạn.");
            }
            Map<String, Object> r = new HashMap<>();
            r.put("success", true);
            r.put("deletedIds", ids);
            return r;
        } catch (Exception e) {
            System.out.println("Lỗi delete comment: " + e.getMessage());
            return fail("Lỗi hệ thống, vui lòng thử lại.");
        }
    }
}
