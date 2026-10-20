package dao;

import util.DBContext;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class ReviewDAO extends DBContext {
    
    public List<Map<String, Object>> getReviews(int starFilter, String sortBy) {
        List<Map<String, Object>> list = new ArrayList<>();
        String query = "SELECT r.ReviewID, r.Rating, r.Content, CONVERT(VARCHAR, r.CreatedAt, 103) as Date, " +
                       "u.FullName, u.Username, u.Email as AuthorEmail " +
                       "FROM Reviews r JOIN Users u ON r.UserID = u.UserID WHERE 1=1 ";
        
        if (starFilter > 0) {
            query += "AND r.Rating = " + starFilter + " ";
        }
        
        if ("oldest".equals(sortBy)) {
            query += "ORDER BY r.CreatedAt ASC";
        } else {
            query += "ORDER BY r.CreatedAt DESC";
        }

        try {
            PreparedStatement ps = conn.prepareStatement(query);
            ResultSet rs = ps.executeQuery();
            while (rs.next()) {
                Map<String, Object> map = new HashMap<>();
                map.put("id", rs.getInt("ReviewID"));
                map.put("rating", rs.getInt("Rating"));
                map.put("comment", rs.getString("Content")); 
                map.put("date", rs.getString("Date"));
                map.put("fullName", rs.getString("FullName"));
                map.put("username", rs.getString("Username"));
                map.put("authorEmail", rs.getString("AuthorEmail"));
                list.add(map);
            }
        } catch (Exception e) {
            System.out.println("Lỗi getReviews: " + e.getMessage());
        }
        return list;
    }

    public boolean addReview(String email, int rating, String comment) {
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

    public boolean updateReview(int reviewId, int rating, String comment) {
        String query = "UPDATE Reviews SET Rating = ?, Content = ? WHERE ReviewID = ?";
        try {
            PreparedStatement ps = conn.prepareStatement(query);
            ps.setInt(1, rating);
            ps.setNString(2, comment);
            ps.setInt(3, reviewId);
            return ps.executeUpdate() > 0;
        } catch (Exception e) {
            System.out.println("Lỗi updateReview: " + e.getMessage());
        }
        return false;
    }

    public boolean deleteReview(int reviewId) {
        String query = "DELETE FROM Reviews WHERE ReviewID = ?";
        try {
            PreparedStatement ps = conn.prepareStatement(query);
            ps.setInt(1, reviewId);
            return ps.executeUpdate() > 0;
        } catch (Exception e) {
            System.out.println("Lỗi deleteReview: " + e.getMessage());
        }
        return false;
    }
}