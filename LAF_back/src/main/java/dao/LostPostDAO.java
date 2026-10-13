package dao;

import util.DBContext;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class LostPostDAO extends DBContext {

    public List<Map<String, Object>> getAllLostPosts() {
        List<Map<String, Object>> list = new ArrayList<>();
        
        // Truy vấn bảng LostPosts, nối với Users để lấy tên người đăng, và lấy đếm Like/Comment
        String query = "SELECT l.LostPostID as id, u.FullName as author, " +
                       "CONVERT(VARCHAR, l.CreatedAt, 103) as time, " +
                       "l.Status as status, l.Title as title, l.Content as content, " +
                       "l.LocationLost as location, CONVERT(VARCHAR, l.TimeLost, 103) as date, " +
                       "ISNULL((SELECT TOP 1 ImageURL FROM LostImages i WHERE i.LostPostID = l.LostPostID), '') as image, " +
                       "(SELECT COUNT(*) FROM Likes k WHERE k.LostPostID = l.LostPostID) as likes, " +
                       "(SELECT COUNT(*) FROM Comments c WHERE c.LostPostID = l.LostPostID) as commentsCount " +
                       "FROM LostPosts l JOIN Users u ON l.UserID = u.UserID " +
                       "ORDER BY l.CreatedAt DESC";
        
        try {
            PreparedStatement ps = conn.prepareStatement(query);
            ResultSet rs = ps.executeQuery();
            while(rs.next()) {
                Map<String, Object> map = new HashMap<>();
                map.put("id", rs.getInt("id"));
                map.put("author", rs.getString("author"));
                map.put("time", rs.getString("time"));
                
                // Chuẩn hóa trạng thái cho Frontend hiển thị Badge
                String status = rs.getString("status");
                map.put("status", "Found".equalsIgnoreCase(status) ? "Đã tìm được" : "Đang tìm đồ");
                map.put("statusVariant", "Found".equalsIgnoreCase(status) ? "success" : "warning");
                
                map.put("title", rs.getString("title"));
                map.put("content", rs.getString("content"));
                map.put("location", rs.getString("location") != null ? rs.getString("location") : "Chưa rõ");
                map.put("date", rs.getString("date") != null ? rs.getString("date") : "Chưa rõ");
                map.put("category", "Đồ thất lạc");
                map.put("likes", rs.getInt("likes"));
                map.put("commentsCount", rs.getInt("commentsCount"));
                
                String imgUrl = rs.getString("image");
                map.put("image", (imgUrl != null && !imgUrl.isEmpty()) ? imgUrl : null);
                
                // Mảng rỗng tạm thời cho comments để tránh lỗi map() ở React
                map.put("comments", new ArrayList<>()); 
                
                list.add(map);
            }
        } catch (Exception e) {
            System.out.println("Lỗi getAllLostPosts: " + e.getMessage());
        }
        return list;
    }
}