package dao;

import util.DBContext;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class ForumDAO extends DBContext {
    // Chỉ lấy 2 bài mới nhất (TOP 2)
    public List<Map<String, Object>> getLatestForumPosts() {
        List<Map<String, Object>> list = new ArrayList<>();
        String query = "SELECT TOP 2 PostID, Title, Category, " +
                       "CONVERT(VARCHAR, CreatedAt, 103) as Date " +
                       "FROM ForumPosts ORDER BY CreatedAt DESC";
        try {
            PreparedStatement ps = conn.prepareStatement(query);
            ResultSet rs = ps.executeQuery();
            while(rs.next()){
                Map<String, Object> map = new HashMap<>();
                map.put("id", rs.getInt("PostID"));
                map.put("title", rs.getString("Title"));
                map.put("category", rs.getString("Category"));
                map.put("date", rs.getString("Date"));
                list.add(map);
            }
        } catch (Exception e) {
            System.out.println("Lỗi getLatestForumPosts: " + e.getMessage());
        }
        return list;
    }
}