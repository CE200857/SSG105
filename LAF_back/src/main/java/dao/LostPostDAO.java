package dao;

import util.DBContext;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class LostPostDAO extends DBContext {

    // Thêm tham số keyword, category và location vào hàm
    public List<Map<String, Object>> getAllLostPosts(String keyword, String category, String location) {
        List<Map<String, Object>> list = new ArrayList<>();
        
        StringBuilder query = new StringBuilder(
            "SELECT l.LostPostID as id, u.FullName as author, l.Category as category, " + // Đã lấy cột Category
            "CONVERT(VARCHAR, l.CreatedAt, 103) as time, " +
            "l.Status as status, l.Title as title, l.Content as content, " +
            "l.LocationLost as location, CONVERT(VARCHAR, l.TimeLost, 103) as date, " +
            "ISNULL((SELECT TOP 1 ImageURL FROM LostImages i WHERE i.LostPostID = l.LostPostID), '') as image, " +
            "(SELECT COUNT(*) FROM Likes k WHERE k.LostPostID = l.LostPostID) as likes, " +
            "(SELECT COUNT(*) FROM Comments c WHERE c.LostPostID = l.LostPostID) as commentsCount " +
            "FROM LostPosts l JOIN Users u ON l.UserID = u.UserID " +
            "WHERE 1=1 "
        );
        
        // Nối chuỗi điều kiện nếu có tham số truyền vào
        if (keyword != null && !keyword.trim().isEmpty()) {
            query.append(" AND (l.Title LIKE ? OR l.Content LIKE ?) ");
        }
        if (category != null && !category.trim().isEmpty() && !category.equals("Tất cả danh mục")) {
            query.append(" AND l.Category = ? ");
        }
        if (location != null && !location.trim().isEmpty() && !location.equals("Toàn campus")) {
            query.append(" AND l.LocationLost LIKE ? ");
        }

        query.append(" ORDER BY l.CreatedAt DESC");
        
        try {
            PreparedStatement ps = conn.prepareStatement(query.toString());
            int paramIndex = 1;
            
            // Gán giá trị cho các dấu chấm hỏi (?)
            if (keyword != null && !keyword.trim().isEmpty()) {
                ps.setString(paramIndex++, "%" + keyword.trim() + "%");
                ps.setString(paramIndex++, "%" + keyword.trim() + "%");
            }
            if (category != null && !category.trim().isEmpty() && !category.equals("Tất cả danh mục")) {
                ps.setString(paramIndex++, category.trim());
            }
            if (location != null && !location.trim().isEmpty() && !location.equals("Toàn campus")) {
                ps.setString(paramIndex++, "%" + location.trim() + "%");
            }

            ResultSet rs = ps.executeQuery();
            while(rs.next()) {
                Map<String, Object> map = new HashMap<>();
                map.put("id", rs.getInt("id"));
                map.put("author", rs.getString("author"));
                map.put("time", rs.getString("time"));
                
                String status = rs.getString("status");
                map.put("status", "Found".equalsIgnoreCase(status) ? "Đã tìm được" : "Đang tìm đồ");
                map.put("statusVariant", "Found".equalsIgnoreCase(status) ? "success" : "warning");
                
                map.put("title", rs.getString("title"));
                map.put("content", rs.getString("content"));
                map.put("location", rs.getString("location") != null ? rs.getString("location") : "Chưa rõ");
                map.put("date", rs.getString("date") != null ? rs.getString("date") : "Chưa rõ");
                map.put("category", rs.getString("category")); // Map giá trị Category từ DB
                map.put("likes", rs.getInt("likes"));
                map.put("commentsCount", rs.getInt("commentsCount"));
                
                String imgUrl = rs.getString("image");
                map.put("image", (imgUrl != null && !imgUrl.isEmpty()) ? imgUrl : null);
                map.put("comments", new ArrayList<>()); 
                
                list.add(map);
            }
        } catch (Exception e) {
            System.out.println("Lỗi getAllLostPosts: " + e.getMessage());
        }
        return list;
    }
}