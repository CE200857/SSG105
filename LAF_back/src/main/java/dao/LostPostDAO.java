package dao;

import util.DBContext;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class LostPostDAO extends DBContext {

    public List<Map<String, Object>> getAllLostPosts(String keyword, String category, String location, String currentUserEmail) {
        return getAllLostPosts(keyword, category, location, currentUserEmail, false, null);
    }

    // adminView = true: thấy cả bài riêng tư (trang quản lý), có thể lọc theo visibility (Public/Private)
    public List<Map<String, Object>> getAllLostPosts(String keyword, String category, String location, String currentUserEmail, boolean adminView, String visibilityFilter) {
        List<Map<String, Object>> list = new ArrayList<>();

        StringBuilder query = new StringBuilder(
                "SELECT l.LostPostID, l.Category, l.Title, l.Content, l.LocationLost, "
                + "CONVERT(VARCHAR, l.TimeLost, 103) as DateLost, "
                + "CONVERT(VARCHAR, l.CreatedAt, 103) as CreatedDate, "
                + "l.Status, l.Visibility, u.FullName, u.Username, u.Email as AuthorEmail, i.ImageURL, "
                + "(SELECT COUNT(*) FROM LostLikes ll WHERE ll.LostPostID = l.LostPostID) as LikesCount, "
                + "(SELECT COUNT(*) FROM LostLikes ll JOIN Users u2 ON ll.UserID = u2.UserID WHERE ll.LostPostID = l.LostPostID AND u2.Email = ?) as UserLiked "
                + "FROM LostPosts l "
                + "JOIN Users u ON l.UserID = u.UserID "
                + "LEFT JOIN LostImages i ON l.LostPostID = i.LostPostID WHERE 1=1 AND l.ApprovalStatus = 'Approved' "
        );

        List<Object> params = new ArrayList<>();
        params.add(currentUserEmail != null ? currentUserEmail : "");

        if (adminView) {
            if ("Public".equals(visibilityFilter) || "Private".equals(visibilityFilter)) {
                query.append("AND l.Visibility = ? ");
                params.add(visibilityFilter);
            }
        } else {
            // Người xem thường: chỉ thấy bài công khai + bài riêng tư của chính mình
            query.append("AND (l.Visibility = 'Public' OR u.Email = ?) ");
            params.add(currentUserEmail != null ? currentUserEmail : "");
        }

        if (keyword != null && !keyword.trim().isEmpty()) {
            query.append("AND (l.Title LIKE ? OR l.Content LIKE ?) ");
            params.add("%" + keyword.trim() + "%");
            params.add("%" + keyword.trim() + "%");
        }
        if (category != null && !category.trim().isEmpty() && !category.equals("Tất cả danh mục")) {
            query.append("AND l.Category = ? ");
            params.add(category.trim());
        }
        if (location != null && !location.trim().isEmpty() && !location.equals("Toàn campus")) {
            query.append("AND l.LocationLost = ? ");
            params.add(location.trim());
        }

        query.append("ORDER BY l.CreatedAt DESC");

        try {
            PreparedStatement ps = conn.prepareStatement(query.toString());
            for (int i = 0; i < params.size(); i++) {
                ps.setObject(i + 1, params.get(i));
            }
            ResultSet rs = ps.executeQuery();
            while (rs.next()) {
                int postId = rs.getInt("LostPostID");
                Map<String, Object> map = new HashMap<>();
                map.put("id", postId);
                map.put("postSource", "LOST");
                map.put("category", rs.getString("Category") != null ? rs.getString("Category") : "Khác");
                map.put("title", rs.getString("Title"));
                map.put("content", rs.getString("Content"));
                map.put("location", rs.getString("LocationLost"));
                map.put("date", rs.getString("DateLost") != null ? rs.getString("DateLost") : rs.getString("CreatedDate"));
                map.put("time", rs.getString("CreatedDate"));

                String rawStatus = rs.getString("Status");
                map.put("status", ("Found".equalsIgnoreCase(rawStatus) || "Đã tìm được".equalsIgnoreCase(rawStatus)) ? "Đã tìm được" : "Đang tìm đồ");

                map.put("author", rs.getString("FullName"));
                map.put("username", rs.getString("Username"));
                map.put("authorEmail", rs.getString("AuthorEmail"));
                map.put("visibility", rs.getString("Visibility"));
                map.put("image", rs.getString("ImageURL"));
                map.put("likes", rs.getInt("LikesCount"));
                map.put("hasLiked", rs.getInt("UserLiked") > 0);

                List<Map<String, Object>> comments = getCommentsByPostId(postId, currentUserEmail);
                map.put("comments", comments);
                map.put("commentsCount", comments.size());

                list.add(map);
            }
        } catch (Exception e) {
            System.out.println("Lỗi getAllLostPosts: " + e.getMessage());
        }
        return list;
    }

    public List<Map<String, Object>> getCommentsByPostId(int lostPostId, String currentUserEmail) {
        List<Map<String, Object>> comments = new ArrayList<>();
        String query = "SELECT c.CommentID, c.Content, c.ParentCommentID, "
                + "CONVERT(VARCHAR, c.CreatedAt, 103) + ' ' + CONVERT(VARCHAR, c.CreatedAt, 108) as Time, "
                + "u.FullName, u.Username, "
                + "(SELECT COUNT(*) FROM CommentLikes cl WHERE cl.CommentType = 'lost' AND cl.CommentID = c.CommentID) as LikesCount, "
                + "(SELECT COUNT(*) FROM CommentLikes cl JOIN Users u2 ON cl.UserID = u2.UserID WHERE cl.CommentType = 'lost' AND cl.CommentID = c.CommentID AND u2.Email = ?) as UserLiked "
                + "FROM LostComments c JOIN Users u ON c.UserID = u.UserID "
                + "WHERE c.LostPostID = ? ORDER BY c.CreatedAt DESC";
        try {
            PreparedStatement ps = conn.prepareStatement(query);
            ps.setString(1, currentUserEmail != null ? currentUserEmail : "");
            ps.setInt(2, lostPostId);
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
            System.out.println("Lỗi getCommentsByPostId (Lost): " + e.getMessage());
        }
        return comments;
    }

    public boolean addLostPost(String email, String title, String category, String content, String location, String timeLost, String imageUrl) {
        return addLostPost(email, title, category, content, location, timeLost, imageUrl, "Pending");
    }

    public boolean addLostPost(String email, String title, String category, String content, String location, String timeLost, String imageUrl, String approvalStatus) {
        String finalContent = content;
        if (timeLost != null && !timeLost.trim().isEmpty()) {
            finalContent += " (Thời gian mất: " + timeLost.trim() + ")";
        }
        String query = "INSERT INTO LostPosts (UserID, Category, Title, Content, LocationLost, TimeLost, Status, CreatedAt, ApprovalStatus) "
                + "SELECT UserID, ?, ?, ?, ?, GETDATE(), 'Not Found', GETDATE(), ? FROM Users WHERE Email = ?";
        try {
            PreparedStatement ps = conn.prepareStatement(query, Statement.RETURN_GENERATED_KEYS);
            ps.setNString(1, category);
            ps.setNString(2, title);
            ps.setNString(3, finalContent);
            ps.setNString(4, location);
            ps.setString(5, approvalStatus);
            ps.setString(6, email);
            int affected = ps.executeUpdate();
            if (affected > 0) {
                ResultSet keys = ps.getGeneratedKeys();
                if (keys.next() && imageUrl != null && !imageUrl.trim().isEmpty()) {
                    int newPostId = keys.getInt(1);
                    PreparedStatement imgPs = conn.prepareStatement("INSERT INTO LostImages (LostPostID, ImageURL) VALUES (?, ?)");
                    imgPs.setInt(1, newPostId);
                    imgPs.setString(2, imageUrl);
                    imgPs.executeUpdate();
                }
                return true;
            }
        } catch (Exception e) {
            System.out.println("Lỗi addLostPost: " + e.getMessage());
        }
        return false;
    }

    public Map<String, Object> toggleLike(int lostPostId, String email) {
        Map<String, Object> res = new HashMap<>();
        try {
            String checkQuery = "SELECT 1 FROM LostLikes WHERE LostPostID = ? AND UserID = (SELECT UserID FROM Users WHERE Email = ?)";
            PreparedStatement checkPs = conn.prepareStatement(checkQuery);
            checkPs.setInt(1, lostPostId);
            checkPs.setString(2, email);
            boolean exists = checkPs.executeQuery().next();

            if (exists) {
                PreparedStatement delPs = conn.prepareStatement("DELETE FROM LostLikes WHERE LostPostID = ? AND UserID = (SELECT UserID FROM Users WHERE Email = ?)");
                delPs.setInt(1, lostPostId);
                delPs.setString(2, email);
                delPs.executeUpdate();
                res.put("hasLiked", false);
            } else {
                PreparedStatement insPs = conn.prepareStatement("INSERT INTO LostLikes (LostPostID, UserID, CreatedAt) SELECT ?, UserID, GETDATE() FROM Users WHERE Email = ?");
                insPs.setInt(1, lostPostId);
                insPs.setString(2, email);
                insPs.executeUpdate();
                res.put("hasLiked", true);

                // Tạo thông báo
                NotificationDAO notif = new NotificationDAO();
                int senderId = notif.getUserIdByEmail(email);
                String senderName = notif.getFullNameByEmail(email);
                PreparedStatement ownerPs = conn.prepareStatement("SELECT UserID, Title FROM LostPosts WHERE LostPostID = ?");
                ownerPs.setInt(1, lostPostId);
                ResultSet ors = ownerPs.executeQuery();
                if (ors.next()) {
                    notif.createNotification(ors.getInt("UserID"), senderId, "LIKE_POST", "lost", lostPostId,
                            senderName + " đã thích bài đăng tìm đồ \"" + ors.getNString("Title") + "\" của bạn.");
                }
            }

            PreparedStatement countPs = conn.prepareStatement("SELECT COUNT(*) as Total FROM LostLikes WHERE LostPostID = ?");
            countPs.setInt(1, lostPostId);
            ResultSet rs = countPs.executeQuery();
            res.put("likes", rs.next() ? rs.getInt("Total") : 0);
            res.put("success", true);
        } catch (Exception e) {
            System.out.println("Lỗi toggleLike (Lost): " + e.getMessage());
            res.put("success", false);
        }
        return res;
    }

    public boolean addComment(int lostPostId, String email, String content, Integer parentId) {
        String query = "INSERT INTO LostComments (LostPostID, UserID, Content, ParentCommentID, CreatedAt) "
                + "SELECT ?, UserID, ?, ?, GETDATE() FROM Users WHERE Email = ?";
        try {
            PreparedStatement ps = conn.prepareStatement(query);
            ps.setInt(1, lostPostId);
            ps.setNString(2, content);
            if (parentId != null && parentId > 0) {
                ps.setInt(3, parentId);
            } else {
                ps.setNull(3, java.sql.Types.INTEGER);
            }
            ps.setString(4, email);
            boolean ok = ps.executeUpdate() > 0;
            if (ok) {
                NotificationDAO notif = new NotificationDAO();
                int senderId = notif.getUserIdByEmail(email);
                String senderName = notif.getFullNameByEmail(email);
                if (parentId != null && parentId > 0) {
                    PreparedStatement pPs = conn.prepareStatement("SELECT UserID FROM LostComments WHERE CommentID = ?");
                    pPs.setInt(1, parentId);
                    ResultSet prs = pPs.executeQuery();
                    if (prs.next()) {
                        notif.createNotification(prs.getInt("UserID"), senderId, "REPLY_COMMENT", "lost", lostPostId,
                                senderName + " đã trả lời bình luận của bạn.");
                    }
                } else {
                    PreparedStatement ownerPs = conn.prepareStatement("SELECT UserID, Title FROM LostPosts WHERE LostPostID = ?");
                    ownerPs.setInt(1, lostPostId);
                    ResultSet ors = ownerPs.executeQuery();
                    if (ors.next()) {
                        notif.createNotification(ors.getInt("UserID"), senderId, "COMMENT_POST", "lost", lostPostId,
                                senderName + " đã bình luận về bài tìm đồ \"" + ors.getNString("Title") + "\" của bạn.");
                    }
                }
            }
            return ok;
        } catch (Exception e) {
            System.out.println("Lỗi addComment (Lost): " + e.getMessage());
        }
        return false;
    }

    public boolean updateStatus(int lostPostId, String status) {
        String dbStatus = "Đã tìm được".equals(status) ? "Found" : "Not Found";
        try {
            PreparedStatement ps = conn.prepareStatement("UPDATE LostPosts SET Status = ? WHERE LostPostID = ?");
            ps.setString(1, dbStatus);
            ps.setInt(2, lostPostId);
            return ps.executeUpdate() > 0;
        } catch (Exception e) {
            System.out.println("Lỗi updateStatus (Lost): " + e.getMessage());
        }
        return false;
    }

    public boolean updateLostPost(int lostPostId, String title, String category, String location, String content, String imageUrl) {
        String query = "UPDATE LostPosts SET Title = ?, Category = ?, LocationLost = ?, Content = ? WHERE LostPostID = ?";
        try {
            PreparedStatement ps = conn.prepareStatement(query);
            ps.setNString(1, title);
            ps.setNString(2, category);
            ps.setNString(3, location);
            ps.setNString(4, content);
            ps.setInt(5, lostPostId);
            boolean ok = ps.executeUpdate() > 0;

            if (ok && imageUrl != null && !imageUrl.trim().isEmpty()) {
                PreparedStatement checkImg = conn.prepareStatement("SELECT 1 FROM LostImages WHERE LostPostID = ?");
                checkImg.setInt(1, lostPostId);
                if (checkImg.executeQuery().next()) {
                    PreparedStatement upImg = conn.prepareStatement("UPDATE LostImages SET ImageURL = ? WHERE LostPostID = ?");
                    upImg.setString(1, imageUrl);
                    upImg.setInt(2, lostPostId);
                    upImg.executeUpdate();
                } else {
                    PreparedStatement insImg = conn.prepareStatement("INSERT INTO LostImages (LostPostID, ImageURL) VALUES (?, ?)");
                    insImg.setInt(1, lostPostId);
                    insImg.setString(2, imageUrl);
                    insImg.executeUpdate();
                }
            }
            return ok;
        } catch (Exception e) {
            System.out.println("Lỗi updateLostPost: " + e.getMessage());
        }
        return false;
    }

    public boolean deletePost(int lostPostId) {
        try {
            String[] queries = {
                "DELETE FROM CommentLikes WHERE CommentType = 'lost' AND CommentID IN (SELECT CommentID FROM LostComments WHERE LostPostID = ?)",
                "UPDATE LostComments SET ParentCommentID = NULL WHERE LostPostID = ?",
                "DELETE FROM LostComments WHERE LostPostID = ?",
                "DELETE FROM LostLikes WHERE LostPostID = ?",
                "DELETE FROM LostImages WHERE LostPostID = ?",
                "DELETE FROM LostPosts WHERE LostPostID = ?"
            };
            for (String q : queries) {
                try {
                    PreparedStatement ps = conn.prepareStatement(q);
                    ps.setInt(1, lostPostId);
                    ps.executeUpdate();
                } catch (Exception ignore) {
                }
            }
            return true;
        } catch (Exception e) {
            System.out.println("Lỗi deletePost (Lost): " + e.getMessage());
        }
        return false;
    }
}
