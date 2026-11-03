package dao;

import util.DBContext;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

// Người dùng tự xóa tài khoản của chính mình
public class AccountDAO extends DBContext {

    // Chạy một câu lệnh dọn dẹp; lỗi (ví dụ bảng không tồn tại) được bỏ qua, kết quả cuối cùng kiểm tra riêng
    private void run(String sql, int userId, int params) {
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            for (int i = 1; i <= params; i++) {
                ps.setInt(i, userId);
            }
            ps.executeUpdate();
        } catch (Exception e) {
            System.out.println("AccountDAO bỏ qua: " + e.getMessage());
        }
    }

    public String getAvatarPath(int userId) {
        try (PreparedStatement ps = conn.prepareStatement("SELECT AvatarURL FROM Users WHERE UserID = ?")) {
            ps.setInt(1, userId);
            ResultSet rs = ps.executeQuery();
            if (rs.next()) {
                return rs.getString("AvatarURL");
            }
        } catch (Exception e) {
            System.out.println("Lỗi getAvatarPath: " + e.getMessage());
        }
        return null;
    }

    private boolean userExists(int userId) {
        try (PreparedStatement ps = conn.prepareStatement("SELECT 1 FROM Users WHERE UserID = ?")) {
            ps.setInt(1, userId);
            return ps.executeQuery().next();
        } catch (Exception e) {
            System.out.println("Lỗi userExists: " + e.getMessage());
        }
        return true; // không chắc chắn -> coi như chưa xóa được
    }

    /**
     * Xóa tài khoản và toàn bộ dữ liệu liên quan (bài viết, bình luận, lượt thích, chia sẻ, thông báo...).
     * Trả về true chỉ khi dòng trong bảng Users đã thật sự biến mất.
     */
    public boolean deleteAccount(int userId, String email) {
        // Thông báo gửi tới / do người này gửi
        run("DELETE FROM Notifications WHERE RecipientUserID = ? OR SenderUserID = ?", userId, 2);

        // Yêu cầu đổi trạng thái do người này gửi hoặc nằm trên bài của người này
        run("DELETE FROM StatusRequests WHERE UserID = ?", userId, 1);
        run("DELETE FROM StatusRequests WHERE PostType = 'lost' AND PostID IN (SELECT LostPostID FROM LostPosts WHERE UserID = ?)", userId, 1);
        run("DELETE FROM StatusRequests WHERE PostType = 'found' AND PostID IN (SELECT FoundPostID FROM FoundPosts WHERE UserID = ?)", userId, 1);
        run("DELETE FROM StatusRequests WHERE PostType = 'forum' AND PostID IN (SELECT PostID FROM ForumPosts WHERE UserID = ?)", userId, 1);

        // Lượt thích trên bình luận của người khác nằm trong bình luận của người này
        run("DELETE FROM CommentLikes WHERE CommentType = 'lost' AND CommentID IN (SELECT CommentID FROM LostComments WHERE UserID = ? OR LostPostID IN (SELECT LostPostID FROM LostPosts WHERE UserID = ?))", userId, 2);
        run("DELETE FROM CommentLikes WHERE CommentType = 'found' AND CommentID IN (SELECT CommentID FROM FoundComments WHERE UserID = ? OR FoundPostID IN (SELECT FoundPostID FROM FoundPosts WHERE UserID = ?))", userId, 2);
        run("DELETE FROM CommentLikes WHERE CommentType = 'forum' AND CommentID IN (SELECT CommentID FROM ForumComments WHERE UserID = ? OR PostID IN (SELECT PostID FROM ForumPosts WHERE UserID = ?))", userId, 2);

        // Bài chia sẻ của người này (và lượt thích trên đó)
        run("DELETE FROM SharedLikes WHERE UserID = ?", userId, 1);
        run("DELETE FROM SharedLikes WHERE ShareID IN (SELECT ShareID FROM SharedPosts WHERE UserID = ?)", userId, 1);
        run("DELETE FROM SharedPosts WHERE UserID = ?", userId, 1);

        // Bài viết, bình luận, lượt thích, đánh giá, ảnh: dùng lại logic dọn dẹp sẵn có của Admin
        new AdminDAO().deleteUserByAdmin(userId);

        if (email != null) {
            try (PreparedStatement ps = conn.prepareStatement("DELETE FROM EmailVerification WHERE Email = ?")) {
                ps.setString(1, email);
                ps.executeUpdate();
            } catch (Exception e) {
                System.out.println("AccountDAO bỏ qua: " + e.getMessage());
            }
        }
        return !userExists(userId);
    }
}
