package dao;

import util.DBContext;
import java.security.MessageDigest;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class AdminDAO extends DBContext {

    private String hashMD5(String password) {
        try {
            MessageDigest md = MessageDigest.getInstance("MD5");
            md.update(password.getBytes());
            byte[] bytes = md.digest();
            StringBuilder sb = new StringBuilder();
            for (byte b : bytes) {
                sb.append(Integer.toString((b & 0xff) + 0x100, 16).substring(1));
            }
            return sb.toString();
        } catch (Exception e) {
            return password;
        }
    }

    // 1. Thống kê tổng quan Dashboard
    public Map<String, Integer> getDashboardStats() {
        Map<String, Integer> stats = new HashMap<>();
        String[] keys = {"lostCount", "foundCount", "forumCount", "reviewCount", "studentCount", "pendingCount"};
        String[] queries = {
            "SELECT COUNT(*) FROM LostPosts WHERE ApprovalStatus = 'Approved'",
            "SELECT COUNT(*) FROM FoundPosts WHERE ApprovalStatus = 'Approved'",
            "SELECT COUNT(*) FROM ForumPosts WHERE ApprovalStatus = 'Approved'",
            "SELECT COUNT(*) FROM Reviews",
            "SELECT COUNT(*) FROM Users WHERE RoleID = 2",
            "SELECT (SELECT COUNT(*) FROM LostPosts WHERE ApprovalStatus = 'Pending') + "
            + "(SELECT COUNT(*) FROM FoundPosts WHERE ApprovalStatus = 'Pending') + "
            + "(SELECT COUNT(*) FROM ForumPosts WHERE ApprovalStatus = 'Pending')"
        };
        for (int i = 0; i < keys.length; i++) {
            try {
                PreparedStatement ps = conn.prepareStatement(queries[i]);
                ResultSet rs = ps.executeQuery();
                stats.put(keys[i], rs.next() ? rs.getInt(1) : 0);
            } catch (Exception e) {
                stats.put(keys[i], 0);
            }
        }
        return stats;
    }

    // 2. Lấy danh sách tài khoản (hỗ trợ lọc từ khóa, cơ sở, giới tính, vai trò)
    public List<Map<String, Object>> getAllUsers(String keyword, String campus, String gender, String roleId) {
        List<Map<String, Object>> list = new ArrayList<>();
        StringBuilder query = new StringBuilder(
                "SELECT UserID, Username, FullName, Email, Phone, Campus, Gender, RoleID, IsActive, "
                + "CONVERT(VARCHAR, CreatedAt, 103) as CreatedDate FROM Users WHERE 1=1 "
        );
        List<Object> params = new ArrayList<>();

        if (keyword != null && !keyword.trim().isEmpty()) {
            query.append("AND (Username LIKE ? OR FullName LIKE ? OR Email LIKE ? OR Phone LIKE ?) ");
            String kw = "%" + keyword.trim() + "%";
            params.add(kw);
            params.add(kw);
            params.add(kw);
            params.add(kw);
        }
        if (campus != null && !campus.trim().isEmpty() && !campus.equals("Tất cả")) {
            query.append("AND Campus = ? ");
            params.add(campus.trim());
        }
        if (gender != null && !gender.trim().isEmpty() && !gender.equals("Tất cả")) {
            query.append("AND Gender = ? ");
            params.add(gender.trim());
        }
        if (roleId != null && !roleId.trim().isEmpty() && !roleId.equals("0")) {
            query.append("AND RoleID = ? ");
            params.add(Integer.parseInt(roleId.trim()));
        }

        query.append("ORDER BY UserID DESC");

        try {
            PreparedStatement ps = conn.prepareStatement(query.toString());
            for (int i = 0; i < params.size(); i++) {
                ps.setObject(i + 1, params.get(i));
            }
            ResultSet rs = ps.executeQuery();
            while (rs.next()) {
                Map<String, Object> u = new HashMap<>();
                u.put("userId", rs.getInt("UserID"));
                u.put("username", rs.getString("Username"));
                u.put("fullName", rs.getString("FullName"));
                u.put("email", rs.getString("Email"));
                u.put("phone", rs.getString("Phone") != null ? rs.getString("Phone") : "");
                u.put("campus", rs.getString("Campus") != null ? rs.getString("Campus") : "Cần Thơ");
                u.put("gender", rs.getString("Gender") != null ? rs.getString("Gender") : "Nam");
                u.put("roleId", rs.getInt("RoleID"));
                u.put("isActive", rs.getBoolean("IsActive"));
                u.put("createdAt", rs.getString("CreatedDate"));
                list.add(u);
            }
        } catch (Exception e) {
            System.out.println("Lỗi getAllUsers: " + e.getMessage());
        }
        return list;
    }

    // 3. Tạo tài khoản mới bởi Admin
    public String createUserByAdmin(String username, String fullName, String email, String phone, String campus, String gender, String rawPassword, int roleId) {
        try {
            PreparedStatement check = conn.prepareStatement("SELECT 1 FROM Users WHERE Username = ? OR Email = ?");
            check.setString(1, username.trim());
            check.setString(2, email.trim());
            if (check.executeQuery().next()) {
                return "Username hoặc Email đã tồn tại trong hệ thống!";
            }

            String query = "INSERT INTO Users (Username, FullName, Email, Phone, Campus, Gender, PasswordHash, RoleID, CreatedAt) "
                    + "VALUES (?, ?, ?, ?, ?, ?, ?, ?, GETDATE())";
            PreparedStatement ps = conn.prepareStatement(query);
            ps.setString(1, username.trim());
            ps.setNString(2, fullName.trim());
            ps.setString(3, email.trim());
            ps.setString(4, phone != null ? phone.trim() : "");
            ps.setNString(5, campus != null && !campus.isEmpty() ? campus : "Cần Thơ");
            ps.setNString(6, gender != null && !gender.isEmpty() ? gender : "Nam");
            ps.setString(7, hashMD5(rawPassword != null && !rawPassword.isEmpty() ? rawPassword : "123456"));
            ps.setInt(8, roleId);

            return ps.executeUpdate() > 0 ? null : "Không thể tạo tài khoản!";
        } catch (Exception e) {
            return "Lỗi CSDL: " + e.getMessage();
        }
    }

    // 4. Cập nhật tài khoản bởi Admin (Có thể đổi cả mật khẩu nếu nhập mật khẩu mới)
    public String updateUserByAdmin(int userId, String username, String fullName, String email, String phone, String campus, String gender, String newPassword, int roleId) {
        try {
            PreparedStatement check = conn.prepareStatement("SELECT 1 FROM Users WHERE (Username = ? OR Email = ?) AND UserID != ?");
            check.setString(1, username.trim());
            check.setString(2, email.trim());
            check.setInt(3, userId);
            if (check.executeQuery().next()) {
                return "Username hoặc Email đã bị trùng với tài khoản khác!";
            }

            if (newPassword != null && !newPassword.trim().isEmpty()) {
                String q = "UPDATE Users SET Username=?, FullName=?, Email=?, Phone=?, Campus=?, Gender=?, PasswordHash=?, RoleID=? WHERE UserID=?";
                PreparedStatement ps = conn.prepareStatement(q);
                ps.setString(1, username.trim());
                ps.setNString(2, fullName.trim());
                ps.setString(3, email.trim());
                ps.setString(4, phone != null ? phone.trim() : "");
                ps.setNString(5, campus);
                ps.setNString(6, gender);
                ps.setString(7, hashMD5(newPassword.trim()));
                ps.setInt(8, roleId);
                ps.setInt(9, userId);
                ps.executeUpdate();
            } else {
                String q = "UPDATE Users SET Username=?, FullName=?, Email=?, Phone=?, Campus=?, Gender=?, RoleID=? WHERE UserID=?";
                PreparedStatement ps = conn.prepareStatement(q);
                ps.setString(1, username.trim());
                ps.setNString(2, fullName.trim());
                ps.setString(3, email.trim());
                ps.setString(4, phone != null ? phone.trim() : "");
                ps.setNString(5, campus);
                ps.setNString(6, gender);
                ps.setInt(7, roleId);
                ps.setInt(8, userId);
                ps.executeUpdate();
            }
            return null;
        } catch (Exception e) {
            return "Lỗi cập nhật: " + e.getMessage();
        }
    }
    
        // Ban / mở khóa tài khoản (không xóa dữ liệu, không ban được Admin)
    public boolean setUserActive(int userId, boolean active) {
        String query = "UPDATE Users SET IsActive = ? WHERE UserID = ? AND RoleID <> 1";
        try {
            PreparedStatement ps = conn.prepareStatement(query);
            ps.setBoolean(1, active);
            ps.setInt(2, userId);
            return ps.executeUpdate() > 0;
        } catch (Exception e) {
            System.out.println("Lỗi setUserActive: " + e.getMessage());
        }
        return false;
    }

    // 5. Xóa hoàn toàn tài khoản và dọn sạch các bảng phụ thuộc
    public boolean deleteUserByAdmin(int userId) {
        try {
            String[] cleanupQueries = {
                "DELETE FROM CommentLikes WHERE UserID = ?",
                "DELETE FROM LostLikes WHERE UserID = ?",
                "DELETE FROM FoundLikes WHERE UserID = ?",
                "DELETE FROM ForumLikes WHERE UserID = ?",
                "UPDATE LostComments SET ParentCommentID = NULL WHERE UserID = ?",
                "UPDATE FoundComments SET ParentCommentID = NULL WHERE UserID = ?",
                "UPDATE ForumComments SET ParentCommentID = NULL WHERE UserID = ?",
                "DELETE FROM LostComments WHERE UserID = ?",
                "DELETE FROM FoundComments WHERE UserID = ?",
                "DELETE FROM ForumComments WHERE UserID = ?",
                "DELETE FROM Reviews WHERE UserID = ?",
                "DELETE FROM LostImages WHERE LostPostID IN (SELECT LostPostID FROM LostPosts WHERE UserID = ?)",
                "DELETE FROM LostLikes WHERE LostPostID IN (SELECT LostPostID FROM LostPosts WHERE UserID = ?)",
                "DELETE FROM LostComments WHERE LostPostID IN (SELECT LostPostID FROM LostPosts WHERE UserID = ?)",
                "DELETE FROM LostPosts WHERE UserID = ?",
                "DELETE FROM FoundImages WHERE FoundPostID IN (SELECT FoundPostID FROM FoundPosts WHERE UserID = ?)",
                "DELETE FROM FoundLikes WHERE FoundPostID IN (SELECT FoundPostID FROM FoundPosts WHERE UserID = ?)",
                "DELETE FROM FoundComments WHERE FoundPostID IN (SELECT FoundPostID FROM FoundPosts WHERE UserID = ?)",
                "DELETE FROM FoundPosts WHERE UserID = ?",
                "DELETE FROM ForumLikes WHERE PostID IN (SELECT PostID FROM ForumPosts WHERE UserID = ?)",
                "DELETE FROM ForumComments WHERE PostID IN (SELECT PostID FROM ForumPosts WHERE UserID = ?)",
                "DELETE FROM ForumPosts WHERE UserID = ?",
                "DELETE FROM Users WHERE UserID = ?"
            };
            for (String q : cleanupQueries) {
                try {
                    PreparedStatement ps = conn.prepareStatement(q);
                    ps.setInt(1, userId);
                    ps.executeUpdate();
                } catch (Exception ignore) {
                }
            }
            return true;
        } catch (Exception e) {
            System.out.println("Lỗi deleteUserByAdmin: " + e.getMessage());
        }
        return false;
    }
}
