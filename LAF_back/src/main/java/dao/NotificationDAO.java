package dao;

import util.DBContext;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class NotificationDAO extends DBContext {

    public int getUserIdByEmail(String email) {
        if (email == null || email.trim().isEmpty()) {
            return -1;
        }
        try {
            PreparedStatement ps = conn.prepareStatement("SELECT UserID FROM Users WHERE Email = ?");
            ps.setString(1, email);
            ResultSet rs = ps.executeQuery();
            if (rs.next()) {
                return rs.getInt("UserID");
            }
        } catch (Exception e) {
            System.out.println("Lỗi getUserIdByEmail: " + e.getMessage());
        }
        return -1;
    }

    public String getFullNameByEmail(String email) {
        if (email == null || email.trim().isEmpty()) {
            return "Một người dùng";
        }
        try {
            PreparedStatement ps = conn.prepareStatement("SELECT FullName FROM Users WHERE Email = ?");
            ps.setString(1, email);
            ResultSet rs = ps.executeQuery();
            if (rs.next()) {
                return rs.getNString("FullName");
            }
        } catch (Exception e) {
            System.out.println("Lỗi getFullNameByEmail: " + e.getMessage());
        }
        return "Một người dùng";
    }

    public void createNotification(int recipientId, int senderId, String type, String postType, int postId, String message) {
        // Không tự thông báo cho chính mình
        if (recipientId <= 0 || senderId <= 0 || recipientId == senderId) {
            return;
        }
        String query = "INSERT INTO Notifications (RecipientUserID, SenderUserID, Type, PostType, PostID, Message, IsRead, CreatedAt) "
                + "VALUES (?, ?, ?, ?, ?, ?, 0, GETDATE())";
        try {
            PreparedStatement ps = conn.prepareStatement(query);
            ps.setInt(1, recipientId);
            ps.setInt(2, senderId);
            ps.setString(3, type);
            ps.setString(4, postType);
            ps.setInt(5, postId);
            ps.setNString(6, message);
            ps.executeUpdate();
        } catch (Exception e) {
            System.out.println("Lỗi createNotification: " + e.getMessage());
        }
    }

    public List<Map<String, Object>> getNotificationsByEmail(String email) {
        List<Map<String, Object>> list = new ArrayList<>();
        String query = "SELECT TOP 30 n.NotificationID, n.Type, n.PostType, n.PostID, n.Message, n.IsRead, "
                + "CONVERT(VARCHAR, n.CreatedAt, 103) + ' ' + CONVERT(VARCHAR, n.CreatedAt, 108) as Time, "
                + "u.FullName as SenderName, u.Username as SenderUsername "
                + "FROM Notifications n "
                + "JOIN Users r ON n.RecipientUserID = r.UserID "
                + "JOIN Users u ON n.SenderUserID = u.UserID "
                + "WHERE r.Email = ? ORDER BY n.CreatedAt DESC";
        try {
            PreparedStatement ps = conn.prepareStatement(query);
            ps.setString(1, email);
            ResultSet rs = ps.executeQuery();
            while (rs.next()) {
                Map<String, Object> map = new HashMap<>();
                map.put("id", rs.getInt("NotificationID"));
                map.put("type", rs.getString("Type"));
                map.put("postType", rs.getString("PostType"));
                map.put("postId", rs.getInt("PostID"));
                map.put("message", rs.getString("Message"));
                map.put("isRead", rs.getBoolean("IsRead"));
                map.put("time", rs.getString("Time"));
                map.put("senderName", rs.getString("SenderName"));
                map.put("senderUsername", rs.getString("SenderUsername"));
                list.add(map);
            }
        } catch (Exception e) {
            System.out.println("Lỗi getNotificationsByEmail: " + e.getMessage());
        }
        return list;
    }

    // Chỉ cho đánh dấu đã đọc thông báo của chính người nhận
    public boolean markAsRead(int notificationId, String email) {
        String sql = "UPDATE Notifications SET IsRead = 1 WHERE NotificationID = ? "
                + "AND RecipientUserID = (SELECT UserID FROM Users WHERE Email = ?)";
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, notificationId);
            ps.setString(2, email);
            return ps.executeUpdate() > 0;
        } catch (Exception e) {
            System.out.println("Lỗi markAsRead: " + e.getMessage());
        }
        return false;
    }

    public boolean markAllAsRead(String email) {
        try {
            PreparedStatement ps = conn.prepareStatement(
                    "UPDATE Notifications SET IsRead = 1 WHERE RecipientUserID = (SELECT UserID FROM Users WHERE Email = ?)"
            );
            ps.setString(1, email);
            return ps.executeUpdate() >= 0;
        } catch (Exception e) {
            System.out.println("Lỗi markAllAsRead: " + e.getMessage());
        }
        return false;
    }
}
