package dao;

import util.DBContext;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class PostDAO extends DBContext {

    public List<Map<String, Object>> getRecentPosts() {
        List<Map<String, Object>> list = new ArrayList<>();
        
        // Đã bổ sung tiền tố định danh bảng (LostPosts., FoundPosts.) để tránh lỗi Ambiguous column
        String query = 
            "SELECT TOP 10 * FROM (" +
            "   SELECT LostPosts.LostPostID as ID, 'lost' as Type, N'Đang tìm' as Tag, '#dc3545' as TagColor, " +
            "   N'Tin mất đồ' as Category, LostPosts.Title, LostPosts.LocationLost as Location, Users.FullName as UserName, " +
            "   CONVERT(VARCHAR, LostPosts.TimeLost, 120) as Time, " +
            "   (SELECT TOP 1 ImageURL FROM LostImages WHERE LostImages.LostPostID = LostPosts.LostPostID) as ImgUrl, " +
            "   LostPosts.CreatedAt " +
            "   FROM LostPosts JOIN Users ON LostPosts.UserID = Users.UserID " +
            "   UNION ALL " +
            "   SELECT FoundPosts.FoundPostID as ID, 'found' as Type, N'Nhặt được' as Tag, '#0C8B72' as TagColor, " +
            "   N'Tin nhặt đồ' as Category, FoundPosts.ItemName as Title, FoundPosts.LocationFound as Location, Users.FullName as UserName, " +
            "   CONVERT(VARCHAR, FoundPosts.TimeFound, 120) as Time, " +
            "   (SELECT TOP 1 ImageURL FROM FoundImages WHERE FoundImages.FoundPostID = FoundPosts.FoundPostID) as ImgUrl, " +
            "   FoundPosts.CreatedAt " +
            "   FROM FoundPosts JOIN Users ON FoundPosts.UserID = Users.UserID " +
            ") as CombinedTable ORDER BY CreatedAt DESC";

        try {
            PreparedStatement ps = conn.prepareStatement(query);
            ResultSet rs = ps.executeQuery();
            while (rs.next()) {
                Map<String, Object> post = new HashMap<>();
                post.put("id", rs.getInt("ID"));
                post.put("type", rs.getString("Type"));
                post.put("tag", rs.getString("Tag"));
                post.put("tagColor", rs.getString("TagColor"));
                post.put("category", rs.getString("Category"));
                post.put("title", rs.getString("Title"));
                post.put("location", rs.getString("Location"));
                post.put("user", rs.getString("UserName"));
                post.put("time", rs.getString("Time"));
                
                String imgUrl = rs.getString("ImgUrl");
                post.put("img", imgUrl != null ? imgUrl : "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=400&q=80");

                list.add(post);
            }
        } catch (Exception e) {
            System.out.println("Lỗi getRecentPosts: " + e.getMessage());
        }
        return list;
    }
}