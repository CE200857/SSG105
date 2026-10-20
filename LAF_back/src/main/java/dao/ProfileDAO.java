package dao;

import util.DBContext;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class ProfileDAO extends DBContext {

    public Map<String, Object> getFullProfile(String email, String username, String viewerEmail) {
        Map<String, Object> result = new HashMap<>();
        String query;
        String param;
        if (username != null && !username.trim().isEmpty()) {
            query = "SELECT UserID, Username, FullName, Email, Phone, Campus, Gender, CONVERT(VARCHAR, CreatedAt, 103) as JoinedDate FROM Users WHERE Username = ?";
            param = username.trim();
        } else {
            query = "SELECT UserID, Username, FullName, Email, Phone, Campus, Gender, CONVERT(VARCHAR, CreatedAt, 103) as JoinedDate FROM Users WHERE Email = ?";
            param = email != null ? email.trim() : "";
        }

        try {
            PreparedStatement ps = conn.prepareStatement(query);
            ps.setString(1, param);
            ResultSet rs = ps.executeQuery();
            if (rs.next()) {
                int userId = rs.getInt("UserID");
                String targetUsername = rs.getString("Username");
                String targetFullName = rs.getString("FullName");
                String targetEmail = rs.getString("Email");

                result.put("userId", userId);
                result.put("username", targetUsername);
                result.put("fullName", targetFullName);
                result.put("email", targetEmail);
                result.put("phone", rs.getString("Phone") != null ? rs.getString("Phone") : "Chưa cập nhật");
                result.put("campus", rs.getString("Campus") != null ? rs.getString("Campus") : "Cần Thơ");
                result.put("gender", rs.getString("Gender") != null ? rs.getString("Gender") : "Chưa xác định");
                result.put("joinedDate", rs.getString("JoinedDate"));

                // Lấy bài đăng Lost, Found, Forum của user này
                List<Map<String, Object>> userPosts = new ArrayList<>();

                LostPostDAO lostDao = new LostPostDAO();
                for (Map<String, Object> p : lostDao.getAllLostPosts("", "", "", viewerEmail)) {
                    if (targetUsername.equals(p.get("username"))) {
                        userPosts.add(p);
                    }
                }

                FoundPostDAO foundDao = new FoundPostDAO();
                for (Map<String, Object> p : foundDao.getFoundPosts("", "", "", "newest", viewerEmail)) {
                    if (targetUsername.equals(p.get("username"))) {
                        userPosts.add(p);
                    }
                }

                ForumDAO forumDao = new ForumDAO();
                for (Map<String, Object> p : forumDao.getForumPosts("Tất cả", "newest", viewerEmail)) {
                    if (targetUsername.equals(p.get("username"))) {
                        userPosts.add(p);
                    }
                }

                // Lấy bài đã Chia sẻ (SharedPosts) của user này
                ShareDAO shareDao = new ShareDAO();
                List<Map<String, Object>> sharedPosts = shareDao.getSharedPostsByUserId(userId, viewerEmail);

                result.put("posts", userPosts);
                result.put("sharedPosts", sharedPosts);
            }
        } catch (Exception e) {
            System.out.println("Lỗi getFullProfile: " + e.getMessage());
        }
        return result;
    }
}