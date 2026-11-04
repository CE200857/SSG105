package dao;

import util.DBContext;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class ProfileDAO extends DBContext {

    /**
     * Lấy hồ sơ theo userId (ưu tiên) hoặc email. Username không còn được trả ra.
     * canSeeContact = false (khách chưa đăng nhập) -> KHÔNG trả email / số điện thoại của người khác.
     */
    public Map<String, Object> getFullProfile(String email, int userIdParam, String viewerEmail, boolean canSeeContact) {
        Map<String, Object> result = new HashMap<>();
        String select = "SELECT UserID, FullName, Email, Phone, Campus, Gender, AvatarURL, CONVERT(VARCHAR, CreatedAt, 103) as JoinedDate FROM Users WHERE ";
        String query;
        String param = null;
        if (userIdParam > 0) {
            query = select + "UserID = ?";
        } else {
            query = select + "Email = ?";
            param = email != null ? email.trim() : "";
        }

        try {
            PreparedStatement ps = conn.prepareStatement(query);
            if (userIdParam > 0) ps.setInt(1, userIdParam); else ps.setString(1, param);
            ResultSet rs = ps.executeQuery();
            if (rs.next()) {
                int userId = rs.getInt("UserID");
                String targetFullName = rs.getString("FullName");

                result.put("userId", userId);
                result.put("fullName", targetFullName);
                result.put("canSeeContact", canSeeContact);
                if (canSeeContact) {
                    result.put("email", rs.getString("Email"));
                    result.put("phone", rs.getString("Phone") != null ? rs.getString("Phone") : "Chưa cập nhật");
                } else {
                    result.put("email", "");
                    result.put("phone", "");
                }
                result.put("campus", rs.getString("Campus") != null ? rs.getString("Campus") : "Cần Thơ");
                result.put("gender", rs.getString("Gender") != null ? rs.getString("Gender") : "Chưa xác định");
                result.put("avatar", rs.getString("AvatarURL"));
                result.put("joinedDate", rs.getString("JoinedDate"));

                // Lấy bài đăng Lost, Found, Forum của user này
                List<Map<String, Object>> userPosts = new ArrayList<>();

                LostPostDAO lostDao = new LostPostDAO();
                for (Map<String, Object> p : lostDao.getAllLostPosts("", "", "", viewerEmail)) {
                    if (isAuthor(p, userId)) {
                        userPosts.add(p);
                    }
                }

                FoundPostDAO foundDao = new FoundPostDAO();
                for (Map<String, Object> p : foundDao.getFoundPosts("", "", "", "newest", viewerEmail)) {
                    if (isAuthor(p, userId)) {
                        userPosts.add(p);
                    }
                }

                ForumDAO forumDao = new ForumDAO();
                for (Map<String, Object> p : forumDao.getForumPosts("Tất cả", "newest", viewerEmail)) {
                    if (isAuthor(p, userId)) {
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

    // Bài thuộc về user này? (so khớp theo authorId, không dùng username)
    private static boolean isAuthor(Map<String, Object> post, int userId) {
        Object id = post.get("authorId");
        return id instanceof Number && ((Number) id).intValue() == userId;
    }
}
