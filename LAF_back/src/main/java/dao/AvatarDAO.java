package dao;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import util.DBContext;

public class AvatarDAO extends DBContext {

    public String getAvatarByUserId(int userId) {
        try (PreparedStatement ps = conn.prepareStatement("SELECT AvatarURL FROM Users WHERE UserID = ?")) {
            ps.setInt(1, userId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return rs.getString(1);
                }
            }
        } catch (Exception e) {
            System.out.println("Lỗi getAvatarByUserId: " + e.getMessage());
        }
        return null;
    }

    // Lưu avatar mới; trả về true nếu thành công. oldPath[0] nhận đường dẫn cũ để xóa file.
    public boolean replaceAvatar(int userId, String newPath, String[] oldPath) {
        try {
            oldPath[0] = getAvatarByUserId(userId);
            try (PreparedStatement ps = conn.prepareStatement("UPDATE Users SET AvatarURL = ? WHERE UserID = ?")) {
                ps.setString(1, newPath);
                ps.setInt(2, userId);
                return ps.executeUpdate() > 0;
            }
        } catch (Exception e) {
            System.out.println("Lỗi replaceAvatar: " + e.getMessage());
        }
        return false;
    }
}
