package dao;

import util.DBContext;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class ShareDAO extends DBContext {

    public boolean createShare(String email, String postType, int postId, String shareContent) {
        String query = "INSERT INTO SharedPosts (UserID, OriginalPostType, OriginalPostID, ShareContent, CreatedAt) " +
                       "SELECT UserID, ?, ?, ?, GETDATE() FROM Users WHERE Email = ?";
        try {
            PreparedStatement ps = conn.prepareStatement(query);
            ps.setString(1, postType);
            ps.setInt(2, postId);
            ps.setNString(3, shareContent);
            ps.setString(4, email);
            boolean ok = ps.executeUpdate() > 0;
            if (ok) {
                NotificationDAO notifDao = new NotificationDAO();
                int senderId = notifDao.getUserIdByEmail(email);
                String senderName = notifDao.getFullNameByEmail(email);
                int ownerId = getPostOwnerId(postType, postId);
                notifDao.createNotification(ownerId, senderId, "SHARE_POST", postType, postId,
                        senderName + " đã chia sẻ bài viết của bạn.");
            }
            return ok;
        } catch (Exception e) {
            System.out.println("Lỗi createShare: " + e.getMessage());
        }
        return false;
    }

    private int getPostOwnerId(String postType, int postId) {
        String sql = "";
        if ("lost".equals(postType)) sql = "SELECT UserID FROM LostPosts WHERE LostPostID = ?";
        else if ("found".equals(postType)) sql = "SELECT UserID FROM FoundPosts WHERE FoundPostID = ?";
        else if ("forum".equals(postType)) sql = "SELECT UserID FROM ForumPosts WHERE PostID = ?";
        try {
            PreparedStatement ps = conn.prepareStatement(sql);
            ps.setInt(1, postId);
            ResultSet rs = ps.executeQuery();
            if (rs.next()) return rs.getInt("UserID");
        } catch (Exception e) {
            System.out.println("Lỗi getPostOwnerId: " + e.getMessage());
        }
        return -1;
    }

    public List<Map<String, Object>> getSharedPostsByUserId(int profileUserId, String viewerEmail) {
        List<Map<String, Object>> list = new ArrayList<>();
        String query = "SELECT s.ShareID, s.OriginalPostType, s.OriginalPostID, s.ShareContent, " +
                       "CONVERT(VARCHAR, s.CreatedAt, 103) + ' ' + CONVERT(VARCHAR, s.CreatedAt, 108) as SharedTime, " +
                       "u.FullName as SharerName, u.Username as SharerUsername, " +
                       "(SELECT COUNT(*) FROM SharedLikes sl WHERE sl.ShareID = s.ShareID) as LikesCount, " +
                       "(SELECT COUNT(*) FROM SharedLikes sl JOIN Users u2 ON sl.UserID = u2.UserID WHERE sl.ShareID = s.ShareID AND u2.Email = ?) as UserLiked " +
                       "FROM SharedPosts s JOIN Users u ON s.UserID = u.UserID " +
                       "WHERE s.UserID = ? ORDER BY s.CreatedAt DESC";
        try {
            PreparedStatement ps = conn.prepareStatement(query);
            ps.setString(1, viewerEmail != null ? viewerEmail : "");
            ps.setInt(2, profileUserId);
            ResultSet rs = ps.executeQuery();
            while (rs.next()) {
                int shareId = rs.getInt("ShareID");
                String origType = rs.getString("OriginalPostType");
                int origId = rs.getInt("OriginalPostID");

                Map<String, Object> map = new HashMap<>();
                map.put("id", shareId);
                map.put("postSource", "SHARED");
                map.put("originalPostType", origType);
                map.put("originalPostId", origId);
                map.put("shareContent", rs.getString("ShareContent"));
                map.put("time", rs.getString("SharedTime"));
                map.put("author", rs.getString("SharerName"));
                map.put("username", rs.getString("SharerUsername"));
                map.put("likes", rs.getInt("LikesCount"));
                map.put("hasLiked", rs.getInt("UserLiked") > 0);
                map.put("originalPost", getOriginalPostSummary(origType, origId));

                List<Map<String, Object>> comments = getCommentsByShareId(shareId, viewerEmail);
                map.put("comments", comments);
                map.put("commentsCount", comments.size());
                list.add(map);
            }
        } catch (Exception e) {
            System.out.println("Lỗi getSharedPostsByUserId: " + e.getMessage());
        }
        return list;
    }

    private Map<String, Object> getOriginalPostSummary(String type, int id) {
        Map<String, Object> orig = new HashMap<>();
        try {
            if ("lost".equals(type)) {
                String q = "SELECT l.LostPostID, l.Category, l.Title, l.Content, l.LocationLost, l.Status, " +
                           "CONVERT(VARCHAR, l.CreatedAt, 103) as Date, u.FullName, u.Username, i.ImageURL " +
                           "FROM LostPosts l JOIN Users u ON l.UserID = u.UserID LEFT JOIN LostImages i ON l.LostPostID = i.LostPostID " +
                           "WHERE l.LostPostID = ?";
                PreparedStatement ps = conn.prepareStatement(q);
                ps.setInt(1, id);
                ResultSet rs = ps.executeQuery();
                if (rs.next()) {
                    orig.put("id", rs.getInt("LostPostID"));
                    orig.put("type", "lost");
                    orig.put("badgeLabel", "Đồ thất lạc (Lost)");
                    orig.put("category", rs.getString("Category"));
                    orig.put("title", rs.getString("Title"));
                    orig.put("content", rs.getString("Content"));
                    orig.put("location", rs.getString("LocationLost"));
                    orig.put("date", rs.getString("Date"));
                    orig.put("author", rs.getString("FullName"));
                    orig.put("username", rs.getString("Username"));
                    orig.put("image", rs.getString("ImageURL"));
                }
            } else if ("found".equals(type)) {
                String q = "SELECT f.FoundPostID, f.Category, f.ItemName, f.Description, f.LocationFound, f.Status, " +
                           "CONVERT(VARCHAR, f.CreatedAt, 103) as Date, u.FullName, u.Username, i.ImageURL " +
                           "FROM FoundPosts f JOIN Users u ON f.UserID = u.UserID LEFT JOIN FoundImages i ON f.FoundPostID = i.FoundPostID " +
                           "WHERE f.FoundPostID = ?";
                PreparedStatement ps = conn.prepareStatement(q);
                ps.setInt(1, id);
                ResultSet rs = ps.executeQuery();
                if (rs.next()) {
                    orig.put("id", rs.getInt("FoundPostID"));
                    orig.put("type", "found");
                    orig.put("badgeLabel", "Đồ nhặt được (Found)");
                    orig.put("category", rs.getString("Category"));
                    orig.put("title", rs.getString("ItemName"));
                    orig.put("content", rs.getString("Description"));
                    orig.put("location", rs.getString("LocationFound"));
                    orig.put("date", rs.getString("Date"));
                    orig.put("author", rs.getString("FullName"));
                    orig.put("username", rs.getString("Username"));
                    orig.put("image", rs.getString("ImageURL"));
                }
            } else if ("forum".equals(type)) {
                String q = "SELECT f.PostID, f.Category, f.Title, f.Content, CONVERT(VARCHAR, f.CreatedAt, 103) as Date, u.FullName, u.Username " +
                           "FROM ForumPosts f JOIN Users u ON f.UserID = u.UserID WHERE f.PostID = ?";
                PreparedStatement ps = conn.prepareStatement(q);
                ps.setInt(1, id);
                ResultSet rs = ps.executeQuery();
                if (rs.next()) {
                    orig.put("id", rs.getInt("PostID"));
                    orig.put("type", "forum");
                    orig.put("badgeLabel", "Diễn đàn (Forum)");
                    orig.put("category", rs.getString("Category"));
                    orig.put("title", rs.getString("Title"));
                    orig.put("content", rs.getString("Content"));
                    orig.put("date", rs.getString("Date"));
                    orig.put("author", rs.getString("FullName"));
                    orig.put("username", rs.getString("Username"));
                }
            }
        } catch (Exception e) {
            System.out.println("Lỗi getOriginalPostSummary: " + e.getMessage());
        }
        return orig;
    }

    public List<Map<String, Object>> getCommentsByShareId(int shareId, String currentUserEmail) {
        List<Map<String, Object>> comments = new ArrayList<>();
        String query = "SELECT c.CommentID, c.Content, c.ParentCommentID, " +
                       "CONVERT(VARCHAR, c.CreatedAt, 103) + ' ' + CONVERT(VARCHAR, c.CreatedAt, 108) as Time, " +
                       "u.FullName, u.Username, " +
                       "(SELECT COUNT(*) FROM CommentLikes cl WHERE cl.CommentType = 'shared' AND cl.CommentID = c.CommentID) as LikesCount, " +
                       "(SELECT COUNT(*) FROM CommentLikes cl JOIN Users u2 ON cl.UserID = u2.UserID WHERE cl.CommentType = 'shared' AND cl.CommentID = c.CommentID AND u2.Email = ?) as UserLiked " +
                       "FROM SharedComments c JOIN Users u ON c.UserID = u.UserID " +
                       "WHERE c.ShareID = ? ORDER BY c.CreatedAt DESC";
        try {
            PreparedStatement ps = conn.prepareStatement(query);
            ps.setString(1, currentUserEmail != null ? currentUserEmail : "");
            ps.setInt(2, shareId);
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
            System.out.println("Lỗi getCommentsByShareId: " + e.getMessage());
        }
        return comments;
    }

    public Map<String, Object> toggleShareLike(int shareId, String email) {
        Map<String, Object> res = new HashMap<>();
        try {
            String check = "SELECT 1 FROM SharedLikes WHERE ShareID = ? AND UserID = (SELECT UserID FROM Users WHERE Email = ?)";
            PreparedStatement ps = conn.prepareStatement(check);
            ps.setInt(1, shareId);
            ps.setString(2, email);
            boolean exists = ps.executeQuery().next();

            if (exists) {
                PreparedStatement del = conn.prepareStatement("DELETE FROM SharedLikes WHERE ShareID = ? AND UserID = (SELECT UserID FROM Users WHERE Email = ?)");
                del.setInt(1, shareId);
                del.setString(2, email);
                del.executeUpdate();
                res.put("hasLiked", false);
            } else {
                PreparedStatement ins = conn.prepareStatement("INSERT INTO SharedLikes (ShareID, UserID, CreatedAt) SELECT ?, UserID, GETDATE() FROM Users WHERE Email = ?");
                ins.setInt(1, shareId);
                ins.setString(2, email);
                ins.executeUpdate();
                res.put("hasLiked", true);

                // Tạo thông báo cho chủ bài share
                NotificationDAO notif = new NotificationDAO();
                int senderId = notif.getUserIdByEmail(email);
                String senderName = notif.getFullNameByEmail(email);
                PreparedStatement ownerPs = conn.prepareStatement("SELECT UserID FROM SharedPosts WHERE ShareID = ?");
                ownerPs.setInt(1, shareId);
                ResultSet ors = ownerPs.executeQuery();
                if (ors.next()) {
                    notif.createNotification(ors.getInt("UserID"), senderId, "LIKE_POST", "shared", shareId,
                            senderName + " đã thích bài chia sẻ của bạn.");
                }
            }

            PreparedStatement countPs = conn.prepareStatement("SELECT COUNT(*) as Total FROM SharedLikes WHERE ShareID = ?");
            countPs.setInt(1, shareId);
            ResultSet rs = countPs.executeQuery();
            res.put("likes", rs.next() ? rs.getInt("Total") : 0);
            res.put("success", true);
        } catch (Exception e) {
            System.out.println("Lỗi toggleShareLike: " + e.getMessage());
            res.put("success", false);
        }
        return res;
    }

    public boolean addShareComment(int shareId, String email, String content, Integer parentId) {
        String query = "INSERT INTO SharedComments (ShareID, UserID, Content, ParentCommentID, CreatedAt) " +
                       "SELECT ?, UserID, ?, ?, GETDATE() FROM Users WHERE Email = ?";
        try {
            PreparedStatement ps = conn.prepareStatement(query);
            ps.setInt(1, shareId);
            ps.setNString(2, content);
            if (parentId != null && parentId > 0) ps.setInt(3, parentId);
            else ps.setNull(3, java.sql.Types.INTEGER);
            ps.setString(4, email);
            boolean ok = ps.executeUpdate() > 0;
            if (ok) {
                NotificationDAO notif = new NotificationDAO();
                int senderId = notif.getUserIdByEmail(email);
                String senderName = notif.getFullNameByEmail(email);
                PreparedStatement ownerPs = conn.prepareStatement("SELECT UserID FROM SharedPosts WHERE ShareID = ?");
                ownerPs.setInt(1, shareId);
                ResultSet ors = ownerPs.executeQuery();
                if (ors.next()) {
                    notif.createNotification(ors.getInt("UserID"), senderId, "COMMENT_POST", "shared", shareId,
                            senderName + " đã bình luận về bài chia sẻ của bạn.");
                }
            }
            return ok;
        } catch (Exception e) {
            System.out.println("Lỗi addShareComment: " + e.getMessage());
        }
        return false;
    }

    public Map<String, Object> toggleCommentLike(String commentType, int commentId, String email) {
        Map<String, Object> res = new HashMap<>();
        try {
            String check = "SELECT 1 FROM CommentLikes WHERE CommentType = ? AND CommentID = ? AND UserID = (SELECT UserID FROM Users WHERE Email = ?)";
            PreparedStatement ps = conn.prepareStatement(check);
            ps.setString(1, commentType);
            ps.setInt(2, commentId);
            ps.setString(3, email);
            boolean exists = ps.executeQuery().next();

            if (exists) {
                PreparedStatement del = conn.prepareStatement("DELETE FROM CommentLikes WHERE CommentType = ? AND CommentID = ? AND UserID = (SELECT UserID FROM Users WHERE Email = ?)");
                del.setString(1, commentType);
                del.setInt(2, commentId);
                del.setString(3, email);
                del.executeUpdate();
                res.put("hasLiked", false);
            } else {
                PreparedStatement ins = conn.prepareStatement("INSERT INTO CommentLikes (CommentType, CommentID, UserID, CreatedAt) SELECT ?, ?, UserID, GETDATE() FROM Users WHERE Email = ?");
                ins.setString(1, commentType);
                ins.setInt(2, commentId);
                ins.setString(3, email);
                ins.executeUpdate();
                res.put("hasLiked", true);
            }

            PreparedStatement countPs = conn.prepareStatement("SELECT COUNT(*) as Total FROM CommentLikes WHERE CommentType = ? AND CommentID = ?");
            countPs.setString(1, commentType);
            countPs.setInt(2, commentId);
            ResultSet rs = countPs.executeQuery();
            res.put("likes", rs.next() ? rs.getInt("Total") : 0);
            res.put("success", true);
        } catch (Exception e) {
            System.out.println("Lỗi toggleCommentLike: " + e.getMessage());
            res.put("success", false);
        }
        return res;
    }
}