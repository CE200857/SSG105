package dao;

import entity.Users;
import util.DBContext;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

public class UserDAO extends DBContext {
    
    // Kiểm tra đăng nhập bằng Email hoặc Số điện thoại[cite: 2]
    public Users checkLogin(String identifier, String hashedPassword) {
        String query = "SELECT * FROM Users WHERE (Email = ? OR Phone = ?) AND PasswordHash = ?";
        try {
            PreparedStatement ps = conn.prepareStatement(query);
            ps.setString(1, identifier);
            ps.setString(2, identifier);
            ps.setString(3, hashedPassword);
            
            ResultSet rs = ps.executeQuery();
            if (rs.next()) {
                Users user = new Users();
                user.setUserID(rs.getInt("UserID"));
                user.setUsername(rs.getString("Username"));
                user.setFullName(rs.getString("FullName"));
                user.setEmail(rs.getString("Email"));
                user.setPhone(rs.getString("Phone"));
                user.setCampus(rs.getString("Campus"));
                user.setGender(rs.getString("Gender"));
                user.setRoleID(rs.getInt("RoleID"));
                return user;
            }
        } catch (Exception e) {
            System.out.println("Lỗi checkLogin: " + e.getMessage());
        }
        return null;
    }
    
    // Kiểm tra xem Username hoặc Email đã tồn tại chưa
    public boolean checkUserExist(String username, String email) {
        String query = "SELECT 1 FROM Users WHERE Username = ? OR Email = ?";
        try {
            PreparedStatement ps = conn.prepareStatement(query);
            ps.setString(1, username);
            ps.setString(2, email);
            ResultSet rs = ps.executeQuery();
            if (rs.next()) {
                return true; // Đã tồn tại
            }
        } catch (Exception e) {
            System.out.println("Lỗi checkUserExist: " + e.getMessage());
        }
        return false;
    }

    // Thêm User mới vào DB
    public boolean registerUser(String username, String fullName, String email, 
            String phone, String campus, String gender, String passwordHash) {
        // Mặc định RoleID = 2 (Student)[cite: 1]
        String query = "INSERT INTO Users (Username, FullName, Email, Phone, Campus, Gender, PasswordHash, RoleID, CreatedAt) "
                     + "VALUES (?, ?, ?, ?, ?, ?, ?, 2, GETDATE())";
        try {
            PreparedStatement ps = conn.prepareStatement(query);
            ps.setString(1, username);
            ps.setNString(2, fullName);
            ps.setString(3, email);
            ps.setString(4, phone);
            ps.setNString(5, campus);
            ps.setNString(6, gender);
            ps.setString(7, passwordHash);
            
            int rowsAffected = ps.executeUpdate();
            return rowsAffected > 0;
        } catch (Exception e) {
            System.out.println("Lỗi registerUser: " + e.getMessage());
        }
        return false;
    }
}