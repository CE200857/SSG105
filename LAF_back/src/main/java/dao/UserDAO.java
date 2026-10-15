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
    
    // Hàm kiểm tra trùng số điện thoại
    public boolean checkPhoneExist(String phone) {
        String query = "SELECT 1 FROM Users WHERE Phone = ?";
        try {
            java.sql.PreparedStatement ps = conn.prepareStatement(query);
            ps.setString(1, phone);
            java.sql.ResultSet rs = ps.executeQuery();
            if (rs.next()) {
                return true; // Số điện thoại đã tồn tại
            }
        } catch (Exception e) {
            System.out.println("Lỗi checkPhoneExist: " + e.getMessage());
        }
        return false;
    }
    
    // 1. Kiểm tra mật khẩu hiện tại
    public boolean checkCurrentPassword(String email, String currentPassword) {
        // Đã sửa 'Password' thành 'PasswordHash'
        String query = "SELECT * FROM Users WHERE Email = ? AND PasswordHash = ?";
        try {
            PreparedStatement ps = conn.prepareStatement(query);
            ps.setString(1, email);
            ps.setString(2, currentPassword);
            ResultSet rs = ps.executeQuery();
            if (rs.next()) {
                return true; // Mật khẩu đúng
            }
        } catch (Exception e) {
            System.out.println("Lỗi checkCurrentPassword: " + e.getMessage());
        }
        return false;
    }

    // 2. Cập nhật mật khẩu mới
    public boolean changePassword(String email, String newPassword) {
        // Đã sửa 'Password' thành 'PasswordHash'
        String query = "UPDATE Users SET PasswordHash = ? WHERE Email = ?";
        try {
            PreparedStatement ps = conn.prepareStatement(query);
            ps.setString(1, newPassword);
            ps.setString(2, email);
            int result = ps.executeUpdate();
            return result > 0; // Trả về true nếu update thành công
        } catch (Exception e) {
            System.out.println("Lỗi changePassword: " + e.getMessage());
        }
        return false;
    }
    
    // 3. Kiểm tra trùng lặp khi Cập nhật (Bỏ qua chính user hiện tại)
    public String checkDuplicateForUpdate(String currentEmail, String newUsername, String newEmail, String newPhone) {
        try {
            // Check Username
            String q1 = "SELECT 1 FROM Users WHERE Username = ? AND Email != ?";
            PreparedStatement p1 = conn.prepareStatement(q1);
            p1.setString(1, newUsername);
            p1.setString(2, currentEmail);
            if (p1.executeQuery().next()) return "Tên người dùng (Username) đã có người sử dụng!";

            // Check Email
            String q2 = "SELECT 1 FROM Users WHERE Email = ? AND Email != ?";
            PreparedStatement p2 = conn.prepareStatement(q2);
            p2.setString(1, newEmail);
            p2.setString(2, currentEmail);
            if (p2.executeQuery().next()) return "Địa chỉ Email này đã được đăng ký cho tài khoản khác!";

            // Check Phone
            if (newPhone != null && !newPhone.trim().isEmpty()) {
                String q3 = "SELECT 1 FROM Users WHERE Phone = ? AND Email != ?";
                PreparedStatement p3 = conn.prepareStatement(q3);
                p3.setString(1, newPhone);
                p3.setString(2, currentEmail);
                if (p3.executeQuery().next()) return "Số điện thoại này đã được sử dụng!";
            }
        } catch (Exception e) {
            System.out.println("Lỗi checkDuplicateForUpdate: " + e.getMessage());
            return "Lỗi cơ sở dữ liệu khi kiểm tra trùng lặp.";
        }
        return null; // Không trùng
    }

    // 4. Thực thi cập nhật Profile
    public boolean updateProfile(String currentEmail, String username, String fullName, String newEmail, String phone, String campus, String gender) {
        String query = "UPDATE Users SET Username=?, FullName=?, Email=?, Phone=?, Campus=?, Gender=? WHERE Email=?";
        try {
            PreparedStatement ps = conn.prepareStatement(query);
            ps.setString(1, username);
            ps.setNString(2, fullName);
            ps.setString(3, newEmail);
            ps.setString(4, phone);
            ps.setNString(5, campus);
            ps.setNString(6, gender);
            ps.setString(7, currentEmail);
            return ps.executeUpdate() > 0;
        } catch (Exception e) {
            System.out.println("Lỗi updateProfile: " + e.getMessage());
        }
        return false;
    }
}