package dao;

import util.DBContext;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class ForumDAO extends DBContext {

    public List<Map<String, Object>> getLatestForumPosts() {
        List<Map<String, Object>> list = new ArrayList<>();
        String query = "SELECT TOP 2 PostID, Title, Category, " +
                       "CONVERT(VARCHAR, CreatedAt, 103) as Date " +
                       "FROM ForumPosts ORDER BY CreatedAt DESC";
        try {
            PreparedStatement ps = conn.prepareStatement(query);
            ResultSet rs = ps.executeQuery();
            while (rs.next()) {
                Map<String, Object> map = new HashMap<>();
                map.put("id", rs.getInt("PostID"));
                map.put("title", rs.getString("Title"));
                map.put("category", rs.getString("Category"));
                map.put("date", rs.getString("Date"));
                list.add(map);
            }
        } catch (Exception e) {
            System.out.println("Lỗi getLatestForumPosts: " + e.getMessage());
        }
        return list;
    }
    
    public List<Map<String, Object>> getForumPosts(String categoryFilter, String sortBy, String currentUserEmail) {
        List<Map<String, Object>> list = new ArrayList<>();
        StringBuilder query = new StringBuilder(
            "SELECT f.PostID, f.Title, f.Category, f.Content, " +
            "CONVERT(VARCHAR, f.CreatedAt, 103) as Date, " +
            "u.FullName, u.Username, " +
            "(SELECT COUNT(*) FROM ForumLikes fl WHERE fl.PostID = f.PostID) as LikesCount, " +
            "(SELECT COUNT(*) FROM ForumLikes fl JOIN Users u2 ON fl.UserID = u2.UserID WHERE fl.PostID = f.PostID AND u2.Email = ?) as UserLiked " +
            "FROM ForumPosts f JOIN Users u ON f.UserID = u.UserID WHERE 1=1 "
        );
        
        List<Object> params = new ArrayList<>();
        params.add(currentUserEmail != null ? currentUserEmail : "");

        if (categoryFilter != null && !categoryFilter.isEmpty() && !categoryFilter.equals("Tất cả")) {
            query.append("AND f.Category = ? ");
            params.add(categoryFilter);
        }
        
        if ("oldest".equals(sortBy)) {
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
                int postId = rs.getInt("PostID");
                Map<String, Object> map = new HashMap<>();
                map.put("id", postId);
                map.put("postSource", "FORUM");
                map.put("title", rs.getString("Title"));
                map.put("category", rs.getString("Category"));
                map.put("content", rs.getString("Content"));
                map.put("date", rs.getString("Date"));
                map.put("fullName", rs.getString("FullName"));
                map.put("username", rs.getString("Username"));
                map.put("likes", rs.getInt("LikesCount"));
                map.put("hasLiked", rs.getInt("UserLiked") > 0);
                
                List<Map<String, Object>> comments = getCommentsByPostId(postId, currentUserEmail);
                map.put("comments", comments);
                map.put("commentsCount", comments.size());
                
                list.add(map);
            }
        } catch (Exception e) {
            System.out.println("Lỗi getForumPosts: " + e.getMessage());
        }
        return list;
    }

    public List<Map<String, Object>> getCommentsByPostId(int postId, String currentUserEmail) {
        List<Map<String, Object>> comments = new ArrayList<>();
        String query = "SELECT c.CommentID, c.Content, c.ParentCommentID, " +
                       "CONVERT(VARCHAR, c.CreatedAt, 103) + ' ' + CONVERT(VARCHAR, c.CreatedAt, 108) as Time, " +
                       "u.FullName, u.Username, " +
                       "(SELECT COUNT(*) FROM CommentLikes cl WHERE cl.CommentType = 'forum' AND cl.CommentID = c.CommentID) as LikesCount, " +
                       "(SELECT COUNT(*) FROM CommentLikes cl JOIN Users u2 ON cl.UserID = u2.UserID WHERE cl.CommentType = 'forum' AND cl.CommentID = c.CommentID AND u2.Email = ?) as UserLiked " +
                       "FROM ForumComments c JOIN Users u ON c.UserID = u.UserID " +
                       "WHERE c.PostID = ? ORDER BY c.CreatedAt DESC";
        try {
            PreparedStatement ps = conn.prepareStatement(query);
            ps.setString(1, currentUserEmail != null ? currentUserEmail : "");
            ps.setInt(2, postId);
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
            System.out.println("Lỗi getCommentsByPostId (Forum): " + e.getMessage());
        }
        return comments;
    }

    public boolean addForumPost(String email, String title, String category, String content) {
        String query = "INSERT INTO ForumPosts (UserID, Title, Category, Content, CreatedAt) " +
                       "SELECT UserID, ?, ?, ?, GETDATE() FROM Users WHERE Email = ?";
        try {
            PreparedStatement ps = conn.prepareStatement(query);
            ps.setNString(1, title);
            ps.setNString(2, category);
            ps.setNString(3, content);
            ps.setString(4, email);
            return ps.executeUpdate() > 0;
        } catch (Exception e) {
            System.out.println("Lỗi addForumPost: " + e.getMessage());
        }
        return false;
    }

    public Map<String, Object> toggleLike(int postId, String email) {
        Map<String, Object> res = new HashMap<>();
        try {
            String checkQuery = "SELECT 1 FROM ForumLikes WHERE PostID = ? AND UserID = (SELECT UserID FROM Users WHERE Email = ?)";
            PreparedStatement checkPs = conn.prepareStatement(checkQuery);
            checkPs.setInt(1, postId);
            checkPs.setString(2, email);
            boolean exists = checkPs.executeQuery().next();

            if (exists) {
                PreparedStatement delPs = conn.prepareStatement("DELETE FROM ForumLikes WHERE PostID = ? AND UserID = (SELECT UserID FROM Users WHERE Email = ?)");
                delPs.setInt(1, postId);
                delPs.setString(2, email);
                delPs.executeUpdate();
                res.put("hasLiked", false);
            } else {
                PreparedStatement insPs = conn.prepareStatement("INSERT INTO ForumLikes (PostID, UserID, CreatedAt) SELECT ?, UserID, GETDATE() FROM Users WHERE Email = ?");
                insPs.setInt(1, postId);
                insPs.setString(2, email);
                insPs.executeUpdate();
                res.put("hasLiked", true);

                NotificationDAO notif = new NotificationDAO();
                int senderId = notif.getUserIdByEmail(email);
                String senderName = notif.getFullNameByEmail(email);
                PreparedStatement ownerPs = conn.prepareStatement("SELECT UserID, Title FROM ForumPosts WHERE PostID = ?");
                ownerPs.setInt(1, postId);
                ResultSet ors = ownerPs.executeQuery();
                if (ors.next()) {
                    notif.createNotification(ors.getInt("UserID"), senderId, "LIKE_POST", "forum", postId,
                            senderName + " đã thích bài viết diễn đàn \"" + ors.getNString("Title") + "\" của bạn.");
                }
            }

            PreparedStatement countPs = conn.prepareStatement("SELECT COUNT(*) as Total FROM ForumLikes WHERE PostID = ?");
            countPs.setInt(1, postId);
            ResultSet rs = countPs.executeQuery();
            res.put("likes", rs.next() ? rs.getInt("Total") : 0);
            res.put("success", true);
        } catch (Exception e) {
            System.out.println("Lỗi toggleLike (Forum): " + e.getMessage());
            res.put("success", false);
        }
        return res;
    }

    public boolean addComment(int postId, String email, String content, Integer parentId) {
        String query = "INSERT INTO ForumComments (PostID, UserID, Content, ParentCommentID, CreatedAt) " +
                       "SELECT ?, UserID, ?, ?, GETDATE() FROM Users WHERE Email = ?";
        try {
            PreparedStatement ps = conn.prepareStatement(query);
            ps.setInt(1, postId);
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
                    PreparedStatement pPs = conn.prepareStatement("SELECT UserID FROM ForumComments WHERE CommentID = ?");
                    pPs.setInt(1, parentId);
                    ResultSet prs = pPs.executeQuery();
                    if (prs.next()) {
                        notif.createNotification(prs.getInt("UserID"), senderId, "REPLY_COMMENT", "forum", postId,
                                senderName + " đã trả lời bình luận của bạn.");
                    }
                } else {
                    PreparedStatement ownerPs = conn.prepareStatement("SELECT UserID, Title FROM ForumPosts WHERE PostID = ?");
                    ownerPs.setInt(1, postId);
                    ResultSet ors = ownerPs.executeQuery();
                    if (ors.next()) {
                        notif.createNotification(ors.getInt("UserID"), senderId, "COMMENT_POST", "forum", postId,
                                senderName + " đã bình luận về bài viết \"" + ors.getNString("Title") + "\" của bạn.");
                    }
                }
            }
            return ok;
        } catch (Exception e) {
            System.out.println("Lỗi addComment (Forum): " + e.getMessage());
        }
        return false;
    }
    public boolean updateForumPost(int postId, String title, String category, String content) {
        try {
            PreparedStatement ps = conn.prepareStatement("UPDATE ForumPosts SET Title = ?, Category = ?, Content = ? WHERE PostID = ?");
            ps.setNString(1, title);
            ps.setNString(2, category);
            ps.setNString(3, content);
            ps.setInt(4, postId);
            return ps.executeUpdate() > 0;
        } catch (Exception e) {
            System.out.println("Lỗi updateForumPost: " + e.getMessage());
        }
        return false;
    }

    public boolean deleteForumPost(int postId) {
        try {
            String[] queries = {
                "DELETE FROM SharedPosts WHERE PostType = 'forum' AND OriginalPostID = ?",
                "DELETE FROM Notifications WHERE PostType = 'forum' AND PostID = ?",
                "DELETE FROM CommentLikes WHERE CommentType = 'forum' AND CommentID IN (SELECT CommentID FROM ForumComments WHERE PostID = ?)",
                "UPDATE ForumComments SET ParentCommentID = NULL WHERE PostID = ?",
                "DELETE FROM ForumComments WHERE PostID = ?",
                "DELETE FROM ForumLikes WHERE PostID = ?",
                "DELETE FROM ForumPosts WHERE PostID = ?"
            };
            for (String q : queries) {
                try {
                    PreparedStatement ps = conn.prepareStatement(q);
                    ps.setInt(1, postId);
                    ps.executeUpdate();
                } catch (Exception ignore) {}
            }
            return true;
        } catch (Exception e) {
            System.out.println("Lỗi deleteForumPost: " + e.getMessage());
        }
        return false;
    }
}