package dao;

import util.DBContext;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.HashMap;
import java.util.Map;

public class ProfileDAO extends DBContext {

    public Map<String, String> getUserProfile(String email) {
        Map<String, String> user = new HashMap<>();
        // Truy vấn WHERE Email = ?
        String query = "SELECT Username, FullName, Email, Phone, Campus, Gender FROM Users WHERE Email = ?";
        
        try {
            PreparedStatement ps = conn.prepareStatement(query);
            ps.setString(1, email);
            ResultSet rs = ps.executeQuery();
            
            if (rs.next()) {
                user.put("username", rs.getString("Username"));
                user.put("fullName", rs.getString("FullName"));
                user.put("email", rs.getString("Email"));
                user.put("phone", rs.getString("Phone") != null ? rs.getString("Phone") : "Chưa cập nhật");
                user.put("campus", rs.getString("Campus") != null ? rs.getString("Campus") : "Chưa cập nhật");
                user.put("gender", rs.getString("Gender") != null ? rs.getString("Gender") : "Chưa xác định");
            }
        } catch (Exception e) {
            System.out.println("Lỗi getUserProfile: " + e.getMessage());
        }
        return user;
    }
}