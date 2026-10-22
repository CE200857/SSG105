package dao;

import dto.OverviewDTO;
import util.DBContext;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

public class OverviewDAO extends DBContext {

    public OverviewDTO getOverviewStats() {
        OverviewDTO dto = new OverviewDTO();

        // Query truy vấn chuẩn xác theo bảng & ID trong CSDL LostAndFoundDB của bạn
        String query = "SELECT "
                + "(SELECT COUNT(*) FROM LostPosts WHERE ApprovalStatus = 'Approved') AS totalLost, "
                + "(SELECT COUNT(*) FROM LostPosts WHERE Status = 'Found' AND ApprovalStatus = 'Approved') AS lostFound, "
                + "(SELECT COUNT(*) FROM LostPosts WHERE Status = 'Not Found' AND ApprovalStatus = 'Approved') AS lostNotFound, "
                + "(SELECT COUNT(*) FROM FoundPosts WHERE ApprovalStatus = 'Approved') AS totalFound, "
                + "(SELECT COUNT(*) FROM FoundPosts WHERE Status = 'Claimed' AND ApprovalStatus = 'Approved') AS foundClaimed, "
                + "(SELECT COUNT(*) FROM FoundPosts WHERE Status = 'Unclaimed' AND ApprovalStatus = 'Approved') AS foundUnclaimed, "
                + "(SELECT ISNULL(AVG(CAST(Rating AS FLOAT)), 0.0) FROM Reviews) AS avgRating, "
                + "(SELECT COUNT(*) FROM Reviews) AS totalReviews";

        try {
            PreparedStatement ps = conn.prepareStatement(query);
            ResultSet rs = ps.executeQuery();

            if (rs.next()) {
                int totalLost = rs.getInt("totalLost");
                int lostFound = rs.getInt("lostFound");
                int lostNotFound = rs.getInt("lostNotFound");

                int totalFound = rs.getInt("totalFound");
                int foundClaimed = rs.getInt("foundClaimed");
                int foundUnclaimed = rs.getInt("foundUnclaimed");

                double avgRating = Math.round(rs.getDouble("avgRating") * 10.0) / 10.0;
                int totalReviews = rs.getInt("totalReviews");

                // Gán dữ liệu cho DTO
                dto.setTotalLost(totalLost);
                dto.setLostFound(lostFound);
                dto.setLostNotFound(lostNotFound);

                dto.setTotalFound(totalFound);
                dto.setFoundClaimed(foundClaimed);
                dto.setFoundUnclaimed(foundUnclaimed);

                // Tổng hợp bài đăng & trạng thái kết nối
                dto.setTotalPosts(totalLost + totalFound);
                dto.setResolvedPosts(lostFound + foundClaimed);
                dto.setWaitingPosts(lostNotFound + foundUnclaimed);

                dto.setAvgRating(avgRating);
                dto.setTotalReviews(totalReviews);
            }
        } catch (Exception e) {
            System.err.println("Lỗi getOverviewStats: " + e.getMessage());
        }

        return dto;
    }
}
