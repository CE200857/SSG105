package dao;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import util.DBContext;

public class StatusRequestDAO extends DBContext {

    // {bảng, cột ID, cột tiêu đề}
    private String[] meta(String type) {
        if ("lost".equals(type)) {
            return new String[]{"LostPosts", "LostPostID", "Title"};
        }
        if ("found".equals(type)) {
            return new String[]{"FoundPosts", "FoundPostID", "ItemName"};
        }
        return null;
    }

    // Giá trị frontend gửi -> giá trị lưu DB
    private String toDbStatus(String type, String ui) {
        if (ui == null) {
            return null;
        }
        if ("lost".equals(type)) {
            if ("Đã tìm được".equals(ui)) {
                return "Found";
            }
            if ("Đang tìm đồ".equals(ui)) {
                return "Not Found";
            }
        } else if ("Claimed".equals(ui) || "Unclaimed".equals(ui)) {
            return ui;
        }
        return null;
    }

    private String normalize(String type, String raw) {
        if ("lost".equals(type)) {
            return ("Found".equalsIgnoreCase(raw) || "Đã tìm được".equalsIgnoreCase(raw)) ? "Found" : "Not Found";
        }
        return (raw == null || "Unclaimed".equalsIgnoreCase(raw)) ? "Unclaimed" : "Claimed";
    }

    private String label(String type, String dbStatus) {
        if ("lost".equals(type)) {
            return "Found".equals(dbStatus) ? "Đã tìm được" : "Đang tìm đồ";
        }
        return "Unclaimed".equals(dbStatus) ? "Đang tìm chủ" : "Đã trao trả";
    }

    // ===== Student gửi yêu cầu đổi trạng thái (admin thì đổi thẳng) =====
    public Map<String, Object> createRequest(String type, int postId, String email, String uiStatus) {
        Map<String, Object> r = new HashMap<>();
        r.put("success", false);
        String[] m = meta(type);
        String newStatus = toDbStatus(type, uiStatus);
        if (m == null || newStatus == null || email == null || email.trim().isEmpty()) {
            r.put("message", "Yêu cầu không hợp lệ.");
            return r;
        }
        try {
            PreparedStatement ps = conn.prepareStatement(
                    "SELECT p.UserID AS OwnerID, p.Status, p.ApprovalStatus, u.UserID AS ReqID, u.RoleID "
                    + "FROM " + m[0] + " p CROSS JOIN Users u WHERE p." + m[1] + " = ? AND u.Email = ?");
            ps.setInt(1, postId);
            ps.setString(2, email.trim());
            ResultSet rs = ps.executeQuery();
            if (!rs.next()) {
                r.put("message", "Không tìm thấy bài đăng.");
                return r;
            }
            int ownerId = rs.getInt("OwnerID");
            int reqId = rs.getInt("ReqID");
            String approval = rs.getString("ApprovalStatus");
            String current = normalize(type, rs.getString("Status"));

            if (ownerId != reqId) {
                r.put("message", "Bạn không phải chủ bài đăng này.");
                return r;
            }
            if (!"Approved".equals(approval)) {
                r.put("message", "Bài đăng chưa được duyệt.");
                return r;
            }
            if (current.equals(newStatus)) {
                r.put("message", "Bài đăng đã ở trạng thái này rồi.");
                return r;
            }

            PreparedStatement chk = conn.prepareStatement(
                    "SELECT 1 FROM StatusRequests WHERE PostType = ? AND PostID = ? AND Status = 'Pending'");
            chk.setString(1, type);
            chk.setInt(2, postId);
            if (chk.executeQuery().next()) {
                r.put("message", "Bài này đã có yêu cầu đổi trạng thái đang chờ admin duyệt.");
                return r;
            }

            PreparedStatement ins = conn.prepareStatement(
                    "INSERT INTO StatusRequests (PostType, PostID, UserID, NewStatus) VALUES (?, ?, ?, ?)");
            ins.setString(1, type);
            ins.setInt(2, postId);
            ins.setInt(3, reqId);
            ins.setString(4, newStatus);
            ins.executeUpdate();

            r.put("success", true);
            r.put("applied", false);
            r.put("message", "Đã gửi yêu cầu đổi trạng thái. Admin sẽ kiểm tra và duyệt trước khi trạng thái thay đổi.");
        } catch (Exception e) {
            System.out.println("Lỗi createRequest: " + e.getMessage());
            r.put("message", "Lỗi hệ thống, vui lòng thử lại.");
        }
        return r;
    }

