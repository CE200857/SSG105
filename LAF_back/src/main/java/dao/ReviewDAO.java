package dao;

import util.DBContext;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class ReviewDAO extends DBContext {
    
    // Lấy danh sách đánh giá kèm theo bộ lọc và sắp xếp
    public List<Map<String, Object>> getReviews(int starFilter, String sortBy) {
        List<Map<String, Object>> list = new ArrayList<>();
        // Đã sửa r.Comment thành r.Content
        String query = "SELECT r.ReviewID, r.Rating, r.Content, CONVERT(VARCHAR, r.CreatedAt, 103) as Date, " +
                       "u.FullName, u.Username " +
                       "FROM Reviews r JOIN Users u ON r.UserID = u.UserID WHERE 1=1 ";
        
        // Lọc theo sao
        if (starFilter > 0) {
            query += "AND r.Rating = " + starFilter + " ";
        }
        
        // Sắp xếp
        if ("oldest".equals(sortBy)) {
            query += "ORDER BY r.CreatedAt ASC";
        } else {
            query += "ORDER BY r.CreatedAt DESC"; // Mặc định mới nhất
        }

        try {
            PreparedStatement ps = conn.prepareStatement(query);
            ResultSet rs = ps.executeQuery();
            while(rs.next()){
                Map<String, Object> map = new HashMap<>();
                map.put("id", rs.getInt("ReviewID"));
                map.put("rating", rs.getInt("Rating"));
                // Đã sửa "Comment" thành "Content"
                map.put("comment", rs.getString("Content")); 
                map.put("date", rs.getString("Date"));
                map.put("fullName", rs.getString("FullName"));
                map.put("username", rs.getString("Username"));
                list.add(map);
            }
        } catch (Exception e) {
            System.out.println("Lỗi getReviews: " + e.getMessage());
        }
        return list;
    }

    // Thêm đánh giá mới
    public boolean addReview(String email, int rating, String comment) {
        // Đã sửa Comment thành Content
        String query = "INSERT INTO Reviews (UserID, Rating, Content, CreatedAt) " +
                       "SELECT UserID, ?, ?, GETDATE() FROM Users WHERE Email = ?";
        try {
            PreparedStatement ps = conn.prepareStatement(query);
            ps.setInt(1, rating);
            ps.setNString(2, comment);
            ps.setString(3, email);
            return ps.executeUpdate() > 0;
        } catch (Exception e) {
            System.out.println("Lỗi addReview: " + e.getMessage());
        }
        return false;
    }
}