package dao;

import java.sql.*;
import java.util.*;

/** Fetch comments for visible posts in batches instead of two extra queries per post. */
final class CommentBatchLoader {
    private CommentBatchLoader() { }

    static void attach(Connection conn, List<Map<String, Object>> posts,
            String type, String email, boolean admin) throws SQLException {
        String table;
        String postKey;
        switch (type) {
            case "lost": table = "LostComments"; postKey = "LostPostID"; break;
            case "found": table = "FoundComments"; postKey = "FoundPostID"; break;
            case "forum": table = "ForumComments"; postKey = "PostID"; break;
            default: throw new IllegalArgumentException("Unknown comment type");
        }
        Map<Integer, List<Map<String, Object>>> groups = new LinkedHashMap<>();
        for (Map<String, Object> post : posts) {
            groups.put(((Number) post.get("id")).intValue(), new ArrayList<>());
        }
        List<Integer> ids = new ArrayList<>(groups.keySet());
        // SQL Server allows 2100 parameters; leave room for the current viewer.
        for (int offset = 0; offset < ids.size(); offset += 500) {
            List<Integer> batch = ids.subList(offset, Math.min(offset + 500, ids.size()));
            String sql = "SELECT c." + postKey + " AS ParentPostID, c.CommentID, c.Content, c.ParentCommentID, "
                    + "CONVERT(VARCHAR, c.CreatedAt, 103) + ' ' + CONVERT(VARCHAR, c.CreatedAt, 108) AS Time, "
                    + "u.FullName, u.UserID AS AuthorID, u.Email, u.AvatarURL, "
                    + "(SELECT COUNT(*) FROM CommentLikes cl WHERE cl.CommentType = '" + type
                    + "' AND cl.CommentID = c.CommentID) AS LikesCount, "
                    + "(SELECT COUNT(*) FROM CommentLikes cl JOIN Users v ON v.UserID = cl.UserID "
                    + "WHERE cl.CommentType = '" + type + "' AND cl.CommentID = c.CommentID AND v.Email = ?) AS UserLiked "
                    + "FROM " + table + " c JOIN Users u ON c.UserID = u.UserID WHERE c." + postKey
                    + " IN (" + String.join(",", Collections.nCopies(batch.size(), "?")) + ") "
                    + "ORDER BY c.CreatedAt DESC, c.CommentID DESC";
            try (PreparedStatement ps = conn.prepareStatement(sql)) {
                ps.setString(1, email == null ? "" : email);
                for (int i = 0; i < batch.size(); i++) ps.setInt(i + 2, batch.get(i));
                try (ResultSet rs = ps.executeQuery()) {
                    while (rs.next()) {
                        Map<String, Object> comment = new HashMap<>();
                        comment.put("id", rs.getInt("CommentID"));
                        comment.put("author", rs.getString("FullName"));
                        comment.put("authorId", rs.getInt("AuthorID"));
                        String authorEmail = rs.getString("Email");
                        comment.put("authorEmail", email == null || email.trim().isEmpty() ? "" : authorEmail);
                        comment.put("avatar", rs.getString("AvatarURL"));
                        comment.put("canManage", admin || (email != null && email.equalsIgnoreCase(authorEmail)));
                        comment.put("text", rs.getString("Content"));
                        comment.put("time", rs.getString("Time"));
                        int parentId = rs.getInt("ParentCommentID");
                        comment.put("parentId", rs.wasNull() ? null : parentId);
                        comment.put("likes", rs.getInt("LikesCount"));
                        comment.put("hasLiked", rs.getInt("UserLiked") > 0);
                        groups.get(rs.getInt("ParentPostID")).add(comment);
                    }
                }
            }
        }
        for (Map<String, Object> post : posts) {
            List<Map<String, Object>> comments = groups.get(((Number) post.get("id")).intValue());
            post.put("comments", comments);
            post.put("commentsCount", comments.size());
        }
    }
}