    // ===== Gắn "pendingStatus" vào danh sách bài để frontend hiện nhãn "Chờ duyệt" =====
    public void attachPending(String type, List<Map<String, Object>> posts) {
        Map<Integer, String> pend = new HashMap<>();
        try {
            PreparedStatement ps = conn.prepareStatement(
                    "SELECT PostID, NewStatus FROM StatusRequests WHERE PostType = ? AND Status = 'Pending'");
            ps.setString(1, type);
            ResultSet rs = ps.executeQuery();
            while (rs.next()) {
                pend.put(rs.getInt(1), rs.getString(2));
            }
        } catch (Exception e) {
            System.out.println("Lỗi attachPending: " + e.getMessage());
            return;
        }
        for (Map<String, Object> p : posts) {
            Object id = p.get("id");
            if (id instanceof Integer && pend.containsKey(id)) {
                p.put("pendingStatus", pend.get(id));
            }
        }
    }

    // ===== Danh sách yêu cầu đang chờ (email = null: tất cả, dùng cho admin) =====
    public List<Map<String, Object>> getPending(String email) {
        List<Map<String, Object>> list = new ArrayList<>();
        String sql = "SELECT r.RequestID, r.PostType, r.PostID, r.NewStatus, r.CreatedAt AS ReqAt, "
                + "COALESCE(l.Title, f.ItemName) AS Title, COALESCE(l.Content, f.Description) AS Content, "
                + "COALESCE(l.Category, f.Category) AS Category, "
                + "COALESCE(l.LocationLost, f.LocationFound) AS Location, "
                + "COALESCE(l.Status, f.Status) AS CurStatus, COALESCE(l.CreatedAt, f.CreatedAt) AS PostAt, "
                + "CASE WHEN r.PostType = 'lost' "
                + "THEN (SELECT TOP 1 ImageURL FROM LostImages WHERE LostPostID = r.PostID) "
                + "ELSE (SELECT TOP 1 ImageURL FROM FoundImages WHERE FoundPostID = r.PostID) END AS Image, "
                + "u.FullName, u.Email "
                + "FROM StatusRequests r JOIN Users u ON r.UserID = u.UserID "
                + "LEFT JOIN LostPosts l ON r.PostType = 'lost' AND l.LostPostID = r.PostID "
                + "LEFT JOIN FoundPosts f ON r.PostType = 'found' AND f.FoundPostID = r.PostID "
                + "WHERE r.Status = 'Pending' AND (l.LostPostID IS NOT NULL OR f.FoundPostID IS NOT NULL) "
                + (email != null ? "AND u.Email = ? " : "")
                + "ORDER BY r.CreatedAt ASC";
        java.text.SimpleDateFormat fmt = new java.text.SimpleDateFormat("dd/MM/yyyy HH:mm");
        try {
            PreparedStatement ps = conn.prepareStatement(sql);
            if (email != null) {
                ps.setString(1, email);
            }
            ResultSet rs = ps.executeQuery();
            while (rs.next()) {
                String type = rs.getString("PostType");
                Map<String, Object> m = new HashMap<>();
                m.put("requestId", rs.getInt("RequestID"));
                m.put("postType", type);
                m.put("id", rs.getInt("PostID"));
                m.put("postId", rs.getInt("PostID"));
                m.put("title", rs.getNString("Title"));
                m.put("content", rs.getNString("Content"));
                m.put("category", rs.getNString("Category"));
                m.put("location", rs.getNString("Location"));
                m.put("image", rs.getString("Image"));
                m.put("author", rs.getNString("FullName"));
                m.put("authorEmail", rs.getString("Email"));
                m.put("fromLabel", label(type, normalize(type, rs.getString("CurStatus"))));
                m.put("toLabel", label(type, rs.getString("NewStatus")));
                java.sql.Timestamp t1 = rs.getTimestamp("ReqAt");
                java.sql.Timestamp t2 = rs.getTimestamp("PostAt");
                m.put("createdAt", t1 != null ? fmt.format(t1) : "");
                m.put("postCreatedAt", t2 != null ? fmt.format(t2) : "");
                list.add(m);
            }
        } catch (Exception e) {
            System.out.println("Lỗi getPending (status): " + e.getMessage());
        }
        return list;
    }

    // ===== Admin duyệt / từ chối =====
    public boolean approve(int requestId, String adminEmail) {
        return resolve(requestId, adminEmail, true, null);
    }

    public boolean reject(int requestId, String adminEmail, String reason) {
        return resolve(requestId, adminEmail, false, reason);
    }

