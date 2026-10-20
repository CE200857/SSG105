package dao;

import util.DBContext;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class FoundPostDAO extends DBContext {
    
    public List<Map<String, Object>> getFoundPosts(String keyword, String category, String location, String sort, String currentUserEmail) {
        List<Map<String, Object>> list = new ArrayList<>();
        
        StringBuilder query = new StringBuilder(
            "SELECT f.FoundPostID, f.Category, f.ItemName, f.Description, f.LocationFound, " +
            "CONVERT(VARCHAR, f.TimeFound, 103) + ' - ' + CONVERT(VARCHAR, f.TimeFound, 108) as TimeFound, " +
            "f.Status, u.FullName, u.Username, u.Email as AuthorEmail, i.ImageURL, " +
            "(SELECT COUNT(*) FROM FoundLikes fl WHERE fl.FoundPostID = f.FoundPostID) as LikesCount, " +
            "(SELECT COUNT(*) FROM FoundLikes fl JOIN Users u2 ON fl.UserID = u2.UserID WHERE fl.FoundPostID = f.FoundPostID AND u2.Email = ?) as UserLiked " +
            "FROM FoundPosts f " +
            "JOIN Users u ON f.UserID = u.UserID " +
            "LEFT JOIN FoundImages i ON f.FoundPostID = i.FoundPostID WHERE 1=1 "
        );

        List<Object> params = new ArrayList<>();
        params.add(currentUserEmail != null ? currentUserEmail : "");

        if (keyword != null && !keyword.trim().isEmpty()) {
            query.append("AND (f.ItemName LIKE ? OR f.Description LIKE ?) ");
            params.add("%" + keyword.trim() + "%");
            params.add("%" + keyword.trim() + "%");
        }
        if (category != null && !category.trim().isEmpty() && !category.equals("Tất cả danh mục")) {
            query.append("AND f.Category = ? ");
            params.add(category.trim());
        }
        if (location != null && !location.trim().isEmpty() && !location.equals("Toàn campus")) {
            query.append("AND f.LocationFound = ? ");
            params.add(location.trim());
        }
        
        if ("oldest".equals(sort)) {
            query.append("ORDER BY f.CreatedAt ASC");
        } else {
            query.append("ORDER BY f.CreatedAt DESC");
        }

        try {
            PreparedStatement ps = conn.prepareStatement(query.toString());
            for (int i = 0; i < params.size(); i++) {
                ps.setObject(i + 1, params.get(i));
            }
            ResultSet rs = ps.executeQuery();
            while (rs.next()) {
                int postId = rs.getInt("FoundPostID");
                Map<String, Object> map = new HashMap<>();
                map.put("id", postId);
                map.put("postSource", "FOUND");
                map.put("itemName", rs.getString("ItemName"));
                map.put("description", rs.getString("Description"));
                map.put("location", rs.getString("LocationFound"));
                map.put("time", rs.getString("TimeFound"));
                map.put("status", rs.getString("Status"));
                map.put("author", rs.getString("FullName"));
                map.put("username", rs.getString("Username"));
                map.put("authorEmail", rs.getString("AuthorEmail"));
                map.put("category", rs.getString("Category") != null ? rs.getString("Category") : "Đồ dùng cá nhân");
                map.put("image", rs.getString("ImageURL") != null ? rs.getString("ImageURL") : "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&q=80");
                map.put("likes", rs.getInt("LikesCount"));
                map.put("hasLiked", rs.getInt("UserLiked") > 0);
                
                List<Map<String, Object>> comments = getCommentsByPostId(postId, currentUserEmail);
                map.put("comments", comments);
                map.put("commentsCount", comments.size());
                
                list.add(map);
            }
        } catch (Exception e) {
            System.out.println("Lỗi getFoundPosts: " + e.getMessage());
        }
        return list;
    }

    public List<Map<String, Object>> getCommentsByPostId(int foundPostId, String currentUserEmail) {
        List<Map<String, Object>> comments = new ArrayList<>();
        String query = "SELECT c.CommentID, c.Content, c.ParentCommentID, " +
                       "CONVERT(VARCHAR, c.CreatedAt, 103) + ' ' + CONVERT(VARCHAR, c.CreatedAt, 108) as Time, " +
                       "u.FullName, u.Username, " +
                       "(SELECT COUNT(*) FROM CommentLikes cl WHERE cl.CommentType = 'found' AND cl.CommentID = c.CommentID) as LikesCount, " +
                       "(SELECT COUNT(*) FROM CommentLikes cl JOIN Users u2 ON cl.UserID = u2.UserID WHERE cl.CommentType = 'found' AND cl.CommentID = c.CommentID AND u2.Email = ?) as UserLiked " +
                       "FROM FoundComments c JOIN Users u ON c.UserID = u.UserID " +
                       "WHERE c.FoundPostID = ? ORDER BY c.CreatedAt DESC";
        try {
            PreparedStatement ps = conn.prepareStatement(query);
            ps.setString(1, currentUserEmail != null ? currentUserEmail : "");
            ps.setInt(2, foundPostId);
            ResultSet rs = ps.executeQuery();
            while (rs.next()) {
                Map<String, Object> c = new HashMap<>();
                c.put("id", rs.getInt("CommentID"));
                c.put("author", rs.getString("FullName"));
                c.put("username", rs.getString("Username"));
                c.put("text", rs.getString("Content"));
                c.put("time", rs.getString("Time"));
                int parentId = rs.getInt("ParentCommentID");
                c.put("parentId", rs.wasNull() ? null : parentId);
                c.put("likes", rs.getInt("LikesCount"));
                c.put("hasLiked", rs.getInt("UserLiked") > 0);
                comments.add(c);
            }
        } catch (Exception e) {
            System.out.println("Lỗi getCommentsByPostId (Found): " + e.getMessage());
        }
        return comments;
    }

    public boolean addFoundPost(String email, String itemName, String category, String description, String location, String time, String imageUrl) {
        String finalDescription = description;
        if (time != null && !time.trim().isEmpty()) {
            finalDescription += " (Thời gian nhặt: " + time.trim() + ")";
        }

        String query = "INSERT INTO FoundPosts (UserID, Category, ItemName, Description, LocationFound, TimeFound, Status, CreatedAt) " +
                       "SELECT UserID, ?, ?, ?, ?, GETDATE(), 'Unclaimed', GETDATE() FROM Users WHERE Email = ?";
        try {
            PreparedStatement ps = conn.prepareStatement(query, Statement.RETURN_GENERATED_KEYS);
            ps.setNString(1, category);
            ps.setNString(2, itemName);
            ps.setNString(3, finalDescription);
            ps.setNString(4, location);
            ps.setString(5, email);
            int affected = ps.executeUpdate();
            if (affected > 0) {
                ResultSet keys = ps.getGeneratedKeys();
                if (keys.next() && imageUrl != null && !imageUrl.trim().isEmpty()) {
                    int newPostId = keys.getInt(1);
                    PreparedStatement imgPs = conn.prepareStatement("INSERT INTO FoundImages (FoundPostID, ImageURL) VALUES (?, ?)");
                    imgPs.setInt(1, newPostId);
                    imgPs.setString(2, imageUrl);
                    imgPs.executeUpdate();
                }
                return true;
            }
        } catch (Exception e) {
            System.out.println("Lỗi addFoundPost: " + e.getMessage());
        }
        return false;
    }

    public Map<String, Object> toggleLike(int foundPostId, String email) {
        Map<String, Object> res = new HashMap<>();
        try {
            String checkQuery = "SELECT 1 FROM FoundLikes WHERE FoundPostID = ? AND UserID = (SELECT UserID FROM Users WHERE Email = ?)";
            PreparedStatement checkPs = conn.prepareStatement(checkQuery);
            checkPs.setInt(1, foundPostId);
            checkPs.setString(2, email);
            boolean exists = checkPs.executeQuery().next();

            if (exists) {
                PreparedStatement delPs = conn.prepareStatement("DELETE FROM FoundLikes WHERE FoundPostID = ? AND UserID = (SELECT UserID FROM Users WHERE Email = ?)");
                delPs.setInt(1, foundPostId);
                delPs.setString(2, email);
                delPs.executeUpdate();
                res.put("hasLiked", false);
            } else {
                PreparedStatement insPs = conn.prepareStatement("INSERT INTO FoundLikes (FoundPostID, UserID, CreatedAt) SELECT ?, UserID, GETDATE() FROM Users WHERE Email = ?");
                insPs.setInt(1, foundPostId);
                insPs.setString(2, email);
                insPs.executeUpdate();
                res.put("hasLiked", true);

                NotificationDAO notif = new NotificationDAO();
                int senderId = notif.getUserIdByEmail(email);
                String senderName = notif.getFullNameByEmail(email);
                PreparedStatement ownerPs = conn.prepareStatement("SELECT UserID, ItemName FROM FoundPosts WHERE FoundPostID = ?");
                ownerPs.setInt(1, foundPostId);
                ResultSet ors = ownerPs.executeQuery();
                if (ors.next()) {
                    notif.createNotification(ors.getInt("UserID"), senderId, "LIKE_POST", "found", foundPostId,
                            senderName + " đã thích bài đăng nhặt đồ \"" + ors.getNString("ItemName") + "\" của bạn.");
                }
            }

            PreparedStatement countPs = conn.prepareStatement("SELECT COUNT(*) as Total FROM FoundLikes WHERE FoundPostID = ?");
            countPs.setInt(1, foundPostId);
            ResultSet rs = countPs.executeQuery();
            res.put("likes", rs.next() ? rs.getInt("Total") : 0);
            res.put("success", true);
        } catch (Exception e) {
            System.out.println("Lỗi toggleLike (Found): " + e.getMessage());
            res.put("success", false);
        }
        return res;
    }

    public boolean addComment(int foundPostId, String email, String content, Integer parentId) {
        String query = "INSERT INTO FoundComments (FoundPostID, UserID, Content, ParentCommentID, CreatedAt) " +
                       "SELECT ?, UserID, ?, ?, GETDATE() FROM Users WHERE Email = ?";
        try {
            PreparedStatement ps = conn.prepareStatement(query);
            ps.setInt(1, foundPostId);
            ps.setNString(2, content);
            if (parentId != null && parentId > 0) ps.setInt(3, parentId);
            else ps.setNull(3, java.sql.Types.INTEGER);
            ps.setString(4, email);
            boolean ok = ps.executeUpdate() > 0;
            if (ok) {
                NotificationDAO notif = new NotificationDAO();
                int senderId = notif.getUserIdByEmail(email);
                String senderName = notif.getFullNameByEmail(email);
                if (parentId != null && parentId > 0) {
                    PreparedStatement pPs = conn.prepareStatement("SELECT UserID FROM FoundComments WHERE CommentID = ?");
                    pPs.setInt(1, parentId);
                    ResultSet prs = pPs.executeQuery();
                    if (prs.next()) {
                        notif.createNotification(prs.getInt("UserID"), senderId, "REPLY_COMMENT", "found", foundPostId,
                                senderName + " đã trả lời bình luận của bạn.");
                    }
                } else {
                    PreparedStatement ownerPs = conn.prepareStatement("SELECT UserID, ItemName FROM FoundPosts WHERE FoundPostID = ?");
                    ownerPs.setInt(1, foundPostId);
                    ResultSet ors = ownerPs.executeQuery();
                    if (ors.next()) {
                        notif.createNotification(ors.getInt("UserID"), senderId, "COMMENT_POST", "found", foundPostId,
                                senderName + " đã bình luận về bài nhặt đồ \"" + ors.getNString("ItemName") + "\" của bạn.");
                    }
                }
            }
            return ok;
        } catch (Exception e) {
            System.out.println("Lỗi addComment (Found): " + e.getMessage());
        }
        return false;
    }

    public boolean updateStatus(int foundPostId, String status) {
        try {
            PreparedStatement ps = conn.prepareStatement("UPDATE FoundPosts SET Status = ? WHERE FoundPostID = ?");
            ps.setString(1, status);
            ps.setInt(2, foundPostId);
            return ps.executeUpdate() > 0;
        } catch (Exception e) {
            System.out.println("Lỗi updateStatus (Found): " + e.getMessage());
        }
        return false;
    }
    
    // 7. Chỉnh sửa bài đăng đồ nhặt được
    public boolean updateFoundPost(int foundPostId, String itemName, String category, String location, String description, String imageUrl) {
        String query = "UPDATE FoundPosts SET ItemName = ?, Category = ?, LocationFound = ?, Description = ? WHERE FoundPostID = ?";
        try {
            PreparedStatement ps = conn.prepareStatement(query);
            ps.setNString(1, itemName);
            ps.setNString(2, category);
            ps.setNString(3, location);
            ps.setNString(4, description);
            ps.setInt(5, foundPostId);
            boolean ok = ps.executeUpdate() > 0;

            if (ok && imageUrl != null && !imageUrl.trim().isEmpty()) {
                PreparedStatement checkImg = conn.prepareStatement("SELECT 1 FROM FoundImages WHERE FoundPostID = ?");
                checkImg.setInt(1, foundPostId);
                if (checkImg.executeQuery().next()) {
                    PreparedStatement upImg = conn.prepareStatement("UPDATE FoundImages SET ImageURL = ? WHERE FoundPostID = ?");
                    upImg.setString(1, imageUrl);
                    upImg.setInt(2, foundPostId);
                    upImg.executeUpdate();
                } else {
                    PreparedStatement insImg = conn.prepareStatement("INSERT INTO FoundImages (FoundPostID, ImageURL) VALUES (?, ?)");
                    insImg.setInt(1, foundPostId);
                    insImg.setString(2, imageUrl);
                    insImg.executeUpdate();
                }
            }
            return ok;
        } catch (Exception e) {
            System.out.println("Lỗi updateFoundPost: " + e.getMessage());
        }
        return false;
    }

    // 8. Xóa hoàn toàn bài đăng đồ nhặt được khỏi Database (kể cả trên trang Home)
    public boolean deletePost(int foundPostId) {
        try {
            String[] queries = {
                "DELETE FROM SharedPosts WHERE PostType = 'found' AND OriginalPostID = ?",
                "DELETE FROM Notifications WHERE PostType = 'found' AND PostID = ?",
                "DELETE FROM CommentLikes WHERE CommentType = 'found' AND CommentID IN (SELECT CommentID FROM FoundComments WHERE FoundPostID = ?)",
                "UPDATE FoundComments SET ParentCommentID = NULL WHERE FoundPostID = ?",
                "DELETE FROM FoundComments WHERE FoundPostID = ?",
                "DELETE FROM FoundLikes WHERE FoundPostID = ?",
                "DELETE FROM FoundImages WHERE FoundPostID = ?",
                "DELETE FROM FoundPosts WHERE FoundPostID = ?"
            };
            for (String q : queries) {
                try {
                    PreparedStatement ps = conn.prepareStatement(q);
                    ps.setInt(1, foundPostId);
                    ps.executeUpdate();
                } catch (Exception ignore) {}
            }
            return true;
        } catch (Exception e) {
            System.out.println("Lỗi deletePost (Found): " + e.getMessage());
        }
        return false;
    }
}