    private boolean resolve(int requestId, String adminEmail, boolean approve, String reason) {
        String type, newStatus, title;
        int postId, ownerId;
        try {
            conn.setAutoCommit(false);
            PreparedStatement sel = conn.prepareStatement(
                    "SELECT PostType, PostID, UserID, NewStatus FROM StatusRequests "
                    + "WHERE RequestID = ? AND Status = 'Pending'");
            sel.setInt(1, requestId);
            ResultSet rs = sel.executeQuery();
            if (!rs.next()) {
                conn.rollback();
                return false;
            }
            type = rs.getString("PostType");
            postId = rs.getInt("PostID");
            ownerId = rs.getInt("UserID");
            newStatus = rs.getString("NewStatus");
            String[] m = meta(type);
            if (m == null) {
                conn.rollback();
                return false;
            }

            PreparedStatement t = conn.prepareStatement(
                    "SELECT " + m[2] + " FROM " + m[0] + " WHERE " + m[1] + " = ?");
            t.setInt(1, postId);
            ResultSet tr = t.executeQuery();
            if (!tr.next()) {
                conn.rollback();
                return false;
            }   // bài đã bị xóa
            title = tr.getNString(1);

            PreparedStatement done = conn.prepareStatement(
                    "UPDATE StatusRequests SET Status = ?, ResolvedAt = GETDATE() "
                    + "WHERE RequestID = ? AND Status = 'Pending'");
            done.setString(1, approve ? "Approved" : "Rejected");
            done.setInt(2, requestId);
            if (done.executeUpdate() <= 0) {
                conn.rollback();
                return false;
            }

            if (approve) {
                PreparedStatement up = conn.prepareStatement(
                        "UPDATE " + m[0] + " SET Status = ? WHERE " + m[1] + " = ?");
                up.setString(1, newStatus);
                up.setInt(2, postId);
                if (up.executeUpdate() <= 0) {
                    conn.rollback();
                    return false;
                }
            }
            conn.commit();
        } catch (Exception e) {
            System.out.println("Lỗi resolve status request: " + e.getMessage());
            try {
                conn.rollback();
            } catch (Exception ignore) {
            }
            return false;
        } finally {
            try {
                conn.setAutoCommit(true);
            } catch (Exception ignore) {
            }
        }

        String shortTitle = title.length() > 60 ? title.substring(0, 60) + "..." : title;
        String target = label(type, newStatus);
        String msg;
        if (approve) {
            msg = "đã duyệt yêu cầu đổi trạng thái bài \"" + shortTitle + "\" sang \"" + target
                    + "\". Trạng thái mới đã được cập nhật.";
        } else {
            msg = "đã từ chối yêu cầu đổi trạng thái bài \"" + shortTitle + "\" sang \"" + target + "\".";
            if (reason != null && !reason.trim().isEmpty()) {
                msg += " Lý do: " + reason.trim();
            }
            msg += " Bài đăng giữ nguyên trạng thái hiện tại.";
        }
        NotificationDAO notif = new NotificationDAO();
        int adminId = notif.getUserIdByEmail(adminEmail);
        if (adminId <= 0) {
            adminId = anyAdminId();
        }
        if (adminId <= 0) {
            adminId = ownerId;
        }
        insertNotification(ownerId, adminId, approve ? "STATUS_APPROVED" : "STATUS_REJECTED",
                type, postId, msg);
        return true;
    }

    private int anyAdminId() {
        try {
            ResultSet rs = conn.prepareStatement("SELECT TOP 1 UserID FROM Users WHERE RoleID = 1").executeQuery();
            if (rs.next()) {
                return rs.getInt(1);
            }
        } catch (Exception e) {
            System.out.println("Lỗi anyAdminId: " + e.getMessage());
        }
        return -1;
    }

    // Ghi thẳng vào Notifications. Không dùng NotificationDAO.createNotification vì hàm đó
    // bỏ qua khi người nhận trùng người gửi (VD: admin tự duyệt yêu cầu của chính mình).
    private void insertNotification(int recipientId, int senderId, String type,
            String postType, int postId, String message) {
        String sql = "INSERT INTO Notifications (RecipientUserID, SenderUserID, Type, PostType, PostID, Message, IsRead, CreatedAt) "
                + "VALUES (?, ?, ?, ?, ?, ?, 0, GETDATE())";
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, recipientId);
            ps.setInt(2, senderId);
            ps.setString(3, type);
            ps.setString(4, postType);
            ps.setInt(5, postId);
            ps.setNString(6, message);
            ps.executeUpdate();
        } catch (Exception e) {
            System.out.println("Lỗi insertNotification: " + e.getMessage());
        }
    }
}
